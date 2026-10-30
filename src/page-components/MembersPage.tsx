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
  Phone,
  Network
} from 'lucide-react';
import { TableSkeleton } from '../components/Skeletons';
import { useLanguage } from '../context/LanguageContext';
import { ORGANIZATIONAL_HIERARCHY, STANDARD_DISTRICTS } from '../data/districtsData';
import { getUsers } from '../services/userService';
import { useDynamicTranslatedText } from '../lib/autoTranslate';
import { translateDistrictRole } from '../lib/translateEntity';



const DIST_ROLE_KEYS = [
  'district_president',
  'district_coordinator',
  'district_gen_secretary',
  'district_secretary',
  'district_finance_coord',
];

// Priority helper: Admin & Executive first (1..3), District Officers second (10..15), Members third (100)
const getMemberPriority = (u: any): number => {
  const role = (u.role || '').toLowerCase();
  const distRole = (u.districtRole || u.district_role || '').toLowerCase();

  // Tier 1: Admin & Executive people
  if (role === 'super_admin') return 1;
  if (role === 'executive_admin') return 2;
  if (role === 'community_admin' || distRole === 'community_admin') return 3;

  // Tier 2: District Role people
  const effectiveDistRole = distRole || (DIST_ROLE_KEYS.includes(role) ? role : '');
  if (effectiveDistRole === 'district_president') return 10;
  if (effectiveDistRole === 'district_coordinator') return 11;
  if (effectiveDistRole === 'district_gen_secretary') return 12;
  if (effectiveDistRole === 'district_secretary') return 13;
  if (effectiveDistRole === 'district_finance_coord') return 14;
  if (effectiveDistRole) return 15;

  // Tier 3: Member people
  return 100;
};

const MemberTableRow: React.FC<{
  member: any;
  idx: number;
  currentPage: number;
  pageSize: number;
  language: any;
}> = ({ member, idx, currentPage, pageSize, language }) => {
  const serialNumber = (currentPage - 1) * pageSize + idx + 1;

  // Translated name using useDynamicTranslatedText like ManageUsers
  const rawName = member.name || 'Member';
  const displayName = useDynamicTranslatedText(rawName, language) || rawName;

  const email = member.email || '—';

  const rawDistrict = member.district || member.city || 'Bareilly';
  const displayDistrict = useDynamicTranslatedText(rawDistrict, language) || rawDistrict;

  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const effectiveDistrictRole = member.districtRole || member.district_role || (DIST_ROLE_KEYS.includes(member.role) ? member.role : '');

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin':
        return tr('सुपर एडमिन', 'سپر ایڈمن', 'SUPER ADMIN');
      case 'executive_admin':
        return tr('कार्यकारी एडमिन', 'ایگزیکٹو ایڈمن', 'EXECUTIVE ADMIN');
      case 'community_admin':
        return tr('सामुदायिक एडमिन', 'کمیونٹی ایڈمن', 'COMMUNITY ADMIN');
      case 'district_president':
        return tr('जिला अध्यक्ष', 'ضلعی صدر', 'DISTRICT PRESIDENT');
      case 'district_coordinator':
        return tr('जिला समन्वयक', 'ضلعی کوآرڈینیٹر', 'DISTRICT COORDINATOR');
      case 'district_gen_secretary':
        return tr('जिला महासचिव', 'ضلعی جنرل سیکرٹری', 'DISTRICT GEN SEC');
      case 'district_secretary':
        return tr('जिला सचिव', 'ضلعی سیکرٹری', 'DISTRICT SECRETARY');
      case 'district_finance_coord':
        return tr('जिला वित्त समन्वयक', 'ضلعی فنانس کوآرڈینیٹر', 'DISTRICT FINANCE COORD');
      default:
        return tr('सदस्य', 'ممبر', 'MEMBER');
    }
  };

  const roleRaw = (member.role || 'member').toLowerCase();
  const roleLabel = getRoleLabel(roleRaw);

  const roleBadgeClass =
    roleRaw === 'super_admin'
      ? 'bg-rose-50 text-rose-700 border-rose-300 font-black'
      : roleRaw === 'executive_admin'
        ? 'bg-purple-50 text-purple-700 border-purple-200 font-extrabold'
        : roleRaw === 'community_admin'
          ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
          : effectiveDistrictRole
            ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  const joinDate = member.created_at || member.joinDate || member.join_date;
  const formattedDate = joinDate
    ? new Date(joinDate).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
    : tr('सक्रिय', 'فعال', 'Active');

  return (
    <tr
      key={member.id || idx}
      className="hover:bg-amber-50/40 transition-colors group cursor-default"
    >
      {/* 1. S.No */}
      <td className="py-3.5 px-3 text-center font-bold text-slate-500 whitespace-nowrap">
        {serialNumber}
      </td>

      {/* 2. Name */}
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

      {/* 3. Email */}
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

      {/* 4. Role */}
      <td className="py-3.5 px-3 whitespace-nowrap">
        <div className="flex flex-col gap-1 items-start">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${roleBadgeClass} whitespace-nowrap`}>
            <Shield className="w-3 h-3" />
            <span>{roleLabel}</span>
          </span>
          {effectiveDistrictRole && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-300 whitespace-nowrap shadow-xs">
              <Award className="w-3 h-3 text-amber-600 shrink-0" />
              <span>{translateDistrictRole(effectiveDistrictRole, language)}</span>
            </span>
          )}
        </div>
      </td>

      {/* 5. District */}
      <td className="py-3.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{displayDistrict}</span>
        </div>
      </td>

      {/* 6. Join Date */}
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
  const [pageSize, setPageSize] = useState<number>(10);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showHierarchyModal, setShowHierarchyModal] = useState<boolean>(false);

  // Fetch Users from Database
  useEffect(() => {
    let isMounted = true;

    const fetchMembers = async () => {
      setLoading(true);
      try {
        // 1. Try fetching from /api/users
        const res = await fetch('/api/users');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            if (isMounted) {
              setUsers(json.data);
              return;
            }
          }
        }

        // 2. Direct Supabase query fallback via userService
        try {
          const directUsers = await getUsers();
          if (Array.isArray(directUsers)) {
            if (isMounted) {
              setUsers(directUsers);
              return;
            }
          }
        } catch (dbErr) {
          console.warn('Direct database users query fallback warning:', dbErr);
        }
      } catch (err) {
        console.error('Failed to fetch members from API:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMembers();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered members list with 3-tier sorting:
  // 1. Admin and executive people
  // 2. District role people
  // 3. Member people
  const filteredMembers = useMemo(() => {
    const list = users.filter((u) => {
      // District Filter
      if (selectedDistrict) {
        const uDistrict = (u.city || u.district || '').toLowerCase();
        if (uDistrict !== selectedDistrict.toLowerCase() && !uDistrict.includes(selectedDistrict.toLowerCase())) {
          return false;
        }
      }

      // Role Filter
      if (selectedRole !== 'all') {
        const uRole = (u.role || '').toLowerCase();
        const uDistRole = (u.districtRole || u.district_role || '').toLowerCase();
        const effectiveDist = uDistRole || (DIST_ROLE_KEYS.includes(uRole) ? uRole : '');

        if (selectedRole === 'admin_executive') {
          const isTier1 = ['super_admin', 'executive_admin', 'community_admin'].includes(uRole) || uDistRole === 'community_admin';
          if (!isTier1) return false;
        } else if (selectedRole === 'district_roles') {
          if (!effectiveDist) return false;
        } else if (selectedRole === 'member') {
          const isTier1 = ['super_admin', 'executive_admin', 'community_admin'].includes(uRole) || uDistRole === 'community_admin';
          if (isTier1 || effectiveDist) return false;
        } else {
          if (uRole !== selectedRole && uDistRole !== selectedRole && effectiveDist !== selectedRole) {
            return false;
          }
        }
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

    // Sort order:
    // 1st: Admin and Executive people
    // 2nd: District role people
    // 3rd: Member people
    return list.sort((a, b) => {
      const pA = getMemberPriority(a);
      const pB = getMemberPriority(b);
      if (pA !== pB) return pA - pB;

      // Secondary tie-breaker: newest creation date first
      const dateA = new Date(a.created_at || a.joinDate || a.join_date || 0).getTime();
      const dateB = new Date(b.created_at || b.joinDate || b.join_date || 0).getTime();
      return dateB - dateA;
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
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedMembers = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return filteredMembers.slice(start, start + pageSize);
  }, [filteredMembers, validCurrentPage, pageSize]);

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (validCurrentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (validCurrentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', validCurrentPage - 1, validCurrentPage, validCurrentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

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
                {STANDARD_DISTRICTS.map((dist) => (
                  <option key={dist.id} value={dist.nameEn}>
                    {language === 'hi' ? dist.nameHi : language === 'ur' ? dist.nameUr : dist.nameEn}
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
                <option value="admin_executive">
                  {language === 'hi' ? 'प्रशासनिक व कार्यकारी (Admins & Executive)' : language === 'ur' ? 'انتظامی و ایگزیکٹو' : 'Admins & Executive'}
                </option>
                <option value="district_roles">
                  {language === 'hi' ? 'जिला पदाधिकारी (District Officers)' : language === 'ur' ? 'ضلعی عہدیداران' : 'District Officers'}
                </option>
                <option value="member">
                  {language === 'hi' ? 'सामान्य सदस्य (General Members)' : language === 'ur' ? 'عام ممبران' : 'General Members'}
                </option>
                <option value="super_admin">
                  {language === 'hi' ? 'सुपर एडमिन (Super Admin)' : language === 'ur' ? 'سپر ایڈمن' : 'Super Admin'}
                </option>
                <option value="executive_admin">
                  {language === 'hi' ? 'कार्यकारी व्यवस्थापक (Executive Admin)' : language === 'ur' ? 'ایگزیکٹو ایڈمن' : 'Executive Admin'}
                </option>
                <option value="community_admin">
                  {language === 'hi' ? 'सामुदायिक एडमिन (Community Admin)' : language === 'ur' ? 'کمیونٹی ایڈمن' : 'Community Admin'}
                </option>
              </select>

              {(selectedDistrict || selectedRole !== 'all' || searchQuery) && (
                <button
                  onClick={handleResetFilters}
                  title="Reset Filters"
                  className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shrink-0 flex items-center gap-1 text-xs font-bold cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{language === 'hi' ? 'रीसेट' : 'Reset'}</span>
                </button>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* ── 3. Member Directory Table (Direct Simple List) ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">

          {/* Top Bar inside card */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2 flex-wrap">
                <Users className="w-5 h-5 text-emerald-700" />
                <span>
                  {language === 'hi'
                    ? 'MFCT सदस्य विवरण तालिका'
                    : language === 'ur'
                      ? 'ایم ایف سی ٹی ممبر تفصیلات'
                      : 'MFCT Member Details Directory'}
                </span>
                {selectedDistrict && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {selectedDistrict}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'hi'
                  ? 'सभी वैधानिक एवं सक्रिय सदस्यों का पूर्ण पारदर्शी रिकॉर्ड'
                  : language === 'ur'
                    ? 'تمام رجسٹرڈ اور فعال ممبران की مکمل شفاف تفصیلات'
                    : 'Complete transparent records of active & registered MFCT members'}
              </p>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
              {/* Organizational Hierarchy Modal Button */}
              <button
                type="button"
                onClick={() => setShowHierarchyModal(true)}
                className="py-1.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
                title="View Organizational Framework"
              >
                <Network className="w-3.5 h-3.5 text-emerald-700" />
                <span>{language === 'hi' ? 'संगठनात्मक ढांचा' : language === 'ur' ? 'تنظیمی ڈھانچہ' : 'Hierarchy'}</span>
              </button>

              {/* Page Size Select */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span>{language === 'hi' ? 'दिखाएँ:' : 'Show:'}</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold outline-none cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
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
            <div className="p-4">
              <TableSkeleton rows={8} cols={6} />
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
                    <th className="py-3.5 px-4 whitespace-nowrap">{language === 'hi' ? 'नाम (Name)' : 'Name'}</th>
                    <th className="py-3.5 px-3 whitespace-nowrap">{language === 'hi' ? 'ईमेल (Email)' : 'Email'}</th>
                    <th className="py-3.5 px-3 whitespace-nowrap">{language === 'hi' ? 'पद (Role)' : 'Role'}</th>
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
                      currentPage={validCurrentPage}
                      pageSize={pageSize}
                      language={language}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && totalItems > 0 && (
            <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              {/* Left: Summary & Rows Per Page */}
              <div className="flex flex-wrap items-center gap-3 text-slate-600">
                <span>
                  {language === 'hi' ? 'प्रविष्टियाँ:' : language === 'ur' ? 'اندراجات:' : 'Showing:'}{' '}
                  <strong className="font-bold text-slate-900">
                    {(validCurrentPage - 1) * pageSize + 1} - {Math.min(validCurrentPage * pageSize, totalItems)}
                  </strong>{' '}
                  {language === 'hi' ? 'कुल' : language === 'ur' ? 'کل' : 'of'}{' '}
                  <strong className="font-bold text-slate-900">{totalItems}</strong>{' '}
                  {language === 'hi' ? 'सदस्य' : language === 'ur' ? 'ممبران' : 'members'}
                </span>

                <div className="flex items-center gap-1.5 ml-0 sm:ml-2">
                  <span className="text-[11px] text-slate-500">
                    {language === 'hi' ? 'प्रति पृष्ठ:' : language === 'ur' ? 'فی صفحہ:' : 'Per page:'}
                  </span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 outline-none cursor-pointer hover:border-emerald-500 transition-colors"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              {/* Right: Page Navigation Buttons */}
              <div className="flex items-center gap-1.5 self-center sm:self-auto">
                {/* First Page */}
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  disabled={validCurrentPage <= 1}
                  className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title={language === 'hi' ? 'पहला पृष्ठ' : language === 'ur' ? 'پہلا صفحہ' : 'First Page'}
                >
                  «
                </button>

                {/* Prev Page */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={validCurrentPage <= 1}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title={language === 'hi' ? 'पिछला पृष्ठ' : language === 'ur' ? 'پچھلا صفحہ' : 'Previous Page'}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {language === 'hi' ? 'पिछला' : language === 'ur' ? 'پچھلا' : 'Prev'}
                  </span>
                </button>

                {/* Numbered Page Buttons */}
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, idx) => {
                    if (page === '...') {
                      return (
                        <span key={`ellipsis-${idx}`} className="px-2 py-1 text-slate-400 font-bold">
                          ...
                        </span>
                      );
                    }
                    const pageNum = Number(page);
                    const isActive = pageNum === validCurrentPage;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`min-w-8 h-8 px-2 flex items-center justify-center rounded-lg font-bold text-xs transition-colors cursor-pointer ${isActive
                            ? 'bg-[#103825] text-amber-300 shadow-sm border border-[#103825]'
                            : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next Page */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={validCurrentPage >= totalPages}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title={language === 'hi' ? 'अगला पृष्ठ' : language === 'ur' ? 'اگلا صفحہ' : 'Next Page'}
                >
                  <span className="hidden sm:inline">
                    {language === 'hi' ? 'अगला' : language === 'ur' ? 'اگلا' : 'Next'}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Last Page */}
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={validCurrentPage >= totalPages}
                  className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title={language === 'hi' ? 'अंतिम पृष्ठ' : language === 'ur' ? 'آخری صفحہ' : 'Last Page'}
                >
                  »
                </button>
              </div>
            </div>
          )}

        </div>

        {/* ── Organizational Hierarchy Modal (Digital Implementation of Image 2) ── */}
        {showHierarchyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative">
              <button
                onClick={() => setShowHierarchyModal(false)}
                className="absolute right-5 top-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                ✕
              </button>

              {/* Modal Header */}
              <div className="text-center pb-5 border-b border-slate-200 dark:border-slate-800">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-amber-400 text-slate-950 inline-block mb-2">
                  {language === 'hi' ? 'संगठनात्मक ढांचा' : language === 'ur' ? 'تنظیمی ڈھانچہ' : 'Organizational Framework'}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {language === 'hi'
                    ? 'MFCT संगठनात्मक ढांचा एवं कार्यप्रणाली'
                    : language === 'ur'
                      ? 'MFCT تنظیمی ڈھانچہ اور درجہ بندی'
                      : 'MFCT Organizational Hierarchy & Workflow'}
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto">
                  {language === 'hi'
                    ? 'केंद्रीय नेतृत्व से लेकर जमीनी स्तर के स्वयंसेवकों तक 8-स्तरीय पारदर्शी प्रशासनिक श्रृंखला।'
                    : language === 'ur'
                      ? 'مرکزی قیادت سے لے کر نچلی سطح کے رضاکاروں تک شفاف 8 درجاتی تنظیمی سلسلہ۔'
                      : 'Transparent 8-tier administrative chain connecting central apex leadership with grassroots volunteers.'}
                </p>
              </div>

              {/* 8-Tier Hierarchy Flowchart (Exact digital twin of Image 2) */}
              <div className="py-6 max-w-md mx-auto space-y-2">
                {ORGANIZATIONAL_HIERARCHY.map((tier, idx) => {
                  const title = language === 'hi' ? tier.titleHi : language === 'ur' ? tier.titleUr : tier.titleEn;
                  const desc = language === 'hi' ? tier.descHi : language === 'ur' ? tier.descUr : tier.descEn;

                  return (
                    <React.Fragment key={tier.level}>
                      <div
                        className={`p-3.5 rounded-2xl border text-center transition-all shadow-xs ${tier.isGoldHighlight
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-400 font-extrabold'
                          : 'bg-emerald-950 text-white border-emerald-700/80 font-bold'
                          }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] uppercase font-mono tracking-wider opacity-75">
                            Level {tier.level}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider font-bold opacity-90">
                            {tier.roleScope}
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-black tracking-wide">
                          {title}
                        </h3>
                        <p className={`text-[11px] mt-0.5 leading-tight ${tier.isGoldHighlight ? 'text-slate-900' : 'text-emerald-200/90'}`}>
                          {desc}
                        </p>
                      </div>

                      {/* Downward connecting arrow if not last item */}
                      {idx < ORGANIZATIONAL_HIERARCHY.length - 1 && (
                        <div className="flex justify-center -my-1">
                          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-500 text-xs font-bold shadow-xs">
                            ↓
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => setShowHierarchyModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  {language === 'hi' ? 'बंद करें' : language === 'ur' ? 'بند کریں' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
};
