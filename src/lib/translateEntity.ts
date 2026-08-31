'use client';

/**
 * translateEntity.ts
 *
 * All dynamic user-entered content (names, cities, states, community names/descriptions,
 * campaign titles/stories, testimonial quotes, gallery titles, etc.) is translated via
 * the Groq API route (/api/translate) through `autoTranslateText()` and cached in localStorage.
 *
 * This file provides:
 * 1. Small STATIC maps ONLY for fixed enum-like system labels: category, religion, help type,
 *    and role badges — values that the admin always picks from a dropdown and are never
 *    free-typed by the end user.
 * 2. `getCachedTranslation()` — reads the shared localStorage cache that autoTranslateText
 *    writes to.
 * 3. Synchronous "translate*" helpers that return the cached value immediately (or the
 *    original text as fallback). These are used in components that cannot call a React hook
 *    (e.g. pure functions), but the real translation is always initiated by
 *    `useDynamicTranslatedText()` from autoTranslate.ts.
 *
 * DO NOT add static translations for user-entered data like person names, city/state strings,
 * community names, campaign titles, testimonial quotes, or descriptions. Those must go through
 * the API so any arbitrary value entered by an admin/user is translated correctly.
 */

import { Language } from '../context/LanguageContext';
import { Campaign, Community, Testimonial, CommunityStory } from '../types';
import { GalleryPhoto } from '../services/galleryService';

// ─── STATIC ENUM MAPS (dropdown-selected values only) ────────────────────────

const CATEGORY_MAP: Record<string, { hi: string; ur: string }> = {
  Medical:   { hi: 'चिकित्सा सहायता',        ur: 'طبی امداد' },
  Education: { hi: 'शिक्षा सहायता',           ur: 'تعلیمی امداد' },
  Marriage:  { hi: 'विवाह सहायता',            ur: 'نکاح امداد' },
  Food:      { hi: 'राशन एवं भोजन',           ur: 'راشن و خوراک' },
  Community: { hi: 'सामुदायिक कार्य',          ur: 'کمیونٹی فلاح' },
  Janazah:   { hi: 'जनाज़ा एवं अंतिम संस्कार', ur: 'جنازہ و کفن' },
  Zakat:     { hi: 'ज़कात पात्र',             ur: 'مستحقین زکوٰۃ' },
};

export const RELIGION_MAP: Record<string, { hi: string; ur: string }> = {
  Hindu:    { hi: 'हिन्दू',  ur: 'ہندو' },
  Muslim:   { hi: 'मुस्लिम', ur: 'مسلم' },
  Sikh:     { hi: 'सिख',    ur: 'سکھ' },
  Christian:{ hi: 'ईसाई',   ur: 'عیسائی' },
};

export const HELP_TYPE_MAP: Record<string, { hi: string; ur: string }> = {
  Zakat:  { hi: 'ज़कात', ur: 'زکوٰۃ' },
  Sadaka: { hi: 'सदका',  ur: 'صدقہ' },
  Fitra:  { hi: 'फ़ितरा', ur: 'فطرہ' },
  Other:  { hi: 'अन्य',  ur: 'دیگر' },
};

const ROLE_MAP: Record<string, { hi: string; ur: string }> = {
  'Verified Donor':            { hi: 'सत्यापित दानदाता',   ur: 'تصدیق شدہ عطیہ دہندہ' },
  'Beneficiary Father':        { hi: 'लाभार्थी पिता',       ur: 'مستفید والد' },
  'Widow Mother':              { hi: 'विधवा मां',            ur: 'بیوہ ماں' },
  'Community Admin':           { hi: 'सामुदायिक प्रशासक',   ur: 'کمیونٹی ایڈمن' },
  'Headquarters Administrator':{ hi: 'मुख्यालय प्रशासक',    ur: 'مرکزی ایڈمن' },
  'Member':                    { hi: 'सदस्य',               ur: 'ممبر' },
  'Volunteer':                 { hi: 'स्वयंसेवक',            ur: 'رضاکار' },
  'Regular Monthly Donor':     { hi: 'नियमित मासिक दानदाता', ur: 'ماہانہ ڈونر' },
  'Grassroots Field Volunteer':{ hi: 'ज़मीनी स्वयंसेवक',    ur: 'فیلڈ رضاکار' },
  'Community Organiser':       { hi: 'सामुदायिक आयोजक',     ur: 'کمیونٹی آرگنائزر' },
};

// ─── CACHE HELPERS ────────────────────────────────────────────────────────────

/**
 * Reads the shared localStorage cache written by autoTranslateText().
 * Returns null if not cached or on SSR.
 */
export function getCachedTranslation(text: string, lang: Language): string | null {
  if (typeof window === 'undefined' || !text || lang === 'en') return null;
  try {
    const raw = localStorage.getItem('mfct_translation_cache_v1');
    if (!raw) return null;
    const cache = JSON.parse(raw);
    return cache[`${lang}:${text.trim()}`] || null;
  } catch {
    return null;
  }
}

// ─── SYNCHRONOUS TRANSLATE HELPERS ───────────────────────────────────────────
// These return the cached API translation if available, otherwise the original
// text as a graceful fallback. Actual translation is triggered by the calling
// component via `useDynamicTranslatedText(text, language)` from autoTranslate.ts.

/** Category badge labels — fixed enum, always safe to use static map. */
export function translateCategory(cat: string, lang: Language): string {
  if (lang === 'en' || !cat) return cat;
  return CATEGORY_MAP[cat]?.[lang] || cat;
}

/** Religion badge labels — fixed enum, always safe to use static map. */
export function translateReligion(religion?: string, lang: Language = 'en'): string {
  if (!religion || lang === 'en') return religion || '';
  return RELIGION_MAP[religion]?.[lang] || religion;
}

/** Help-type badge labels — fixed enum, always safe to use static map. */
export function translateHelpType(helpType?: string, lang: Language = 'en'): string {
  if (!helpType || lang === 'en') return helpType || '';
  return HELP_TYPE_MAP[helpType]?.[lang] || helpType;
}

/** Role badge labels — fixed enum, always safe to use static map. */
export function translateRole(role: string, lang: Language): string {
  if (lang === 'en' || !role) return role;
  return ROLE_MAP[role]?.[lang] || role;
}

// ─── USER-ENTERED CONTENT ─────────────────────────────────────────────────────
// The functions below handle arbitrary user-entered text.
// They return the cached API result if present, otherwise the original text.
// The actual API call is always handled by `useDynamicTranslatedText()` in the
// calling component — these are just synchronous cache-read wrappers for contexts
// where hooks cannot be used.

/** City / location name — arbitrary user input, routed through API cache. */
export function translateCity(city: string, lang: Language): string {
  if (lang === 'en' || !city) return city;
  return getCachedTranslation(city, lang) || city;
}

/** State / province name — arbitrary user input, routed through API cache. */
export function translateState(state: string, lang: Language): string {
  if (lang === 'en' || !state) return state;
  return getCachedTranslation(state, lang) || state;
}

/** Community name — arbitrary user input, routed through API cache. */
export function translateCommunityName(name: string, lang: Language): string {
  if (lang === 'en' || !name) return name;
  return getCachedTranslation(name, lang) || name;
}

/** Community description — arbitrary user input, routed through API cache. */
export function translateCommunityDesc(desc: string, lang: Language): string {
  if (lang === 'en' || !desc) return desc;
  return getCachedTranslation(desc, lang) || desc;
}

/** Admin / person name — arbitrary user input, routed through API cache. */
export function translateAdminName(name: string, lang: Language): string {
  if (lang === 'en' || !name) return name;
  return getCachedTranslation(name, lang) || name;
}

/** Campaign title — arbitrary user input, routed through API cache. */
export function translateCampaignTitle(title: string, lang: Language): string {
  if (lang === 'en' || !title) return title;
  return getCachedTranslation(title, lang) || title;
}

/** Campaign story / description — arbitrary user input, routed through API cache. */
export function translateCampaignStory(story: string, lang: Language): string {
  if (lang === 'en' || !story) return story;
  return getCachedTranslation(story, lang) || story;
}

/** Donor name — arbitrary user input, routed through API cache. */
export function translateDonorName(name: string, lang: Language): string {
  if (lang === 'en' || !name) return name;
  return getCachedTranslation(name, lang) || name;
}

/** Testimonial quote — arbitrary user input, routed through API cache. */
export function translateQuote(quote: string, lang: Language): string {
  if (lang === 'en' || !quote) return quote;
  return getCachedTranslation(quote, lang) || quote;
}

/** Gallery photo title — arbitrary user input, routed through API cache. */
export function translateGalleryTitle(title: string, lang: Language): string {
  if (lang === 'en' || !title) return title;
  return getCachedTranslation(title, lang) || title;
}

// ─── COMPOUND OBJECT TRANSLATORS ─────────────────────────────────────────────
// These return a translated copy of a full entity object using cached values.
// For live translation in UI, use `useDynamicTranslatedText()` per field.

export function translateCampaign(c: Campaign, lang: Language): Campaign {
  if (lang === 'en') return c;
  return {
    ...c,
    title:         translateCampaignTitle(c.title, lang),
    story:         translateCampaignStory(c.story, lang),
    city:          translateCity(c.city, lang),
    communityName: translateCommunityName(c.communityName, lang),
  };
}

export function translateCommunity(c: Community, lang: Language): Community {
  if (lang === 'en') return c;
  return {
    ...c,
    name:        translateCommunityName(c.name, lang),
    description: translateCommunityDesc(c.description, lang),
    adminName:   translateAdminName(c.adminName, lang),
    city:        translateCity(c.city, lang),
    state:       translateState(c.state, lang),
  };
}

export function translateTestimonial(t: Testimonial, lang: Language): Testimonial {
  if (lang === 'en') return t;
  return {
    ...t,
    name:  translateDonorName(t.name, lang),
    role:  translateRole(t.role, lang),
    city:  translateCity(t.city, lang),
    quote: translateQuote(t.quote, lang),
  };
}

export function translateGalleryPhoto(p: GalleryPhoto, lang: Language): GalleryPhoto {
  if (lang === 'en') return p;
  return {
    ...p,
    title: translateGalleryTitle(p.title, lang),
    city:  translateCity(p.city, lang),
  };
}

export function translateCommunityStory(s: CommunityStory, lang: Language): CommunityStory {
  if (lang === 'en') return s;
  return {
    ...s,
    location: translateCity(s.location, lang),
    summary:  getCachedTranslation(s.summary, lang) || s.summary,
  };
}
