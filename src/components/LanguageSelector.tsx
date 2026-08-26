'use client';

import React from 'react';
import { useLanguage, Language } from '../context/LanguageContext';
import { Globe, Check } from 'lucide-react';

interface LanguageSelectorProps {
  compact?: boolean;
  className?: string;
  /** 'website' shows Hindi + English (2 langs), 'admin' shows Hindi + Urdu + English (3 langs) */
  mode?: 'website' | 'admin';
}

const WEBSITE_LANGS: { code: Language; label: string; title: string }[] = [
  { code: 'hi', label: 'हिंदी', title: 'हिंदी में देखें' },
  { code: 'en', label: 'English', title: 'Switch to English' },
];

const ADMIN_LANGS: { code: Language; label: string; title: string }[] = [
  { code: 'hi', label: 'हिंदी', title: 'हिंदी में देखें' },
  { code: 'ur', label: 'اردو', title: 'اردو میں دیکھیں' },
  { code: 'en', label: 'English', title: 'Switch to English' },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  compact = false,
  className = '',
  mode = 'website',
}) => {
  const { language, setLanguage } = useLanguage();
  const langs = mode === 'admin' ? ADMIN_LANGS : WEBSITE_LANGS;

  if (compact) {
    return (
      <div className={`flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 ${className}`}>
        {langs.map(({ code, label, title }) => (
          <button
            key={code}
            onClick={() => setLanguage(code)}
            className={`px-2 py-1 text-xs font-bold rounded transition-all cursor-pointer ${
              language === code
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title={title}
          >
            {label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 ${className}`}>
      <div className="pl-1.5 text-slate-400">
        <Globe className="w-3.5 h-3.5" />
      </div>
      {langs.map(({ code, label, title }) => (
        <button
          key={code}
          onClick={() => setLanguage(code)}
          title={title}
          className={`px-2.5 py-1 text-xs font-extrabold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
            language === code
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>{label}</span>
          {language === code && <Check className="w-3 h-3 text-white" />}
        </button>
      ))}
    </div>
  );
};
