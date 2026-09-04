'use client';

import { useState, useEffect } from 'react';
import { Language } from '../context/LanguageContext';

const TRANSLATION_CACHE_KEY = 'mfct_translation_cache_v2';

const inFlightPromises = new Map<string, Promise<string>>();
let runtimeMemoryCache: Record<string, string> | null = null;

// Universal High-Accuracy Dictionary for Indian States, Common Locations, Honorifics & Names
export const AUTO_TRANSLATE_DICTIONARY: Record<string, { hi: string; ur: string; en?: string }> = {
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

  // Districts & Cities
  'bareilly': { hi: 'बरेली', ur: 'بریلی', en: 'Bareilly' },
  'lucknow': { hi: 'लखनऊ', ur: 'لکھنؤ', en: 'Lucknow' },
  'moradabad': { hi: 'मुरादाबाद', ur: 'مرادآباد', en: 'Moradabad' },
  'rampur': { hi: 'रामपुर', ur: 'رام پور', en: 'Rampur' },
  'pilibhit': { hi: 'पीलीभीत', ur: 'پیلی بھیت', en: 'Pilibhit' },
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

  // Common Communities
  'bareilly central care society (headquarters)': { hi: 'बरेली सेंट्रल केयर सोसाइटी (मुख्यालय)', ur: 'بریلی سنٹرل کیئر سوسائٹی (ہیڈ کوارٹر)', en: 'Bareilly Central Care Society (Headquarters)' },
  'bareilly central care society': { hi: 'बरेली सेंट्रल केयर सोसाइटी', ur: 'بریلی سنٹرل کیئر سوسائٹی', en: 'Bareilly Central Care Society' },
  'rohilkhand educational & nikah trust': { hi: 'रुहेलखंड एजुकेशनल एवं निकाह ट्रस्ट', ur: 'روہیل کھنڈ ایجوکیشنل اینڈ نکاح ٹرسٹ', en: 'Rohilkhand Educational & Nikah Trust' },
  'maharajganj welfare foundation': { hi: 'महराजगंज वेलफेयर फाउंडेशन', ur: 'مہراج گنج ویلفیئر فاؤنڈیشن', en: 'Maharajganj Welfare Foundation' },

  // District Roles
  'district president': { hi: 'जिला अध्यक्ष', ur: 'ضلعی صدر', en: 'District President' },
  'district_president': { hi: 'जिला अध्यक्ष', ur: 'ضلعی صدر', en: 'District President' },
  'district coordinator': { hi: 'जिला समन्वयक', ur: 'ضلعی کوآرڈینیٹر', en: 'District Coordinator' },
  'district_coordinator': { hi: 'जिला समन्वयक', ur: 'ضلعی کوآرڈینیٹر', en: 'District Coordinator' },
  'district general secretary': { hi: 'जिला महासचिव', ur: 'ضلعی جنرل سیکرٹری', en: 'District General Secretary' },
  'district_gen_secretary': { hi: 'जिला महासचिव', ur: 'ضلعی جنرل سیکرٹری', en: 'District General Secretary' },
  'district secretary': { hi: 'जिला सचिव', ur: 'ضلعی سیکرٹری', en: 'District Secretary' },
  'district_secretary': { hi: 'जिला सचिव', ur: 'ضلعی سیکرٹری', en: 'District Secretary' },
  'district finance coordinator': { hi: 'जिला वित्त समन्वयक', ur: 'ضلعی فنانس کوآرڈینیٹر', en: 'District Finance Coordinator' },
  'district_finance_coord': { hi: 'जिला वित्त समन्वयक', ur: 'ضلعی فنانس کوآرڈینیٹر', en: 'District Finance Coordinator' },
};

export function lookupDictionary(text: string, targetLang: Language): string | null {
  if (!text) return null;
  const trimmed = text.trim().toLowerCase();
  const entry = AUTO_TRANSLATE_DICTIONARY[trimmed];
  if (entry) {
    if (targetLang === 'en') return entry.en || text;
    if (targetLang === 'hi') return entry.hi;
    if (targetLang === 'ur') return entry.ur;
  }

  // Reverse lookup if text is in Hindi or Urdu
  for (const [enKey, val] of Object.entries(AUTO_TRANSLATE_DICTIONARY)) {
    if (val.hi.toLowerCase() === trimmed || val.ur.toLowerCase() === trimmed) {
      if (targetLang === 'en') return val.en || enKey.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      if (targetLang === 'hi') return val.hi;
      if (targetLang === 'ur') return val.ur;
    }
  }

  return null;
}

export function isValidScript(text: string, targetLang: Language): boolean {
  if (!text) return false;
  if (targetLang === 'hi') return /[\u0900-\u097F]/.test(text);
  if (targetLang === 'ur') return /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
  if (targetLang === 'en') return /[a-zA-Z]/.test(text);
  return true;
}

export function getMemoryCache(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(TRANSLATION_CACHE_KEY);
    if (!raw) {
      runtimeMemoryCache = {};
      return {};
    }
    if (runtimeMemoryCache) return runtimeMemoryCache;
    runtimeMemoryCache = JSON.parse(raw);
    return runtimeMemoryCache || {};
  } catch {
    return {};
  }
}

/** Clears both in-memory and localStorage translation caches. */
export function clearTranslationCache() {
  runtimeMemoryCache = {};
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(TRANSLATION_CACHE_KEY);
  } catch {}
}

export function setMemoryCache(key: string, value: string) {
  const cache = getMemoryCache();
  cache[key] = value;
  runtimeMemoryCache = cache;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

export function detectScript(text: string): 'hi' | 'ur' | 'en' {
  if (!text) return 'en';
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  if (/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text)) return 'ur';
  return 'en';
}

/**
 * Universal dynamic translation function for any text / name / story across Hindi, Urdu, English.
 * Automatically caches responses in localStorage for instant reload.
 */
export async function autoTranslateText(text: string, targetLang: Language): Promise<string> {
  if (!text || !text.trim()) return text || '';

  const trimmed = text.trim();
  const sourceLang = detectScript(trimmed);

  // If text is already in the target language script, no translation needed
  if (sourceLang === targetLang) {
    return trimmed;
  }

  // If already pure ASCII and targeting English, no translation needed
  const isPureAscii = /^[\x00-\x7F]*$/.test(trimmed);
  if (targetLang === 'en' && isPureAscii) {
    return trimmed;
  }

  // 0. Check built-in high-accuracy dictionary (Instant 0ms)
  const dictMatch = lookupDictionary(trimmed, targetLang);
  if (dictMatch) {
    setMemoryCache(`${targetLang}:${trimmed}`, dictMatch);
    return dictMatch;
  }

  const cacheKey = `${targetLang}:${trimmed}`;
  const cache = getMemoryCache();
  if (cache[cacheKey] && isValidScript(cache[cacheKey], targetLang)) {
    return cache[cacheKey];
  }

  // Check if an identical request is already in-flight to prevent duplicate network calls
  if (inFlightPromises.has(cacheKey)) {
    return inFlightPromises.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed, targetLang }),
      });

      if (!response.ok) return trimmed;
      const json = await response.json();
      if (json.success && json.translatedText && isValidScript(json.translatedText, targetLang)) {
        setMemoryCache(cacheKey, json.translatedText);
        return json.translatedText;
      }
    } catch (err) {
      console.warn('autoTranslateText failed:', err);
    } finally {
      inFlightPromises.delete(cacheKey);
    }
    return trimmed;
  })();

  inFlightPromises.set(cacheKey, promise);
  return promise;
}

/**
 * React hook to dynamically translate names, titles, quotes or any dynamic entity in real time
 * based on the active user-selected language.
 */
export function useDynamicTranslatedText(rawText: string | undefined, targetLang: Language): string {
  const text = rawText || '';

  // Pre-calculate immediate sync value from script match, dictionary, or validated cache
  const getImmediateValue = (str: string, lang: Language): string => {
    if (!str) return '';
    const trimmed = str.trim();
    if (detectScript(trimmed) === lang) return trimmed;
    if (lang === 'en' && /^[\x00-\x7F]*$/.test(trimmed)) return trimmed;

    // Fast dictionary match
    const dict = lookupDictionary(trimmed, lang);
    if (dict) return dict;

    // Cache check
    const cache = getMemoryCache();
    const cached = cache[`${lang}:${trimmed}`];
    if (cached && isValidScript(cached, lang)) {
      return cached;
    }

    return str;
  };

  const [translated, setTranslated] = useState<string>(() => getImmediateValue(text, targetLang));

  useEffect(() => {
    if (!text) {
      setTranslated('');
      return;
    }

    const immediate = getImmediateValue(text, targetLang);
    setTranslated(immediate);

    const trimmed = text.trim();
    if (detectScript(trimmed) === targetLang) return;
    if (targetLang === 'en' && /^[\x00-\x7F]*$/.test(trimmed)) return;
    if (immediate !== text && isValidScript(immediate, targetLang)) return;

    let isMounted = true;
    autoTranslateText(text, targetLang).then((result) => {
      if (isMounted && result && isValidScript(result, targetLang)) {
        setTranslated(result);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [text, targetLang]);

  return translated;
}

export async function autoTranslateCampaign(
  title?: string,
  story?: string
): Promise<{
  title_hi: string;
  title_ur: string;
  story_hi: string;
  story_ur: string;
}> {
  const [title_hi, title_ur, story_hi, story_ur] = await Promise.all([
    autoTranslateText(title || '', 'hi'),
    autoTranslateText(title || '', 'ur'),
    autoTranslateText(story || '', 'hi'),
    autoTranslateText(story || '', 'ur'),
  ]);

  return {
    title_hi: title_hi || title || '',
    title_ur: title_ur || title || '',
    story_hi: story_hi || story || '',
    story_ur: story_ur || story || '',
  };
}

/**
 * Complete multi-language campaign translation powered by Groq AI & translation cascade.
 */
export async function autoTranslateFullCampaign(
  title?: string,
  beneficiaryName?: string,
  beneficiaryRelation?: string,
  story?: string
): Promise<{
  hi: { title: string; beneficiaryName: string; beneficiaryRelation: string; story: string };
  ur: { title: string; beneficiaryName: string; beneficiaryRelation: string; story: string };
  en: { title: string; beneficiaryName: string; beneficiaryRelation: string; story: string };
}> {
  const [
    title_hi, title_ur, title_en,
    bName_hi, bName_ur, bName_en,
    bRel_hi, bRel_ur, bRel_en,
    story_hi, story_ur, story_en,
  ] = await Promise.all([
    autoTranslateText(title || '', 'hi'),
    autoTranslateText(title || '', 'ur'),
    autoTranslateText(title || '', 'en'),
    autoTranslateText(beneficiaryName || '', 'hi'),
    autoTranslateText(beneficiaryName || '', 'ur'),
    autoTranslateText(beneficiaryName || '', 'en'),
    autoTranslateText(beneficiaryRelation || '', 'hi'),
    autoTranslateText(beneficiaryRelation || '', 'ur'),
    autoTranslateText(beneficiaryRelation || '', 'en'),
    autoTranslateText(story || '', 'hi'),
    autoTranslateText(story || '', 'ur'),
    autoTranslateText(story || '', 'en'),
  ]);

  return {
    hi: {
      title: title_hi || title || '',
      beneficiaryName: bName_hi || beneficiaryName || '',
      beneficiaryRelation: bRel_hi || beneficiaryRelation || '',
      story: story_hi || story || '',
    },
    ur: {
      title: title_ur || title || '',
      beneficiaryName: bName_ur || beneficiaryName || '',
      beneficiaryRelation: bRel_ur || beneficiaryRelation || '',
      story: story_ur || story || '',
    },
    en: {
      title: title_en || title || '',
      beneficiaryName: bName_en || beneficiaryName || '',
      beneficiaryRelation: bRel_en || beneficiaryRelation || '',
      story: story_en || story || '',
    },
  };
}

/**
 * Multi-language community translation for name, description, city, and state.
 */
export async function autoTranslateCommunityData(
  name?: string,
  description?: string,
  city?: string,
  state?: string
): Promise<{
  hi: { name: string; description: string; city: string; state: string };
  ur: { name: string; description: string; city: string; state: string };
  en: { name: string; description: string; city: string; state: string };
}> {
  const [
    name_hi, name_ur, name_en,
    desc_hi, desc_ur, desc_en,
    city_hi, city_ur, city_en,
    state_hi, state_ur, state_en,
  ] = await Promise.all([
    autoTranslateText(name || '', 'hi'),
    autoTranslateText(name || '', 'ur'),
    autoTranslateText(name || '', 'en'),
    autoTranslateText(description || '', 'hi'),
    autoTranslateText(description || '', 'ur'),
    autoTranslateText(description || '', 'en'),
    autoTranslateText(city || '', 'hi'),
    autoTranslateText(city || '', 'ur'),
    autoTranslateText(city || '', 'en'),
    autoTranslateText(state || '', 'hi'),
    autoTranslateText(state || '', 'ur'),
    autoTranslateText(state || '', 'en'),
  ]);

  return {
    hi: {
      name: name_hi || name || '',
      description: desc_hi || description || '',
      city: city_hi || city || '',
      state: state_hi || state || '',
    },
    ur: {
      name: name_ur || name || '',
      description: desc_ur || description || '',
      city: city_ur || city || '',
      state: state_ur || state || '',
    },
    en: {
      name: name_en || name || '',
      description: desc_en || description || '',
      city: city_en || city || '',
      state: state_en || state || '',
    },
  };
}

export async function autoTranslateStory(
  name?: string,
  city?: string,
  quote?: string
): Promise<{
  hi: { name: string; city: string; quote: string };
  ur: { name: string; city: string; quote: string };
  en: { name: string; city: string; quote: string };
}> {
  const [
    name_hi, name_ur, name_en,
    city_hi, city_ur, city_en,
    quote_hi, quote_ur, quote_en
  ] = await Promise.all([
    autoTranslateText(name || '', 'hi'),
    autoTranslateText(name || '', 'ur'),
    autoTranslateText(name || '', 'en'),
    autoTranslateText(city || '', 'hi'),
    autoTranslateText(city || '', 'ur'),
    autoTranslateText(city || '', 'en'),
    autoTranslateText(quote || '', 'hi'),
    autoTranslateText(quote || '', 'ur'),
    autoTranslateText(quote || '', 'en'),
  ]);

  return {
    hi: { name: name_hi || name || '', city: city_hi || city || '', quote: quote_hi || quote || '' },
    ur: { name: name_ur || name || '', city: city_ur || city || '', quote: quote_ur || quote || '' },
    en: { name: name_en || name || '', city: city_en || city || '', quote: quote_en || quote || '' },
  };
}
