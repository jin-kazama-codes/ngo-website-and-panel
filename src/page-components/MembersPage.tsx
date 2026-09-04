'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Building2,
  UserPlus,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Download,
  Copy,
  Check,
  Briefcase,
  Calendar,
  Mail,
  Shield,
  Hash,
  Award,
  Phone
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// Comprehensive Name / Word Translation Map
const TRANSLATION_MAP: Record<string, { hi: string; ur: string }> = {
  'mohd nayeem': { hi: 'मोहम्मद नईम', ur: 'محمد نعیم' },
  'mohammad nayeem': { hi: 'मोहम्मद नईम', ur: 'محمد نعیم' },
  'nayeem': { hi: 'नईम', ur: 'نعیم' },
  'er. mohammad zahid': { hi: 'इंजी. मोहम्मद जाहिद', ur: 'انجینئر محمد زاہد' },
  'er mohammad zahid': { hi: 'इंजी. मोहम्मद जाहिद', ur: 'انجینئر محمد زاہد' },
  'uttar pradesh': { hi: 'उत्तर प्रदेश', ur: 'اتر پردیش' },
  // Names
  'gulam raza': { hi: 'गुलाम रज़ा', ur: 'غलाम رضا' },
  'ghulam raza': { hi: 'गुलाम रज़ा', ur: 'غलाम رضا' },
  'farhan ali siddiqui': { hi: 'फरहान अली सिद्दीकी', ur: 'فرحان علی صدیقی' },
  'dr. shakeel ahmad usmani': { hi: 'डॉ. शकील अहमद उस्मानी', ur: 'ڈاکٹر شکیل احمد عثمانی' },
  'shakeel ahmad usmani': { hi: 'शकील अहमद उस्मानी', ur: 'شکیل احمد عثمانی' },
  'mohammad faeem': { hi: 'मोहम्मद फ़ईम', ur: 'محمد فہیم' },
  'aafaq ahmad': { hi: 'आफ़ाक़ अहमद', ur: 'آفاق احمد' },
  'tariq khan': { hi: 'तारिक खान', ur: 'طارق خان' },
  'zaid ahmed': { hi: 'ज़ैद अहमद', ur: 'زید احمد' },
  'mohd arshad': { hi: 'मोहम्मद अरशद', ur: 'محمد ارشد' },
  'salman khan': { hi: 'सलमान खान', ur: 'سلمان خان' },
  'rehan ali': { hi: 'रेहान अली', ur: 'ریحان علی' },
  'sohail ahmad': { hi: 'सोहेल अहमद', ur: 'سہیل احمد' },
  'imran khan': { hi: 'इमरान खान', ur: 'عمران خان' },
  'adnan siddiqui': { hi: 'अदनान सिद्दीकी', ur: 'عدنان صدیقی' },
  'waseem akram': { hi: 'वसीम अकरम', ur: 'وسیم اکرم' },
  'irfan habib': { hi: 'इरफान हबीब', ur: 'عرفان حبیب' },
  'nasir hussain': { hi: 'नासिर हुसैन', ur: 'ناصر حسین' },
  'kamran ali': { hi: 'कामरान अली', ur: 'کامران علی' },
  'aslam khan': { hi: 'अस्लम खान', ur: 'اسلم خان' },
  'nadeem ahmad': { hi: 'नदीम अहमद', ur: 'ندیم احمد' },
  'shabnam bano': { hi: 'शबनम बानो', ur: 'شبنم بانو' },
  'yasmeen parveen': { hi: 'यासमीन परवीन', ur: 'یاسمین پروین' },
  'fatima khatoon': { hi: 'फातिमा खातून', ur: 'فاطمہ خاتون' },
  'aisha begum': { hi: 'आयशा बेगम', ur: 'عائشہ بیگم' },
  'farhana parveen': { hi: 'फरहाना परवीन', ur: 'فرحانہ پروین' },
  'rubina bano': { hi: 'रुबीना बानो', ur: 'روبینہ بانو' },
  'gulzar ahmad': { hi: 'गुलज़ार अहमद', ur: 'گلزار احمد' },

  // Communities
  'bareilly central care society (headquarters)': { hi: 'बरेली सेंट्रल केयर सोसाइटी (मुख्यालय)', ur: 'بریلی سنٹرل کیئر سوسائٹی (ہیڈ کوارٹر)' },
  'rohilkhand educational & nikah trust': { hi: 'रुहेलखंड एजुकेशनल एवं निकाह ट्रस्ट', ur: 'روہیل کھنڈ ایجوکیشنل اینڈ نکاح ٹرسٹ' },
  'maharajganj welfare foundation': { hi: 'महराजगंज वेलफेयर फाउंडेशन', ur: 'مہراج گنج ویلفیئر فاؤنڈیشن' },
  'lucknow youth care': { hi: 'लखनऊ यूथ केयर', ur: 'لکھنؤ یوتھ کیئر' },
  'moradabad health network': { hi: 'मुरादाबाद हेल्थ नेटवर्क', ur: 'مرادآباد ہیلتھ نیٹ ورک' },

  // Districts
  'bareilly': { hi: 'बरेली', ur: 'بریلی' },
  'maharajganj': { hi: 'महराजगंज', ur: 'مہراج گنج' },
  'lucknow': { hi: 'लखनऊ', ur: 'لکھنؤ' },
  'moradabad': { hi: 'मुरादाबाद', ur: 'مرادآباد' },
  'rampur': { hi: 'रामपुर', ur: 'رام پور' },
  'pilibhit': { hi: 'पीलीभीत', ur: 'پیلی بھیت' },
  'shahjahanpur': { hi: 'शाहजहांपुर', ur: 'شاہجہاں پور' },
  'budaun': { hi: 'बदायूँ', ur: 'بدایوں' },
  'bijnor': { hi: 'बिजनौर', ur: 'بجنور' },
  'sambhal': { hi: 'संभल', ur: 'سنبھل' },
  'meerut': { hi: 'मेरठ', ur: 'میرٹھ' },
  'aligarh': { hi: 'अलीगढ़', ur: 'علی گڑھ' },
  'agra': { hi: 'आगरा', ur: 'آگرہ' },
  'varanasi': { hi: 'वाराणसी', ur: 'وارانسی' },
  'kanpur': { hi: 'कानपुर', ur: 'کانپور' },
  'prayagraj': { hi: 'प्रयागराज', ur: 'پریاگ راج' },
  'gorakhpur': { hi: 'गोरखपुर', ur: 'گورکھپور' },

  // Roles
  'district president': { hi: 'जिला अध्यक्ष', ur: 'ضلعی صدر' },
  'district_president': { hi: 'जिला अध्यक्ष', ur: 'ضلعی صدر' },
  'district coordinator': { hi: 'जिला समन्वयक', ur: 'ضلعی کوآرڈینیٹر' },
  'district_coordinator': { hi: 'जिला समन्वयक', ur: 'ضلعی کوآرڈینیٹر' },
  'district general secretary': { hi: 'जिला महासचिव', ur: 'ضلعی جنرل سیکرٹری' },
  'district_gen_secretary': { hi: 'जिला महासचिव', ur: 'ضلعی جنرل سیکرٹری' },
  'district secretary': { hi: 'जिला सचिव', ur: 'ضلعی سیکرٹری' },
  'district_secretary': { hi: 'जिला सचिव', ur: 'ضلعی سیکرٹری' },
  'district finance coordinator': { hi: 'जिला वित्त समन्वयक', ur: 'ضلعی فنانس کوآرڈینیٹر' },
  'district_finance_coord': { hi: 'जिला वित्त समन्वयक', ur: 'ضلعی فنانس کوآرڈینیٹر' },
  'general member': { hi: 'साधारण सदस्य', ur: 'عام ممبر' },
  'member': { hi: 'सदस्य', ur: 'ممبر' },
  'executive admin': { hi: 'कार्यकारी व्यवस्थापक', ur: 'ایگزیکٹو ایڈمن' },
  'executive_admin': { hi: 'कार्यकारी व्यवस्थापक', ur: 'ایگزیکٹو ایڈمن' },
  'community admin': { hi: 'समुदाय व्यवस्थापक', ur: 'کمیونٹی ایڈمن' },
  'community_admin': { hi: 'समुदाय व्यवस्थापक', ur: 'کمیونٹی ایڈمن' },
  'premium donor': { hi: 'विशिष्ट दानदाता', ur: 'پریمیم ڈونر' },
  'premium_donor': { hi: 'विशिष्ट दानदाता', ur: 'پریمیم ڈونر' },
};

import { useDynamicTranslatedText } from '../lib/autoTranslate';

function detectScript(text: string): 'hi' | 'ur' | 'en' {
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  if (/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text)) return 'ur';
  return 'en';
}

// Transliterate / Translate helper with bidirectional fallback
function formatTextByLang(text: string | undefined | null, lang: string): string {
  if (!text) return '—';
  const trimmed = text.trim();
  if (detectScript(trimmed) === lang) return trimmed;

  const key = trimmed.toLowerCase();
  if (TRANSLATION_MAP[key]) {
    if (lang === 'en') {
      return key.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
    return lang === 'ur' ? TRANSLATION_MAP[key].ur : TRANSLATION_MAP[key].hi;
  }

  // Reverse lookup across entries if input is in Hindi or Urdu
  for (const [enKey, val] of Object.entries(TRANSLATION_MAP)) {
    if (val.hi === trimmed || val.ur === trimmed) {
      if (lang === 'en') {
        return enKey.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      }
      return val[lang as 'hi' | 'ur'] || trimmed;
    }
  }

  // Handle strings with brackets like "Farhan Ali Siddiqui (Executive Admin)"
  const bracketMatch = trimmed.match(/^(.+?)\s*\((.+?)\)$/);
  if (bracketMatch) {
    const mainPart = formatTextByLang(bracketMatch[1], lang);
    const subPart = formatTextByLang(bracketMatch[2], lang);
    return `${mainPart} (${subPart})`;
  }

  return trimmed;
}

// UP Districts List
const UP_DISTRICTS = [
  'Bareilly',
  'Maharajganj',
  'Lucknow',
  'Agra',
  'Aligarh',
  'Ambedkar Nagar',
  'Amethi',
  'Amroha',
  'Auraiya',
  'Ayodhya',
  'Azamgarh',
  'Baghpat',
  'Bahraich',
  'Ballia',
  'Balrampur',
  'Banda',
  'Barabanki',
  'Basti',
  'Bijnor',
  'Budaun',
  'Bulandshahr',
  'Chandauli',
  'Chitrakoot',
  'Deoria',
  'Etah',
  'Etawah',
  'Farrukhabad',
  'Fatehpur',
  'Firozabad',
  'Gautam Buddha Nagar (Noida)',
  'Ghaziabad',
  'Ghazipur',
  'Gonda',
  'Gorakhpur',
  'Hamirpur',
  'Hapur',
  'Hardoi',
  'Hathras',
  'Jalaun',
  'Jaunpur',
  'Jhansi',
  'Kannauj',
  'Kanpur Dehat',
  'Kanpur Nagar',
  'Kasganj',
  'Kaushambi',
  'Kushinagar',
  'Lakhimpur Kheri',
  'Lalitpur',
  'Mahoba',
  'Mainpuri',
  'Mathura',
  'Mau',
  'Meerut',
  'Mirzapur',
  'Moradabad',
  'Muzaffarnagar',
  'Pilibhit',
  'Pratapgarh',
  'Prayagraj',
  'Raebareli',
  'Rampur',
  'Saharanpur',
  'Sambhal',
  'Sant Kabir Nagar',
  'Sant Ravidas Nagar (Bhadohi)',
  'Shahjahanpur',
  'Shamli',
  'Shravasti',
  'Siddharthnagar',
  'Sitapur',
  'Sonbhadra',
  'Sultanpur',
  'Unnao',
  'Varanasi'
];

const MemberTableRow: React.FC<{
  member: any;
  idx: number;
  currentPage: number;
  pageSize: number;
  language: any;
  copiedId: string | null;
  handleCopyId: (id: string) => void;
}> = ({ member, idx, currentPage, pageSize, language, copiedId, handleCopyId }) => {
  const serialNumber = (currentPage - 1) * pageSize + idx + 1;
  const memId = member.membership_id || member.membershipId || `MFCT-${(member.id || '').slice(-6).toUpperCase()}`;
  const rawName = member.name || 'Member';
  const dynamicName = useDynamicTranslatedText(rawName, language);
  const displayName = (language !== 'en' && !/[\u0900-\u097F\u0600-\u06FF]/.test(dynamicName))
    ? formatTextByLang(rawName, language) || dynamicName
    : dynamicName;
  const email = member.email || '—';
  const communityId = member.community_id || member.communityId || '—';
  const rawCommName = member.community_name || member.communityName || 'Bareilly Central Care Society (Headquarters)';
  const dynamicCommName = useDynamicTranslatedText(rawCommName, language);
  const displayCommName = (language !== 'en' && !/[\u0900-\u097F\u0600-\u06FF]/.test(dynamicCommName))
    ? formatTextByLang(rawCommName, language) || dynamicCommName
    : dynamicCommName;
  const rawDistrict = member.city || member.district || 'Bareilly';
  const dynamicDistrict = useDynamicTranslatedText(rawDistrict, language);
  const displayDistrict = (language !== 'en' && !/[\u0900-\u097F\u0600-\u06FF]/.test(dynamicDistrict))
    ? formatTextByLang(rawDistrict, language) || dynamicDistrict
    : dynamicDistrict;

  const roleRaw = (member.role || 'member').toLowerCase();
  const roleLabel =
    roleRaw === 'community_admin'
      ? language === 'hi'
        ? 'समुदाय व्यवस्थापक'
        : language === 'ur'
        ? 'کمیونٹی ایڈمن'
        : 'Community Admin'
      : roleRaw === 'executive_admin'
      ? language === 'hi'
        ? 'कार्यकारी व्यवस्थापक'
        : language === 'ur'
        ? 'ایگزیکٹو ایڈمن'
        : 'Executive Admin'
      : roleRaw === 'premium_donor'
      ? language === 'hi'
        ? 'विशिष्ट दानदाता'
        : language === 'ur'
        ? 'پریمیم ڈونر'
        : 'Premium Donor'
      : language === 'hi'
      ? 'सदस्य'
      : language === 'ur'
      ? 'ممبر'
      : 'Member';

  const roleBadgeClass =
    roleRaw === 'community_admin'
      ? 'bg-blue-50 text-blue-700 border-blue-200'
      : roleRaw === 'executive_admin'
      ? 'bg-purple-50 text-purple-700 border-purple-200'
      : roleRaw === 'premium_donor'
      ? 'bg-amber-50 text-amber-800 border-amber-300'
      : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  const joinDate = member.created_at || member.joinDate || member.join_date;
  const formattedDate = joinDate
    ? new Date(joinDate).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : language === 'hi'
    ? 'सक्रिय'
    : 'Active';

  return (
    <tr
      key={member.id || idx}
      className="hover:bg-amber-50/40 transition-colors group cursor-default"
    >
      {/* 1. S.No */}
      <td className="py-3.5 px-3 text-center font-bold text-slate-500 whitespace-nowrap">
        {serialNumber}
      </td>

      {/* 2. Unique ID */}
      <td className="py-3.5 px-3 whitespace-nowrap">
        <button
          onClick={() => handleCopyId(memId)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-900 font-mono font-bold text-[11px] hover:bg-amber-100 border border-slate-200/80 transition-colors whitespace-nowrap cursor-pointer"
          title="Click to copy ID"
        >
          <span>{memId}</span>
          {copiedId === memId ? (
            <Check className="w-3 h-3 text-emerald-600 shrink-0" />
          ) : (
            <Copy className="w-3 h-3 text-slate-400 group-hover:text-slate-600 shrink-0" />
          )}
        </button>
      </td>

      {/* 3. Name */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        <div className="flex items-center gap-2.5">
          {member.avatar && !member.avatar.startsWith('file://') ? (
            <img
              src={member.avatar}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover border border-amber-300 shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-emerald-800 text-amber-300 font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
              {(rawName || 'M')[0].toUpperCase()}
            </div>
          )}
          <span className="font-bold text-slate-900 text-xs sm:text-[13px] whitespace-nowrap">
            {displayName}
          </span>
        </div>
      </td>

      {/* 4. Email */}
      <td className="py-3.5 px-3 whitespace-nowrap">
        {email !== '—' ? (
          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <a href={`mailto:${email}`} className="hover:underline hover:text-emerald-800">
              {email}
            </a>
          </div>
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </td>

      {/* 5. Role */}
      <td className="py-3.5 px-3 whitespace-nowrap">
        <div className="flex flex-col gap-1 items-start">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${roleBadgeClass} whitespace-nowrap`}>
            <Shield className="w-3 h-3" />
            <span>{roleLabel}</span>
          </span>
          {(member.districtRole || member.district_role) && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-300 whitespace-nowrap shadow-xs">
              <Award className="w-3 h-3 text-amber-600 shrink-0" />
              <span>{formatTextByLang((member.districtRole || member.district_role) as string, language)}</span>
            </span>
          )}
        </div>
      </td>

      {/* 6. Community ID */}
      <td className="py-3.5 px-3 whitespace-nowrap">
        {communityId !== '—' ? (
          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] border border-slate-200">
            {communityId}
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </td>

      {/* 7. Community Name */}
      <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span>{displayCommName}</span>
        </div>
      </td>

      {/* 8. District */}
      <td className="py-3.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{displayDistrict}</span>
        </div>
      </td>

      {/* 9. Join Date */}
      <td className="py-3.5 px-3 text-right font-medium text-slate-600 whitespace-nowrap">
        <div className="inline-flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{formattedDate}</span>
        </div>
      </td>
    </tr>
  );
};

interface MembersPageProps {
  onOpenRegister?: () => void;
}

export const MembersPage: React.FC<MembersPageProps> = ({ onOpenRegister }) => {
  const { language } = useLanguage();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch Users from Database
  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            // Filter out super_admin per user request: "members will be all except super_admin"
            const nonSuperAdmins = json.data.filter((u: any) => u.role !== 'super_admin');
            setUsers(nonSuperAdmins);
          }
        }
      } catch (err) {
        console.error('Failed to fetch members from API:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return users.filter((u) => {
      // Exclude super_admin always
      if (u.role === 'super_admin') return false;

      // District Filter
      if (selectedDistrict) {
        const uDistrict = (u.city || u.district || '').toLowerCase();
        if (uDistrict !== selectedDistrict.toLowerCase() && !uDistrict.includes(selectedDistrict.toLowerCase())) {
          return false;
        }
      }

      // Role Filter
      if (selectedRole !== 'all') {
        if (u.role !== selectedRole) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const name = (u.name || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        const memId = (u.membership_id || u.membershipId || u.id || '').toLowerCase();
        const commId = (u.community_id || u.communityId || '').toLowerCase();
        const commName = (u.community_name || u.communityName || '').toLowerCase();
        const city = (u.city || u.district || '').toLowerCase();
        const phone = (u.phone || '').toLowerCase();

        const match =
          name.includes(q) ||
          email.includes(q) ||
          memId.includes(q) ||
          commId.includes(q) ||
          commName.includes(q) ||
          city.includes(q) ||
          phone.includes(q);

        if (!match) return false;
      }

      return true;
    });
  }, [users, selectedDistrict, selectedRole, searchQuery]);

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedDistrict('');
    setSelectedRole('all');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Pagination calculations
  const totalItems = filteredMembers.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMembers.slice(start, start + pageSize);
  }, [filteredMembers, currentPage, pageSize]);

  // Copy membership ID handler
  const handleCopyId = (idText: string) => {
    navigator.clipboard.writeText(idText);
    setCopiedId(idText);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      
      {/* ── 1. Hero Header Banner ── */}
      <section className="relative overflow-hidden text-white pt-10 pb-14 px-4 sm:px-6 lg:px-8" style={{ background: 'radial-gradient(ellipse at top, #133c2a 0%, #081e13 100%)' }}>
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#c8a84b_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="relative max-w-5xl mx-auto text-center space-y-3.5">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-md" style={{ background: 'rgba(200,168,75,0.18)', border: '1.5px solid var(--mfct-gold)', color: 'var(--mfct-gold)' }}>
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>MOHAMMAD FAEEM CHARITABLE TRUST (MFCT)</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            {language === 'hi' ? 'वैधानिक सदस्य सूची' : language === 'ur' ? 'آفیشل ممبر لسٹ' : 'Official Member List'}
          </h1>

          <p className="text-sm sm:text-base font-bold tracking-wide" style={{ color: 'var(--mfct-gold)' }}>
            {language === 'hi'
              ? '“याद उनकी, सेवा हमारी” — पारदर्शी एवं पंजीकृत सदस्य डेटाबेस'
              : language === 'ur'
              ? '”یاد ان کی، خدمت ہماری“ — شفاف و رجسٹرڈ ممبر ڈیٹا بیس'
              : '“In Their Memory, In Our Service” — Transparent & Registered Member Directory'}
          </p>

          {/* Quick Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl mx-auto pt-4 text-left">
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
              <span className="text-[10px] text-amber-300 font-bold block uppercase tracking-wider">
                {language === 'hi' ? 'कुल सक्रिय सदस्य' : language === 'ur' ? 'کل فعال ممبران' : 'Total Active Members'}
              </span>
              <span className="text-xl sm:text-2xl font-black text-white">{users.length.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-slate-300 block">
                {language === 'hi' ? 'पंजीकृत व वैधानिक' : language === 'ur' ? 'رجسٹرڈ و قانونی' : 'Registered & Legal'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
              <span className="text-[10px] text-amber-300 font-bold block uppercase tracking-wider">
                {language === 'hi' ? 'सत्यापित सदस्य' : language === 'ur' ? 'تصدیق شدہ ممبران' : 'Verified Members'}
              </span>
              <span className="text-xl sm:text-2xl font-black text-white">
                {users.filter(u => u.is_verified || u.isVerified).length.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-300 block">
                {language === 'hi' ? '100% KYC सत्यापित' : language === 'ur' ? '100% تصدیق شدہ' : '100% KYC Verified'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-amber-300 font-bold block uppercase tracking-wider">
                {language === 'hi' ? 'वार्षिक व्यवस्था सहयोग' : language === 'ur' ? 'سالانہ انتظامی تعاون' : 'Annual Admin Support'}
              </span>
              <span className="text-xl sm:text-2xl font-black text-white">₹100</span>
              <span className="text-[10px] text-slate-300 block">
                {language === 'hi' ? 'पारदर्शी सामाजिक व्यवस्था' : language === 'ur' ? 'شفاف سماجی نظام' : 'Transparent System'}
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ── 2. Filters & Search Box ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-200/80 space-y-4">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-700" />
              <span className="text-sm font-bold text-slate-900">
                {language === 'hi' ? 'सदस्य खोजें एवं फ़िल्टर करें' : language === 'ur' ? 'ممبر تلاش اور فلٹر کریں' : 'Search & Filter Members'}
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {filteredMembers.length} {language === 'hi' ? 'सदस्य मिले' : language === 'ur' ? 'ممبران ملے' : 'members found'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* 1. Search Query */}
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  language === 'hi'
                    ? 'नाम, यूनिक ID, ईमेल, समुदाय नाम से खोजें...'
                    : language === 'ur'
                    ? 'نام، شناختی نمبر، ای میل، کمیونٹی سے تلاش کریں...'
                    : 'Search by Name, Unique ID, Email, Community...'
                }
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#103825] outline-none transition-all"
              />
            </div>

            {/* 2. District Filter */}
            <div>
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  setSelectedDistrict(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#103825] outline-none transition-all cursor-pointer font-medium text-slate-700"
              >
                <option value="">
                  {language === 'hi' ? 'सभी जिले (All Districts)' : language === 'ur' ? 'تمام اضلاع' : 'Select District (All)'}
                </option>
                {UP_DISTRICTS.map((dist) => (
                  <option key={dist} value={dist}>
                    {language === 'hi' ? formatTextByLang(dist, 'hi') : dist}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Role Filter & Reset */}
            <div className="flex items-center gap-2">
              <select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#103825] outline-none transition-all cursor-pointer font-medium text-slate-700"
              >
                <option value="all">
                  {language === 'hi' ? 'सभी पद (All Roles)' : language === 'ur' ? 'تمام عہدے' : 'All Roles'}
                </option>
                <option value="member">
                  {language === 'hi' ? 'सदस्य (Member)' : language === 'ur' ? 'ممبر' : 'Member'}
                </option>
                <option value="community_admin">
                  {language === 'hi' ? 'समुदाय व्यवस्थापक (Community Admin)' : language === 'ur' ? 'کمیونٹی ایڈمن' : 'Community Admin'}
                </option>
                <option value="executive_admin">
                  {language === 'hi' ? 'कार्यकारी व्यवस्थापक (Executive Admin)' : language === 'ur' ? 'ایگزیکٹو ایڈمن' : 'Executive Admin'}
                </option>
                <option value="premium_donor">
                  {language === 'hi' ? 'विशिष्ट दानदाता (Premium Donor)' : language === 'ur' ? 'پریمیم ڈونر' : 'Premium Donor'}
                </option>
              </select>

              {(selectedDistrict || selectedRole !== 'all' || searchQuery) && (
                <button
                  onClick={handleResetFilters}
                  title="Reset Filters"
                  className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shrink-0 flex items-center gap-1 text-xs font-bold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{language === 'hi' ? 'रीसेट' : 'Reset'}</span>
                </button>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* ── 3. District Executive Committee Showcase (When District Selected or Available) ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {selectedDistrict && (
          <div className="bg-gradient-to-br from-[#0a2318] to-[#103825] rounded-3xl p-5 sm:p-7 text-white shadow-xl border border-amber-400/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-emerald-700/60">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-400 text-slate-950">
                    {language === 'hi' ? 'जिला टीम' : language === 'ur' ? 'ضلعی ٹیم' : 'DISTRICT CHAPTER'}
                  </span>
                  <span className="text-emerald-300 text-xs font-semibold">MFCT Chapter</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
                  <Award className="w-6 h-6 text-amber-400" />
                  <span>
                    {language === 'hi'
                      ? `${formatTextByLang(selectedDistrict, 'hi')} जिला कार्यकारिणी`
                      : language === 'ur'
                      ? `${formatTextByLang(selectedDistrict, 'ur')} ضلعی کمیٹی`
                      : `${selectedDistrict} District Executive Committee`}
                  </span>
                </h3>
                <p className="text-xs text-emerald-100/80 mt-1 max-w-2xl">
                  {language === 'hi'
                    ? 'जिले में ट्रस्ट की समग्र गतिविधियों, विस्तार, संचालन एवं सहायता हेतु अधिकृत पदाधिकारी।'
                    : language === 'ur'
                    ? 'ضلع میں ٹرسٹ کی سرگرمیوں، تنظیمی توسیع اور رفاہی کاموں کے لیے نامزد عہدیداران۔'
                    : 'Authorized office-bearers leading trust operations, relief drives, and community coordination in this district.'}
                </p>
              </div>
            </div>

            {/* 5 District Office-Bearer Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-5">
              {[
                {
                  key: 'district_president',
                  titleEn: 'District President',
                  titleHi: 'जिला अध्यक्ष',
                  titleUr: 'ضلعی صدر',
                  workEn: 'Leadership and coordination of all MFCT activities in the district.',
                  workHi: 'जिले में एमएफसीटी की सभी गतिविधियों का नेतृत्व और समन्वय।',
                  workUr: 'ضلع میں ایم ایف سی ٹی کی تمام سرگرمیوں کی قیادت۔',
                  badge: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
                },
                {
                  key: 'district_coordinator',
                  titleEn: 'District Coordinator',
                  titleHi: 'जिला समन्वयक',
                  titleUr: 'ضلعی کوآرڈینیٹر',
                  workEn: 'Daily coordination, membership expansion, team formation, and reporting.',
                  workHi: 'दैनिक समन्वय, सदस्यता विस्तार, टीम गठन और रिपोर्टिंग।',
                  workUr: 'روزمرہ رابطہ کاری، رکنیت سازی، اور رپورٹنگ۔',
                  badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
                },
                {
                  key: 'district_gen_secretary',
                  titleEn: 'District General Secretary',
                  titleHi: 'जिला महासचिव',
                  titleUr: 'ضلعی جنرل سیکرٹری',
                  workEn: 'Organizational expansion and coordination of block / city teams.',
                  workHi: 'संगठनात्मक विस्तार और ब्लॉक / नगर टीमों का समन्वय।',
                  workUr: 'تنظیمی توسیع اور بلاک / سٹی ٹیموں کی رابطہ کاری۔',
                  badge: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
                },
                {
                  key: 'district_secretary',
                  titleEn: 'District Secretary',
                  titleHi: 'जिला सचिव',
                  titleUr: 'ضلعی سیکرٹری',
                  workEn: 'Correspondence, meeting proceedings, and documentation.',
                  workHi: 'पत्राचार, बैठकों की कार्यवाही और दस्तावेजीकरण।',
                  workUr: 'خط و کتابت، میٹنگ کارروائی اور دفتری ریکارڈ۔',
                  badge: 'bg-blue-500/20 text-blue-300 border-blue-400/40',
                },
                {
                  key: 'district_finance_coord',
                  titleEn: 'District Finance Coordinator',
                  titleHi: 'जिला वित्त समन्वयक',
                  titleUr: 'ضلعی فنانس کوآرڈینیٹر',
                  workEn: 'Financial records and documentary support for official transactions.',
                  workHi: 'वित्तीय रिकॉर्ड और आधिकारिक लेन-देन के लिए दस्तावेजी सहयोग।',
                  workUr: 'مالی ریکارڈ اور سرکاری لین دین کے لیے معاونت۔',
                  badge: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
                },
              ].map((roleSlot) => {
                const assignedMember = users.find((u) => {
                  const uDist = (u.district || u.city || '').toLowerCase();
                  const isDist = uDist === selectedDistrict.toLowerCase() || uDist.includes(selectedDistrict.toLowerCase());
                  const r = (u.districtRole || u.district_role || '').toLowerCase();
                  return isDist && (r === roleSlot.key || r === roleSlot.titleEn.toLowerCase());
                });

                const roleTitle = language === 'hi' ? roleSlot.titleHi : language === 'ur' ? roleSlot.titleUr : roleSlot.titleEn;
                const roleWork = language === 'hi' ? roleSlot.workHi : language === 'ur' ? roleSlot.workUr : roleSlot.workEn;

                return (
                  <div
                    key={roleSlot.key}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex flex-col justify-between hover:bg-white/15 transition-all shadow-inner"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-2.5">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${roleSlot.badge}`}>
                          {roleTitle}
                        </span>
                      </div>

                      {assignedMember ? (
                        <div className="space-y-2 mt-2">
                          <div className="flex items-center gap-2.5">
                            {assignedMember.avatar ? (
                              <img
                                src={assignedMember.avatar}
                                alt={assignedMember.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-amber-400 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center shrink-0">
                                {(assignedMember.name || 'U')[0].toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-white truncate">
                                {formatTextByLang(assignedMember.name, language)}
                              </h4>
                              <p className="text-[10px] text-emerald-200 font-mono truncate">
                                ID: {assignedMember.membership_id || assignedMember.membershipId || assignedMember.id?.slice(0, 8)}
                              </p>
                            </div>
                          </div>

                          {assignedMember.phone && (
                            <div className="flex items-center gap-1 text-[11px] text-emerald-200">
                              <Phone className="w-3 h-3 text-amber-400 shrink-0" />
                              <span className="font-mono truncate">{assignedMember.phone}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="py-3 text-center border border-dashed border-white/20 rounded-xl bg-black/10 mt-1">
                          <span className="text-[11px] text-emerald-200/60 font-medium">
                            {language === 'hi' ? 'पद रिक्त (Open Post)' : language === 'ur' ? 'عہدہ خالی ہے' : 'Post Open'}
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-[10px] text-emerald-100/70 border-t border-white/10 pt-2.5 mt-3 leading-relaxed">
                      {roleWork}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          
          {/* Top Bar inside card */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-700" />
                <span>
                  {language === 'hi'
                    ? 'MFCT सदस्य विवरण तालिका'
                    : language === 'ur'
                    ? 'ایم ایف سی ٹی ممبر تفصیلات'
                    : 'MFCT Member Details Directory'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'hi'
                  ? 'सभी वैधानिक एवं सक्रिय सदस्यों का पूर्ण पारदर्शी रिकॉर्ड'
                  : language === 'ur'
                  ? 'تمام رجسٹرڈ اور فعال ممبران کی مکمل شفاف تفصیلات'
                  : 'Complete transparent records of active & registered MFCT members'}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {/* Page Size Select */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span>{language === 'hi' ? 'दिखाएँ:' : 'Show:'}</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold outline-none"
                >
                  <option value={15}>15</option>
                  <option value={30}>30</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              {onOpenRegister && (
                <button
                  onClick={onOpenRegister}
                  className="mfct-btn-gold py-1.5 px-3.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm hover:scale-105 transition-all shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'सदस्य बनें' : language === 'ur' ? 'ممبر بنیں' : 'Join as Member'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Table View */}
          {loading ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-500">
                {language === 'hi' ? 'सदस्य सूची लोड हो रही है...' : 'Loading members directory...'}
              </p>
            </div>
          ) : paginatedMembers.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-700">
                {language === 'hi' ? 'कोई सदस्य नहीं मिला' : 'No members found'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {language === 'hi'
                  ? 'आपके द्वारा चुने गए फ़िल्टर या खोज शब्द के लिए कोई सदस्य रिकॉर्ड मौजूद नहीं है।'
                  : 'No member records matched your selected filters or search query.'}
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold hover:bg-emerald-900 transition-colors"
              >
                {language === 'hi' ? 'फ़िल्टर रीसेट करें' : 'Reset Filters'}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#103825] text-white uppercase text-[11px] tracking-wider font-bold">
                    <th className="py-3.5 px-3 text-center w-12 whitespace-nowrap">S.No.</th>
                    <th className="py-3.5 px-3 whitespace-nowrap">Unique ID</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">{language === 'hi' ? 'नाम (Name)' : 'Name'}</th>
                    <th className="py-3.5 px-3 whitespace-nowrap">{language === 'hi' ? 'ईमेल (Email)' : 'Email'}</th>
                    <th className="py-3.5 px-3 whitespace-nowrap">{language === 'hi' ? 'पद (Role)' : 'Role'}</th>
                    <th className="py-3.5 px-3 whitespace-nowrap">Community ID</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">{language === 'hi' ? 'समुदाय नाम (Community Name)' : 'Community Name'}</th>
                    <th className="py-3.5 px-3 whitespace-nowrap">{language === 'hi' ? 'जिला (District)' : 'District'}</th>
                    <th className="py-3.5 px-3 text-right whitespace-nowrap">{language === 'hi' ? 'शामिल होने की तिथि (Joining Date)' : language === 'ur' ? 'شمولیت کی تاریخ' : 'Joining Date'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedMembers.map((member, idx) => (
                    <MemberTableRow
                      key={member.id || idx}
                      member={member}
                      idx={idx}
                      currentPage={currentPage}
                      pageSize={pageSize}
                      language={language}
                      copiedId={copiedId}
                      handleCopyId={handleCopyId}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-slate-500 font-medium">
                {language === 'hi'
                  ? `कुल ${totalItems} में से ${Math.min((currentPage - 1) * pageSize + 1, totalItems)} से ${Math.min(currentPage * pageSize, totalItems)} सदस्य दिखाए जा रहे हैं`
                  : `Showing ${Math.min((currentPage - 1) * pageSize + 1, totalItems)} to ${Math.min(currentPage * pageSize, totalItems)} of ${totalItems} members`}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-lg font-bold transition-all ${
                        currentPage === pageNum
                          ? 'bg-[#103825] text-amber-300 shadow-sm'
                          : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {totalPages > 5 && <span className="px-1 text-slate-400">...</span>}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>

      </main>

    </div>
  );
};
