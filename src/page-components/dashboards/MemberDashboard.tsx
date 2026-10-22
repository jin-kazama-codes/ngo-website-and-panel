'use client';

import React, { useState, useEffect } from 'react';
import { User, Donation } from '../../types';
import { getDonations } from '../../services/donationService';
import { ShieldCheck, Heart, Download, Building2 } from 'lucide-react';
import { downloadRegistrationPaymentSlip } from '../../lib/registrationPaymentSlip';
import { useLanguage } from '../../context/LanguageContext';
import { translateCommunityName, translateCity } from '../../lib/translateEntity';

interface MemberDashboardProps {
  user: User;
  onOpenDonate: () => void;
  onOpenMembershipCard: () => void;
  onSelectDonationReceipt: (donation: Donation) => void;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({
  user,
  onOpenDonate,
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDonations(user.id)
      .then(setUserDonations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user.id]);

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
