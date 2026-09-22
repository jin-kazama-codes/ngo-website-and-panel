import { DistrictPostDefinition } from '../types';

export interface DistrictInfo {
  id: string;
  name?: string;
  nameEn: string;
  nameHi: string;
  nameUr: string;
  stateEn: string;
  stateHi: string;
  stateUr: string;
  headquarters?: string;
  isPriority?: boolean;
}

export const DISTRICT_POSTS: DistrictPostDefinition[] = [
  {
    slotNumber: '01',
    key: 'district_president',
    titleEn: 'District President',
    titleHi: 'जिला अध्यक्ष',
    titleUr: 'ضلعی صدر',
    dutyEn: 'Leadership and coordination of all MFCT activities in the district.',
    dutyHi: 'जिले में MFCT की समस्त गतिविधियों का नेतृत्व एवं समन्वय।',
    dutyUr: 'ضلع میں MFCT کی تمام سرگرمیوں کی قیادت اور رابطہ کاری۔',
    color: '#d97706', // amber
  },
  {
    slotNumber: '02',
    key: 'district_coordinator',
    titleEn: 'District Coordinator',
    titleHi: 'जिला संयोजक',
    titleUr: 'ضلعی کوآرڈینیٹر',
    dutyEn: 'Daily coordination, membership expansion, KYC Verfication.',
    dutyHi: 'दैनिक समन्वय, सदस्यता विस्तार, KYC सत्यापन',
    dutyUr: 'روزمرہ رابطہ کاری، رکنیت سازی، کے وائی سی توثیق۔',
    color: '#059669', // emerald
  },
  {
    slotNumber: '03',
    key: 'district_gen_secretary',
    titleEn: 'District General Secretary',
    titleHi: 'जिला महासचिव',
    titleUr: 'ضلعی جنرل سیکرٹری',
    dutyEn: 'Organization expansion and coordination of block / municipal teams.',
    dutyHi: 'संगठन विस्तार एवं ब्लॉक / नगर टीमों का समन्वय।',
    dutyUr: 'تنظیمی توسیع اور بلاک / بلدیاتی ٹیموں کی رابطہ کاری۔',
    color: '#7c3aed', // violet/purple
  },
  {
    slotNumber: '04',
    key: 'district_secretary',
    titleEn: 'District Secretary',
    titleHi: 'जिला सचिव',
    titleUr: 'ضلعی سیکرٹری',
    dutyEn: 'Correspondence, meeting proceedings, announcements .',
    dutyHi: 'पत्राचार, बैठक कार्यवाही एवं घोषणाएं।',
    dutyUr: 'خط و کتابت، میٹنگ کی کارروائی اور اعلانات۔',
    color: '#2563eb', // blue
  },
  {
    slotNumber: '05',
    key: 'district_finance_coord',
    titleEn: 'District Finance Coordinator',
    titleHi: 'जिला वित्त समन्वयक',
    titleUr: 'ضلعی فنانس کوآرڈینیٹر',
    dutyEn: 'Financial records and documentary support for official transactions.',
    dutyHi: 'वित्तीय रिकॉर्ड एवं आधिकारिक लेन-देन के दस्तावेजी सहयोग।',
    dutyUr: 'مالیاتی ریکارڈ اور سرکاری لین دین میں دستاویزی معاونت۔',
    color: '#ea580c', // orange
  },
];

export interface HierarchyLevel {
  level: number;
  titleEn: string;
  titleHi: string;
  titleUr: string;
  descEn: string;
  descHi: string;
  descUr: string;
  badgeColor: string;
  roleScope: string;
  isGoldHighlight?: boolean;
}

export const ORGANIZATIONAL_HIERARCHY: HierarchyLevel[] = [
  {
    level: 1,
    titleEn: 'MFCT Central / State Team',
    titleHi: 'MFCT केंद्रीय / राज्य टीम',
    titleUr: 'مرکزی / ریاستی ٹیم',
    descEn: 'Supreme governance, state-wide policy, compliance, and fund sanctions.',
    descHi: 'सर्वोच्च प्रशासनिक नियंत्रण, राज्यव्यापी नीति एवं अंतिम अनुमोदन।',
    descUr: 'سپریم انتظامی کنٹرول، پالیسی سازی اور آخری منظوری۔',
    badgeColor: 'bg-amber-500 text-slate-950 font-bold',
    roleScope: 'Central Apex',
    isGoldHighlight: true,
  },
  {
    level: 2,
    titleEn: 'District President',
    titleHi: 'जिला अध्यक्ष',
    titleUr: 'ضلعی صدر',
    descEn: 'Overall leadership and coordination of all MFCT activities in the district.',
    descHi: 'जिले में ट्रस्ट की समस्त गतिविधियों का समग्र नेतृत्व एवं समन्वय।',
    descUr: 'ضلع میں تمام سرگرمیوں کی مجموعی قیادت اور سربراہی۔',
    badgeColor: 'bg-emerald-800 text-white font-bold',
    roleScope: 'District Leadership',
  },
  {
    level: 3,
    titleEn: 'District Coordinator',
    titleHi: 'जिला संयोजक',
    titleUr: 'ضلعی کوآرڈینیٹر',
    descEn: 'Daily operations, membership recruitment drives, and ground team formation.',
    descHi: 'दैनिक समन्वय, सदस्यता विस्तार, टीम गठन एवं रिपोर्टिंग।',
    descUr: 'روزمرہ رابطہ، رکنیت سازی کی مہمات اور رپورٹنگ۔',
    badgeColor: 'bg-emerald-700 text-white font-bold',
    roleScope: 'District Operations',
  },
  {
    level: 4,
    titleEn: 'District Executive Team',
    titleHi: 'जिला कार्यकारिणी टीम',
    titleUr: 'ضلعی مجلس عاملہ',
    descEn: 'General Secretary, Secretary, and Finance Coordinator managing functional divisions.',
    descHi: 'महासचिव, सचिव एवं वित्त समन्वयक द्वारा संचालित कार्यक्षेत्र।',
    descUr: 'جنرل سیکرٹری، سیکرٹری اور فنانس کوآرڈینیٹر کی مشترکہ ٹیم۔',
    badgeColor: 'bg-amber-600 text-white font-bold',
    roleScope: 'District Directorate',
    isGoldHighlight: true,
  },
  {
    level: 5,
    titleEn: 'Block / Municipal Team',
    titleHi: 'ब्लॉक / नगर टीम',
    titleUr: 'بلاک / نگر ٹیم',
    descEn: 'Tehsil and municipal level committees supervising grassroots relief cells.',
    descHi: 'तहसील व नगरपालिका स्तर पर सक्रिय स्थानीय संचालन समितियां।',
    descUr: 'تحصیل اور بلدیہ سطح پر سرگرم مقامی اکائیاں۔',
    badgeColor: 'bg-emerald-800 text-white font-bold',
    roleScope: 'Sub-District Units',
  },
  {
    level: 6,
    titleEn: 'Zonal / Sector Team',
    titleHi: 'क्षेत्रीय टीम',
    titleUr: 'علاقائی ٹیم',
    descEn: 'Area coordinators bridging block commands with neighborhood clusters.',
    descHi: 'ब्लॉक एवं मोहल्लों/गांवों के मध्य समन्वय स्थापित करने वाले क्षेत्रीय प्रभारी।',
    descUr: 'علاقائی رابطہ کار جو بلاک اور دیہات کے درمیان کام کرتے ہیں۔',
    badgeColor: 'bg-emerald-700 text-white font-bold',
    roleScope: 'Area Clusters',
  },
  {
    level: 7,
    titleEn: 'Village / Ward Volunteers',
    titleHi: 'ग्राम / वार्ड स्वयंसेवक',
    titleUr: 'گاؤں / وارڈ رضاکار',
    descEn: 'Grassroots volunteers conducting ground verification, aid delivery, and local surveys.',
    descHi: 'जमीनी सत्यापन, आपातकालीन राहत वितरण एवं स्थानीय सर्वेक्षण हेतु समर्पित कार्यकर्ता।',
    descUr: 'بنیادی سطح پر تصدیق اور امداد پہنچانے والے رضاکاران۔',
    badgeColor: 'bg-emerald-900 text-emerald-100 font-bold',
    roleScope: 'Ground Mobilization',
  },
  {
    level: 8,
    titleEn: 'MFCT Registered Members',
    titleHi: 'MFCT सदस्य',
    titleUr: 'اراکین ٹرسٹ',
    descEn: 'Registered supporters, regular monthly contributors, and benevolent donors.',
    descHi: 'पंजीकृत सदस्य, मासिक सहयोगी एवं समाज हितैषी दानदाता बंधु।',
    descUr: 'رجسٹرڈ ممبران، ماہانہ معاونین اور عام خیر خواہ۔',
    badgeColor: 'bg-amber-500 text-slate-950 font-bold',
    roleScope: 'General Membership',
    isGoldHighlight: true,
  },
];

export const STANDARD_DISTRICTS: DistrictInfo[] = [
  {
    id: 'Bareilly',
    nameEn: 'Bareilly',
    nameHi: 'बरेली',
    nameUr: 'بریلی',
    stateEn: 'Uttar Pradesh',
    stateHi: 'उत्तर प्रदेश',
    stateUr: 'اتر پردیش',
    headquarters: 'Bareilly Central',
    isPriority: true,
  },
  {
    id: 'Lucknow',
    nameEn: 'Lucknow',
    nameHi: 'लखनऊ',
    nameUr: 'لکھنؤ',
    stateEn: 'Uttar Pradesh',
    stateHi: 'उत्तर प्रदेश',
    stateUr: 'اتر پردیش',
    headquarters: 'Lucknow City',
    isPriority: true,
  },
  {
    id: 'Moradabad',
    nameEn: 'Moradabad',
    nameHi: 'मुरादाबाद',
    nameUr: 'مرادآباد',
    stateEn: 'Uttar Pradesh',
    stateHi: 'उत्तर प्रदेश',
    stateUr: 'اتر پردیش',
    headquarters: 'Moradabad Central',
    isPriority: true,
  },
  {
    id: 'Rampur',
    nameEn: 'Rampur',
    nameHi: 'रामपुर',
    nameUr: 'رام پور',
    stateEn: 'Uttar Pradesh',
    stateHi: 'उत्तर प्रदेश',
    stateUr: 'اتر پردیش',
    headquarters: 'Rampur City',
  },
  {
    id: 'Pilibhit',
    nameEn: 'Pilibhit',
    nameHi: 'पीलीभीत',
    nameUr: 'پیلی بھیت',
    stateEn: 'Uttar Pradesh',
    stateHi: 'उत्तर प्रदेश',
    stateUr: 'اتر پردیش',
    headquarters: 'Pilibhit Sadar',
  },
  {
    id: 'Shahjahanpur',
    nameEn: 'Shahjahanpur',
    nameHi: 'शाहजहांपुर',
    nameUr: 'شاہجہاں پور',
    stateEn: 'Uttar Pradesh',
    stateHi: 'उत्तर प्रदेश',
    stateUr: 'اتر پردیش',
    headquarters: 'Shahjahanpur City',
  },
  {
    id: 'Budaun',
    nameEn: 'Budaun',
    nameHi: 'बदायूँ',
    nameUr: 'بدایوں',
    stateEn: 'Uttar Pradesh',
    stateHi: 'उत्तर प्रदेश',
    stateUr: 'اتر پردیش',
    headquarters: 'Budaun Sadar',
  },
  {
    id: 'Bijnor',
    nameEn: 'Bijnor',
    nameHi: 'बिजनौर',
    nameUr: 'بجنور',
    stateEn: 'Uttar Pradesh',
    stateHi: 'उत्तर प्रदेश',
    stateUr: 'اتر پردیش',
  },
  {
    id: 'Sambhal',
    nameEn: 'Sambhal',
    nameHi: 'संभल',
    nameUr: 'سنبھل',
    stateEn: 'Uttar Pradesh',
    stateHi: 'उत्तर प्रदेश',
    stateUr: 'اتر پردیش',
  },
  {
    id: 'Aligarh',
    nameEn: 'Aligarh',
    nameHi: 'अलीगढ़',
    nameUr: 'علی گڑھ',
    stateEn: 'Uttar Pradesh',
    stateHi: 'उत्तर प्रदेश',
    stateUr: 'اتر پردیش',
  },
  {
    id: 'Meerut',
    nameEn: 'Meerut',
    nameHi: 'मेरठ',
    nameUr: 'میرٹھ',
    stateEn: 'Uttar Pradesh',
    stateHi: 'उत्तर प्रदेश',
    stateUr: 'اتر پردیش',
  },
  {
    id: 'Agra',
    nameEn: 'Agra',
    nameHi: 'आगरा',
    nameUr: 'آگرہ',
    stateEn: 'Uttar Pradesh',
    stateHi: 'उत्तर प्रदेश',
    stateUr: 'اتر پردیش',
  },
  {
    id: 'Kanpur',
    nameEn: 'Kanpur',
    nameHi: 'कानपुर',
    nameUr: 'کانپور',
    stateEn: 'Uttar Pradesh',
    stateHi: 'उत्तर प्रदेश',
    stateUr: 'اتر پردیش',
  },
  {
    id: 'Varanasi',
    nameEn: 'Varanasi',
    nameHi: 'वाराणसी',
    nameUr: 'وارانسی',
    stateEn: 'Uttar Pradesh',
    stateHi: 'उत्तर प्रदेश',
    stateUr: 'اتر پردیش',
  },
  {
    id: 'Prayagraj',
    nameEn: 'Prayagraj',
    nameHi: 'प्रयागराज',
    nameUr: 'پریاگ راج',
    stateEn: 'Uttar Pradesh',
    stateHi: 'उत्तर प्रदेश',
    stateUr: 'اتر پردیش',
  },
  {
    id: 'Gorakhpur',
    nameEn: 'Gorakhpur',
    nameHi: 'गोरखपुर',
    nameUr: 'گورکھپور',
    stateEn: 'Uttar Pradesh',
    stateHi: 'उत्तर प्रदेश',
    stateUr: 'اتر پردیش',
  },
];
