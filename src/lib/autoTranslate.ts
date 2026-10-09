'use client';

import { useState, useEffect } from 'react';
import { Language } from '../context/LanguageContext';
import { STANDARD_DISTRICTS } from '../data/districtsData';

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
  'danish': { hi: 'दानिश', ur: 'دانش', en: 'Danish' },
  'waseem': { hi: 'वसीम', ur: 'وسیم', en: 'Waseem' },
  'nadeem': { hi: 'नदीम', ur: 'ندیم', en: 'Nadeem' },
  'arif': { hi: 'आरिफ', ur: 'عارف', en: 'Arif' },
  'parvez': { hi: 'परवेज', ur: 'پرویز', en: 'Parvez' },
  'shahnawaz': { hi: 'शाहनवाज', ur: 'شاہ نواز', en: 'Shahnawaz' },
  'rizwan': { hi: 'रिजवान', ur: 'رضوان', en: 'Rizwan' },
  'abdul rahman': { hi: 'अब्दुल रहमान', ur: 'عبدالرحمٰن', en: 'Abdul Rahman' },

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

  // Common Communities
  'bareilly central care society (headquarters)': { hi: 'बरेली सेंट्रल केयर सोसाइटी (मुख्यालय)', ur: 'بریلی سنٹرل کیئر سوسائٹی (ہیڈ کوارٹر)', en: 'Bareilly Central Care Society (Headquarters)' },
  'bareilly central care society': { hi: 'बरेली सेंट्रल केयर सोसाइटी', ur: 'بریلی سنٹرل کیئر سوسائٹی', en: 'Bareilly Central Care Society' },
  'rohilkhand educational & nikah trust': { hi: 'रुहेलखंड एजुकेशनल एवं निकाह ट्रस्ट', ur: 'روہیل کھنڈ ایجوکیشنل اینڈ نکاح ٹرسٹ', en: 'Rohilkhand Educational & Nikah Trust' },
  'rohilkhand educational and nikah trust': { hi: 'रुहेलखंड एजुकेशनल एवं निकाह ट्रस्ट', ur: 'روہیل کھنڈ ایجوکیشنل اینڈ نکاح ٹرسٹ', en: 'Rohilkhand Educational & Nikah Trust' },
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

// Common Indian & Islamic names map for immediate phonetic accuracy
export const COMMON_HINDI_NAME_MAP: Record<string, string> = {
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
  'रहीम': 'Rahim',
  'करीम': 'Karim',
  'शकील': 'Shakeel',
  'जाहिद': 'Zahid',
  'अरशद': 'Arshad',
  'फैसल': 'Faisal',
  'फैजान': 'Faizan',
  'जीशान': 'Zeeshan',
  'नासिर': 'Nasir',
  'शब्बीर': 'Shabbir',
  'तौकीर': 'Tauqeer',
  'सलीम': 'Salim',
  'अकरम': 'Akram',
  'अजहर': 'Azhar',
  'मुस्तफा': 'Mustafa',
  'इरफान': 'Irfan',
  'कासिम': 'Qasim',
  'हसन': 'Hasan',
  'हुसैन': 'Hussain',
  'हैदर': 'Haider',
  'इकबाल': 'Iqbal',
  'अख्तर': 'Akhtar',
  'अंसारी': 'Ansari',
  'कुरैशी': 'Qureshi',
  'शेख': 'Sheikh',
  'मलिक': 'Malik',
  'चौधरी': 'Chaudhary',
  'सैफी': 'Saifi',
  'शर्मा': 'Sharma',
  'वर्मा': 'Verma',
  'गुप्ता': 'Gupta',
  'मिश्रा': 'Mishra',
  'पांडे': 'Pandey',
  'पाण्डेय': 'Pandey',
  'यादव': 'Yadav',
  'कुमार': 'Kumar',
  'सिंह': 'Singh',
  'प्रसाद': 'Prasad',
  'लाल': 'Lal',
  'देवी': 'Devi',
  'राम': 'Ram',
  'राहुल': 'Rahul',
  'रोहित': 'Rohit',
  'अमित': 'Amit',
  'सुमित': 'Sumit',
  'दीपक': 'Deepak',
  'सुरेश': 'Suresh',
  'रमेश': 'Ramesh',
  'मुकेश': 'Mukesh',
  'राजेश': 'Rajesh',
  'राकेश': 'Rakesh',
  'सुनील': 'Sunil',
  'अनिल': 'Anil',
  'संजय': 'Sanjay',
  'मनोज': 'Manoj',
  'अजय': 'Ajay',
  'विजय': 'Vijay',
  'विकास': 'Vikas',
  'संदीप': 'Sandeep',
  'प्रदीप': 'Pradeep',
  'नीरज': 'Neeraj',
  'पंकज': 'Pankaj',
  'आलोक': 'Alok',
  'आनंद': 'Anand',
  'सचिन': 'Sachin',
  'गौरव': 'Gaurav',
  'सौरभ': 'Saurabh',
  'मनीष': 'Manish',
  'नितिन': 'Nitin',
  'अंकित': 'Ankit',
  'पूजा': 'Pooja',
  'प्रिया': 'Priya',
  'आरती': 'Aarti',
  'सुनीता': 'Sunita',
  'गीता': 'Geeta',
  'रेखा': 'Rekha',
  'फातिमा': 'Fatima',
  'आयशा': 'Ayesha',
  'ज़ैनब': 'Zainab',
  'जैनब': 'Zainab',
  'मरियम': 'Maryam',
  'शबाना': 'Shabana',
  'परवीन': 'Parveen',
  'यासमीन': 'Yasmeen',
  'नसरीन': 'Nasreen',
  // Common spelling variants for districts/places
  'बदायूं': 'Budaun',
  'बदायूँ': 'Budaun',
  'रुहेलखंड': 'Rohilkhand',
  'रोहिलखंड': 'Rohilkhand',
  'पीलीभीत': 'Pilibhit',
  'शाहजहांपुर': 'Shahjahanpur',
  'संभल': 'Sambhal',
  'मुरादाबाद': 'Moradabad',
  'रामपुर': 'Rampur',
  'बिजनौर': 'Bijnor',
  'बरेली': 'Bareilly',
  'लखनऊ': 'Lucknow',
  'उत्तर प्रदेश': 'Uttar Pradesh',
};

// ─── PHONETIC DEVANAGARI TO ENGLISH TRANSLITERATOR ────────────────────────────
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

/**
 * Phonetically transliterates any Hindi / Devanagari text (names, places, etc.)
 * into clear, standard English (Latin script) with 100% offline reliability.
 */
export function devanagariToEnglish(text: string): string {
  if (!text) return '';

  const normalized = text
    .replace(/\bडॉ\.\s*/g, 'Dr. ')
    .replace(/\bइंजी\.\s*/g, 'Er. ')
    .replace(/\bमोह\.\s*/g, 'Mohd. ');

  const words = normalized.split(/\s+/);
  const translatedWords = words.map((word) => {
    // Keep numbers and non-Devanagari words intact
    if (!/[\u0900-\u097F]/.test(word)) {
      return word;
    }

    // Direct match in common Hindi names dictionary
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

      // Check nukta combinations (e.g. क + ़ = क़)
      let combined = ch;
      if (nextCh === '\u093C') {
        combined = ch + nextCh;
        i++;
      }

      // Special conjuncts
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

      // Matras
      if (MATRAS[combined]) {
        res += MATRAS[combined];
        continue;
      }

      // Independent Vowels
      if (INDEPENDENT_VOWELS[combined]) {
        res += INDEPENDENT_VOWELS[combined];
        continue;
      }

      // Halant (virama)
      if (combined === '्') {
        continue;
      }

      // Consonants
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

export function lookupDictionary(text: string, targetLang: Language): string | null {
  if (!text) return null;
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  // 1. Direct match in AUTO_TRANSLATE_DICTIONARY
  const entry = AUTO_TRANSLATE_DICTIONARY[lower];
  if (entry) {
    if (targetLang === 'en') return entry.en || text;
    if (targetLang === 'hi') return entry.hi;
    if (targetLang === 'ur') return entry.ur;
  }

  // 2. Reverse lookup in AUTO_TRANSLATE_DICTIONARY
  for (const [enKey, val] of Object.entries(AUTO_TRANSLATE_DICTIONARY)) {
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

  // 3. Search in STANDARD_DISTRICTS (district names and state names across en, hi, ur)
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

  // 5. Handle comma-separated locations e.g. "बरेली, उत्तर प्रदेश"
  if (trimmed.includes(',')) {
    const parts = trimmed.split(',').map((p) => p.trim());
    const translatedParts = parts.map((part) => lookupDictionary(part, targetLang) || (targetLang === 'en' && detectScript(part) === 'hi' ? devanagariToEnglish(part) : part));
    return translatedParts.join(', ');
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

export function setMemoryCache(key: string, value: string): void;
export function setMemoryCache(text: string, lang: string, value: string): void;
export function setMemoryCache(first: string, second: string, third?: string): void {
  const cache = getMemoryCache();
  if (third !== undefined) {
    const key = `${second}:${first.trim()}`;
    cache[key] = third;
  } else {
    cache[first] = second;
  }
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
export async function autoTranslateText(text: string, targetLang: Language | string): Promise<string> {
  if (!text || !text.trim()) return text || '';
  const lang: Language = (['en', 'hi', 'ur'].includes(targetLang) ? targetLang : 'en') as Language;

  const trimmed = text.trim();
  const sourceLang = detectScript(trimmed);

  // If text is already in the target language script, no translation needed
  if (sourceLang === lang) {
    return trimmed;
  }

  // If already pure ASCII and targeting English, no translation needed
  const isPureAscii = /^[\x00-\x7F]*$/.test(trimmed);
  if (lang === 'en' && isPureAscii) {
    return trimmed;
  }

  // 0. Check built-in high-accuracy dictionary (Instant 0ms)
  const dictMatch = lookupDictionary(trimmed, lang);
  if (dictMatch) {
    setMemoryCache(`${lang}:${trimmed}`, dictMatch);
    return dictMatch;
  }

  const cacheKey = `${lang}:${trimmed}`;
  const cache = getMemoryCache();
  if (cache[cacheKey] && isValidScript(cache[cacheKey], lang)) {
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
        body: JSON.stringify({ text: trimmed, targetLang: lang }),
      });

      if (!response.ok) {
        // Fallback for Hindi to English
        if (lang === 'en' && sourceLang === 'hi') {
          const fallbackTranslit = devanagariToEnglish(trimmed);
          if (fallbackTranslit && isValidScript(fallbackTranslit, 'en')) {
            setMemoryCache(cacheKey, fallbackTranslit);
            return fallbackTranslit;
          }
        }
        return trimmed;
      }

      const json = await response.json();
      if (json.success && json.translatedText && isValidScript(json.translatedText, lang)) {
        setMemoryCache(cacheKey, json.translatedText);
        return json.translatedText;
      }

      // If backend returned original text without translation, use offline transliterator for Hindi -> English
      if (lang === 'en' && sourceLang === 'hi') {
        const fallbackTranslit = devanagariToEnglish(trimmed);
        if (fallbackTranslit && isValidScript(fallbackTranslit, 'en')) {
          setMemoryCache(cacheKey, fallbackTranslit);
          return fallbackTranslit;
        }
      }
    } catch (err) {
      console.warn('autoTranslateText network issue, using offline transliteration:', err);
      if (lang === 'en' && sourceLang === 'hi') {
        const fallbackTranslit = devanagariToEnglish(trimmed);
        if (fallbackTranslit && isValidScript(fallbackTranslit, 'en')) {
          setMemoryCache(cacheKey, fallbackTranslit);
          return fallbackTranslit;
        }
      }
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
export function useDynamicTranslatedText(rawText: string | undefined, targetLang: Language | string): string {
  const text = rawText || '';
  const lang: Language = (['en', 'hi', 'ur'].includes(targetLang) ? targetLang : 'en') as Language;

  // Pre-calculate immediate sync value from script match, dictionary, transliterator, or validated cache
  const getImmediateValue = (str: string, l: Language): string => {
    if (!str) return '';
    const trimmed = str.trim();
    if (detectScript(trimmed) === l) return trimmed;
    if (l === 'en' && /^[\x00-\x7F]*$/.test(trimmed)) return trimmed;

    // Fast dictionary match (checks dictionary, standard districts, states, and common names)
    const dict = lookupDictionary(trimmed, l);
    if (dict) return dict;

    // Cache check
    const cache = getMemoryCache();
    const cached = cache[`${l}:${trimmed}`];
    if (cached && isValidScript(cached, l)) {
      return cached;
    }

    // Instant offline transliteration for Hindi to English
    if (l === 'en' && detectScript(trimmed) === 'hi') {
      const transliterated = devanagariToEnglish(trimmed);
      if (transliterated && isValidScript(transliterated, 'en')) {
        return transliterated;
      }
    }

    return str;
  };

  const [translated, setTranslated] = useState<string>(() => getImmediateValue(text, lang));

  useEffect(() => {
    if (!text) {
      setTranslated('');
      return;
    }

    const immediate = getImmediateValue(text, lang);
    setTranslated(immediate);

    const trimmed = text.trim();
    if (detectScript(trimmed) === lang) return;
    if (lang === 'en' && /^[\x00-\x7F]*$/.test(trimmed)) return;
    if (immediate !== text && isValidScript(immediate, lang)) return;

    let isMounted = true;
    autoTranslateText(text, lang).then((result) => {
      if (isMounted && result && isValidScript(result, lang)) {
        setTranslated(result);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [text, lang]);

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
