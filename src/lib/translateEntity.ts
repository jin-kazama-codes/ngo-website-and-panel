import { Language } from '../context/LanguageContext';
import { Campaign, Community, Testimonial, CommunityStory } from '../types';
import { GalleryPhoto } from '../services/galleryService';

const CITY_MAP: Record<string, { hi: string; ur: string }> = {
  Bareilly: { hi: 'बरेली', ur: 'بریلی' },
  Delhi: { hi: 'दिल्ली', ur: 'دہلی' },
  Lucknow: { hi: 'लखनऊ', ur: 'لکھنؤ' },
  Hyderabad: { hi: 'हैदराबाद', ur: 'حیدرآباد' },
  Mumbai: { hi: 'मुंबई', ur: 'ممبئی' },
};

const STATE_MAP: Record<string, { hi: string; ur: string }> = {
  'Uttar Pradesh': { hi: 'उत्तर प्रदेश', ur: 'اتر پردیش' },
  'State': { hi: 'राज्य', ur: 'ریاست' },
  'Delhi': { hi: 'दिल्ली', ur: 'دہلی' },
  'Telangana': { hi: 'तेलंगाना', ur: 'تلنگانہ' },
  'Maharashtra': { hi: 'महाराष्ट्र', ur: 'مہاراشٹر' },
};

const CATEGORY_MAP: Record<string, { hi: string; ur: string }> = {
  Medical: { hi: 'चिकित्सा सहायता', ur: 'طبی امداد' },
  Education: { hi: 'शिक्षा सहायता', ur: 'تعلیمی امداد' },
  Marriage: { hi: 'विवाह सहायता', ur: 'نکاح امداد' },
  Food: { hi: 'राशन एवं भोजन', ur: 'راشن و خوراک' },
  Community: { hi: 'सामुदायिक कार्य', ur: 'کمیونٹی فلاح' },
  Janazah: { hi: 'जनाज़ा एवं अंतिम संस्कार', ur: 'جنازہ و کفن' },
  Zakat: { hi: 'ज़कात पात्र', ur: 'مستحقین زکوٰۃ' },
};

const ROLE_MAP: Record<string, { hi: string; ur: string }> = {
  'Verified Donor': { hi: 'सत्यापित दानदाता', ur: 'تصدیق شدہ عطیہ دہندہ' },
  'Beneficiary Father': { hi: 'लाभार्थी पिता', ur: 'مستفید والد' },
  'Widow Mother': { hi: 'विधवा मां', ur: 'بیوہ ماں' },
  'Community Admin': { hi: 'सामुदायिक प्रशासक', ur: 'کمیونٹی ایڈمن' },
  'Headquarters Administrator': { hi: 'मुख्यालय प्रशासक', ur: 'مرکزی ایڈمن' },
  'Member': { hi: 'सदस्य', ur: 'ممبر' },
  'Volunteer': { hi: 'स्वयंसेवक', ur: 'رضاکار' },
  'Regular Monthly Donor': { hi: 'नियमित मासिक दानदाता', ur: 'ماہانہ ڈونر' },
  'Grassroots Field Volunteer': { hi: 'ज़मीनी स्वयंसेवक', ur: 'فیلڈ رضاکار' },
  'Community Organiser': { hi: 'सामुदायिक आयोजक', ur: 'کمیونٹی آرگنائزر' },
};

const ADMIN_NAME_MAP: Record<string, { hi: string; ur: string }> = {
  'Delhi Admin': { hi: 'दिल्ली प्रशासक', ur: 'دہلی ایڈمن' },
  'Bareilly Admin': { hi: 'बरेली प्रशासक', ur: 'بریلی ایڈمن' },
  'Lucknow Admin': { hi: 'लखनऊ प्रशासक', ur: 'لکھنؤ ایڈمن' },
  'Hyderabad Admin': { hi: 'हैदराबाद प्रशासक', ur: 'حیدرآباد ایڈمن' },
  'Mumbai Admin': { hi: 'मुंबई प्रशासक', ur: 'ممبئی ایڈمن' },
  'Maulana Hafiz Ziauddin Bareillvi': { hi: 'मौलाना हाफ़िज़ ज़ियाउद्दीन बरेलवी', ur: 'مولانا حافظ ضیاء الدین بریلوی' },
  'Farhan Ali Siddiqui': { hi: 'फरहान अली सिद्दीकी', ur: 'فرحان علی صدیقی' },
  'Dr. Mohammed Ahmed': { hi: 'डॉ. मोहम्मद अहमद', ur: 'ڈاکٹر محمد احمد' },
};

const COMMUNITY_NAME_MAP: Record<string, { hi: string; ur: string }> = {
  'Bareilly Central Care Society (Headquarters)': {
    hi: 'बरेली सेंट्रल केयर सोसाइटी (मुख्यालय)',
    ur: 'بریلی سینٹرل کیئر سوسائٹی (مرکزی دفتر)',
  },
  'Delhi Welfare Chapter': {
    hi: 'दिल्ली वेलफेयर चैप्टर',
    ur: 'دہلی ویلفیئر چیپٹر',
  },
  'Bareilly Welfare Chapter': {
    hi: 'बरेली वेलफेयर चैप्टर',
    ur: 'بریلی ویلفیئر چیپٹر',
  },
  'Lucknow Welfare Chapter': {
    hi: 'लखनऊ वेलफेयर चैप्टर',
    ur: 'لکھنؤ ویلفیئر چیپٹر',
  },
  'Hyderabad Welfare Chapter': {
    hi: 'हैदराबाद वेलफेयर चैप्टर',
    ur: 'حیدرآباد ویلفیئر چیپٹر',
  },
  'Mumbai Welfare Chapter': {
    hi: 'मुंबई वेलफेयर चैप्टर',
    ur: 'ممبئی ویلفیئر چیپٹر',
  },
  'Hazrat Nizamuddin Welfare Community': {
    hi: 'हज़रत निज़ामुद्दीन कल्याण समिति',
    ur: 'حضرت نظام الدین ویلفیئر کمیونٹی',
  },
  'Bareilly Unity & Relief Council': {
    hi: 'बरेली एकता एवं राहत परिषद',
    ur: 'بریلی یونٹی اینڈ ریلیف کونسل',
  },
  'Charminar Heritage & Care Society': {
    hi: 'चारमीनार हेरिटेज एंड केयर सोसाइटी',
    ur: 'چارمینار ہیریٹیج اینڈ کیئر سوسائٹی',
  },
  'Chowk Heritage Community Foundation': {
    hi: 'चौक हेरिटेज कम्युनिटी फाउंडेशन',
    ur: 'چوک ہیریٹیج کمیونٹی فاؤنڈیشن',
  },
};

const COMMUNITY_DESC_MAP: Record<string, { hi: string; ur: string }> = {
  'Headquarters of SevaSangam in Civil Lines, Bareilly. Managing emergency Janazah mortuary van, Nikah bridal kits, and student scholarships across Uttar Pradesh.': {
    hi: 'सिविल लाइंस, बरेली में मुख्य कार्यालय। आपातकालीन जनाज़ा वैन, निकाह किट और उत्तर प्रदेश में छात्रवृत्ति का प्रबंधन।',
    ur: 'سول لائنز، بریلی میں مرکزی دفتر۔ ہنگامی جنازہ وین، نکاح کٹ اور پورے اتر پردیش میں طلباء کے وظائف کا انتظام۔',
  },
  'Official chapter for Delhi providing local emergency aid.': {
    hi: 'दिल्ली के लिए आधिकारिक चैप्टर जो स्थानीय आपातकालीन सहायता प्रदान करता है।',
    ur: 'دہلی کے لیے سرکاری چیپٹر جو مقامی ہنگامی امداد فراہم کرتا ہے۔',
  },
  'Official chapter for Bareilly providing local emergency aid.': {
    hi: 'बरेली के लिए आधिकारिक चैप्टर जो स्थानीय आपातकालीन सहायता प्रदान करता है।',
    ur: 'بریلی کے لیے سرکاری چیپٹر جو مقامی ہنگامی امداد فراہم کرتا ہے۔',
  },
  'Official chapter for Lucknow providing local emergency aid.': {
    hi: 'लखनऊ के लिए आधिकारिक चैप्टर जो स्थानीय आपातकालीन सहायता प्रदान करता है।',
    ur: 'لکھنؤ کے لیے سرکاری چیپٹر جو مقامی ہنگامی امداد فراہم کرتا ہے۔',
  },
  'Official chapter for Hyderabad providing local emergency aid.': {
    hi: 'हैदराबाद के लिए आधिकारिक चैप्टर जो स्थानीय आपातकालीन सहायता प्रदान करता है।',
    ur: 'حیدرآباد کے لیے سرکاری چیپٹر جو مقامی ہنگامی امداد فراہم کرتا ہے۔',
  },
  'Official chapter for Mumbai providing local emergency aid.': {
    hi: 'मुंबई के लिए आधिकारिक चैप्टर जो स्थानीय आपातकालीन सहायता प्रदान करता है।',
    ur: 'ممبئی کے لیے سرکاری چیپٹر جو مقامی ہنگامی امداد فراہم کرتا ہے۔',
  },
};

const QUOTE_MAP: Record<string, { hi: string; ur: string }> = {
  'This platform has made it so easy to see the direct impact of our contributions. Highly recommended and trustworthy!': {
    hi: 'इस मंच ने हमारे योगदान के प्रत्यक्ष प्रभाव को देखना बहुत आसान बना दिया है। अत्यधिक अनुशंसित और भरोसेमंद!',
    ur: 'اس پلیٹ فارم نے ہمارے عطیات کے براہ راست اثرات کو دیکھنا انتہائی آسان بنا دیا ہے۔ قابل اعتماد اور بہترین!',
  },
  'When my daughter Zoya needed an emergency kidney transplant, our local SevaSangam community raised ₹3.2 Lakhs in under two weeks. The transparency and direct hospital payments gave us hope.': {
    hi: 'जब मेरी बेटी ज़ोया को आपातकालीन किडनी ट्रांसप्लांट की ज़रूरत थी, तो हमारे स्थानीय समुदाय ने दो सप्ताह से भी कम समय में ₹3.2 लाख जुटाए। पारदर्शिता ने हमें नई उम्मीद दी।',
    ur: 'جب میری بیٹی زویا کو ایمرجنسی گردے کی پیوند کاری کی ضرورت تھی، تو مقامی کمیونٹی نے دو ہفتوں میں ₹3.2 لاکھ اکٹھے کیے۔ شفافیت نے ہمیں نئی امید بخشی۔',
  },
  'As a single mother working on daily stitching wages, I could never have arranged my daughter Sania’s wedding essentials without the community’s ₹50 membership solidarity.': {
    hi: 'दैनिक सिलाई पर काम करने वाली एक अकेली माँ के रूप में, मैं समुदाय की ₹50 सदस्यता एकजुटता के बिना अपनी बेटी सानिया की शादी की व्यवस्था कभी नहीं कर पाती।',
    ur: 'سلائی مزدوری کرنے والی تنہا ماں کے طور پر، میں محلے کے ₹50 ممبرشپ فنڈ کے بغیر اپنی بیٹی ثانیہ کے نکاح کا انتظام کبھی نہیں کر سکتی تھی۔',
  },
  'Managing 2,000+ local families through SevaSangam has completely eliminated fraud. Every rupee donated inside or outside our community is tracked with clear UTR receipts.': {
    hi: 'इस मंच के माध्यम से 2,000+ स्थानीय परिवारों का प्रबंधन करने से धोखाधड़ी पूरी तरह खत्म हो गई है। प्रत्येक दान किए गए रुपये को स्पष्ट यूटीआर रसीदों के साथ ट्रैक किया जाता है।',
    ur: 'اس پلیٹ فارم کے ذریعے 2,000+ خاندانوں کا انتظام کرنے سے دھوکہ دہی کا خاتمہ ہو گیا ہے۔ ہر ایک روپے کا حساب واضح یو ٹی آر رسید کے ساتھ رکھا جاتا ہے۔',
  },
};

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

export function translateCity(city: string, lang: Language): string {
  if (lang === 'en' || !city) return city;
  return CITY_MAP[city]?.[lang] || city;
}

export function translateState(state: string, lang: Language): string {
  if (lang === 'en' || !state) return state;
  return STATE_MAP[state]?.[lang] || state;
}

export function translateCategory(cat: string, lang: Language): string {
  if (lang === 'en' || !cat) return cat;
  return CATEGORY_MAP[cat]?.[lang] || cat;
}

export function translateRole(role: string, lang: Language): string {
  if (lang === 'en' || !role) return role;
  return ROLE_MAP[role]?.[lang] || role;
}

export function translateAdminName(name: string, lang: Language): string {
  if (lang === 'en' || !name) return name;
  return ADMIN_NAME_MAP[name]?.[lang] || name;
}

export function translateCommunityName(name: string, lang: Language): string {
  if (lang === 'en' || !name) return name;
  if (COMMUNITY_NAME_MAP[name]?.[lang]) {
    return COMMUNITY_NAME_MAP[name][lang];
  }
  // Pattern matching: e.g. "City Welfare Chapter"
  for (const [cityKey, cityTrans] of Object.entries(CITY_MAP)) {
    if (name.includes(cityKey)) {
      if (name.includes('Welfare Chapter')) {
        return lang === 'hi'
          ? `${cityTrans.hi} वेलफेयर चैप्टर`
          : `${cityTrans.ur} ویلفیئر چیپٹر`;
      }
    }
  }
  return name;
}

export function translateCommunityDesc(desc: string, lang: Language): string {
  if (lang === 'en' || !desc) return desc;
  if (COMMUNITY_DESC_MAP[desc]?.[lang]) {
    return COMMUNITY_DESC_MAP[desc][lang];
  }
  // Pattern: "Official chapter for [City] providing local emergency aid."
  for (const [cityKey, cityTrans] of Object.entries(CITY_MAP)) {
    if (desc.includes(`for ${cityKey}`)) {
      return lang === 'hi'
        ? `${cityTrans.hi} के लिए आधिकारिक चैप्टर जो स्थानीय आपातकालीन सहायता प्रदान करता है।`
        : `${cityTrans.ur} کے لیے سرکاری چیپٹر جو مقامی ہنگامی امداد فراہم کرتا ہے۔`;
    }
  }
  return desc;
}

const DONOR_NAME_MAP: Record<string, { hi: string; ur: string }> = {
  'Anonymous Supporter': { hi: 'गुमनाम समर्थक', ur: 'گمنام معاون' },
  'Anonymous': { hi: 'गुमनाम दानदाता', ur: 'گمنام عطیہ دہندہ' },
  'anonymous supporter': { hi: 'गुमनाम समर्थक', ur: 'گمنام معاون' },
  'zaid alam': { hi: 'ज़ैद आलम', ur: 'زید عالم' },
  'Zaid Alam': { hi: 'ज़ैद आलम', ur: 'زید عالم' },
  'Faraz Hussain': { hi: 'फ़राज़ हुसैन', ur: 'فراز حسین' },
  'faraz hussain': { hi: 'फ़राज़ हुसैन', ur: 'فراز حسین' },
  'afzal rehman': { hi: 'अफ़ज़ल रहमान', ur: 'افضل رحمان' },
  'Afzal Rehman': { hi: 'अफ़ज़ल रहमान', ur: 'افضل رحمان' },
  'Mohd Faheem': { hi: 'मोहम्मद फहीम', ur: 'محمد فہیم' },
  'mohd faheem': { hi: 'मोहम्मद फहीम', ur: 'محمد فہیم' },
  'Mohammad Faeem': { hi: 'मोहम्मद फहीम', ur: 'محمد فہیم' },
  'Tariq Anwer': { hi: 'तारिक अनवर', ur: 'طارق انور' },
  'Sohail Khan': { hi: 'सोहेल खान', ur: 'سہیل خان' },
  'Imran Malik': { hi: 'इमरान मलिक', ur: 'عمران ملک' },
  'Arshad Warsi': { hi: 'अरशद वारसी', ur: 'ارشد وارثی' },
  'Salman Khan': { hi: 'सलमान खान', ur: 'سلمان خان' },
  'Aamir Khan': { hi: 'आमिर खान', ur: 'عامر خان' },
  'Bareilly Care Admin': { hi: 'बरेली केयर प्रशासक', ur: 'بریلی کیئر ایڈمن' },
};

export function translateDonorName(name: string, lang: Language): string {
  if (lang === 'en' || !name) return name;
  const cached = getCachedTranslation(name, lang);
  if (cached) return cached;

  if (DONOR_NAME_MAP[name]?.[lang]) {
    return DONOR_NAME_MAP[name][lang];
  }
  const lower = name.toLowerCase().trim();
  for (const [k, v] of Object.entries(DONOR_NAME_MAP)) {
    if (k.toLowerCase().trim() === lower) {
      return v[lang];
    }
  }

  // Match "Donor X from City"
  const donorMatch = name.match(/Donor\s+(\d+)\s+from\s+(\w+)/i);
  if (donorMatch) {
    const num = donorMatch[1];
    const city = donorMatch[2];
    const translatedCity = CITY_MAP[city]?.[lang] || city;
    return lang === 'hi'
      ? `दानदाता ${num} (${translatedCity})`
      : `عطیہ دہندہ ${num} (${translatedCity})`;
  }
  if (ADMIN_NAME_MAP[name]?.[lang]) {
    return ADMIN_NAME_MAP[name][lang];
  }
  return name;
}

export function translateQuote(quote: string, lang: Language): string {
  if (lang === 'en' || !quote) return quote;
  if (QUOTE_MAP[quote]?.[lang]) {
    return QUOTE_MAP[quote][lang];
  }
  return quote;
}

export function translateCampaignTitle(title: string, lang: Language): string {
  if (lang === 'en' || !title) return title;
  const cached = getCachedTranslation(title, lang);
  if (cached) return cached;

  // Match "Urgent [Category] Support for Family in [City]"
  const match = title.match(/Urgent\s+(\w+)\s+Support\s+for\s+Family\s+in\s+(\w+)/i);
  if (match) {
    const cat = match[1];
    const city = match[2];
    const transCat = CATEGORY_MAP[cat]?.[lang] || cat;
    const transCity = CITY_MAP[city]?.[lang] || city;
    return lang === 'hi'
      ? `${transCity} में परिवार के लिए तत्काल ${transCat}`
      : `${transCity} میں خاندان کے لیے فوری ${transCat}`;
  }
  return title;
}

export function translateCampaignStory(story: string, lang: Language): string {
  if (lang === 'en' || !story) return story;
  const cached = getCachedTranslation(story, lang);
  if (cached) return cached;

  if (story.includes('This is a detailed story about the cause')) {
    return lang === 'hi'
      ? 'यह इस मामले की विस्तृत जानकारी है। उन्हें तत्काल सहायता की आवश्यकता है। हम सभी से आगे आने और इस कारण का समर्थन करने का अनुरोध करते हैं।'
      : 'یہ اس کیس کی تفصیلی معلومات ہے۔ انہیں فوری مدد کی ضرورت ہے۔ ہم سب سے گزارش کرتے ہیں کہ آگے آئیں اور اس نیک کام میں حصہ لیں۔';
  }
  return story;
}

export function translateTestimonial(t: Testimonial, lang: Language): Testimonial {
  if (lang === 'en') return t;
  return {
    ...t,
    name: translateDonorName(t.name, lang),
    role: translateRole(t.role, lang),
    city: translateCity(t.city, lang),
    quote: translateQuote(t.quote, lang),
  };
}

export function translateCommunity(c: Community, lang: Language): Community {
  if (lang === 'en') return c;
  return {
    ...c,
    name: translateCommunityName(c.name, lang),
    description: translateCommunityDesc(c.description, lang),
    adminName: translateAdminName(c.adminName, lang),
    city: translateCity(c.city, lang),
    state: translateState(c.state, lang),
  };
}

export function translateCampaign(c: Campaign, lang: Language): Campaign {
  if (lang === 'en') return c;
  return {
    ...c,
    title: translateCampaignTitle(c.title, lang),
    story: translateCampaignStory(c.story, lang),
    city: translateCity(c.city, lang),
    communityName: translateCommunityName(c.communityName, lang),
  };
}

export function translateGalleryPhoto(p: GalleryPhoto, lang: Language): GalleryPhoto {
  if (lang === 'en') return p;
  const match = p.title.match(/Food Drive in (\w+)/i);
  let title = p.title;
  if (match) {
    const city = match[1];
    const transCity = CITY_MAP[city]?.[lang] || city;
    title = lang === 'hi' ? `${transCity} में खाद्य वितरण अभियान` : `${transCity} میں راشن تقسیم مہم`;
  }
  return {
    ...p,
    title,
    city: translateCity(p.city, lang),
  };
}

export function translateCommunityStory(s: CommunityStory, lang: Language): CommunityStory {
  if (lang === 'en') return s;
  return {
    ...s,
    summary: lang === 'hi' ? 'सामुदायिक सहायता की एक प्रेरणादायक कहानी।' : 'کمیونٹی سپورٹ کی ایک شاندار کہانی۔',
    impactMetric: lang === 'hi' ? '1 जान बचाई गई' : '1 جان بچائی گئی',
    location: translateCity(s.location, lang),
  };
}
