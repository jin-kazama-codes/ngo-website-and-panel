'use client';

import React, { useState, useEffect } from 'react';
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
  Filter
} from 'lucide-react';
import { DarkListSkeleton } from '../../components/Skeletons';
import { getUsers, updateUser } from '../../services/userService';
import { useLanguage } from '../../context/LanguageContext';
import { useDynamicTranslatedText } from '../../lib/autoTranslate';
import { translateCity } from '../../lib/translateEntity';

interface ExecutiveDashboardProps {
  activeUser?: User;
  currentRole?: UserRole;
}

type VerificationFilter = 'all' | 'pending' | 'approved';

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ activeUser, currentRole }) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeFilter, setActiveFilter] = useState<VerificationFilter>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<'approve' | 'reject' | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const communityFilter = currentRole === 'community_admin' && activeUser?.communityId ? activeUser.communityId : undefined;
      const allUsers = await getUsers(communityFilter);
      setUsers(allUsers || []);
    } catch (err) {
      console.error('Failed to load users for KYC verification:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [currentRole, activeUser?.communityId]);

  const handleAction = async (id: string, approve: boolean) => {
    try {
      setProcessingId(id);
      setProcessingAction(approve ? 'approve' : 'reject');
      await updateUser(id, { isVerified: approve });
      
      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isVerified: approve } : u))
      );

      if (selectedUser?.id === id) {
        setSelectedUser((prev) => (prev ? { ...prev, isVerified: approve } : null));
      }
    } catch (err) {
      console.error('Action failed:', err);
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  // Counts
  const counts = {
    all: users.length,
    pending: users.filter((u) => !u.isVerified).length,
    approved: users.filter((u) => !!u.isVerified).length,
  };

  // Filtered list
  const filteredUsers = users.filter((u) => {
    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'pending' && !u.isVerified) ||
      (activeFilter === 'approved' && !!u.isVerified);

    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      u.name?.toLowerCase().includes(query) ||
      u.phone?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query) ||
      u.city?.toLowerCase().includes(query) ||
      u.membershipId?.toLowerCase().includes(query) ||
      u.paymentUtr?.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Verification Queue Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center shrink-0 font-bold shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-xl sm:text-2xl text-slate-900 dark:text-white">
                {tr('सदस्य पंजीकरण एवं केवाईसी सत्यापन', 'اراکین رجسٹریشن اور KYC تصدیق', 'Member Registrations & KYC Verification')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {tr('नए पंजीकृत सदस्यों के दस्तावेज़, आधार कार्ड और भुगतान सत्यापन की समीक्षा करें।', 'نئے رجسٹرڈ اراکین کے دستاویزات، آدھار کارڈ اور ادائیگی کا جائزہ لیں۔', 'Review member documents, Aadhaar identity proofs, and fee payment verification records.')}
              </p>
            </div>
          </div>
        </div>

        {/* Filter Pills & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveFilter('pending')}
              className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeFilter === 'pending'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{tr('लंबित सत्यापन', 'زیر التواء', 'Pending Approval')}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                activeFilter === 'pending' ? 'bg-white/20 text-white' : 'bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-200'
              }`}>
                {counts.pending}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('approved')}
              className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeFilter === 'approved'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{tr('सत्यापित / स्वीकृत', 'تصدیق شدہ', 'Approved & Verified')}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                activeFilter === 'approved' ? 'bg-white/20 text-white' : 'bg-emerald-200/80 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200'
              }`}>
                {counts.approved}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('all')}
              className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{tr('सभी सदस्य', 'تمام اراکین', 'All Registrations')}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                activeFilter === 'all' ? 'bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                {counts.all}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder={tr('नाम, फ़ोन, ईमेल, UTR या शहर खोजें...', 'نام، فون، ای میل، UTR تلاش کریں...', 'Search name, phone, email, UTR...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
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
                  ? tr('कोई मिलान नहीं मिला', 'کوئی نتیجہ نہیں ملا', 'No matching members found')
                  : activeFilter === 'pending'
                  ? tr('सब कुछ अद्यतन है! कोई लंबित सत्यापन नहीं', 'سب مکمل ہے! کوئی زیر التواء تصدیق نہیں', 'All caught up! No pending verifications')
                  : tr('कोई सदस्य नहीं मिला', 'کوئی ممبر نہیں ملا', 'No members found')}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {searchQuery
                  ? tr('कृपया अलग खोज शब्द का प्रयास करें।', 'براہ کرم کوئی دوسرا لفظ تلاش کریں۔', 'Try adjusting your search criteria.')
                  : activeFilter === 'pending'
                  ? tr('सभी सदस्य सफलतापूर्वक सत्यापित किए जा चुके हैं।', 'تمام اراکین کی تصدیق مکمل ہو چکی ہے۔', 'All registered members have been reviewed.')
                  : tr('इस श्रेणी में अभी कोई रिकॉर्ड नहीं है।', 'اس کیٹیگری میں ابھی کوئی ریکارڈ موجود نہیں ہے۔', 'No records found in this category.')}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredUsers.map((u) => {
              const isApproved = !!u.isVerified;
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
                            <span>{tr('सत्यापित', 'تصدیق شدہ', 'Verified')}</span>
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
                              {tr(`मदद पात्र (${u.helpType || 'सामान्य'})`, `امداد کے اہل (${u.helpType || 'عام'})`, `Eligible for Aid (${u.helpType || 'General'})`)}
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

                    {/* Approve Button */}
                    {!isApproved && (
                      <button
                        onClick={() => handleAction(u.id, true)}
                        disabled={processingId === u.id}
                        className="cursor-pointer px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                      >
                        {processingId === u.id && processingAction === 'approve' ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>{tr('स्वीकृत करें', 'منظور کریں', 'Approve')}</span>
                      </button>
                    )}

                    {/* Reject / Revoke Button */}
                    {isApproved ? (
                      <button
                        onClick={() => handleAction(u.id, false)}
                        disabled={processingId === u.id}
                        className="cursor-pointer px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-400 font-bold text-xs flex items-center gap-1 transition-colors border border-rose-200 dark:border-rose-800/60 disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>{tr('सत्यापन हटाएं', 'منسوخ کریں', 'Revoke')}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction(u.id, false)}
                        disabled={processingId === u.id}
                        className="cursor-pointer px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-400 font-bold text-xs flex items-center gap-1 transition-colors border border-rose-200 dark:border-rose-800/60 disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>{tr('अस्वीकार करें', 'مسترد', 'Reject')}</span>
                      </button>
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
                {selectedUser.isVerified ? (
                  <button
                    onClick={() => handleAction(selectedUser.id, false)}
                    disabled={processingId === selectedUser.id}
                    className="cursor-pointer px-5 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-bold text-xs border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {processingId === selectedUser.id && processingAction === 'reject' ? (
                      <div className="w-3.5 h-3.5 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <X className="w-3.5 h-3.5" />
                    )}
                    <span>{tr('सत्यापन रद्द करें (गैर-सत्यापित करें)', 'منسوخ کریں', 'Revoke Verification')}</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleAction(selectedUser.id, false)}
                      disabled={processingId === selectedUser.id}
                      className="cursor-pointer px-5 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-bold text-xs border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {processingId === selectedUser.id && processingAction === 'reject' ? (
                        <div className="w-3.5 h-3.5 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <X className="w-3.5 h-3.5" />
                      )}
                      <span>{tr('अस्वीकार करें', 'مسترد کریں', 'Reject')}</span>
                    </button>

                    <button
                      onClick={() => handleAction(selectedUser.id, true)}
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
                )}
              </div>
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
