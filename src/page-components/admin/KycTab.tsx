'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { User, UserRole } from '../../types';
import {
  UserCheck,
  Check,
  Eye,
  CheckCircle2,
  X,
  FileText,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Building2,
  CreditCard,
  Receipt,
  Calendar,
  Sparkles,
  Heart,
  Award,
  Search,
  RotateCcw,
  ExternalLink,
  Copy,
  Clock,
  IdCard,
  User as UserIcon,
  Image as ImageIcon,
  AlertCircle,
  Filter,
  XCircle
} from 'lucide-react';
import { DarkListSkeleton } from '../../components/Skeletons';
import { getUsers, updateUser } from '../../services/userService';
import { useLanguage } from '../../context/LanguageContext';
import { useAppState } from '../../providers/AppStateProvider';
import { STANDARD_DISTRICTS } from '../../data/districtsData';
import { useDynamicTranslatedText } from '../../lib/autoTranslate';
import { translateCity } from '../../lib/translateEntity';

interface ExecutiveDashboardProps {
  activeUser?: User;
  currentRole?: UserRole;
}

type VerificationFilter = 'all' | 'pending' | 'approved' | 'rejected';

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ activeUser, currentRole }) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  // Safe fallback to AppStateProvider context if props are not explicitly supplied
  let contextUser: User | undefined;
  let contextRole: UserRole | undefined;
  try {
    const appState = useAppState();
    contextUser = appState?.activeUser;
    contextRole = appState?.currentRole;
  } catch {
    // Outside AppStateProvider fallback
  }

  const user = activeUser || contextUser;
  const role = currentRole || contextRole;

  const rawDistRole = (
    user?.district_role ||
    user?.districtRole ||
    (user?.role as string) ||
    ''
  ).toLowerCase().trim().replace(/\s+/g, '_');

  const isSuperOrExecutive =
    role === 'super_admin' ||
    role === 'executive_admin' ||
    user?.role === 'super_admin' ||
    user?.role === 'executive_admin';

  const isDistrictCoordinator =
    role === 'district_coordinator' ||
    rawDistRole === 'district_coordinator' ||
    rawDistRole.includes('coordinator');

  const canPerformKycAction = isSuperOrExecutive || isDistrictCoordinator;

  const districtRoleKeys = [
    'district_president',
    'district_coordinator',
    'district_gen_secretary',
    'district_secretary',
    'district_finance_coord',
  ];

  const isDistrictRole =
    districtRoleKeys.includes(role as string) ||
    districtRoleKeys.includes(rawDistRole) ||
    (typeof role === 'string' && role.startsWith('district_')) ||
    rawDistRole.startsWith('district_') ||
    rawDistRole.includes('president') ||
    rawDistRole.includes('coordinator') ||
    rawDistRole.includes('secretary') ||
    rawDistRole.includes('finance');

  const isRestrictedToDistrict = !isSuperOrExecutive && isDistrictRole;

  const districtRoleTitle =
    role === 'district_president' || rawDistRole.includes('president')
      ? tr('जिला अध्यक्ष दृश्य', 'ضلعی صدر منظر', 'District President View')
      : role === 'district_coordinator' || rawDistRole.includes('coordinator')
        ? tr('जिला संयोजक दृश्य', 'ضلعی کوآرڈینیٹر منظر', 'District Coordinator View')
        : role === 'district_gen_secretary' || rawDistRole.includes('gen_sec')
          ? tr('जिला महासचिव दृश्य', 'ضلعی جنرل سیکرٹری منظر', 'District General Secretary View')
          : role === 'district_secretary' || rawDistRole.includes('secretary')
            ? tr('जिला सचिव दृश्य', 'ضلعی سیکرٹری منظر', 'District Secretary View')
            : role === 'district_finance_coord' || rawDistRole.includes('finance')
              ? tr('जिला वित्त समन्वयक दृश्य', 'ضلعی فنانس کوآرڈینیٹر منظر', 'District Finance Coordinator View')
              : tr('जिला स्तरीय दृश्य', 'ضلعی سطحی منظر', 'District Level View');

  const userDistrict = (user?.district || '').trim();
  const cleanDistrict = userDistrict
    ? userDistrict.replace(/\s+(district|chapter|city|block|zone).*$/i, '').trim() || userDistrict
    : '';

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeFilter, setActiveFilter] = useState<VerificationFilter>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState<string>('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<'approve' | 'reject' | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  // Mandatory rejection reason modal state
  const [rejectModalUser, setRejectModalUser] = useState<User | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [rejectionReasonError, setRejectionReasonError] = useState('');

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const loadUsers = async () => {
    try {
      setLoading(true);

      // Super Admin and Executive Admin: view all registered users across all districts.
      // District President, General Secretary, Coordinator, and other district-level roles:
      // strictly view and fetch data pertaining to their specific district.
      let fetchedUsers: User[] = [];
      if (isRestrictedToDistrict && userDistrict) {
        fetchedUsers = await getUsers(cleanDistrict || userDistrict);
      } else {
        fetchedUsers = await getUsers();
      }
      setUsers(fetchedUsers || []);
    } catch (err) {
      console.error('Failed to load users for KYC verification:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [role, isRestrictedToDistrict, userDistrict, cleanDistrict]);

  const handleApprove = async (id: string) => {
    if (!canPerformKycAction) return;
    try {
      setProcessingId(id);
      setProcessingAction('approve');
      await updateUser(id, { status: 'approved', rejectionReason: '' });

      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: 'approved', isVerified: true, rejectionReason: undefined, rejection_reason: undefined } : u))
      );

      if (selectedUser?.id === id) {
        setSelectedUser((prev) => (prev ? { ...prev, status: 'approved', isVerified: true, rejectionReason: undefined, rejection_reason: undefined } : null));
      }
    } catch (err) {
      console.error('Approve failed:', err);
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const openRejectModal = (u: User) => {
    setRejectModalUser(u);
    setRejectionReasonInput(u.rejectionReason || u.rejection_reason || '');
    setRejectionReasonError('');
  };

  const handleConfirmReject = async () => {
    if (!rejectModalUser || !canPerformKycAction) return;
    const trimmedReason = rejectionReasonInput.trim();
    if (!trimmedReason) {
      setRejectionReasonError(
        tr(
          'कृपया अस्वीकृति का कारण अवश्य दर्ज करें।',
          'براہ کرم مسترد کرنے کی وجہ درج کریں۔',
          'Rejection reason is mandatory. Please provide a reason.'
        )
      );
      return;
    }

    const id = rejectModalUser.id;
    try {
      setProcessingId(id);
      setProcessingAction('reject');
      await updateUser(id, { status: 'reject', rejectionReason: trimmedReason });

      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: 'reject', isVerified: false, rejectionReason: trimmedReason, rejection_reason: trimmedReason } : u))
      );

      if (selectedUser?.id === id) {
        setSelectedUser((prev) => (prev ? { ...prev, status: 'reject', isVerified: false, rejectionReason: trimmedReason, rejection_reason: trimmedReason } : null));
      }

      setRejectModalUser(null);
      setRejectionReasonInput('');
      setRejectionReasonError('');
    } catch (err) {
      console.error('Reject failed:', err);
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  // District filtering
  const districtFilteredUsers = useMemo(() => {
    let list = users;

    if (isRestrictedToDistrict && userDistrict) {
      const target = userDistrict.toLowerCase().trim();
      const cleanTarget = (cleanDistrict || target).toLowerCase().trim();
      list = list.filter((u) => {
        const uDistrict = (u.district || '').toLowerCase().trim();
        const uCity = (u.city || '').toLowerCase().trim();
        const uComm = (u.communityName || '').toLowerCase().trim();
        return (
          uDistrict === target ||
          uDistrict === cleanTarget ||
          (uDistrict && (target.includes(uDistrict) || cleanTarget.includes(uDistrict) || uDistrict.includes(cleanTarget))) ||
          uCity === target ||
          uCity === cleanTarget ||
          (uCity && (target.includes(uCity) || cleanTarget.includes(uCity) || uCity.includes(cleanTarget))) ||
          (uComm && (target.includes(uComm) || cleanTarget.includes(uComm) || uComm.includes(cleanTarget)))
        );
      });
    } else if (selectedDistrictFilter) {
      const target = selectedDistrictFilter.toLowerCase().trim();
      list = list.filter((u) => {
        const uDistrict = (u.district || '').toLowerCase().trim();
        const uCity = (u.city || '').toLowerCase().trim();
        return (
          uDistrict === target ||
          (uDistrict && target.includes(uDistrict)) ||
          (target && uDistrict.includes(target)) ||
          uCity === target ||
          (uCity && target.includes(uCity)) ||
          (target && uCity.includes(target))
        );
      });
    }

    return list;
  }, [users, isRestrictedToDistrict, userDistrict, cleanDistrict, selectedDistrictFilter]);

  // Counts based on active district scope
  const counts = {
    all: districtFilteredUsers.length,
    pending: districtFilteredUsers.filter((u) => {
      const s = u.status || (u.isVerified ? 'approved' : 'pending');
      return s === 'pending';
    }).length,
    approved: districtFilteredUsers.filter((u) => {
      const s = u.status || (u.isVerified ? 'approved' : 'pending');
      return s === 'approved';
    }).length,
    rejected: districtFilteredUsers.filter((u) => {
      const s = u.status;
      return s === 'reject' || s === 'rejected';
    }).length,
  };

  // Filtered list with status and search
  const filteredUsers = useMemo(() => {
    return districtFilteredUsers.filter((u) => {
      const uStatus = u.status || (u.isVerified ? 'approved' : 'pending');
      const isRejected = uStatus === 'reject' || uStatus === 'rejected';
      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'pending' && uStatus === 'pending') ||
        (activeFilter === 'approved' && uStatus === 'approved') ||
        (activeFilter === 'rejected' && isRejected);

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        u.name?.toLowerCase().includes(query) ||
        u.phone?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query) ||
        u.city?.toLowerCase().includes(query) ||
        u.district?.toLowerCase().includes(query) ||
        u.membershipId?.toLowerCase().includes(query) ||
        u.paymentUtr?.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [districtFilteredUsers, activeFilter, searchQuery]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Header Banner */}
      <div
        className="rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6"
        style={{
          background: 'linear-gradient(135deg, var(--mfct-dark-green) 0%, #0a1c12 100%)',
          border: '1px solid rgba(200,168,75,0.3)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(200,168,75,0.18)' }} />

        <div className="flex items-start gap-4 relative z-10">
          <div
            className="p-3.5 rounded-2xl shrink-0 mt-0.5"
            style={{
              background: 'rgba(200,168,75,0.15)',
              border: '1px solid rgba(200,168,75,0.35)',
            }}
          >
            <ShieldCheck className="w-6 h-6" style={{ color: 'var(--mfct-gold)' }} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {tr('सदस्य पंजीकरण एवं केवाईसी सत्यापन', 'اراکین رجسٹریشن اور KYC تصدیق', 'Member Registrations & KYC Verification')}
            </h1>
            <p className="text-xs sm:text-sm mt-1 max-w-4xl" style={{ color: 'rgba(200,168,75,0.9)' }}>
              {tr(
                'नए पंजीकृत सदस्यों के दस्तावेज़, आधार कार्ड और भुगतान सत्यापन की समीक्षा करें।',
                'نئے رجسٹرڈ اراکین کے دستاویزات، آدھار کارڈ اور ادائیگی کا جائزہ لیں۔',
                'Review member documents, Aadhaar identity proofs, and fee payment verification records.'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Verification Queue Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        {/* District Role Filter Indicator Banner */}
        {isRestrictedToDistrict && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <p className="font-black text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <span>{districtRoleTitle}</span>
                  {userDistrict && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 text-[10px] font-bold">
                      {userDistrict}
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                  {tr(
                    `केवल आपके जिले (${userDistrict || 'निर्दिष्ट जिला'}) के सदस्यों का केवाईसी दिखाया जा रहा है।`,
                    `صرف آپ کے ضلع (${userDistrict || 'مخصوص ضلع'}) کے اراکین کی کے وائی سی دکھائی جا رہی ہے۔`,
                    `Showing only member KYC registrations belonging to your designated district (${userDistrict || 'Assigned District'}).`
                  )}
                  {!canPerformKycAction && (
                    <span className="block mt-0.5 font-semibold text-rose-700 dark:text-rose-400">
                      {tr(
                        '(केवल दृश्य मोड: सत्यापन की कार्रवाई केवल जिला संयोजक या केंद्रीय व्यवस्थापक कर सकते हैं)',
                        '(صرف دیکھنے کا موڈ: صرف ڈسٹرکٹ کوآرڈینیٹر یا سینٹرل ایڈمن تصدیق کر سکتے ہیں)',
                        '(View Only: KYC actions can only be performed by District Coordinator or Central Admins)'
                      )}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300 font-bold text-[11px] shrink-0">
              {districtFilteredUsers.length} {tr('सदस्य', 'اراکین', districtFilteredUsers.length === 1 ? 'Member' : 'Members')}
            </span>
          </div>
        )}

        {/* Filter Pills & Controls Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1">
            <button
              onClick={() => setActiveFilter('pending')}
              className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeFilter === 'pending'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100'
                }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{tr('लंबित सत्यापन', 'زیر التواء', 'Pending Approval')}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${activeFilter === 'pending' ? 'bg-white/20 text-white' : 'bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-200'
                }`}>
                {counts.pending}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('approved')}
              className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeFilter === 'approved'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100'
                }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{tr('सत्यापित / स्वीकृत', 'تصدیق شدہ', 'Approved & Verified')}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${activeFilter === 'approved' ? 'bg-white/20 text-white' : 'bg-emerald-200/80 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200'
                }`}>
                {counts.approved}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('rejected')}
              className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeFilter === 'rejected'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100'
                }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>{tr('अस्वीकृत', 'مسترد شدہ', 'Rejected')}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${activeFilter === 'rejected' ? 'bg-white/20 text-white' : 'bg-rose-200/80 dark:bg-rose-900 text-rose-900 dark:text-rose-200'
                }`}>
                {counts.rejected}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('all')}
              className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{tr('सभी सदस्य', 'تمام اراکین', 'All Registrations')}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${activeFilter === 'all' ? 'bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                {counts.all}
              </span>
            </button>
          </div>

          {/* Right Controls: District Filter Dropdown & Search Box */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            {!isRestrictedToDistrict && (
              <div className="flex items-center gap-2 shrink-0">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={selectedDistrictFilter}
                  onChange={(e) => setSelectedDistrictFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:border-emerald-500 outline-none cursor-pointer"
                >
                  <option value="">{tr('सभी जिले (All Districts)', 'تمام اضلاع', 'All Districts')}</option>
                  {STANDARD_DISTRICTS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {language === 'hi' ? d.nameHi : language === 'ur' ? d.nameUr : d.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder={tr('नाम, फ़ोन, ईमेल, UTR या शहर खोजें...', 'نام، فون، ای میل، UTR تلاش کریں...', 'Search name, phone, email, UTR...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-7 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Users List */}
        {loading ? (
          <DarkListSkeleton items={4} />
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="max-w-sm space-y-1">
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                {searchQuery
                  ? tr('कोई मिलान नहीं मिला', 'کوئی نتیجہ नहीं मिला', 'No matching members found')
                  : activeFilter === 'pending'
                    ? tr('सब कुछ अद्यतन है! कोई लंबित सत्यापन नहीं', 'سب مکمل ہے! کوئی زیر التواء تصدیق نہیں', 'All caught up! No pending verifications')
                    : activeFilter === 'rejected'
                      ? tr('कोई अस्वीकृत आवेदन नहीं है', 'کوئی مسترد شدہ درخواست نہیں', 'No rejected applications')
                      : tr('कोई सदस्य नहीं मिला', 'کوئی ممبر नहीं मिला', 'No members found')}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {searchQuery
                  ? tr('कृपया अलग खोज शब्द का प्रयास करें।', 'براہ کرم کوئی दूसरा لفظ تلاش کریں۔', 'Try adjusting your search criteria.')
                  : activeFilter === 'pending'
                    ? tr('सभी सदस्य सफलतापूर्वक सत्यापित किए जा चुके हैं।', 'تمام اراکین کی تصدیق مکمل ہو چکی ہے۔', 'All registered members have been reviewed.')
                    : activeFilter === 'rejected'
                      ? tr('कोई अस्वीकृत सदस्य रिकॉर्ड उपलब्ध नहीं है।', 'کوئی مسترد شدہ ریکارڈ موجود نہیں ہے۔', 'No rejected member applications.')
                      : tr('इस श्रेणी में अभी कोई रिकॉर्ड नहीं है।', 'اس کیٹیگری میں ابھی کوئی ریکارڈ موجود नहीं ہے۔', 'No records found in this category.')}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredUsers.map((u) => {
              const uStatus = u.status || (u.isVerified ? 'approved' : 'pending');
              const isApproved = uStatus === 'approved';
              const isRejected = uStatus === 'reject' || uStatus === 'rejected';
              const hasAadhaar = !!(u.aadhaarFrontUrl || u.aadhaarBackUrl);
              const hasScreenshot = !!u.paymentScreenshotUrl;

              return (
                <div
                  key={u.id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700/50 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs"
                >
                  {/* Left: Avatar & Member Info */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    {/* Avatar */}
                    <div className="relative w-12 h-12 shrink-0 rounded-2xl overflow-hidden bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-sm border border-purple-200 dark:border-purple-800">
                      {u.avatar ? (
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span>{(u.name || 'U').trim().charAt(0).toUpperCase()}</span>
                      )}
                    </div>

                    {/* Member Details */}
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-slate-900 dark:text-white text-base truncate">
                          {u.name}
                        </h4>

                        {/* Status Badge */}
                        {isApproved ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{tr('स्वीकृत / सत्यापित', 'تصدیق شدہ', 'Approved & Verified')}</span>
                          </span>
                        ) : isRejected ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>{tr('अस्वीकृत', 'مسترد شدہ', 'Rejected')}</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>{tr('स्वीकृति लंबित', 'زیر التواء', 'Pending Approval')}</span>
                          </span>
                        )}

                        {/* Religion Badge */}
                        {u.religion && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {u.religion}
                          </span>
                        )}

                        {/* Malik-e-Nisab Tag */}
                        {u.religion === 'Muslim' && (
                          u.isMalikENisab ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200">
                              {tr('मालिक-ए-निसाब', 'صاحبِ نصاب', 'Malik-e-Nisab')}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200">
                              {tr(`मदद पात्र (${u.helpType || 'सामान्य'})`, `امداد के اہل (${u.helpType || 'عام'})`, `Eligible for Aid (${u.helpType || 'General'})`)}
                            </span>
                          )
                        )}
                      </div>

                      {/* Contact & Location Info */}
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                        {u.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{u.phone}</span>
                          </span>
                        )}
                        {u.email && (
                          <span className="flex items-center gap-1 truncate max-w-[200px]">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span className="truncate">{u.email}</span>
                          </span>
                        )}
                        {(u.city || u.state) && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{[u.city, u.state].filter(Boolean).join(', ')}</span>
                          </span>
                        )}
                        {u.membershipId && (
                          <span className="font-mono text-[11px] font-semibold text-purple-700 dark:text-purple-400">
                            #{u.membershipId}
                          </span>
                        )}
                      </div>

                      {/* Payment & Documents mini indicator */}
                      <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                        {u.paymentUtr && (
                          <span className="font-mono bg-slate-200/80 dark:bg-slate-700/80 px-2 py-0.5 rounded text-[10px] text-slate-800 dark:text-slate-200 font-bold">
                            UTR: {u.paymentUtr}
                          </span>
                        )}
                        {hasAadhaar && (
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-0.5">
                            <IdCard className="w-3 h-3" /> Aadhaar Attached
                          </span>
                        )}
                        {hasScreenshot && (
                          <span className="text-purple-700 dark:text-purple-400 font-bold text-[10px] flex items-center gap-0.5">
                            <Receipt className="w-3 h-3" /> Payment Proof
                          </span>
                        )}
                      </div>

                      {/* Rejection Reason notice if rejected */}
                      {isRejected && (u.rejectionReason || u.rejection_reason) && (
                        <div className="mt-2 flex items-start gap-1.5 text-xs text-rose-700 dark:text-rose-400 bg-rose-50/90 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 max-w-2xl">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                          <div>
                            <span className="font-bold">{tr('अस्वीकृति कारण:', 'مسترد کرنے کی وجہ:', 'Rejection Reason:')} </span>
                            <span>{u.rejectionReason || u.rejection_reason}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 justify-end flex-wrap">
                    {/* View Details Button */}
                    <button
                      onClick={() => setSelectedUser(u)}
                      className="cursor-pointer px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
                    >
                      <Eye className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span>{tr('पूर्ण विवरण देखें', 'مکمل تفصیلات', 'View Full Details')}</span>
                    </button>

                    {/* Action buttons restricted to Super Admin, Executive Admin & District Coordinator */}
                    {canPerformKycAction && (
                      <>
                        {/* Approve Button (Visible for Pending and Rejected) */}
                        {!isApproved && (
                          <button
                            onClick={() => handleApprove(u.id)}
                            disabled={processingId === u.id}
                            className="cursor-pointer px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                          >
                            {processingId === u.id && processingAction === 'approve' ? (
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            <span>{isRejected ? tr('पुनः स्वीकृत करें', 'دوبارہ منظور کریں', 'Re-Approve') : tr('स्वीकृत करें', 'منظور کریں', 'Approve')}</span>
                          </button>
                        )}

                        {/* Reject / Revoke Button (Must provide reason) */}
                        <button
                          onClick={() => openRejectModal(u)}
                          disabled={processingId === u.id}
                          className="cursor-pointer px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-400 font-bold text-xs flex items-center gap-1 transition-colors border border-rose-200 dark:border-rose-800/60 disabled:opacity-50"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>
                            {isApproved
                              ? tr('सत्यापन हटाएं', 'منسوخ करें', 'Revoke / Reject')
                              : isRejected
                                ? tr('कारण संपादित करें', 'وجہ تبدیل کریں', 'Edit Reason')
                                : tr('अस्वीकार करें', 'مسترد करें', 'Reject')}
                          </span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Comprehensive User Registration Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full shadow-2xl relative overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 flex items-center justify-center font-black">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                    {tr('सदस्य पूर्ण केवाईसी एवं पंजीकरण विवरण', 'رکن کی مکمل رجسٹریشن اور KYC تفصیلات', 'Full Member KYC & Registration Ledger')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {tr('आईडी:', 'شناخت:', 'ID:')} {selectedUser.id} • #{selectedUser.membershipId || 'N/A'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 dark:text-slate-300 text-xs">
              {/* 1. Member Profile & Status Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-black text-2xl overflow-hidden shrink-0 border-2 border-purple-300 shadow-md">
                  {selectedUser.avatar ? (
                    <img
                      src={selectedUser.avatar}
                      alt={selectedUser.name}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-90"
                      onClick={() => setPreviewImage({ url: selectedUser.avatar, title: `${selectedUser.name} - Profile Photo` })}
                    />
                  ) : (
                    <span>{(selectedUser.name || 'U').trim().charAt(0).toUpperCase()}</span>
                  )}
                </div>

                <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {selectedUser.name}
                    </h4>
                    {selectedUser.isVerified ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{tr('सत्यापित सदस्य', 'تصدیق شدہ', 'Verified Member')}</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>{tr('सत्यापन लंबित', 'زیر التواء', 'Pending Approval')}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-slate-500 dark:text-slate-400 text-xs">
                    {tr('समुदाय:', 'کمیونٹی:', 'Community:')}{' '}
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {selectedUser.communityName || 'Rohilkhand Educational & Nikah Trust'}
                    </span>
                    {selectedUser.joinDate && ` • ${tr('जॉइनिंग तिथि:', 'شمولیت کی تاریخ:', 'Join Date:')} ${selectedUser.joinDate}`}
                  </p>
                </div>
              </div>

              {/* 2. Personal & Contact Information */}
              <div className="space-y-3">
                <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <UserIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>{tr('व्यक्तिगत एवं संपर्क विवरण', 'ذاتی اور رابطہ کی معلومات', 'Personal & Contact Information')}</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">{tr('पूरा नाम', 'مکمل نام', 'Full Name')}</p>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedUser.name}</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">{tr('मोबाइल नंबर', 'موبائل نمبر', 'Mobile Number')}</p>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedUser.phone || 'N/A'}</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">{tr('ईमेल आईडी', 'ای میل', 'Email Address')}</p>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5 truncate">{selectedUser.email || 'N/A'}</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">{tr('शहर', 'شہر', 'City')}</p>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedUser.city || 'N/A'}</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">{tr('राज्य', 'ریاست', 'State')}</p>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedUser.state || 'N/A'}</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">{tr('सदस्यता आईडी', 'رکنیت نمبر', 'Membership ID')}</p>
                    <p className="font-bold text-purple-700 dark:text-purple-400 font-mono mt-0.5">{selectedUser.membershipId || 'N/A'}</p>
                  </div>

                  {selectedUser.address && (
                    <div className="sm:col-span-2 md:col-span-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                      <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">{tr('पूरा पता', 'مکمل پتہ', 'Full Address')}</p>
                      <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedUser.address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Faith & Social Finance Eligibility */}
              <div className="space-y-3">
                <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>{tr('धर्म एवं सामाजिक सहायता पात्रता', 'مذہب اور مالی امداد کی حیثیت', 'Religion & Social Finance Status')}</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">{tr('धर्म', 'مذہب', 'Religion')}</p>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5 text-sm">{selectedUser.religion || 'N/A'}</p>
                  </div>

                  {selectedUser.religion === 'Muslim' && (
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                      <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                        {tr('क्या आप मालिक-ए-निसाब हैं?', 'کیا آپ صاحبِ نصاب ہیں؟', 'Malik-e-Nisab Status')}
                      </p>
                      <p className={`font-bold mt-0.5 text-sm ${selectedUser.isMalikENisab ? 'text-teal-600 dark:text-teal-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {selectedUser.isMalikENisab
                          ? tr('हाँ (मालिक-ए-निसाब - ज़कात/सदका दाता)', 'ہاں (صاحبِ نصاب)', 'Yes (Malik-e-Nisab - Eligible to Pay Zakat)')
                          : tr('नहीं (सहायता का पात्र - ज़कात/सदका प्राप्तकर्ता)', 'نہیں (امداد کا مستحق)', 'No (Eligible to Receive Zakat/Sadqa)')}
                      </p>
                    </div>
                  )}

                  {selectedUser.religion === 'Muslim' && !selectedUser.isMalikENisab && selectedUser.helpType && (
                    <div className="sm:col-span-2 bg-amber-50 dark:bg-amber-950/30 p-3.5 rounded-xl border border-amber-200 dark:border-amber-800/50 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-900 dark:text-amber-300">
                          {tr('आवश्यक सहायता का प्रकार:', 'مطلوبہ امداد کی قسم:', 'Assistance Type Requested:')}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-extrabold text-[11px]">
                          {selectedUser.helpType}
                        </span>
                      </div>
                      {selectedUser.helpDetails && (
                        <p className="text-slate-700 dark:text-slate-300 text-xs mt-1">
                          <span className="font-semibold">{tr('विवरण:', 'تفصیلات:', 'Details:')} </span>
                          {selectedUser.helpDetails}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Aadhaar & Identity Proofs */}
              <div className="space-y-3">
                <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <IdCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{tr('पहचान पत्र एवं आधार दस्तावेज़', 'شناختی دستاویزات اور آدھار', 'Identity & Aadhaar Proofs')}</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Aadhaar Front */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                        {tr('आधार कार्ड (सामने का भाग)', 'آدھار کارڈ (سامنے)', 'Aadhaar Card (Front)')}
                      </span>
                      {selectedUser.aadhaarFrontUrl && (
                        <a
                          href={selectedUser.aadhaarFrontUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-purple-600 hover:text-purple-700 dark:text-purple-400 text-[10px] font-bold flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" /> {tr('खोलें', 'کھولیں', 'Open')}
                        </a>
                      )}
                    </div>

                    <div className="h-44 bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-800">
                      {selectedUser.aadhaarFrontUrl ? (
                        <img
                          src={selectedUser.aadhaarFrontUrl}
                          alt="Aadhaar Front"
                          className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => setPreviewImage({ url: selectedUser.aadhaarFrontUrl!, title: `${selectedUser.name} - Aadhaar Front` })}
                        />
                      ) : (
                        <div className="text-center p-4 text-slate-400">
                          <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                          <p className="text-[11px] font-medium">{tr('आधार सामने का भाग संलग्न नहीं है', 'آدھار منسلک نہیں ہے', 'No front image attached')}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Aadhaar Back */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                        {tr('आधार कार्ड (पीछे का भाग)', 'آدھار کارڈ (پیچھے)', 'Aadhaar Card (Back)')}
                      </span>
                      {selectedUser.aadhaarBackUrl && (
                        <a
                          href={selectedUser.aadhaarBackUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-purple-600 hover:text-purple-700 dark:text-purple-400 text-[10px] font-bold flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" /> {tr('खोलें', 'کھولیں', 'Open')}
                        </a>
                      )}
                    </div>

                    <div className="h-44 bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-800">
                      {selectedUser.aadhaarBackUrl ? (
                        <img
                          src={selectedUser.aadhaarBackUrl}
                          alt="Aadhaar Back"
                          className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => setPreviewImage({ url: selectedUser.aadhaarBackUrl!, title: `${selectedUser.name} - Aadhaar Back` })}
                        />
                      ) : (
                        <div className="text-center p-4 text-slate-400">
                          <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                          <p className="text-[11px] font-medium">{tr('आधार पीछे का भाग संलग्न नहीं है', 'آدھار منسلک نہیں ہے', 'No back image attached')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Payment & Fee Verification Ledger */}
              <div className="space-y-3">
                <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>{tr('पंजीकरण शुल्क एवं भुगतान सत्यापन विवरण', 'رجسٹریشن فیس اور ادائیگی کی تفصیلات', 'Registration Fee & Payment Ledger')}</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Payment Details Card */}
                  <div className="space-y-2.5">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                      <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">{tr('भुगतान माध्यम', 'طریقہ ادائیگی', 'Payment Method')}</p>
                      <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedUser.paymentMethod || 'UPI Transfer'}</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">{tr('UTR / लेनदेन संख्या', 'ٹرانزیکشن نمبر', 'UTR / Ref Number')}</p>
                        <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">{selectedUser.paymentUtr || 'N/A'}</p>
                      </div>
                      {selectedUser.paymentUtr && (
                        <button
                          onClick={() => copyToClipboard(selectedUser.paymentUtr!, 'utr')}
                          className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                          title="Copy UTR"
                        >
                          {copiedKey === 'utr' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Payment Screenshot */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                        {tr('भुगतान रसीद / स्क्रीनशॉट', 'ادائیگی کی رسید / اسکرین شاٹ', 'Payment Screenshot Proof')}
                      </span>
                      {selectedUser.paymentScreenshotUrl && (
                        <a
                          href={selectedUser.paymentScreenshotUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-purple-600 hover:text-purple-700 dark:text-purple-400 text-[10px] font-bold flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" /> {tr('खोलें', 'کھولیں', 'Open')}
                        </a>
                      )}
                    </div>

                    <div className="h-36 bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-800">
                      {selectedUser.paymentScreenshotUrl ? (
                        <img
                          src={selectedUser.paymentScreenshotUrl}
                          alt="Payment Proof"
                          className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => setPreviewImage({ url: selectedUser.paymentScreenshotUrl!, title: `${selectedUser.name} - Payment Receipt` })}
                        />
                      ) : (
                        <div className="text-center p-4 text-slate-400">
                          <Receipt className="w-8 h-8 mx-auto mb-1 opacity-50" />
                          <p className="text-[11px] font-medium">{tr('कोई स्क्रीनशॉट संलग्न नहीं है', 'کوئی ثبوت منسلک نہیں', 'No payment receipt attached')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 bg-slate-50 dark:bg-slate-900">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                {tr('बंद करें', 'بند کریں', 'Close')}
              </button>

              <div className="flex items-center gap-2.5">
                {canPerformKycAction ? (
                  selectedUser.status === 'approved' || (selectedUser.isVerified && selectedUser.status !== 'reject' && selectedUser.status !== 'rejected') ? (
                    <button
                      onClick={() => openRejectModal(selectedUser)}
                      disabled={processingId === selectedUser.id}
                      className="cursor-pointer px-5 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-bold text-xs border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>{tr('अस्वीकार करें (कारण आवश्यक)', 'مسترد کریں (وجہ درکار)', 'Reject (Reason Required)')}</span>
                    </button>
                  ) : selectedUser.status === 'reject' || selectedUser.status === 'rejected' ? (
                    <>
                      <button
                        onClick={() => openRejectModal(selectedUser)}
                        disabled={processingId === selectedUser.id}
                        className="cursor-pointer px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>{tr('कारण संपादित करें', 'وجہ تبدیل کریں', 'Edit Rejection Reason')}</span>
                      </button>

                      <button
                        onClick={() => handleApprove(selectedUser.id)}
                        disabled={processingId === selectedUser.id}
                        className="cursor-pointer px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-900/40 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {processingId === selectedUser.id && processingAction === 'approve' ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>{tr('स्वीकृत एवं सत्यापित करें', 'منظور اور تصدیق کریں', 'Approve & Verify Member')}</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => openRejectModal(selectedUser)}
                        disabled={processingId === selectedUser.id}
                        className="cursor-pointer px-5 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-bold text-xs border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>{tr('अस्वीकार करें', 'مسترد کریں', 'Reject')}</span>
                      </button>

                      <button
                        onClick={() => handleApprove(selectedUser.id)}
                        disabled={processingId === selectedUser.id}
                        className="cursor-pointer px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-900/40 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {processingId === selectedUser.id && processingAction === 'approve' ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>{tr('स्वीकृत एवं सत्यापित करें', 'منظور اور تصدیق کریں', 'Approve & Verify Member')}</span>
                      </button>
                    </>
                  )
                ) : (
                  <span className="text-xs text-slate-500 dark:text-slate-400 italic px-2">
                    {tr(
                      'केवल सुपर एडमिन, कार्यकारी एडमिन और जिला संयोजक ही सत्यापन कार्रवाई कर सकते हैं।',
                      'صرف سپر ایڈمن، ایگزیکٹو ایڈمن اور ڈسٹرکٹ کوآرڈینیٹر ہی کارروائی کر سکتے ہیں۔',
                      'Only Super Admin, Executive Admin & District Coordinator can perform KYC actions.'
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Rejection Reason Modal */}
      {rejectModalUser && (
        <div className="fixed inset-0 bg-slate-950/80 z-[110] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-rose-50/60 dark:bg-rose-950/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {tr('अस्वीकृति का कारण दर्ज करें', 'مسترد کرنے کی وجہ درج کریں', 'Enter Rejection Reason')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {rejectModalUser.name} • {tr('आईडी:', 'شناخت:', 'ID:')} {rejectModalUser.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setRejectModalUser(null);
                  setRejectionReasonError('');
                }}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {tr(
                  'सत्यापन अस्वीकार करने के लिए कारण अनिवार्य है। यह कारण सदस्य को उनके रिकॉर्ड में स्पष्ट रूप से दिखाई देगा:',
                  'تصدیق مسترد کرنے کی وجہ لازمی ہے۔ یہ وجہ رکن کے ریکارڈ میں نظر آئے گی:',
                  'A reason is mandatory when rejecting verification. This will be clearly recorded on the member’s profile:'
                )}
              </p>

              {/* Quick Preset Reason Chips */}
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {tr('त्वरित कारण चुनें:', 'فوری وجوہات منتخب کریں:', 'Quick select common reasons:')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    tr('धुंधला या अस्पष्ट आधार कार्ड', 'دھندلا شناختی کارڈ', 'Blurry / Unreadable ID or Aadhaar card'),
                    tr('विवरण और पहचान पत्र में बेमेल', 'تفصیلات میں فرق', 'Details do not match submitted ID'),
                    tr('अमान्य या अपठनीय भुगतान रसीद', 'غلط ادائیگی کی رسید', 'Invalid or unreadable payment receipt'),
                    tr('अधूरे दस्तावेज या पृष्ठ गायब', 'نامکمل دستاویزات', 'Incomplete documents / Missing back page'),
                    tr('अमान्य या अनुचित प्रोफाइल फोटो', 'غلط پروفائل تصویر', 'Invalid or improper profile photo'),
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setRejectionReasonInput((prev) => (prev ? `${prev}. ${preset}` : preset));
                        setRejectionReasonError('');
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-purple-100 hover:text-purple-700 dark:bg-slate-800 dark:hover:bg-purple-950/60 dark:hover:text-purple-300 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  {tr('विस्तृत कारण *', 'تفصیلی وجہ *', 'Detailed Rejection Reason *')}
                </label>
                <textarea
                  value={rejectionReasonInput}
                  onChange={(e) => {
                    setRejectionReasonInput(e.target.value);
                    if (rejectionReasonError) setRejectionReasonError('');
                  }}
                  rows={4}
                  placeholder={tr(
                    'उदा. आधार कार्ड का पिछला भाग गायब है और रसीद साफ नहीं दिख रही है...',
                    'مثلاً شناختی کارڈ کی پشت غائب ہے...',
                    'e.g. Back side of Aadhaar card is missing and payment screenshot is illegible...'
                  )}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder-slate-400 resize-none font-medium"
                />
                {rejectionReasonError && (
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1">
                    <XCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{rejectionReasonError}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setRejectModalUser(null);
                  setRejectionReasonError('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {tr('रद्द करें', 'منسوخ کریں', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={processingId === rejectModalUser.id}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-900/30 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {processingId === rejectModalUser.id ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <XCircle className="w-3.5 h-3.5" />
                )}
                <span>{tr('अस्वीकार की पुष्टि करें', 'مسترد کرنے کی تصدیق کریں', 'Confirm Rejection')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 bg-slate-950/90 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in cursor-zoom-out"
        >
          <div className="max-w-4xl max-h-[90vh] relative flex flex-col items-center">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-rose-400 p-2 text-sm font-bold flex items-center gap-1"
            >
              <X className="w-5 h-5" /> Close
            </button>
            <p className="text-white text-xs font-bold mb-2">{previewImage.title}</p>
            <img
              src={previewImage.url}
              alt={previewImage.title}
              className="max-h-[80vh] max-w-full rounded-2xl shadow-2xl object-contain ring-1 ring-white/20"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export const KycTab = ExecutiveDashboard;
