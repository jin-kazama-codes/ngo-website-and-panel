'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  LogOut,
  Edit3,
  UserPlus,
  ShieldCheck,
  Phone,
  Mail,
  Building2,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Info,
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { LanguageSelector } from '../../../components/LanguageSelector';
import { KycUpdateModal } from '../../../components/KycUpdateModal';
import { getUserById } from '../../../services/userService';
import { User } from '../../../types';

export default function UnderReviewPage() {
  const router = useRouter();
  const { language } = useLanguage();

  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const pollTimerRef = useRef<any>(null);

  // 1. Load initial user from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedId = localStorage.getItem('id');
      const savedName = localStorage.getItem('name') || '';
      const savedEmail = localStorage.getItem('email') || '';
      const savedRole = localStorage.getItem('role') || 'member';

      if (!savedId) {
        // No saved user, redirect to sign-in
        router.push('/sign-in');
        return;
      }

      // Initial temporary user from localStorage while fetching DB
      const tempUser: Partial<User> = {
        id: savedId,
        name: savedName,
        email: savedEmail,
        role: savedRole as any,
        status: 'pending',
      };
      setCurrentUser(tempUser as User);

      // Fetch fresh user from DB
      checkStatus(savedId, false);
    }
  }, []);

  // 2. Fetch fresh user status from DB
  const checkStatus = useCallback(async (userId?: string, showIndicator = false) => {
    const idToCheck = userId || currentUser?.id;
    if (!idToCheck) return;

    if (showIndicator) setIsRefreshing(true);

    try {
      const freshUser = await getUserById(idToCheck);
      setLastChecked(new Date());

      if (!freshUser) {
        // User record was deleted from database -> Terminated
        setIsTerminated(true);
        return;
      }

      setIsTerminated(false);
      setCurrentUser(freshUser);

      // Sync name & status to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('name', freshUser.name || '');
        if (freshUser.email) localStorage.setItem('email', freshUser.email);
        localStorage.setItem('role', freshUser.role);
      }

      // If approved, redirect to home or admin
      const isApproved =
        freshUser.status === 'approved' ||
        (freshUser.isVerified && freshUser.status !== 'reject' && freshUser.status !== 'rejected');

      if (isApproved) {
        setTimeout(() => {
          if (
            freshUser.role === 'super_admin' ||
            freshUser.role === 'executive_admin' ||
            freshUser.role === 'community_admin'
          ) {
            router.push('/admin');
          } else {
            router.push('/');
          }
        }, 1500);
      }
    } catch (err) {
      console.warn('Failed to fetch latest user status on web:', err);
    } finally {
      setLoading(false);
      if (showIndicator) setIsRefreshing(false);
    }
  }, [currentUser?.id, router]);

  // 3. Periodic polling every 12 seconds
  useEffect(() => {
    pollTimerRef.current = setInterval(() => {
      checkStatus(undefined, false);
    }, 12000);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [checkStatus]);

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mfct_is_logged_in');
      localStorage.removeItem('mfct_user_role');
      localStorage.removeItem('role');
      localStorage.removeItem('id');
      localStorage.removeItem('email');
      localStorage.removeItem('name');
      localStorage.removeItem('avatar');
      localStorage.removeItem('community_id');
      localStorage.removeItem('city');
      localStorage.removeItem('login_info');
      localStorage.removeItem('mfct_user_info');
    }
    router.push('/sign-in');
  };

  const handleRegisterAgain = () => {
    handleSignOut();
    router.push('/sign-up');
  };

  // Determine current display state
  const effectiveStatus = currentUser?.status;
  const isApproved =
    !isTerminated &&
    (effectiveStatus === 'approved' ||
      (currentUser?.isVerified && effectiveStatus !== 'reject' && effectiveStatus !== 'rejected'));
  const isRejected = !isTerminated && (effectiveStatus === 'reject' || effectiveStatus === 'rejected');
  const isPending = !isTerminated && !isApproved && !isRejected;

  const rejectionReason =
    currentUser?.rejectionReason ||
    currentUser?.rejection_reason ||
    tr(
      'दस्तावेज़ या विवरण सत्यापन में विसंगति पाई गई।',
      'دستاویزات یا تفصیلات میں نامکمل معلومات پائی گئیں۔',
      'Information or document mismatch during review.'
    );

  const dir = language === 'ur' ? 'rtl' : 'ltr';

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f6f1]" dir={dir}>
      {/* ─── Top Header Navigation ─── */}
      <header className="sticky top-0 z-30 bg-[#0f3322] border-b border-[#f0c868]/20 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-md">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#f0c868]/15 border border-[#f0c868]/40 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-[#f0c868]" />
          </div>
          <div>
            <h1 className="text-white font-black text-sm sm:text-base leading-tight">
              MFCT Portal
            </h1>
            <p className="text-[#f0c868] text-[11px] font-semibold">
              {tr('सदस्यता सत्यापन डेस्क', 'ممبرشپ تصدیقی ڈیسک', 'Membership Verification Desk')}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <LanguageSelector compact mode="admin" />
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{tr('साइन आउट', 'سائن آؤٹ', 'Sign Out')}</span>
          </button>
        </div>
      </header>

      {/* ─── Main Content Container ─── */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 sm:py-12 space-y-6">
        {/* Status Card Banner */}
        {isApproved ? (
          /* Approved Screen */
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-emerald-200 shadow-xl shadow-emerald-900/5 text-center space-y-6 animate-fadeIn">
            <div className="w-20 h-20 rounded-full bg-emerald-100 mx-auto flex items-center justify-center text-emerald-600 shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wide">
              <span>{tr('स्वीकृत / Approved', 'منظور شدہ', 'Approved & Active')}</span>
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                {tr(
                  'मुबारक हो! आपका खाता स्वीकृत हो चुका है',
                  'مبارک ہو! آپ کا اکاؤنٹ منظور ہو چکا ہے',
                  'Congratulations! Your Account is Approved'
                )}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {tr(
                  'अल्हम्दुलिल्लाह, आपका सदस्यता सत्यापन पूरा हो गया है। आपको मुख्य पोर्टल पर भेजा जा रहा है...',
                  'الحمدللہ، آپ کی ممبرشپ کی تصدیق مکمل ہو گئی ہے۔ آپ کو ڈیش بورڈ پر منتقل کیا جا رہا ہے...',
                  'Your membership KYC has been successfully verified. Redirecting you to the portal...'
                )}
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-800 to-emerald-950 text-[#f0c868] shadow-lg shadow-emerald-950/20 hover:scale-[1.02] transition-transform"
              >
                <span>{tr('मुख्य पोर्टल पर जाएं', 'پورٹل پر جائیں', 'Go to Main Portal')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : isTerminated ? (
          /* Terminated Screen */
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-300 shadow-xl shadow-slate-900/5 text-center space-y-6 animate-fadeIn">
            <div className="w-20 h-20 rounded-full bg-rose-100 mx-auto flex items-center justify-center text-rose-600 shadow-inner">
              <XCircle className="w-12 h-12" />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-black uppercase tracking-wide">
              <span>{tr('खाता समाप्त / Terminated', 'اکاؤنٹ ختم کیا گیا', 'Account Terminated')}</span>
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                {tr(
                  'यह सदस्यता खाता समाप्त कर दिया गया है',
                  'یہ ممبرشپ اکاؤنٹ ختم کر دیا گیا ہے',
                  'Membership Account Terminated'
                )}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {tr(
                  'प्रशासन द्वारा इस सदस्यता खाते को समाप्त कर दिया गया है। यदि आप नए सिरे से ट्रस्ट से जुड़ना चाहते हैं, तो आप पुनः पंजीकरण कर सकते हैं।',
                  'انتظامیہ کی طرف سے یہ اکاؤنٹ ختم کر دیا گیا ہے۔ آپ نئی درخواست کے ساتھ دوبارہ رجسٹریشن کر سکتے ہیں۔',
                  'This membership account has been terminated by the administrator. You may submit a fresh registration with valid details.'
                )}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleRegisterAgain}
                className="cursor-pointer inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm bg-[#0f3322] text-[#f0c868] shadow-lg shadow-emerald-950/20 hover:scale-[1.02] transition-transform"
              >
                <UserPlus className="w-4 h-4 text-[#f0c868]" />
                <span>{tr('पुनः नया खाता बनाएं', 'دوبارہ نیا اکاؤنٹ بنائیں', 'Register New Account')}</span>
              </button>
            </div>
          </div>
        ) : isRejected ? (
          /* Rejected Screen */
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-rose-200 shadow-xl shadow-rose-900/5 text-center space-y-6 animate-fadeIn">
            <div className="w-20 h-20 rounded-full bg-rose-100 mx-auto flex items-center justify-center text-rose-600 shadow-inner">
              <AlertTriangle className="w-12 h-12" />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-black uppercase tracking-wide">
              <span>{tr('समीक्षा विफल / सुधार आवश्यक', 'کے وائی سی مسترد', 'Action Required / Rejected')}</span>
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                {tr(
                  'केवाईसी आवेदन में सुधार आवश्यक है',
                  'درخواست میں درستگی درکار ہے',
                  'KYC Application Needs Correction'
                )}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {tr(
                  'आपके दस्तावेज़ों या विवरण में कमी के कारण आवेदन अस्वीकृत किया गया है। कृपया नीचे दिए गए कारण को पढ़कर अपने विवरण में सुधार करें।',
                  'آپ کی تفصیلات میں کچھ نقائص کی وجہ سے درخواست مسترد ہوئی ہے۔ برائے مہربانی نیچے دی گئی وجہ دیکھ کر درستگی کریں۔',
                  'Your application requires corrections before it can be approved. Please review the reason below and update your details.'
                )}
              </p>
            </div>

            {/* Rejection Reason Callout */}
            <div className="max-w-xl mx-auto bg-rose-50 border border-rose-200 rounded-2xl p-4 text-left">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider mb-1">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{tr('अस्वीकृति का कारण / Reason:', 'مسترد ہونے کی وجہ:', 'Rejection Reason:')}</span>
              </div>
              <p className="text-sm font-semibold text-rose-950 pl-6">
                {rejectionReason}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsKycModalOpen(true)}
                className="cursor-pointer w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm bg-[#0f3322] text-[#f0c868] shadow-lg shadow-emerald-950/20 hover:scale-[1.02] transition-transform"
              >
                <Edit3 className="w-4 h-4 text-[#f0c868]" />
                <span>{tr('विवरण सुधारें व पुनः भेजें', 'تفصیلات درست کریں', 'Edit & Resubmit Details')}</span>
              </button>

              <button
                onClick={() => checkStatus(undefined, true)}
                disabled={isRefreshing}
                className="cursor-pointer w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
                <span>{tr('स्थिति पुनः जांचें', 'حیثیت دوبارہ چیک کریں', 'Refresh Status')}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Pending Screen */
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-amber-200 shadow-xl shadow-amber-900/5 text-center space-y-6 animate-fadeIn">
            <div className="w-20 h-20 rounded-full bg-amber-100 mx-auto flex items-center justify-center text-amber-600 shadow-inner relative">
              <Clock className="w-12 h-12 animate-pulse" />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black uppercase tracking-wide">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>{tr('समीक्षाधीन / अंडर रिव्यू', 'زیر جائزہ / عمل جاری ہے', 'Under Review / In Progress')}</span>
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                {tr(
                  'आपका खाता वर्तमान में समीक्षाधीन है',
                  'آپ کا اکاؤنٹ زیر جائزہ ہے',
                  'Your Account is Under Review'
                )}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {tr(
                  'मोहम्मद फईम चैरिटेबल ट्रस्ट (MFCT) में पंजीकरण के लिए धन्यवाद! हमारी प्रशासनिक टीम आपके केवाईसी दस्तावेज़ों और विवरण का सत्यापन कर रही है।',
                  'محمد فہیم چیریٹیبل ٹرسٹ میں رجسٹریشن کا شکریہ! ہماری انتظامی کمیٹی آپ کی تفصیلات اور دستاویزات کی تصدیق کر رہی ہے۔',
                  'Thank you for registering with Mohammad Faeem Charitable Trust (MFCT). Our administrative committee is currently verifying your submitted documents.'
                )}
              </p>
            </div>

            {/* Live Polling Banner */}
            <div className="max-w-md mx-auto bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 text-xs text-amber-900 font-medium">
              <RefreshCw className="w-3.5 h-3.5 text-amber-700 animate-spin" />
              <span>
                {tr(
                  'यह स्क्रीन हर 12 सेकंड में स्थिति को स्वतः अपडेट करती है।',
                  'یہ اسکرین خود بخود ہر 12 سیکنڈ بعد اسٹیٹس چیک کرتی ہے۔',
                  'Auto-refreshing status every 12 seconds.'
                )}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => checkStatus(undefined, true)}
                disabled={isRefreshing}
                className="cursor-pointer w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm bg-[#0f3322] text-[#f0c868] shadow-lg shadow-emerald-950/20 hover:scale-[1.02] transition-transform"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#f0c868]' : ''}`} />
                <span>{tr('अभी स्थिति जांचें', 'ابھی اسٹیٹس چیک کریں', 'Refresh Status Now')}</span>
              </button>

              <button
                onClick={() => setIsKycModalOpen(true)}
                className="cursor-pointer w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 transition-all"
              >
                <Edit3 className="w-4 h-4 text-emerald-800" />
                <span>{tr('जमा किए गए विवरण देखें / सुधारें', 'تفصیلات دیکھیں یا تبدیل کریں', 'View / Edit Submitted Details')}</span>
              </button>
            </div>
          </div>
        )}

        {/* ─── Registered Member Info Card ─── */}
        {currentUser && !isTerminated && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                {tr('पंजीकृत सदस्य जानकारी', 'رجسٹرڈ ممبر معلومات', 'Registered Member Info')}
              </h3>
              <span className="text-[11px] font-semibold text-slate-400">
                {tr('अंतिम जांच', 'آخری جانچ', 'Last checked')}: {lastChecked.toLocaleTimeString()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="block text-xs font-semibold text-slate-400">
                  {tr('नाम', 'نام', 'Name')}
                </span>
                <span className="font-bold text-slate-800">{currentUser.name || 'MFCT Member'}</span>
              </div>

              {currentUser.phone && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="block text-xs font-semibold text-slate-400">
                    {tr('मोबाइल', 'موبائل', 'Phone')}
                  </span>
                  <span className="font-bold text-slate-800">{currentUser.phone}</span>
                </div>
              )}

              {currentUser.email && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="block text-xs font-semibold text-slate-400">
                    {tr('ईमेल', 'ای میل', 'Email')}
                  </span>
                  <span className="font-bold text-slate-800">{currentUser.email}</span>
                </div>
              )}

              {currentUser.membershipId && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="block text-xs font-semibold text-slate-400">
                    {tr('सदस्यता आईडी', 'ممبرشپ نمبر', 'Member ID')}
                  </span>
                  <span className="font-bold text-[#0f3322]">{currentUser.membershipId}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Support & Help Section ─── */}
        <div className="bg-slate-100/70 rounded-2xl p-5 border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <Info className="w-4 h-4 text-emerald-700" />
            <span>{tr('सत्यापन में सहायता चाहिए?', 'تصدیق میں مدد درکار ہے؟', 'Need Assistance with Verification?')}</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {tr(
              'यदि आपका सत्यापन 24 घंटे से अधिक समय से लंबित है, तो कृपया अपनी सदस्यता पर्ची और विवरण के साथ ट्रस्ट प्रशासन से संपर्क करें।',
              'اگر آپ کی تصدیق میں 24 گھنٹے سے زائد وقت لگ رہا ہے تو براہ کرم ٹرسٹ انتظامیہ سے رابطہ کریں۔',
              'If your application is pending review for more than 24 hours, feel free to reach out to the trust helpline.'
            )}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href="tel:+919999999999"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0f3322] bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-700" />
              <span>+91 99999 99999</span>
            </a>
            <a
              href="mailto:info@mfcttrust.com"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0f3322] bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50"
            >
              <Mail className="w-3.5 h-3.5 text-emerald-700" />
              <span>info@mfcttrust.com</span>
            </a>
          </div>
        </div>
      </main>

      {/* KYC Update Modal */}
      {currentUser && (
        <KycUpdateModal
          isOpen={isKycModalOpen}
          onClose={() => setIsKycModalOpen(false)}
          user={currentUser}
          onUpdated={(updated) => {
            setCurrentUser(updated);
            setIsKycModalOpen(false);
            checkStatus(updated.id, true);
          }}
        />
      )}
    </div>
  );
}
