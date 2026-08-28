import { NextResponse } from 'next/server';

// Server-side in-memory cache to prevent repeat API calls & rate limits
const serverCache = new Map<string, string>();

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
    // Fallback to MyMemory quietly on network or rate-limit issues
  }
  return null;
}

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

    const trimmed = text.trim();

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
      });
    }

    // Attempt 1: Google Translate
    let translated = await translateWithGoogle(trimmed, targetLang);

    // Attempt 2: MyMemory API fallback
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
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, translatedText: null, error: error?.message || 'Translation failed' },
      { status: 200 }
    );
  }
}
