import React from 'react';
import { useLanguage, Language } from '../context/LanguageContext';
import { Globe, Check } from 'lucide-react';

interface LanguageSelectorProps {
  compact?: boolean;
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  compact = false,
  className = '',
}) => {
  const { language, setLanguage } = useLanguage();

  if (compact) {
    return (
      <div className={`flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 ${className}`}>
        <button
          onClick={() => setLanguage('en')}
          className={`px-2 py-1 text-xs font-bold rounded transition-all ${
            language === 'en'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          title="Switch to English"
        >
          EN
        </button>
        <button
          onClick={() => setLanguage('hi')}
          className={`px-2 py-1 text-xs font-bold rounded transition-all ${
            language === 'hi'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          title="हिंदी में बदलें"
        >
          हिंदी
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 ${className}`}>
      <div className="pl-1.5 text-slate-400">
        <Globe className="w-3.5 h-3.5" />
      </div>
      <button
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 text-xs font-extrabold rounded-lg transition-all flex items-center gap-1 ${
          language === 'en'
            ? 'bg-white text-emerald-800 shadow-sm border border-slate-200/80'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <span>English</span>
        {language === 'en' && <Check className="w-3 h-3 text-emerald-600" />}
      </button>
      <button
        onClick={() => setLanguage('hi')}
        className={`px-2.5 py-1 text-xs font-extrabold rounded-lg transition-all flex items-center gap-1 ${
          language === 'hi'
            ? 'bg-emerald-700 text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <span>हिंदी</span>
        {language === 'hi' && <Check className="w-3 h-3 text-white" />}
      </button>
    </div>
  );
};
