'use client';

import React, { useState, useEffect } from 'react';
import { User, Donation } from '../types';
import { getDonations, getDonationTimestamp } from '../services/donationService';
import { updateUser } from '../services/userService';
import { useLanguage } from '../context/LanguageContext';
import { Calendar, Heart, CheckCircle2, AlertCircle, Clock, Loader2 } from 'lucide-react';

interface MonthlyPaymentToggleProps {
  user: User;
  onOpenDonate?: () => void;
  onUserUpdated?: (updated: User) => void;
  compact?: boolean;
  showSwitch?: boolean;
}

export const MonthlyPaymentToggle: React.FC<MonthlyPaymentToggleProps> = ({
  user,
  onOpenDonate,
  onUserUpdated,
  compact = false,
  showSwitch = true,
}) => {
  const { language } = useLanguage();

  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const getMonthName = (monthIdx: number, lang: string) => {
    const enMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const hiMonths = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितम्बर', 'अक्टूबर', 'नवम्बर', 'दिसम्बर'];
    const urMonths = ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'];
    if (lang === 'hi') return hiMonths[monthIdx];
    if (lang === 'ur') return urMonths[monthIdx];
    return enMonths[monthIdx];
  };

  // Determine initial Yes/No value
  const initialValue = Boolean(
    user.monthlyPayment === 'yes' ||
    user.monthly_payment === 'yes' ||
    user.monthlyPayment === true ||
    user.monthly_payment === true
  );

  const [isMonthly, setIsMonthly] = useState<boolean>(initialValue);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loadingDonations, setLoadingDonations] = useState<boolean>(false);

  useEffect(() => {
    const currentVal = Boolean(
      user.monthlyPayment === 'yes' ||
      user.monthly_payment === 'yes' ||
      user.monthlyPayment === true ||
      user.monthly_payment === true
    );
    setIsMonthly(currentVal);
  }, [user.monthlyPayment, user.monthly_payment]);

  // Load donations
  useEffect(() => {
    let isMounted = true;
    if (user?.id) {
      setLoadingDonations(true);
      getDonations(user.id)
        .then((data) => {
          if (isMounted) setDonations(data || []);
        })
        .catch((err) => {
          console.warn('Error fetching donations for monthly payment check:', err);
        })
        .finally(() => {
          if (isMounted) setLoadingDonations(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUpdating) return;

    const nextVal = !isMonthly;
    const nextStr = nextVal ? 'yes' : 'no';
    setIsMonthly(nextVal);
    setIsUpdating(true);

    try {
      // 1. Update in database
      const updated = await updateUser(user.id, {
        monthlyPayment: nextStr,
        monthly_payment: nextStr,
      });

      // 2. Sync in localStorage
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('mfct_active_user');
          if (stored) {
            const parsed = JSON.parse(stored);
            localStorage.setItem(
              'mfct_active_user',
              JSON.stringify({ ...parsed, monthlyPayment: nextStr, monthly_payment: nextStr })
            );
          }
        } catch {}
      }

      // 3. Notify parent
      onUserUpdated?.({
        ...user,
        ...updated,
        monthlyPayment: nextStr,
        monthly_payment: nextStr,
      });
    } catch (err) {
      console.error('Failed to update monthly payment preference:', err);
      // Revert on failure
      setIsMonthly(!nextVal);
    } finally {
      setIsUpdating(false);
    }
  };

  // Payment date calculation
  const now = new Date();
  const currentMonthIdx = now.getMonth();
  const currentYear = now.getFullYear();

  const lastMonthIdx = currentMonthIdx === 0 ? 11 : currentMonthIdx - 1;
  const lastMonthYear = currentMonthIdx === 0 ? currentYear - 1 : currentYear;

  const currentMonthName = getMonthName(currentMonthIdx, language);
  const lastMonthName = getMonthName(lastMonthIdx, language);

  // Find latest valid donation / payment
  const validDonations = donations.filter((d) => d.status !== 'rejected');
  const latestDonation = validDonations.length > 0 ? validDonations[0] : null;

  let latestPaymentDate: Date | null = null;
  let latestPaymentAmount = 0;

  if (latestDonation) {
    const t = getDonationTimestamp(latestDonation);
    if (t > 0) latestPaymentDate = new Date(t);
    latestPaymentAmount = latestDonation.amountINR || 0;
  } else if (user.monthly_payment_date || user.monthlyPaymentDate) {
    const dStr = (user.monthly_payment_date || user.monthlyPaymentDate) as string;
    const parsed = new Date(dStr);
    if (!isNaN(parsed.getTime())) latestPaymentDate = parsed;
    latestPaymentAmount = user.monthly_payment_amount || user.monthlyPaymentAmount || 0;
  } else if (user.paymentUtr && (user.joinDate || (user as any).created_at)) {
    const parsed = new Date(user.joinDate || (user as any).created_at);
    if (!isNaN(parsed.getTime())) latestPaymentDate = parsed;
    latestPaymentAmount = user.membershipFee || 0;
  }

  const isPaidThisMonth = Boolean(
    latestPaymentDate &&
    latestPaymentDate.getMonth() === currentMonthIdx &&
    latestPaymentDate.getFullYear() === currentYear
  );

  const isPaidLastMonth = Boolean(
    latestPaymentDate &&
    latestPaymentDate.getMonth() === lastMonthIdx &&
    latestPaymentDate.getFullYear() === lastMonthYear
  );

  const formattedPaymentDate = latestPaymentDate
    ? latestPaymentDate.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '';

  // If in sidebar mode (showSwitch = false) and monthly payment is OFF, do not show at all!
  if (!showSwitch && !isMonthly) {
    return null;
  }

  // Show details if showSwitch is false (sidebar mode) OR if isMonthly is true (dropdown mode)
  const shouldShowDetails = !showSwitch || isMonthly;

  return (
    <div
      className="p-2.5 rounded-xl transition-all"
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(200, 168, 75, 0.25)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Calendar className="w-4 h-4 shrink-0" style={{ color: 'var(--mfct-gold)' }} />
          <div className="min-w-0">
            <div className="text-xs font-bold text-white leading-tight truncate">
              {tr('मासिक भुगतान', 'ماہانہ ادائیگی', 'Monthly Payment')}
            </div>
            <div className="text-[10px] text-white/60 leading-tight truncate">
              {showSwitch
                ? tr('नियमित सहयोग', 'باقاعدہ تعاون', 'Regular Support')
                : tr('सहयोग स्थिति विवरण', 'ادائیگی کی حیثیت', 'Contribution Status')}
            </div>
          </div>
        </div>

        {/* Switch Button (only shown in profile dropdown) OR Status Pill (shown in sidebar) */}
        {showSwitch ? (
          <button
            type="button"
            onClick={handleToggle}
            disabled={isUpdating}
            aria-label={tr('मासिक भुगतान टॉगल', 'ماہانہ ادائیگی ٹوگل', 'Toggle monthly payment')}
            className="relative inline-flex items-center h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer shrink-0"
            style={{
              width: '64px',
              background: isMonthly ? '#10b981' : 'rgba(255, 255, 255, 0.2)',
              border: isMonthly ? '1px solid #059669' : '1px solid rgba(255, 255, 255, 0.25)',
            }}
          >
            {/* Label inside toggle */}
            <span
              className="absolute text-[10px] font-black uppercase tracking-wider select-none"
              style={{
                left: isMonthly ? '8px' : 'auto',
                right: isMonthly ? 'auto' : '8px',
                color: isMonthly ? '#ffffff' : 'rgba(255, 255, 255, 0.75)',
              }}
            >
              {isMonthly ? tr('हाँ', 'ہاں', 'YES') : tr('नहीं', 'نہیں', 'NO')}
            </span>

            {/* Toggle Knob */}
            <span
              className="inline-block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out flex items-center justify-center"
              style={{
                transform: isMonthly ? 'translateX(38px)' : 'translateX(0px)',
              }}
            >
              {isUpdating ? (
                <Loader2 className="w-3 h-3 text-slate-700 animate-spin" />
              ) : isMonthly ? (
                <div className="w-2 h-2 rounded-full bg-emerald-600" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-slate-400" />
              )}
            </span>
          </button>
        ) : (
          /* When switch is hidden in sidebar: show status badge */
          <div
            className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide"
            style={
              isPaidThisMonth
                ? { background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', border: '1px solid rgba(16, 185, 129, 0.4)' }
                : { background: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d', border: '1px solid rgba(245, 158, 11, 0.4)' }
            }
          >
            {isPaidThisMonth ? tr('पूर्ण ✓', 'مکمل ✓', 'Paid ✓') : tr('बाकी', 'واجب الادا', 'Due')}
          </div>
        )}
      </div>

      {/* Details Box */}
      {shouldShowDetails && (
        <div
          className="mt-2.5 pt-2 border-t text-left"
          style={{ borderColor: 'rgba(200, 168, 75, 0.2)' }}
        >
          {loadingDonations ? (
            <div className="flex items-center gap-2 py-1 text-[11px] text-white/70">
              <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: 'var(--mfct-gold)' }} />
              <span>{tr('भुगतान स्थिति जांची जा रही है...', 'ادائیگی کی حیثیت کی جانچ...', 'Checking payment status...')}</span>
            </div>
          ) : isPaidThisMonth ? (
            /* PAID THIS MONTH */
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  {tr(
                    `${currentMonthName} माह का भुगतान: पूर्ण ✓`,
                    `${currentMonthName} کی ادائیگی: مکمل ✓`,
                    `${currentMonthName} Payment: Paid ✓`
                  )}
                </span>
              </div>
              <div className="text-[10px] text-emerald-100/90 pl-1">
                <span>{tr('भुगतान तिथि:', 'تاریخ:', 'Paid on:')} </span>
                <span className="font-semibold text-white">{formattedPaymentDate}</span>
                {latestPaymentAmount > 0 && (
                  <span className="ml-1 text-emerald-300 font-bold">
                    (₹{latestPaymentAmount.toLocaleString('en-IN')})
                  </span>
                )}
              </div>
            </div>
          ) : isPaidLastMonth ? (
            /* PAID LAST MONTH -> SHOW DETAILS & INDICATE THIS MONTH IS DUE */
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  {tr(
                    `${currentMonthName} का भुगतान: बाकी है`,
                    `${currentMonthName} کی ادائیگی: باقی ہے`,
                    `${currentMonthName} Payment: Due`
                  )}
                </span>
              </div>

              {/* Details of last month's payment */}
              <div
                className="p-1.5 rounded-lg text-[10px] leading-tight"
                style={{ background: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(200, 168, 75, 0.2)' }}
              >
                <div className="text-white/80">
                  <span className="font-bold text-amber-200">
                    {tr('पिछला भुगतान:', 'پچھلی ادائیگی:', 'Last Payment:')}{' '}
                  </span>
                  <span>{lastMonthName} {lastMonthYear}</span>
                </div>
                <div className="text-white/70 mt-0.5">
                  <span>{tr('तारीख:', 'تاریخ:', 'Date:')} {formattedPaymentDate}</span>
                  {latestPaymentAmount > 0 && (
                    <span className="ml-1 font-bold text-emerald-300">
                      • ₹{latestPaymentAmount.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>

              {/* Pay This Month CTA Button */}
              {onOpenDonate && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDonate();
                  }}
                  className="w-full mt-1 py-1.5 px-2.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all hover:brightness-110 cursor-pointer shadow-sm"
                  style={{
                    background: 'linear-gradient(135deg, var(--mfct-gold) 0%, #e0c068 100%)',
                    color: 'var(--mfct-dark-green)',
                  }}
                >
                  <Heart className="w-3 h-3 fill-current" />
                  <span>
                    {tr(
                      `${currentMonthName} माह का सहयोग करें`,
                      `${currentMonthName} کا تعاون کریں`,
                      `Pay for ${currentMonthName}`
                    )}
                  </span>
                </button>
              )}
            </div>
          ) : (
            /* NO PAYMENT FOUND / OLDER PAYMENT -> THIS MONTH DUE */
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  {tr(
                    `${currentMonthName} का भुगतान: बाकी है`,
                    `${currentMonthName} की ادائیگی: باقی ہے`,
                    `${currentMonthName} Payment: Due`
                  )}
                </span>
              </div>

              {latestPaymentDate && (
                <div className="text-[10px] text-white/70 pl-1">
                  <span>{tr('अंतिम भुगतान:', 'آخری ادائیگی:', 'Last record:')} </span>
                  <span className="font-semibold text-white">{formattedPaymentDate}</span>
                </div>
              )}

              {/* Pay This Month CTA Button */}
              {onOpenDonate && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDonate();
                  }}
                  className="w-full mt-1 py-1.5 px-2.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all hover:brightness-110 cursor-pointer shadow-sm"
                  style={{
                    background: 'linear-gradient(135deg, var(--mfct-gold) 0%, #e0c068 100%)',
                    color: 'var(--mfct-dark-green)',
                  }}
                >
                  <Heart className="w-3 h-3 fill-current" />
                  <span>
                    {tr(
                      `${currentMonthName} माह का सहयोग करें`,
                      `${currentMonthName} کا تعاون کریں`,
                      `Pay for ${currentMonthName}`
                    )}
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
