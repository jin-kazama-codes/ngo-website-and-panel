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
  title: string,
  story: string
): Promise<{
  title_hi: string;
  title_ur: string;
  story_hi: string;
  story_ur: string;
}> {
  const [title_hi, title_ur, story_hi, story_ur] = await Promise.all([
    autoTranslateText(title, 'hi'),
    autoTranslateText(title, 'ur'),
    autoTranslateText(story, 'hi'),
    autoTranslateText(story, 'ur'),
  ]);

  return {
    title_hi,
    title_ur,
    story_hi,
    story_ur,
  };
}

export async function autoTranslateStory(
  name: string,
  city: string,
  quote: string
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
    autoTranslateText(name, 'hi'),
    autoTranslateText(name, 'ur'),
    autoTranslateText(name, 'en'),
    autoTranslateText(city, 'hi'),
    autoTranslateText(city, 'ur'),
    autoTranslateText(city, 'en'),
    autoTranslateText(quote, 'hi'),
    autoTranslateText(quote, 'ur'),
    autoTranslateText(quote, 'en'),
  ]);

  return {
    hi: { name: name_hi || name, city: city_hi || city, quote: quote_hi || quote },
    ur: { name: name_ur || name, city: city_ur || city, quote: quote_ur || quote },
    en: { name: name_en || name, city: city_en || city, quote: quote_en || quote },
  };
}
