'use client';

import React from 'react';
import { CheckCircle2, UserPlus } from 'lucide-react';
import { useAppState } from '../providers/AppStateProvider';
import { useLanguage } from '../context/LanguageContext';

export const MembershipBanner: React.FC = () => {
  const { handleOpenRegister } = useAppState();
  const { isHindi } = useLanguage();

  return (
    <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 rounded-2xl p-8 text-white shadow-xl border border-emerald-800/40 relative overflow-hidden mt-8 mb-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        <div className="lg:col-span-8 space-y-4">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 inline-block">
            {isHindi ? '₹50 वार्षिक एकजुटता सदस्यता' : '₹50 سالانہ یکجہتی ممبرشپ'}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            {isHindi ? 'अपने स्थानीय समुदाय नेटवर्क से जुड़ें' : 'اپنے مقامی محلے کے نیٹ ورک سے جڑیں'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            {isHindi
              ? 'अपने शहर के स्थानीय समुदाय हब के सत्यापित सदस्य बनें। ₹50 वार्षिक सदस्यता शुल्क हमारे एकजुटता आपातकालीन कोष का निर्माण करता है, आपको डिजिटल आईडी कार्ड प्रदान करता है, और प्राथमिकता आपातकालीन सहायता के योग्य बनाता है।'
              : 'اپنے شہر کے فلاحی کمیونٹی ہب کے تصدیق شدہ ممبر بنیں۔ ₹50 سالانہ فیس ہنگامی امدادی فنڈ بناتی ہے، ڈیجیٹل شناختی کارڈ دیتی ہے اور ہنگامی امداد کے اہل بناتی ہے۔'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{isHindi ? 'डिजिटल सदस्य आईडी कार्ड' : 'ڈیجیٹل ممبر شناختی کارڈ'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{isHindi ? 'आपातकालीन सहायता पात्रता' : 'ہنگامی امداد کی اہلیت'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{isHindi ? 'सत्यापित आधार केवाईसी बैज' : 'تصدیق شدہ آدھار کے وائی سی'}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center gap-3">
          <button
            onClick={handleOpenRegister}
            className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> {isHindi ? 'अभी सदस्य बनें (₹50)' : 'ابھی ممبر بنیں (₹50)'}
          </button>
          <span className="text-[11px] text-slate-400 text-center lg:text-right">
            {isHindi ? 'पंजीकरण के तुरंत बाद डिजिटल कार्ड जनरेशन' : 'رجسٹریشن کے فوری بعد ڈیجیٹل کارڈ دستیاب'}
          </span>
        </div>
      </div>
    </div>
  );
};
