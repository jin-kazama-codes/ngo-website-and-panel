import { NextResponse } from 'next/server';
import { STANDARD_DISTRICTS } from '../../../data/districtsData';

// Server-side in-memory cache to prevent repeat API calls & minimize latency
const serverCache = new Map<string, string>();

const LANGUAGE_MAP: Record<string, string> = {
  hi: 'Hindi (हिन्दी / Devanagari script)',
  ur: 'Urdu (اردو / Nastaliq or Perso-Arabic script)',
  en: 'English',
};

// Built-in high-accuracy dictionary for common Indian states, honorifics, and names
const COMMON_DICTIONARY: Record<string, { hi: string; ur: string; en?: string }> = {
  // Names
  'mohd nayeem': { hi: 'मोहम्मद नईम', ur: 'محمد نعیم', en: 'Mohd Nayeem' },
  'mohammad nayeem': { hi: 'मोहम्मद नईम', ur: 'محمد نعیم', en: 'Mohammad Nayeem' },
  'nayeem': { hi: 'नईम', ur: 'نعیم', en: 'Nayeem' },
  'gulam raza': { hi: 'गुलाम रज़ा', ur: 'غلام رضا', en: 'Gulam Raza' },
  'ghulam raza': { hi: 'गुलाम रज़ा', ur: 'غلام رضا', en: 'Ghulam Raza' },
  'farhan ali siddiqui': { hi: 'फरहान अली सिद्दीकी', ur: 'فرحان علی صدیقی', en: 'Farhan Ali Siddiqui' },
  'dr. shakeel ahmad usmani': { hi: 'डॉ. शकील अहमद उस्मानी', ur: 'ڈاکٹر شکیل احمد عثمانی', en: 'Dr. Shakeel Ahmad Usmani' },
  'shakeel ahmad usmani': { hi: 'शकील अहमद उस्मानी', ur: 'شکیل احمد عثمانی', en: 'Shakeel Ahmad Usmani' },
  'er. mohammad zahid': { hi: 'इंजी. मोहम्मद जाहिद', ur: 'انجینئر محمد زاہد', en: 'Er. Mohammad Zahid' },
  'er mohammad zahid': { hi: 'इंजी. मोहम्मद जाहिद', ur: 'انجینئر محمد زاہد', en: 'Er. Mohammad Zahid' },
  'mohammad zahid': { hi: 'मोहम्मद जाहिद', ur: 'محمد زاہد', en: 'Mohammad Zahid' },
  'mohd arshad': { hi: 'मोहम्मद अरशद', ur: 'محمد ارشد', en: 'Mohd Arshad' },
  'tariq khan': { hi: 'तारिक खान', ur: 'طارق خان', en: 'Tariq Khan' },
  'salman khan': { hi: 'सलमान खान', ur: 'سلمان خان', en: 'Salman Khan' },
  'rehan ali': { hi: 'रेहान अली', ur: 'ریحان علی', en: 'Rehan Ali' },
  'sohail ahmad': { hi: 'सोहेल अहमद', ur: 'سہیل احمد', en: 'Sohail Ahmad' },
  'imran khan': { hi: 'इमरान खान', ur: 'عمران خان', en: 'Imran Khan' },
  'adnan siddiqui': { hi: 'अदनान सिद्दीकी', ur: 'عدنان صدیقی', en: 'Adnan Siddiqui' },
  'danish': { hi: 'दानिश', ur: 'دانش', en: 'Danish' },
  'waseem': { hi: 'वसीम', ur: 'وسیم', en: 'Waseem' },
  'nadeem': { hi: 'नदीम', ur: 'ندیم', en: 'Nadeem' },
  'arif': { hi: 'आरिफ', ur: 'عارف', en: 'Arif' },
  'parvez': { hi: 'परवेज', ur: 'پرویز', en: 'Parvez' },
  'shahnawaz': { hi: 'शाहनवाज', ur: 'شاہ نواز', en: 'Shahnawaz' },
  'rizwan': { hi: 'रिजवान', ur: 'رضوان', en: 'Rizwan' },

  // States & UTs
  'uttar pradesh': { hi: 'उत्तर प्रदेश', ur: 'اتر پردیش', en: 'Uttar Pradesh' },
  'up': { hi: 'उत्तर प्रदेश', ur: 'اتر پردیش', en: 'Uttar Pradesh' },
  'delhi': { hi: 'दिल्ली', ur: 'دہلی', en: 'Delhi' },
  'bihar': { hi: 'बिहार', ur: 'بہار', en: 'Bihar' },
  'uttarakhand': { hi: 'उत्तराखंड', ur: 'اتراکھنڈ', en: 'Uttarakhand' },
  'madhya pradesh': { hi: 'मध्य प्रदेश', ur: 'مدھیہ پردیش', en: 'Madhya Pradesh' },
  'mp': { hi: 'मध्य प्रदेश', ur: 'مدھیہ پردیش', en: 'Madhya Pradesh' },
  'rajasthan': { hi: 'राजस्थान', ur: 'راجستھان', en: 'Rajasthan' },
  'haryana': { hi: 'हरियाणा', ur: 'ہریانہ', en: 'Haryana' },
  'punjab': { hi: 'पंजाब', ur: 'پنجاب', en: 'Punjab' },
  'west bengal': { hi: 'पश्चिम बंगाल', ur: 'مغربی بنگال', en: 'West Bengal' },
  'maharashtra': { hi: 'महाराष्ट्र', ur: 'مہاراشٹر', en: 'Maharashtra' },
  'gujarat': { hi: 'गुजरात', ur: 'گجرات', en: 'Gujarat' },
  'jharkhand': { hi: 'झारखंड', ur: 'جھارکھنڈ', en: 'Jharkhand' },

  // Cities
  'bareilly': { hi: 'बरेली', ur: 'بریلی', en: 'Bareilly' },
  'lucknow': { hi: 'लखनऊ', ur: 'لکھنؤ', en: 'Lucknow' },
  'moradabad': { hi: 'मुरादाबाद', ur: 'مرادآباد', en: 'Moradabad' },
  'rampur': { hi: 'रामपुर', ur: 'رام پور', en: 'Rampur' },
  'pilibhit': { hi: 'पीलीभीत', ur: 'پیلی भीत', en: 'Pilibhit' },
  'shahjahanpur': { hi: 'शाहजहांपुर', ur: 'شاہجہاں پور', en: 'Shahjahanpur' },
  'budaun': { hi: 'बदायूँ', ur: 'بدایوں', en: 'Budaun' },
  'bijnor': { hi: 'बिजनौर', ur: 'بجنور', en: 'Bijnor' },
  'sambhal': { hi: 'संभल', ur: 'سنبھل', en: 'Sambhal' },
  'meerut': { hi: 'मेरठ', ur: 'میرٹھ', en: 'Meerut' },
  'aligarh': { hi: 'अलीगढ़', ur: 'علی گڑھ', en: 'Aligarh' },
  'agra': { hi: 'आगरा', ur: 'آگرہ', en: 'Agra' },
  'varanasi': { hi: 'वाराणसी', ur: 'وارانسی', en: 'Varanasi' },
  'kanpur': { hi: 'कानपुर', ur: 'کانپور', en: 'Kanpur' },
  'gorakhpur': { hi: 'गोरखपुर', ur: 'گورکھپور', en: 'Gorakhpur' },
  'maharajganj': { hi: 'महराजगंज', ur: 'مہراج گنج', en: 'Maharajganj' },

  // Communities
  'rohilkhand educational & nikah trust': { hi: 'रुहेलखंड एजुकेशनल एवं निकाह ट्रस्ट', ur: 'روہیل کھنڈ ایجوکیشنل اینڈ نکاح ٹرسٹ', en: 'Rohilkhand Educational & Nikah Trust' },
  'bareilly central care society (headquarters)': { hi: 'बरेली सेंट्रल केयर सोसाइटी (मुख्यालय)', ur: 'بریلی سنٹرل کیئر سوسائٹی (ہیڈ کوارٹر)', en: 'Bareilly Central Care Society (Headquarters)' },
  'bareilly central care society': { hi: 'बरेली सेंट्रल केयर सोसाइटी', ur: 'بریلی سنٹرل کیئر سوسائٹی', en: 'Bareilly Central Care Society' },
  'maharajganj welfare foundation': { hi: 'महराजगंज वेलफेयर फाउंडेशन', ur: 'مہراج گنج ویلفیئر فاؤنڈیشن', en: 'Maharajganj Welfare Foundation' },
};

const COMMON_HINDI_NAME_MAP: Record<string, string> = {
  'मोहम्मद': 'Mohammad',
  'मो०': 'Mohd.',
  'मोह': 'Mohd',
  'अहमद': 'Ahmad',
  'खान': 'Khan',
  'अली': 'Ali',
  'सिद्दीकी': 'Siddiqui',
  'उस्मानी': 'Usmani',
  'जावेद': 'Javed',
  'तारिक': 'Tariq',
  'सलमान': 'Salman',
  'इमरान': 'Imran',
  'रिजवान': 'Rizwan',
  'शाहनवाज': 'Shahnawaz',
  'फरहान': 'Farhan',
  'अदनान': 'Adnan',
  'सोहेल': 'Sohail',
  'रेहान': 'Rehan',
  'कफील': 'Kafeel',
  'परवेज': 'Parvez',
  'आरिफ': 'Arif',
  'आसिफ': 'Asif',
  'काशिफ': 'Kashif',
  'दानिश': 'Danish',
  'वसीम': 'Waseem',
  'नदीम': 'Nadeem',
  'नईम': 'Nayeem',
  'गुलाम': 'Gulam',
  'रज़ा': 'Raza',
  'रजा': 'Raza',
  'अब्दुल': 'Abdul',
  'रहमान': 'Rahman',
  'शकील': 'Shakeel',
  'जाहिद': 'Zahid',
  'अरशद': 'Arshad',
  'फैसल': 'Faisal',
  'फैजान': 'Faizan',
  'शर्मा': 'Sharma',
  'वर्मा': 'Verma',
  'गुप्ता': 'Gupta',
  'मिश्रा': 'Mishra',
  'पांडे': 'Pandey',
  'यादव': 'Yadav',
  'कुमार': 'Kumar',
  'सिंह': 'Singh',
  'राहुल': 'Rahul',
  'रोहित': 'Rohit',
  'अमित': 'Amit',
  'सुमित': 'Sumit',
  'दीपक': 'Deepak',
  'सुरेश': 'Suresh',
  'रमेश': 'Ramesh',
  'सुनील': 'Sunil',
  'अनिल': 'Anil',
  'संजय': 'Sanjay',
  'अजय': 'Ajay',
  'विजय': 'Vijay',
  'विकास': 'Vikas',
  'संदीप': 'Sandeep',
  'प्रदीप': 'Pradeep',
  'बदायूं': 'Budaun',
  'बदायूँ': 'Budaun',
  'रुहेलखंड': 'Rohilkhand',
  'रोहिलखंड': 'Rohilkhand',
};

const INDEPENDENT_VOWELS: Record<string, string> = {
  'अ': 'A', 'आ': 'Aa', 'इ': 'I', 'ई': 'Ee', 'उ': 'U', 'ऊ': 'Oo', 'ऋ': 'Ri',
  'ए': 'E', 'ऐ': 'Ai', 'ओ': 'O', 'औ': 'Au', 'अं': 'An', 'अः': 'Ah',
};

const MATRAS: Record<string, string> = {
  'ा': 'a', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri',
  'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ं': 'n', 'ँ': 'n', 'ः': 'h',
};

const CONSONANTS: Record<string, string> = {
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v',
  'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
  'क़': 'q', 'ख़': 'kh', 'ग़': 'gh', 'ज़': 'z', 'ड़': 'r', 'ढ़': 'rh', 'फ़': 'f',
};

function devanagariToEnglish(text: string): string {
  if (!text) return '';

  const normalized = text
    .replace(/\bडॉ\.\s*/g, 'Dr. ')
    .replace(/\bइंजी\.\s*/g, 'Er. ')
    .replace(/\bमोह\.\s*/g, 'Mohd. ');

  const words = normalized.split(/\s+/);
  const translatedWords = words.map((word) => {
    if (!/[\u0900-\u097F]/.test(word)) {
      return word;
    }

    const trimmedWord = word.trim();
    if (COMMON_HINDI_NAME_MAP[trimmedWord]) {
      return COMMON_HINDI_NAME_MAP[trimmedWord];
    }

    let res = '';
    const chars = Array.from(word);
    const len = chars.length;

    for (let i = 0; i < len; i++) {
      const ch = chars[i];
      const nextCh = i + 1 < len ? chars[i + 1] : '';
      const nextNextCh = i + 2 < len ? chars[i + 2] : '';

      let combined = ch;
      if (nextCh === '\u093C') {
        combined = ch + nextCh;
        i++;
      }

      if (combined === 'ज' && nextCh === '्' && nextNextCh === 'ञ') {
        res += 'gy';
        i += 2;
        continue;
      }
      if (combined === 'क' && nextCh === '्' && nextNextCh === 'ष') {
        res += 'ksh';
        i += 2;
        continue;
      }
      if (combined === 'त' && nextCh === '्' && nextNextCh === 'र') {
        res += 'tr';
        i += 2;
        continue;
      }
      if (combined === 'श' && nextCh === '्' && nextNextCh === 'र') {
        res += 'shr';
        i += 2;
        continue;
      }

      if (MATRAS[combined]) {
        res += MATRAS[combined];
        continue;
      }

      if (INDEPENDENT_VOWELS[combined]) {
        res += INDEPENDENT_VOWELS[combined];
        continue;
      }

      if (combined === '्') {
        continue;
      }

      if (CONSONANTS[combined]) {
        const romanConsonant = CONSONANTS[combined];
        res += romanConsonant;

        const isNextHalant = nextCh === '्' || (nextCh === '\u093C' && nextNextCh === '्');
        const isNextMatra = MATRAS[nextCh] !== undefined;
        const isLastChar = i === len - 1 || (i === len - 2 && nextCh === '\u093C');

        if (!isNextHalant && !isNextMatra && !isLastChar) {
          res += 'a';
        }
        continue;
      }

      res += combined;
    }

    if (res.length > 0) {
      return res.charAt(0).toUpperCase() + res.slice(1);
    }
    return res;
  });

  return translatedWords.join(' ');
}

function lookupDictionary(text: string, targetLang: string): string | null {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  // 1. Direct entry in COMMON_DICTIONARY
  const entry = COMMON_DICTIONARY[lower];
  if (entry) {
    if (targetLang === 'en') return entry.en || text;
    if (targetLang === 'hi') return entry.hi;
    if (targetLang === 'ur') return entry.ur;
  }

  // 2. Reverse lookup in COMMON_DICTIONARY
  for (const [enKey, val] of Object.entries(COMMON_DICTIONARY)) {
    if (
      val.hi.toLowerCase() === lower ||
      val.ur.toLowerCase() === lower ||
      (val.en && val.en.toLowerCase() === lower) ||
      enKey.toLowerCase() === lower
    ) {
      if (targetLang === 'en') return val.en || enKey.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      if (targetLang === 'hi') return val.hi;
      if (targetLang === 'ur') return val.ur;
    }
  }

  // 3. Search in STANDARD_DISTRICTS
  for (const d of STANDARD_DISTRICTS) {
    if (
      d.nameEn.toLowerCase() === lower ||
      d.nameHi.toLowerCase() === lower ||
      d.nameUr.toLowerCase() === lower ||
      d.id.toLowerCase() === lower
    ) {
      if (targetLang === 'en') return d.nameEn;
      if (targetLang === 'hi') return d.nameHi;
      if (targetLang === 'ur') return d.nameUr;
    }
    if (
      d.stateEn.toLowerCase() === lower ||
      d.stateHi.toLowerCase() === lower ||
      d.stateUr.toLowerCase() === lower
    ) {
      if (targetLang === 'en') return d.stateEn;
      if (targetLang === 'hi') return d.stateHi;
      if (targetLang === 'ur') return d.stateUr;
    }
  }

  // 4. Common Hindi names / places map
  if (targetLang === 'en' && COMMON_HINDI_NAME_MAP[trimmed]) {
    return COMMON_HINDI_NAME_MAP[trimmed];
  }

  // 5. Comma-separated parts
  if (trimmed.includes(',')) {
    const parts = trimmed.split(',').map((p) => p.trim());
    const translatedParts = parts.map(
      (part) => lookupDictionary(part, targetLang) || (targetLang === 'en' && detectScript(part) === 'hi' ? devanagariToEnglish(part) : part)
    );
    return translatedParts.join(', ');
  }

  return null;
}

function detectScript(text: string): 'hi' | 'ur' | 'en' {
  if (!text) return 'en';
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  if (/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text)) return 'ur';
  return 'en';
}

function isValidScriptTranslation(result: string, targetLang: string, originalText: string): boolean {
  if (!result || result.trim() === originalText.trim()) return false;
  if (targetLang === 'hi') {
    return /[\u0900-\u097F]/.test(result);
  }
  if (targetLang === 'ur') {
    return /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(result);
  }
  if (targetLang === 'en') {
    return /[a-zA-Z]/.test(result);
  }
  return true;
}

function normalizeHonorifics(text: string): string {
  return text
    .replace(/\bMohd\.?\b/gi, 'Mohammad')
    .replace(/\bMd\.?\b/gi, 'Mohammad')
    .replace(/\bEr\.?\b/gi, 'Engineer')
    .replace(/\bDr\.?\b/gi, 'Doctor');
}

/**
 * 1. Groq Cloud AI LLM
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

    if (!response.ok) return null;

    const data = await response.json();
    const result = data?.choices?.[0]?.message?.content?.trim();
    if (result) {
      const clean = result.replace(/^["'«»“”„]+|["'«»“”„]+$/g, '').trim();
      if (isValidScriptTranslation(clean, targetLang, text)) {
        return clean;
      }
    }
  } catch (error) {
    console.error('Groq translation error:', error);
  }
  return null;
}

/**
 * 2. MyMemory Translation API
 */
async function translateWithMyMemory(text: string, targetLang: string, sourceLang: string): Promise<string | null> {
  try {
    const normalized = normalizeHonorifics(text);
    const langPair = `${sourceLang}|${targetLang}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(normalized)}&langpair=${encodeURIComponent(langPair)}`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      next: { revalidate: 86400 }
    });
    if (!response.ok) return null;
    const data = await response.json();
    const result = data?.responseData?.translatedText;
    if (result && !result.includes('MYMEMORY WARNING') && isValidScriptTranslation(result, targetLang, text)) {
      return result.trim();
    }
  } catch { }
  return null;
}

/**
 * 3. Google Translate with explicit source language
 */
async function translateWithGoogle(text: string, targetLang: string, sourceLang: string): Promise<string | null> {
  try {
    const normalized = normalizeHonorifics(text);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sourceLang)}&tl=${encodeURIComponent(
      targetLang
    )}&dt=t&q=${encodeURIComponent(normalized)}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
      next: { revalidate: 86400 },
    });

    if (!response.ok) return null;
    const data = await response.json();
    if (Array.isArray(data) && Array.isArray(data[0])) {
      const translated = data[0].map((item: any) => item[0]).filter(Boolean).join('');
      if (translated && isValidScriptTranslation(translated, targetLang, text)) {
        return translated.trim();
      }
    }
  } catch { }
  return null;
}

/**
 * 4. Google Input Tools Transliteration
 */
async function transliterateWithInputTools(text: string, targetLang: string): Promise<string | null> {
  if (targetLang !== 'hi' && targetLang !== 'ur') return null;
  try {
    const itc = targetLang === 'hi' ? 'hi-t-i0-und' : 'ur-t-i0-und';
    const url = `https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=${itc}&num=1`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    if (Array.isArray(data) && data[0] === 'SUCCESS' && data[1]?.[0]?.[1]?.[0]) {
      const transliterated = data[1][0][1][0];
      if (isValidScriptTranslation(transliterated, targetLang, text)) {
        return transliterated.trim();
      }
    }
  } catch { }
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

    const sourceLang = detectScript(trimmed);

    // If source language matches target language, no translation needed
    if (sourceLang === targetLang) {
      return NextResponse.json({ success: true, translatedText: trimmed });
    }

    // If target is English and text is purely ASCII, no translation needed
    const isPureAscii = /^[\x00-\x7F]*$/.test(trimmed);
    if (targetLang === 'en' && isPureAscii) {
      return NextResponse.json({ success: true, translatedText: trimmed });
    }

    // 0. Check built-in high-accuracy dictionary & STANDARD_DISTRICTS (Instant 0ms)
    const dictMatch = lookupDictionary(trimmed, targetLang);
    if (dictMatch) {
      return NextResponse.json({
        success: true,
        translatedText: dictMatch,
        engine: 'dictionary',
      });
    }

    // Check server memory cache
    const cacheKey = `${targetLang}:${trimmed}`;
    if (serverCache.has(cacheKey)) {
      const cached = serverCache.get(cacheKey)!;
      if (isValidScriptTranslation(cached, targetLang, trimmed)) {
        return NextResponse.json({
          success: true,
          translatedText: cached,
          cached: true,
        });
      }
    }

    // 1. Primary Engine: Groq AI (LLaMA 3.3 70B Versatile)
    let translated = await translateWithGroq(trimmed, targetLang);

    // 2. Engine: MyMemory Translation API
    if (!translated) {
      translated = await translateWithMyMemory(trimmed, targetLang, sourceLang);
    }

    // 3. Engine: Google Translate with explicit source script
    if (!translated) {
      translated = await translateWithGoogle(trimmed, targetLang, sourceLang);
    }

    // 4. Engine: Google Input Tools Transliteration (for proper names/places into Hindi/Urdu)
    if (!translated && sourceLang === 'en' && (targetLang === 'hi' || targetLang === 'ur')) {
      translated = await transliterateWithInputTools(trimmed, targetLang);
    }

    // 5. Guaranteed Engine: Hindi to English Devanagari Phonetic Transliteration
    if (!translated && sourceLang === 'hi' && targetLang === 'en') {
      const transliterated = devanagariToEnglish(trimmed);
      if (transliterated && isValidScriptTranslation(transliterated, 'en', trimmed)) {
        translated = transliterated;
      }
    }

    // Validation: Only cache and mark as translated if target script is actually present
    if (translated && isValidScriptTranslation(translated, targetLang, trimmed)) {
      serverCache.set(cacheKey, translated);
      return NextResponse.json({
        success: true,
        translatedText: translated,
        engine: 'multilingual-pipeline',
      });
    }

    // Fallback: Return transliteration for Hindi -> English rather than raw Hindi
    if (targetLang === 'en' && sourceLang === 'hi') {
      const fallbackTranslit = devanagariToEnglish(trimmed);
      return NextResponse.json({
        success: true,
        translatedText: fallbackTranslit,
        engine: 'transliteration-fallback',
      });
    }

    return NextResponse.json({
      success: true,
      translatedText: trimmed,
      engine: 'untranslated-fallback',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, translatedText: null, error: error?.message || 'Translation failed' },
      { status: 200 }
    );
  }
}
