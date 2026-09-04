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
  'district_president':        { hi: 'जिला अध्यक्ष',        ur: 'ضلعی صدر' },
  'District President':        { hi: 'जिला अध्यक्ष',        ur: 'ضلعی صدر' },
  'district_coordinator':      { hi: 'जिला समन्वयक',        ur: 'ضلعی کوآرڈینیٹر' },
  'District Coordinator':      { hi: 'जिला समन्वयक',        ur: 'ضلعی کوآرڈینیٹر' },
  'district_gen_secretary':    { hi: 'जिला महासचिव',        ur: 'ضلعی جنرل سیکرٹری' },
  'District General Secretary':{ hi: 'जिला महासचिव',        ur: 'ضلعی جنرل سیکرٹری' },
  'district_secretary':        { hi: 'जिला सचिव',          ur: 'ضلعی سیکرٹری' },
  'District Secretary':        { hi: 'जिला सचिव',          ur: 'ضلعی سیکرٹری' },
  'district_finance_coord':    { hi: 'जिला वित्त समन्वयक',   ur: 'ضلعی فنانس کوآرڈینیٹر' },
  'District Finance Coordinator': { hi: 'जिला वित्त समन्वयक', ur: 'ضلعی فنانس کوآرڈینیٹر' },
};

export const DISTRICT_ROLE_MAP: Record<string, { en: string; hi: string; ur: string }> = {
  'district_president':         { en: 'District President', hi: 'जिला अध्यक्ष', ur: 'ضلعی صدر' },
  'district_coordinator':       { en: 'District Coordinator', hi: 'जिला समन्वयक', ur: 'ضلعی کوآرڈینیٹر' },
  'district_gen_secretary':     { en: 'District General Secretary', hi: 'जिला महासचिव', ur: 'ضلعی جنرل سیکرٹری' },
  'district_secretary':         { en: 'District Secretary', hi: 'जिला सचिव', ur: 'ضلعی سیکرٹری' },
  'district_finance_coord':     { en: 'District Finance Coordinator', hi: 'जिला वित्त समन्वयक', ur: 'ضلعی فنانس کوآرڈینیٹر' },
  'District President':         { en: 'District President', hi: 'जिला अध्यक्ष', ur: 'ضلعی صدر' },
  'District Coordinator':       { en: 'District Coordinator', hi: 'जिला समन्वयक', ur: 'ضلعی کوآرڈینیٹر' },
  'District General Secretary': { en: 'District General Secretary', hi: 'जिला महासचिव', ur: 'ضلعی جنرل سیکرٹری' },
  'District Secretary':         { en: 'District Secretary', hi: 'जिला सचिव', ur: 'ضلعی سیکرٹری' },
  'District Finance Coordinator': { en: 'District Finance Coordinator', hi: 'जिला वित्त समन्वयक', ur: 'ضلعی فنانس کوآرڈینیٹر' },
};


export function detectScript(text: string): 'hi' | 'ur' | 'en' {
  if (!text) return 'en';
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  if (/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text)) return 'ur';
  return 'en';
}

function resolveEnumTranslation(
  val: string,
  map: Record<string, { hi: string; ur: string; en?: string }>,
  targetLang: Language
): string {
  if (!val) return '';
  const trimmed = val.trim();
  // 1. Direct key match (e.g. key is 'Medical')
  if (map[trimmed]) {
    if (targetLang === 'en') return map[trimmed].en || trimmed;
    return map[trimmed][targetLang] || trimmed;
  }
  // 2. Reverse lookup across entries (e.g. val is 'चिकित्सा सहायता' or 'طبی امداد')
  for (const [key, item] of Object.entries(map)) {
    if (
      key.toLowerCase() === trimmed.toLowerCase() ||
      item.hi === trimmed ||
      item.ur === trimmed ||
      (item.en && item.en.toLowerCase() === trimmed.toLowerCase())
    ) {
      if (targetLang === 'en') return item.en || key;
      return item[targetLang] || (item.en || key);
    }
  }
  return trimmed;
}

// ─── CACHE HELPERS ────────────────────────────────────────────────────────────

/**
 * Reads the shared localStorage cache written by autoTranslateText().
 * Returns null if not cached or on SSR.
 */
export function getCachedTranslation(text: string, lang: Language): string | null {
  if (typeof window === 'undefined' || !text) return null;
  const trimmed = text.trim();
  if (detectScript(trimmed) === lang) return trimmed;
  try {
    const raw = localStorage.getItem('mfct_translation_cache_v2') || localStorage.getItem('mfct_translation_cache_v1');
    if (!raw) return null;
    const cache = JSON.parse(raw);
    const val = cache[`${lang}:${trimmed}`];
    if (val && (lang === 'hi' ? /[\u0900-\u097F]/.test(val) : lang === 'ur' ? /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(val) : /[a-zA-Z]/.test(val))) {
      return val;
    }
    return null;
  } catch {
    return null;
  }
}

// ─── SYNCHRONOUS TRANSLATE HELPERS ───────────────────────────────────────────
// These return the cached API translation if available, otherwise the original
// text as a graceful fallback. Actual translation is triggered by the calling
// component via `useDynamicTranslatedText(text, language)` from autoTranslate.ts.

/** Category badge labels — fixed enum, supports bidirectional translation. */
export function translateCategory(cat: string, lang: Language): string {
  if (!cat) return '';
  return resolveEnumTranslation(cat, CATEGORY_MAP, lang);
}

/** Religion badge labels — fixed enum, supports bidirectional translation. */
export function translateReligion(religion?: string, lang: Language = 'en'): string {
  if (!religion) return '';
  return resolveEnumTranslation(religion, RELIGION_MAP, lang);
}

/** Help-type badge labels — fixed enum, supports bidirectional translation. */
export function translateHelpType(helpType?: string, lang: Language = 'en'): string {
  if (!helpType) return '';
  return resolveEnumTranslation(helpType, HELP_TYPE_MAP, lang);
}

/** Role badge labels — fixed enum, supports bidirectional translation. */
export function translateRole(role: string, lang: Language): string {
  if (!role) return '';
  return resolveEnumTranslation(role, ROLE_MAP, lang);
}

/** District Role badge labels — fixed enum, supports bidirectional translation. */
export function translateDistrictRole(districtRole: string, lang: Language): string {
  if (!districtRole) return '';
  return resolveEnumTranslation(districtRole, DISTRICT_ROLE_MAP, lang);
}

// ─── USER-ENTERED CONTENT ─────────────────────────────────────────────────────
// The functions below handle arbitrary user-entered text (saved in English, Hindi, or Urdu).
// They return the dictionary / cached API result if present, otherwise the original text.
// The actual API call is handled by `useDynamicTranslatedText()` in the
// calling component.

/** City / location name — arbitrary user input, routed through dictionary & API cache. */
export function translateCity(city: string, lang: Language): string {
  if (!city) return '';
  if (detectScript(city) === lang) return city;
  return getCachedTranslation(city, lang) || city;
}

/** State / province name — arbitrary user input, routed through dictionary & API cache. */
export function translateState(state: string, lang: Language): string {
  if (!state) return '';
  if (detectScript(state) === lang) return state;
  return getCachedTranslation(state, lang) || state;
}

/** Community name — arbitrary user input, routed through API cache. */
export function translateCommunityName(name: string, lang: Language): string {
  if (!name) return '';
  if (detectScript(name) === lang) return name;
  return getCachedTranslation(name, lang) || name;
}

/** Community description — arbitrary user input, routed through API cache. */
export function translateCommunityDesc(desc: string, lang: Language): string {
  if (!desc) return '';
  if (detectScript(desc) === lang) return desc;
  return getCachedTranslation(desc, lang) || desc;
}

/** Admin / person name — arbitrary user input, routed through API cache. */
export function translateAdminName(name: string, lang: Language): string {
  if (!name) return '';
  if (detectScript(name) === lang) return name;
  return getCachedTranslation(name, lang) || name;
}

/** Campaign title — arbitrary user input, routed through API cache. */
export function translateCampaignTitle(title: string, lang: Language): string {
  if (!title) return '';
  if (detectScript(title) === lang) return title;
  return getCachedTranslation(title, lang) || title;
}

/** Campaign story / description — arbitrary user input, routed through API cache. */
export function translateCampaignStory(story: string, lang: Language): string {
  if (!story) return '';
  if (detectScript(story) === lang) return story;
  return getCachedTranslation(story, lang) || story;
}

/** Donor name — arbitrary user input, routed through API cache. */
export function translateDonorName(name: string, lang: Language): string {
  if (!name) return '';
  if (detectScript(name) === lang) return name;
  return getCachedTranslation(name, lang) || name;
}

/** Testimonial quote — arbitrary user input, routed through API cache. */
export function translateQuote(quote: string, lang: Language): string {
  if (!quote) return '';
  if (detectScript(quote) === lang) return quote;
  return getCachedTranslation(quote, lang) || quote;
}

/** Gallery photo title — arbitrary user input, routed through API cache. */
export function translateGalleryTitle(title: string, lang: Language): string {
  if (!title) return '';
  if (detectScript(title) === lang) return title;
  return getCachedTranslation(title, lang) || title;
}

// ─── COMPOUND OBJECT TRANSLATORS ─────────────────────────────────────────────
// These return a translated copy of a full entity object using cached values.
// For live translation in UI, use `useDynamicTranslatedText()` per field.

export function translateCampaign(c: Campaign, lang: Language): Campaign {
  return {
    ...c,
    title:         translateCampaignTitle(c.title, lang),
    story:         translateCampaignStory(c.story, lang),
    city:          translateCity(c.city, lang),
    communityName: translateCommunityName(c.communityName, lang),
    category:      translateCategory(c.category, lang) as any,
  };
}

export function translateCommunity(c: Community, lang: Language): Community {
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
  return {
    ...t,
    name:  translateDonorName(t.name, lang),
    role:  translateRole(t.role, lang),
    city:  translateCity(t.city, lang),
    quote: translateQuote(t.quote, lang),
  };
}

export function translateGalleryPhoto(p: GalleryPhoto, lang: Language): GalleryPhoto {
  return {
    ...p,
    title: translateGalleryTitle(p.title, lang),
    city:  translateCity(p.city, lang),
  };
}

export function translateCommunityStory(s: CommunityStory, lang: Language): CommunityStory {
  return {
    ...s,
    location: translateCity(s.location, lang),
    summary:  getCachedTranslation(s.summary, lang) || s.summary,
  };
}
