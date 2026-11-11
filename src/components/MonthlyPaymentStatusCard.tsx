'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Donation, FemaleFamilyMember } from '../types';
import { getDonations } from '../services/donationService';
import { getFemaleFamilyMembers } from '../services/memberService';
import { updateUser } from '../services/userService';
import { useLanguage } from '../context/LanguageContext';
import {
  formatBillingMonthLabel,
  formatShortDate,
  getMonthlySummary,
  MonthlyEntityStatus,
} from '../lib/monthlyPaymentUtils';
import { Calendar, CheckCircle2, Clock, AlertCircle, Loader2, ArrowUpRight } from 'lucide-react';

interface MonthlyPaymentStatusCardProps {
  user: User;
  onOpenMonthlyPay?: (preselectedTargetIds?: string[]) => void;
  onViewDetails?: () => void;
}

export const MonthlyPaymentStatusCard: React.FC<MonthlyPaymentStatusCardProps> = ({
  user,
  onOpenMonthlyPay,
  onViewDetails,
}) => {
  const { language } = useLanguage();

  const tr = (hi: string, ur: string, en: string) => {
    if (language === 'hi') return hi;
    if (language === 'ur') return ur;
    return en;
  };

  const [donations, setDonations] = useState<Donation[]>([]);
  const [femaleMembers, setFemaleMembers] = useState<FemaleFamilyMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingToggle, setUpdatingToggle] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      const [donList, famList] = await Promise.all([
        getDonations(user.id, undefined, 200).catch(() => []),
        getFemaleFamilyMembers(user.id).catch(() => []),
      ]);
      setDonations(donList || []);
      setFemaleMembers(famList || []);
    } catch (err) {
      console.warn('Error loading monthly payment status:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [loadData]);

  useEffect(() => {
    const handleRefresh = () => {
      loadData();
    };
    window.addEventListener('mfct:donations-updated', handleRefresh);
    window.addEventListener('mfct:female-members-updated', handleRefresh);
    window.addEventListener('mfct:user-updated', handleRefresh);
    return () => {
      window.removeEventListener('mfct:donations-updated', handleRefresh);
      window.removeEventListener('mfct:female-members-updated', handleRefresh);
      window.removeEventListener('mfct:user-updated', handleRefresh);
    };
  }, [loadData]);

  const summary = useMemo(
    () => getMonthlySummary(user, femaleMembers, donations),
    [user, femaleMembers, donations]
  );

  const optedInFemaleStatuses = useMemo(
    () => summary.femaleStatuses.filter((fs) => fs.isOptedIn),
    [summary.femaleStatuses]
  );

  const monthLabel = formatBillingMonthLabel(summary.currentMonthKey, language);

  const handleTogglePrimaryMonthly = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id || updatingToggle) return;
    const nextVal: 'yes' | 'no' = summary.primary.isOptedIn ? 'no' : 'yes';
    setUpdatingToggle(true);
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
      console.warn('Failed to toggle monthly payment:', err);
    } finally {
      setUpdatingToggle(false);
    }
  };

  const renderStatusPill = (status: MonthlyEntityStatus) => {
    if (status === 'not_opted_in') {
      return (
        <span
          className="px-1.5 py-0.5 rounded-full text-[9px] font-bold inline-flex items-center gap-1 shrink-0"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            color: 'rgba(255, 255, 255, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
          }}
        >
          <span>{tr('बंद (नहीं)', 'بند (نہیں)', 'Off (No)')}</span>
        </span>
      );
    }
    if (status === 'paid') {
      return (
        <span
          className="px-1.5 py-0.5 rounded-full text-[9px] font-bold inline-flex items-center gap-1 shrink-0"
          style={{
            background: 'rgba(16, 185, 129, 0.2)',
            color: '#6ee7b7',
            border: '1px solid rgba(16, 185, 129, 0.4)',
          }}
        >
          <CheckCircle2 className="w-2.5 h-2.5" />
          <span>{tr('पूर्ण ✓', 'مکمل ✓', 'Paid ✓')}</span>
        </span>
      );
    }
    if (status === 'pending_verification') {
      return (
        <span
          className="px-1.5 py-0.5 rounded-full text-[9px] font-bold inline-flex items-center gap-1 shrink-0"
          style={{
            background: 'rgba(56, 189, 248, 0.18)',
            color: '#7dd3fc',
            border: '1px solid rgba(56, 189, 248, 0.35)',
          }}
        >
          <Clock className="w-2.5 h-2.5" />
          <span>{tr('सत्यापन शेष', 'زیر تصدیق', 'Pending')}</span>
        </span>
      );
    }
    if (status === 'kyc_pending') {
      return (
        <span
          className="px-1.5 py-0.5 rounded-full text-[9px] font-bold inline-flex items-center gap-1 shrink-0"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            color: 'rgba(255, 255, 255, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
          }}
        >
          <span>{tr('KYC लंबित', 'کے وائی سی باقی', 'KYC Pending')}</span>
        </span>
      );
    }
    if (status === 'rejected') {
      return (
        <span
          className="px-1.5 py-0.5 rounded-full text-[9px] font-bold inline-flex items-center gap-1 shrink-0"
          style={{
            background: 'rgba(244, 63, 94, 0.18)',
            color: '#fda4af',
            border: '1px solid rgba(244, 63, 94, 0.35)',
          }}
        >
          <span>{tr('अस्वीकृत', 'مسترد', 'Rejected')}</span>
        </span>
      );
    }
    return (
      <span
        className="px-1.5 py-0.5 rounded-full text-[9px] font-bold inline-flex items-center gap-1 shrink-0"
        style={{
          background: 'rgba(245, 158, 11, 0.2)',
          color: '#fcd34d',
          border: '1px solid rgba(245, 158, 11, 0.4)',
        }}
      >
        <AlertCircle className="w-2.5 h-2.5" />
        <span>{tr('बाकी', 'واجب الادا', 'Due')}</span>
      </span>
    );
  };

  const overallBadgeStyle =
    summary.totalEligibleCount === 0
      ? {
          background: 'rgba(255, 255, 255, 0.08)',
          color: 'rgba(255, 255, 255, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
        }
      : summary.totalDueCount === 0 && summary.totalPendingCount === 0
        ? {
            background: 'rgba(16, 185, 129, 0.2)',
            color: '#6ee7b7',
            border: '1px solid rgba(16, 185, 129, 0.4)',
          }
        : summary.totalDueCount === 0
          ? {
              background: 'rgba(56, 189, 248, 0.18)',
              color: '#7dd3fc',
              border: '1px solid rgba(56, 189, 248, 0.35)',
            }
          : {
              background: 'rgba(245, 158, 11, 0.2)',
              color: '#fcd34d',
              border: '1px solid rgba(245, 158, 11, 0.4)',
            };

  const overallBadgeText =
    summary.totalEligibleCount === 0
      ? tr('बंद (No)', 'بند (No)', 'Off (No)')
      : summary.totalDueCount === 0 && summary.totalPendingCount === 0
        ? tr('पूर्ण ✓', 'مکمل ✓', `${summary.totalPaidCount}/${summary.totalEligibleCount} Paid`)
        : summary.totalDueCount === 0
          ? tr('सत्यापन शेष', 'زیر تصدیق', 'Pending')
          : `${summary.totalPaidCount}/${summary.totalEligibleCount} ${tr('पूर्ण', 'مکمل', 'Paid')}`;

  return (
    <div
      className="p-2.5 rounded-xl transition-all space-y-2"
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(200, 168, 75, 0.25)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Calendar className="w-4 h-4 shrink-0" style={{ color: 'var(--mfct-gold)' }} />
          <div className="min-w-0">
            <div className="text-xs font-bold text-white leading-tight truncate">
              {tr('मासिक शुल्क', 'ماہانہ فیس', 'Monthly Fee')}
            </div>
            <div className="text-[10px] text-white/60 leading-tight truncate">{monthLabel}</div>
          </div>
        </div>

        <span
          className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide shrink-0"
          style={overallBadgeStyle}
        >
          {overallBadgeText}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-1.5 text-[11px] text-white/70 border-t border-[rgba(200,168,75,0.2)] pt-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: 'var(--mfct-gold)' }} />
          <span>{tr('स्थिति जांची जा रही है...', 'حیثیت کی جانچ...', 'Checking status...')}</span>
        </div>
      ) : (
        <div className="space-y-1.5 border-t border-[rgba(200,168,75,0.2)] pt-2">
          {/* Primary User Toggle + Compact Status Row */}
          <div className="px-2 py-1.5 rounded-lg bg-black/25 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-white truncate">
                  {tr('मुख्य सदस्य (स्वयं)', 'بنیادی رکن (خود)', 'Primary (Self)')}
                </div>
                {summary.primary.isOptedIn && summary.primary.latestDate && (
                  <div className="text-[9px] text-white/60 truncate">
                    {formatShortDate(summary.primary.latestDate, language)}
                    {summary.primary.latestAmount > 0 ? ` • ₹${summary.primary.latestAmount}` : ''}
                  </div>
                )}
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={summary.primary.isOptedIn}
                disabled={updatingToggle}
                onClick={handleTogglePrimaryMonthly}
                title={tr('मासिक शुल्क चालू/बंद करें', 'ماہانہ فیس آن/آف کریں', 'Toggle monthly fee')}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors disabled:opacity-50 ${
                  summary.primary.isOptedIn ? 'bg-emerald-500' : 'bg-white/20'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
                    summary.primary.isOptedIn ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            {summary.primary.isOptedIn && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-[9px] text-white/55">₹100/mo</span>
                <div className="flex items-center gap-1.5">
                  {renderStatusPill(summary.primary.status)}
                  {summary.primary.status === 'due' && onOpenMonthlyPay && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenMonthlyPay(['primary']);
                      }}
                      className="px-2 py-0.5 rounded-full text-[9px] font-extrabold cursor-pointer transition-all hover:brightness-110"
                      style={{
                        background: 'var(--mfct-gold)',
                        color: 'var(--mfct-dark-green)',
                      }}
                    >
                      {tr('₹100 दें', '₹100 دیں', 'Pay ₹100')}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Female Members Compact Rows (ONLY opted-in 'yes' members, separate Pay ₹50 each) */}
          {optedInFemaleStatuses.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between px-1 text-[9px] font-bold uppercase tracking-wider text-amber-200/75">
                <span>{tr('महिला सदस्य', 'خواتین اراکین', 'Female Members')}</span>
                <span>
                  {summary.femalePaidCount}/{summary.femaleApprovedCount} {tr('पूर्ण', 'مکمل', 'Paid')}
                </span>
              </div>

              {optedInFemaleStatuses.map(({ member, status, latestDate, latestAmount }) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg bg-black/20"
                >
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold text-white/90 truncate">
                      {member.name}{' '}
                      <span className="text-white/50 text-[9px]">({member.relation})</span>
                    </div>
                    {latestDate && status !== 'kyc_pending' && (
                      <div className="text-[9px] text-white/55 truncate">
                        {formatShortDate(latestDate, language)}
                        {latestAmount > 0 ? ` • ₹${latestAmount}` : ''}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {renderStatusPill(status)}
                    {status === 'due' && onOpenMonthlyPay && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenMonthlyPay([member.id]);
                        }}
                        className="px-2 py-0.5 rounded-full text-[9px] font-extrabold cursor-pointer transition-all hover:brightness-110"
                        style={{
                          background: 'var(--mfct-gold)',
                          color: 'var(--mfct-dark-green)',
                        }}
                      >
                        {tr('₹50 दें', '₹50 دیں', 'Pay ₹50')}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Links (each member paid separately above) */}
          {onViewDetails && (
            <div className="space-y-1 pt-0.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails();
                }}
                className="w-full py-1 px-2 rounded-lg text-[10px] font-semibold text-amber-200/85 hover:text-amber-100 hover:bg-white/5 flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <span>{tr('पूरा विवरण देखें', 'مکمل تفصیل دیکھیں', 'View All Details')}</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
