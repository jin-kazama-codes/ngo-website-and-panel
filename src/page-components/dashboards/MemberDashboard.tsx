'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Donation, FemaleFamilyMember } from '../../types';
import { getDonations } from '../../services/donationService';
import { getFemaleFamilyMembers } from '../../services/memberService';
import { updateUser } from '../../services/userService';
import {
  ShieldCheck,
  Heart,
  Download,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  ArrowUpRight,
} from 'lucide-react';
import { downloadRegistrationPaymentSlip } from '../../lib/registrationPaymentSlip';
import { useLanguage } from '../../context/LanguageContext';
import { translateCommunityName, translateCity } from '../../lib/translateEntity';
import {
  FEMALE_MONTHLY_FEE_INR,
  PRIMARY_MONTHLY_FEE_INR,
  formatBillingMonthLabel,
  formatShortDate,
  getMonthlySummary,
  MonthlyEntityStatus,
} from '../../lib/monthlyPaymentUtils';

interface MemberDashboardProps {
  user: User;
  onOpenDonate: () => void;
  onOpenMonthlyPay?: (preselectedTargetIds?: string[]) => void;
  onNavigateTab?: (tab: string) => void;
  onOpenMembershipCard: () => void;
  onSelectDonationReceipt: (donation: Donation) => void;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({
  user,
  onOpenDonate,
  onOpenMonthlyPay,
  onNavigateTab,
  onOpenMembershipCard,
  onSelectDonationReceipt,
}) => {
  const { language } = useLanguage();
  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const [userDonations, setUserDonations] = useState<Donation[]>([]);
  const [femaleMembers, setFemaleMembers] = useState<FemaleFamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingMonthly, setUpdatingMonthly] = useState(false);

  const loadMemberData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      const [dons, fams] = await Promise.all([
        getDonations(user.id, undefined, 200).catch(() => []),
        getFemaleFamilyMembers(user.id).catch(() => []),
      ]);
      setUserDonations(dons || []);
      setFemaleMembers(fams || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    setLoading(true);
    loadMemberData();
  }, [loadMemberData]);

  useEffect(() => {
    const handleRefresh = () => {
      loadMemberData();
    };
    window.addEventListener('mfct:donations-updated', handleRefresh);
    window.addEventListener('mfct:female-members-updated', handleRefresh);
    window.addEventListener('mfct:user-updated', handleRefresh);
    return () => {
      window.removeEventListener('mfct:donations-updated', handleRefresh);
      window.removeEventListener('mfct:female-members-updated', handleRefresh);
      window.removeEventListener('mfct:user-updated', handleRefresh);
    };
  }, [loadMemberData]);

  const monthlySummary = useMemo(
    () => getMonthlySummary(user, femaleMembers, userDonations),
    [user, femaleMembers, userDonations]
  );

  const optedInFemaleStatuses = useMemo(
    () => monthlySummary.femaleStatuses.filter((fs) => fs.isOptedIn),
    [monthlySummary.femaleStatuses]
  );

  const handleTogglePrimaryMonthly = async () => {
    if (!user?.id || updatingMonthly) return;
    const nextVal: 'yes' | 'no' = monthlySummary.primary.isOptedIn ? 'no' : 'yes';
    setUpdatingMonthly(true);
    try {
      await updateUser(user.id, {
        monthlyPayment: nextVal,
        monthly_payment: nextVal,
      });
      window.dispatchEvent(
        new CustomEvent('mfct:user-updated', {
          detail: { id: user.id, monthlyPayment: nextVal, monthly_payment: nextVal },
        })
      );
      window.dispatchEvent(new CustomEvent('mfct:donations-updated'));
    } catch (err) {
      console.error('Failed to update monthly fee setting:', err);
    } finally {
      setUpdatingMonthly(false);
    }
  };

  const renderMonthlyBadge = (status: MonthlyEntityStatus) => {
    if (status === 'not_opted_in') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          <span>{tr('बंद (नहीं)', 'بند (نہیں)', 'Off (No)')}</span>
        </span>
      );
    }
    if (status === 'paid') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-3 h-3" />
          <span>{tr('भुगतान पूर्ण ✓', 'ادائیگی مکمل ✓', 'Paid ✓')}</span>
        </span>
      );
    }
    if (status === 'pending_verification') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
          <Clock className="w-3 h-3" />
          <span>{tr('सत्यापन प्रक्रियाधीन', 'تصدیق زیر التواء', 'Pending Verification')}</span>
        </span>
      );
    }
    if (status === 'kyc_pending') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          <Clock className="w-3 h-3" />
          <span>{tr('KYC लंबित', 'کے وائی سی باقی', 'Awaiting KYC Approval')}</span>
        </span>
      );
    }
    if (status === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          <span>{tr('अस्वीकृत', 'مسترد', 'Rejected')}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
        <AlertCircle className="w-3 h-3" />
        <span>{tr('भुगतान बाकी', 'ادائیگی واجب الادا', 'Payment Due')}</span>
      </span>
    );
  };

  const totalDonatedAmount = userDonations.reduce((sum, donation) => sum + donation.amountINR, 0);
  const totalDonationsCount = userDonations.length;

  const displayCommunity = translateCommunityName(user.communityName || '', language);
  const displayCity = translateCity(user.city || '', language);


  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Welcome Banner */}
      <div
        className="rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--mfct-dark-green) 0%, #0c2016 100%)',
          border: '1px solid rgba(200,168,75,0.3)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(200,168,75,0.15)' }} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
              style={{
                background: 'rgba(200,168,75,0.15)',
                color: 'var(--mfct-gold)',
                border: '1px solid rgba(200,168,75,0.3)',
              }}
            >
              <ShieldCheck className="w-4 h-4" style={{ color: 'var(--mfct-gold)' }} /> {tr('सक्रिय सत्यापित समुदाय सदस्य', 'فعال تصدیق شدہ کمیونٹی ممبر', 'Active Verified Community Member')}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {tr('वापसी पर स्वागत है', 'خوش آمدید', 'Welcome back')}, {user.name}!
            </h1>
            <p className="text-xs sm:text-sm flex items-center gap-2" style={{ color: 'rgba(200,168,75,0.85)' }}>
              <Building2 className="w-4 h-4 shrink-0" style={{ color: 'var(--mfct-gold)' }} />
              <span>{displayCommunity || user.communityName}{displayCity ? ` • ${displayCity}` : user.city ? ` • ${user.city}` : ''}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={onOpenDonate}
              className="mfct-btn-gold py-3 px-5 rounded-2xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
            >
              <Heart className="w-4 h-4 fill-current" /> {tr('दान करें', 'عطیہ دیں', 'Donate Now')}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all overflow-hidden">
          <span className="text-xs font-bold uppercase tracking-wider block truncate text-slate-500 dark:text-slate-400">
            {tr('कुल दान', 'کل عطیات', 'Total Donated')}
          </span>
          <p className="text-2xl font-extrabold mt-1 truncate text-emerald-600 dark:text-emerald-400">₹ {totalDonatedAmount.toLocaleString('en-IN')}</p>
          <span className="text-[11px] font-semibold mt-1 block truncate text-amber-600 dark:text-amber-400">
            {tr('100% कर मुक्त (80G)', '100٪ ٹیکس سے مستثنیٰ (80G)', '100% Tax Exempt (80G)')}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all overflow-hidden">
          <span className="text-xs font-bold uppercase tracking-wider block truncate text-slate-500 dark:text-slate-400">
            {tr('किए गए योगदान', 'کیے گئے تعاون', 'Contributions Made')}
          </span>
          <p className="text-2xl font-extrabold mt-1 truncate text-slate-900 dark:text-white">
            {totalDonationsCount} {totalDonationsCount === 1 ? tr('दान', 'عطیہ', 'Donation') : tr('दान', 'عطیات', 'Donations')}
          </p>
          <span className="text-[11px] font-semibold mt-1 block truncate text-slate-500 dark:text-slate-400">
            {tr('सत्यापित कार्यों में', 'تصدیق شدہ مقاصد में', 'Across Verified Causes')}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all overflow-hidden">
          <span className="text-xs font-bold uppercase tracking-wider block truncate text-slate-500 dark:text-slate-400">
            {tr('सदस्य आईडी', 'ممبر آئی ڈی', 'Member ID')}
          </span>
          <p className="text-base font-mono font-bold mt-1.5 truncate text-emerald-600 dark:text-emerald-400">{user.membershipId}</p>
          <span className="text-[11px] mt-1 block truncate text-slate-500 dark:text-slate-400">
            {tr('शामिल हुए:', 'شمولیت:', 'Joined:')} {user.joinDate}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all overflow-hidden">
          <span className="text-xs font-bold uppercase tracking-wider block truncate text-slate-500 dark:text-slate-400">
            {tr('समुदाय स्थिति', 'کمیونٹی کی حیثیت', 'Community Status')}
          </span>
          <p className="text-sm font-bold mt-1.5 flex items-center gap-1.5 truncate text-slate-900 dark:text-white">
            {user.religion === 'Muslim' ? (
              user.isMalikENisab
                ? tr('मुस्लिम • साहिब-ए-निसब', 'مسلم • صاحبِ نصاب', 'Muslim • Sahib-e-Nisab')
                : `${tr('मुस्लिम', 'مسلم', 'Muslim')} • ${user.helpType || tr('सहायता', 'امداد', 'Aid')} ${tr('पात्र', 'اہل', 'Eligible')}`
            ) : user.religion ? (
              `${user.religion} ${tr('सदस्य', 'ممبر', 'Member')}`
            ) : (
              tr('सत्यापित सदस्य', 'تصدیق شدہ ممبر', 'Verified Member')
            )}
          </p>
          <span className="text-[11px] mt-1 block truncate text-slate-500 dark:text-slate-400">
            {user.religion === 'Muslim' && !user.isMalikENisab && user.helpDetails
              ? user.helpDetails
              : `${displayCity || user.city || tr('सत्यापित', 'تصدیق شدہ', 'Verified')} ${tr('शाखा', 'شاخ', 'Chapter')}`}
          </span>
        </div>
      </div>

      {/* Monthly Fee Overview: Primary Member & Female Family Members */}
      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(200,168,75,0.15)', border: '1px solid rgba(200,168,75,0.35)' }}
            >
              <Calendar className="w-5 h-5" style={{ color: 'var(--mfct-gold-dark)' }} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  {tr('मासिक शुल्क एवं महिला परिवार विवरण', 'ماہانہ فیس اور خواتین اراکین کی تفصیلات', 'Monthly Fee & Family Payment Status')}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {formatBillingMonthLabel(monthlySummary.currentMonthKey, language)}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {monthlySummary.totalEligibleCount === 0
                  ? tr(
                      'मासिक शुल्क वर्तमान में बंद (नहीं) है — नीचे टॉगल से चालू करें',
                      'ماہانہ فیس فی الحال بند (نہیں) ہے — نیچے ٹوگل سے آن کریں',
                      'Monthly fee is currently disabled (No) — enable via toggle below if desired'
                    )
                  : tr(
                      `सक्रिय सदस्यता स्थिति: ${monthlySummary.totalPaidCount}/${monthlySummary.totalEligibleCount} पूर्ण`,
                      `موجودہ حیثیت: ${monthlySummary.totalPaidCount}/${monthlySummary.totalEligibleCount} مکمل`,
                      `Current month status: ${monthlySummary.totalPaidCount} of ${monthlySummary.totalEligibleCount} active members paid`
                    )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('female_family_members')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-pink-600" />
                <span>{tr('महिला सदस्य प्रबंधन', 'خواتین اراکین', 'Female Members')}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Primary Member Monthly Card */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex flex-col justify-between gap-3">
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                    {tr('मुख्य सदस्य (स्वयं)', 'بنیادی رکن (خود)', 'Primary Member (Self)')}
                  </span>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">
                    {user.name}
                  </h3>
                  {user.membershipId && (
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      {user.membershipId}
                    </span>
                  )}
                </div>
                {renderMonthlyBadge(monthlySummary.primary.status)}
              </div>

              {/* Primary Opt-In Toggle */}
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {tr('मासिक शुल्क (₹100/माह)', 'ماہانہ فیس (₹100/ماہ)', 'Monthly Fee (₹100/mo)')}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={monthlySummary.primary.isOptedIn}
                  disabled={updatingMonthly}
                  onClick={handleTogglePrimaryMonthly}
                  className="inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span className={`text-[11px] font-extrabold ${monthlySummary.primary.isOptedIn ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'}`}>
                    {monthlySummary.primary.isOptedIn ? tr('हाँ', 'ہاں', 'Yes') : tr('नहीं', 'نہیں', 'No')}
                  </span>
                  <span
                    className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${
                      monthlySummary.primary.isOptedIn ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
                        monthlySummary.primary.isOptedIn ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </span>
                </button>
              </div>

              {monthlySummary.primary.isOptedIn ? (
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between">
                    <span>{tr('मासिक शुल्क:', 'ماہانہ فیس:', 'Monthly Fee:')}</span>
                    <span className="font-bold text-slate-900 dark:text-white">₹{PRIMARY_MONTHLY_FEE_INR}</span>
                  </div>
                  {monthlySummary.primary.latestDate ? (
                    <>
                      <div className="flex justify-between">
                        <span>{tr('अंतिम भुगतान:', 'آخری ادائیگی:', 'Last Record:')}</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {formatShortDate(monthlySummary.primary.latestDate, language)}
                          {monthlySummary.primary.latestAmount > 0
                            ? ` (₹${monthlySummary.primary.latestAmount})`
                            : ''}
                        </span>
                      </div>
                      {monthlySummary.primary.latestUtr && (
                        <div className="flex justify-between">
                          <span>UTR:</span>
                          <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                            {monthlySummary.primary.latestUtr}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-[11px] text-slate-400 italic">
                      {tr('इस माह का कोई मासिक शुल्क रिकॉर्ड नहीं मिला', 'اس ماہ کا کوئی ریکارڈ نہیں ملا', 'No monthly fee record found yet')}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  {tr(
                    'मुख्य सदस्य का मासिक शुल्क बंद (नहीं) है। भुगतान शुरू करने के लिए ऊपर दिया टॉगल चालू करें।',
                    'بنیادی رکن کی ماہانہ فیس بند (نہیں) ہے۔ ادائیگی کے لیے اوپر ٹوگل آن کریں۔',
                    'Primary monthly fee is disabled (No). Turn the toggle ON above to enable monthly tracking.'
                  )}
                </div>
              )}
            </div>

            {monthlySummary.primary.isOptedIn && monthlySummary.primary.status === 'due' && (
              <button
                type="button"
                onClick={() =>
                  onOpenMonthlyPay ? onOpenMonthlyPay(['primary']) : onOpenDonate()
                }
                className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Heart className="w-3.5 h-3.5" />
                <span>{tr(`मासिक शुल्क जमा करें (₹${PRIMARY_MONTHLY_FEE_INR})`, `فیس ادا کریں (₹${PRIMARY_MONTHLY_FEE_INR})`, `Pay ₹${PRIMARY_MONTHLY_FEE_INR} Now`)}</span>
              </button>
            )}
          </div>

          {/* Female Family Members Monthly Cards (ONLY opted-in 'yes' female members) */}
          {optedInFemaleStatuses.length > 0 ? (
            optedInFemaleStatuses.map(({ member, status, latestDate, latestAmount, latestUtr }) => (
              <div
                key={member.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex flex-col justify-between gap-3"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {member.photo_url ? (
                        <img
                          src={member.photo_url}
                          alt={member.name}
                          className="w-9 h-9 rounded-xl object-cover border border-pink-200 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 flex items-center justify-center font-bold text-sm shrink-0">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-pink-700 dark:text-pink-400 block">
                          {tr('महिला सदस्य', 'خاتون رکن', 'Female Member')} • {member.relation}
                        </span>
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                          {member.name}
                        </h3>
                      </div>
                    </div>
                    {renderMonthlyBadge(status)}
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between">
                      <span>{tr('मासिक शुल्क:', 'ماہانہ فیس:', 'Monthly Fee:')}</span>
                      <span className="font-bold text-slate-900 dark:text-white">₹{FEMALE_MONTHLY_FEE_INR}</span>
                    </div>
                    {status === 'kyc_pending' ? (
                      <div className="text-[11px] text-amber-600 dark:text-amber-400">
                        {tr('पंजीकरण सत्यापन के बाद मासिक शुल्क शुरू होगा', 'تصدیق کے بعد ماہانہ فیس شروع ہوگی', 'Monthly fee activates after KYC approval')}
                      </div>
                    ) : latestDate ? (
                      <>
                        <div className="flex justify-between">
                          <span>{tr('अंतिम भुगतान:', 'آخری ادائیگی:', 'Last Record:')}</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {formatShortDate(latestDate, language)}
                            {latestAmount > 0 ? ` (₹${latestAmount})` : ''}
                          </span>
                        </div>
                        {latestUtr && (
                          <div className="flex justify-between">
                            <span>UTR:</span>
                            <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                              {latestUtr}
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-[11px] text-slate-400 italic">
                        {tr('इस माह का कोई मासिक भुगतान दर्ज नहीं है', 'اس ماہ کی کوئی ادائیگی درج نہیں', 'No monthly fee recorded yet')}
                      </div>
                    )}
                  </div>
                </div>

                {status === 'due' && (
                  <button
                    type="button"
                    onClick={() =>
                      onOpenMonthlyPay ? onOpenMonthlyPay([member.id]) : onOpenDonate()
                    }
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-pink-600 hover:bg-pink-700 text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Heart className="w-3.5 h-3.5" />
                    <span>{tr(`शुल्क जमा करें (₹${FEMALE_MONTHLY_FEE_INR})`, `فیس ادا کریں (₹${FEMALE_MONTHLY_FEE_INR})`, `Pay ₹${FEMALE_MONTHLY_FEE_INR} Now`)}</span>
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/30 flex flex-col justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400 block">
                  {tr('महिला पारिवारिक सदस्य', 'خواتین خاندانی ارکان', 'Female Family Members')}
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {monthlySummary.femaleTotalCount > 0
                    ? tr(
                        `${monthlySummary.femaleTotalCount} महिला सदस्य दर्ज हैं, परंतु मासिक शुल्क वर्तमान में बंद (नहीं) है।`,
                        `${monthlySummary.femaleTotalCount} خواتین اراکین درج ہیں، لیکن ماہانہ فیس بند (نہیں) ہے۔`,
                        `${monthlySummary.femaleTotalCount} female member(s) registered with Monthly Fee set to No.`
                      )
                    : tr(
                        'अभी तक कोई महिला सदस्य (बेटी/बहन) नहीं जोड़ी गई है।',
                        'ابھی تک کوئی خاتون رکن شامل نہیں کی گئی۔',
                        'No female family members (Daughter/Sister) enrolled yet.'
                      )}
                </p>
              </div>
              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('female_family_members')}
                  className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800 hover:bg-pink-100 transition-colors cursor-pointer"
                >
                  {tr('+ महिला सदस्य जोड़ें', '+ خاتون رکن شامل کریں', '+ Enroll Female Member')}
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {user.status === 'approved' && user.paymentUtr && (
        <section className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm dark:border-emerald-900 dark:bg-slate-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {tr('पंजीकरण भुगतान रसीद', 'رجسٹریشن ادائیگی سلپ', 'Registration Payment Slip')}
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {tr(
                  'आपका ₹100 सदस्यता पंजीकरण भुगतान दर्ज कर लिया गया है।',
                  'آپ کی ₹100 ممبرشپ رجسٹریشن کی ادائیگی درج کر لی گئی ہے۔',
                  'Your ₹100 membership registration payment has been recorded.'
                )}
              </p>
              <p className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">
                {tr('यूटीआर', 'یو ٹی آر', 'UTR')}: {user.paymentUtr}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                try {
                  downloadRegistrationPaymentSlip(user);
                } catch (error) {
                  console.error('Failed to create registration payment slip:', error);
                  window.alert(
                    error instanceof Error
                      ? error.message
                      : tr('भुगतान रसीद बनाने में असमर्थ।', 'ادائیگی سلپ بنانے میں ناکام۔', 'Could not create the payment slip.')
                  );
                }
              }}
              className="mfct-btn-gold inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold"
            >
              <Download className="h-4 w-4" />
              {tr('भुगतान रसीद डाउनलोड करें', 'ادائیگی سلپ ڈاؤن لوڈ کریں', 'Download Payment Slip')}
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
