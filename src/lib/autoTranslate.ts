'use client';

import { useState, useEffect } from 'react';
import { Language } from '../context/LanguageContext';

const TRANSLATION_CACHE_KEY = 'mfct_translation_cache_v1';

export function getMemoryCache(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(TRANSLATION_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setMemoryCache(key: string, value: string) {
  if (typeof window === 'undefined') return;
  try {
    const cache = getMemoryCache();
    cache[key] = value;
    localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

/**
 * Universal dynamic translation function for any text / name / story across Hindi, Urdu, English.
 * Does not require hardcoding. Automatically caches responses in localStorage for instant reload.
 */
export async function autoTranslateText(text: string, targetLang: Language): Promise<string> {
  if (!text || !text.trim()) return text || '';

  const trimmed = text.trim();
  const cacheKey = `${targetLang}:${trimmed}`;
  const cache = getMemoryCache();
  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  // If already pure ASCII and targeting English, no translation needed
  const isPureAscii = /^[\x00-\x7F]*$/.test(trimmed);
  if (targetLang === 'en' && isPureAscii) {
    return trimmed;
  }

  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: trimmed, targetLang }),
    });

    if (!response.ok) return trimmed;
    const json = await response.json();
    if (json.success && json.translatedText) {
      setMemoryCache(cacheKey, json.translatedText);
      return json.translatedText;
    }
  } catch (err) {
    console.warn('autoTranslateText failed:', err);
  }

  return trimmed;
}

/**
 * React hook to dynamically translate names, titles, quotes or any dynamic entity in real time
 * based on the active user-selected language.
 */
export function useDynamicTranslatedText(rawText: string | undefined, targetLang: Language): string {
  const text = rawText || '';
  const [translated, setTranslated] = useState<string>(() => {
    if (!text) return '';
    if (targetLang === 'en' && /^[\x00-\x7F]*$/.test(text)) return text;
    const cache = getMemoryCache();
    return cache[`${targetLang}:${text.trim()}`] || text;
  });

  useEffect(() => {
    if (!text) {
      setTranslated('');
      return;
    }

    if (targetLang === 'en' && /^[\x00-\x7F]*$/.test(text)) {
      setTranslated(text);
      return;
    }

    const cacheKey = `${targetLang}:${text.trim()}`;
    const cache = getMemoryCache();
    if (cache[cacheKey]) {
      setTranslated(cache[cacheKey]);
      return;
    }

    let isMounted = true;
    autoTranslateText(text, targetLang).then((result) => {
      if (isMounted && result) {
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
 * Complete multi-language campaign translation powered by Groq AI.
 * Translates Title, Beneficiary Name, Beneficiary Relation, and Case Story into Hindi, Urdu, and English.
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

  // Pre-seed local cache
  if (title) {
    if (title_hi) setMemoryCache(`hi:${title.trim()}`, title_hi);
    if (title_ur) setMemoryCache(`ur:${title.trim()}`, title_ur);
    if (title_en) setMemoryCache(`en:${title.trim()}`, title_en);
  }
  if (story) {
    if (story_hi) setMemoryCache(`hi:${story.trim()}`, story_hi);
    if (story_ur) setMemoryCache(`ur:${story.trim()}`, story_ur);
    if (story_en) setMemoryCache(`en:${story.trim()}`, story_en);
  }
  if (beneficiaryName) {
    if (bName_hi) setMemoryCache(`hi:${beneficiaryName.trim()}`, bName_hi);
    if (bName_ur) setMemoryCache(`ur:${beneficiaryName.trim()}`, bName_ur);
    if (bName_en) setMemoryCache(`en:${beneficiaryName.trim()}`, bName_en);
  }
  if (beneficiaryRelation) {
    if (bRel_hi) setMemoryCache(`hi:${beneficiaryRelation.trim()}`, bRel_hi);
    if (bRel_ur) setMemoryCache(`ur:${beneficiaryRelation.trim()}`, bRel_ur);
    if (bRel_en) setMemoryCache(`en:${beneficiaryRelation.trim()}`, bRel_en);
  }

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

  if (name) {
    if (name_hi) setMemoryCache(`hi:${name.trim()}`, name_hi);
    if (name_ur) setMemoryCache(`ur:${name.trim()}`, name_ur);
    if (name_en) setMemoryCache(`en:${name.trim()}`, name_en);
  }
  if (description) {
    if (desc_hi) setMemoryCache(`hi:${description.trim()}`, desc_hi);
    if (desc_ur) setMemoryCache(`ur:${description.trim()}`, desc_ur);
    if (desc_en) setMemoryCache(`en:${description.trim()}`, desc_en);
  }

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
