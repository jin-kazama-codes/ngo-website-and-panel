'use client';

import React from 'react';
import { CheckCircle2, UserPlus } from 'lucide-react';
import { useAppState } from '../providers/AppStateProvider';
import { useLanguage } from '../context/LanguageContext';

export const MembershipBanner: React.FC = () => {
  const { handleOpenRegister } = useAppState();
  const { t } = useLanguage();

  return (
    <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 rounded-2xl p-8 text-white shadow-xl border border-emerald-800/40 relative overflow-hidden mt-8 mb-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        <div className="lg:col-span-8 space-y-4">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 inline-block">
            {t('membership.badge', '₹50 Annual Solidarity Membership')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            {t('membership.title', 'Join Your Local Community Network')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            {t('membership.desc', 'Become a verified member of your city\'s community hub. The ₹50 annual fee builds our solidarity emergency fund, gives you a digital ID card, and makes you eligible for priority emergency assistance.')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t('membership.benefit1', 'Digital Member ID Card')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t('membership.benefit2', 'Emergency Aid Eligibility')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t('membership.benefit3', 'Verified Aadhaar KYC Badge')}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center gap-3">
          <button
            onClick={handleOpenRegister}
            className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> {t('membership.cta', 'Join Now (₹50)')}
          </button>
          <span className="text-[11px] text-slate-400 text-center lg:text-right">
            {t('membership.instant', 'Digital card generated instantly after registration')}
          </span>
        </div>
      </div>
    </div>
  );
};
