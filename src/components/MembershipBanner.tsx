import React from 'react';
import { CheckCircle2, UserPlus } from 'lucide-react';
import { useAppState } from '../providers/AppStateProvider';
import { useLanguage } from '../context/LanguageContext';

export const MembershipBanner: React.FC = () => {
  const { handleOpenRegister } = useAppState();
  const { t } = useLanguage();

  return (
    <div className="rounded-2xl p-8 text-white shadow-xl relative overflow-hidden mt-8 mb-4" style={{ background: 'linear-gradient(135deg, var(--mfct-dark-green) 0%, var(--mfct-mid-green) 100%)', border: '1px solid rgba(200,168,75,0.25)' }}>
      {/* Decorative gold circle */}
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-10" style={{ background: 'var(--mfct-gold)' }} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        <div className="lg:col-span-8 space-y-4">
          <span className="px-3 py-1 rounded-full text-xs font-bold border inline-block" style={{ background: 'rgba(200,168,75,0.15)', color: 'var(--mfct-gold)', borderColor: 'rgba(200,168,75,0.3)' }}>
            {t('membership.badge', '₹100 Annual Solidarity Membership')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            {t('membership.title', 'Join Your Local Community Network')}
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed max-w-2xl" style={{ color: 'rgba(200,168,75,0.75)' }}>
            {t('membership.desc', "Become a verified member of your city's community hub. The ₹100 annual fee builds our solidarity emergency fund, gives you a digital ID card, and makes you eligible for priority emergency assistance.")}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
            {[
              t('membership.benefit1', 'Digital Member ID Card'),
              t('membership.benefit2', 'Emergency Aid Eligibility'),
              t('membership.benefit3', 'Verified Aadhaar KYC Badge'),
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: 'var(--mfct-gold)' }} />
                <span className="text-white">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center gap-3">
          <button
            onClick={handleOpenRegister}
            className="mfct-btn-gold w-full sm:w-auto py-3.5 px-6 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> {t('membership.cta', 'Join Now (₹100)')}
          </button>
          <span className="text-[11px] text-center lg:text-right" style={{ color: 'rgba(200,168,75,0.55)' }}>
            {t('membership.instant', 'Digital card generated instantly after registration')}
          </span>
        </div>
      </div>
    </div>
  );
};
