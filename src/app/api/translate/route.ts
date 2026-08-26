import { NextResponse } from 'next/server';

async function translateWithGoogle(text: string, targetLang: string): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(
    targetLang
  )}&dt=t&q=${encodeURIComponent(text)}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) throw new Error(`Google API status ${response.status}`);
  const data = await response.json();
  if (Array.isArray(data) && Array.isArray(data[0])) {
    return data[0].map((item: any) => item[0]).filter(Boolean).join('');
  }
  throw new Error('Invalid Google API response');
}

async function translateWithMyMemory(text: string, targetLang: string): Promise<string> {
  const langPair = `en|${targetLang}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
    text
  )}&langpair=${encodeURIComponent(langPair)}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`MyMemory status ${response.status}`);
  const data = await response.json();
  if (data?.responseData?.translatedText) {
    return data.responseData.translatedText;
  }
  throw new Error('Invalid MyMemory response');
}

export async function POST(request: Request) {
  try {
    const { text, targetLang } = await request.json();

    if (!text || !targetLang) {
      return NextResponse.json({ success: true, translatedText: text || '' });
    }

    // If target is english and text is only ASCII characters, no translation needed
    const isPureAscii = /^[\x00-\x7F]*$/.test(text);
    if (targetLang === 'en' && isPureAscii) {
      return NextResponse.json({ success: true, translatedText: text });
    }

    let translated = '';

    // Attempt 1: Google Translate (sl=auto detects source language automatically)
    try {
      translated = await translateWithGoogle(text, targetLang);
    } catch (gErr) {
      console.warn('Google translation failed, trying MyMemory:', gErr);
      // Attempt 2: MyMemory API
      try {
        translated = await translateWithMyMemory(text, targetLang);
      } catch (mErr) {
        console.warn('MyMemory translation failed:', mErr);
      }
    }

    return NextResponse.json({
      success: true,
      translatedText: translated || text,
    });
  } catch (error: any) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { success: false, translatedText: null, error: error.message },
      { status: 200 }
    );
  }
}
