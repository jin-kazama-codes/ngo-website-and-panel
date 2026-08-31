import { NextResponse } from 'next/server';

// Server-side in-memory cache to prevent repeat API calls & minimize latency
const serverCache = new Map<string, string>();

const LANGUAGE_MAP: Record<string, string> = {
  hi: 'Hindi (हिन्दी / Devanagari script)',
  ur: 'Urdu (اردو / Nastaliq or Perso-Arabic script)',
  en: 'English',
};

/**
 * Translate using Groq Cloud AI (ultra-fast LLM inference)
 */
async function translateWithGroq(text: string, targetLang: string): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const targetLangLabel = LANGUAGE_MAP[targetLang] || targetLang;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are an expert multilingual translator specializing in NGO campaigns, donor testimonials, community updates, names, and quotes.
Translate the provided text into ${targetLangLabel}.

CRITICAL GUIDELINES:
1. Return ONLY the translated text. Do NOT add preamble, quotes, notes, formatting, or explanations.
2. For personal names and city names, phonetically transliterate into the target script (e.g. Devanagari for Hindi, Perso-Arabic script for Urdu, Latin for English).
3. Maintain the sincere, empathetic, and respectful tone of the testimonial or story.
4. Keep numbers, currencies (₹, $, INR), and punctuation properly intact.`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.1,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      console.warn(`Groq API returned status ${response.status}`);
      return null;
    }

    const data = await response.json();
    const result = data?.choices?.[0]?.message?.content?.trim();
    if (result) {
      // Strip any unwanted quotation marks added around the output
      return result.replace(/^["'«»“”„]+|["'«»“”„]+$/g, '').trim();
    }
  } catch (error) {
    console.error('Groq translation error:', error);
  }
  return null;
}

/**
 * Fallback: Google Translate client endpoint
 */
async function translateWithGoogle(text: string, targetLang: string): Promise<string | null> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(
      targetLang
    )}&dt=t&q=${encodeURIComponent(text)}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      next: { revalidate: 86400 },
    });

    if (!response.ok) return null;
    const data = await response.json();
    if (Array.isArray(data) && Array.isArray(data[0])) {
      return data[0].map((item: any) => item[0]).filter(Boolean).join('');
    }
  } catch {
    // Fallback quietly
  }
  return null;
}

/**
 * Fallback: MyMemory Translation API
 */
async function translateWithMyMemory(text: string, targetLang: string): Promise<string | null> {
  try {
    const langPair = `en|${targetLang}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      text
    )}&langpair=${encodeURIComponent(langPair)}`;

    const response = await fetch(url, { next: { revalidate: 86400 } });
    if (!response.ok) return null;
    const data = await response.json();
    if (data?.responseData?.translatedText) {
      return data.responseData.translatedText;
    }
  } catch {
    // Return null on failure
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const { text, targetLang } = await request.json();

    if (!text || !targetLang) {
      return NextResponse.json({ success: true, translatedText: text || '' });
    }

    const trimmed = String(text).trim();
    if (!trimmed) {
      return NextResponse.json({ success: true, translatedText: '' });
    }

    // If target is English and text is only ASCII characters, no translation needed
    const isPureAscii = /^[\x00-\x7F]*$/.test(trimmed);
    if (targetLang === 'en' && isPureAscii) {
      return NextResponse.json({ success: true, translatedText: trimmed });
    }

    // Check server memory cache
    const cacheKey = `${targetLang}:${trimmed}`;
    if (serverCache.has(cacheKey)) {
      return NextResponse.json({
        success: true,
        translatedText: serverCache.get(cacheKey),
        cached: true,
      });
    }

    // 1. Primary Engine: Groq AI (LLaMA 3.3 70B Versatile)
    let translated = await translateWithGroq(trimmed, targetLang);

    // 2. Fallback: Google Translate
    if (!translated) {
      translated = await translateWithGoogle(trimmed, targetLang);
    }

    // 3. Fallback: MyMemory API
    if (!translated) {
      translated = await translateWithMyMemory(trimmed, targetLang);
    }

    const finalResult = translated || trimmed;

    // Cache successful translation in memory
    if (translated) {
      serverCache.set(cacheKey, translated);
    }

    return NextResponse.json({
      success: true,
      translatedText: finalResult,
      engine: translated ? (translated === trimmed ? 'none' : 'groq/fallback') : 'passthrough',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, translatedText: null, error: error?.message || 'Translation failed' },
      { status: 200 }
    );
  }
}
