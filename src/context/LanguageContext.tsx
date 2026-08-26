'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import hi from '../i18n/locales/hi.json';
import ur from '../i18n/locales/ur.json';

export type Language = 'hi' | 'ur';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, defaultText?: string) => string;
  isHindi: boolean;
  isUrdu: boolean;
  formatCurrency: (amount: number) => string;
}

const translations: Record<Language, Record<string, string>> = {
  hi: hi as Record<string, string>,
  ur: ur as Record<string, string>,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Default to 'hi' so server and client initial render match 100% avoiding SSR hydration errors
  const [language, setLanguageState] = useState<Language>('hi');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mfct_lang') as Language;
      if (saved === 'hi' || saved === 'ur') {
        setLanguageState(saved);
      } else {
        localStorage.setItem('mfct_lang', 'hi');
      }
    } catch {}
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('mfct_lang', lang);
    } catch {}
  };

  const toggleLanguage = () => {
    setLanguage(language === 'hi' ? 'ur' : 'hi');
  };

  const t = (key: string, defaultText?: string): string => {
    if (translations[language] && translations[language][key]) {
      return translations[language][key];
    }
    if (translations.hi && translations.hi[key]) {
      return translations.hi[key];
    }
    return defaultText || key;
  };

  const formatCurrency = (amount: number): string => {
    return '₹' + amount.toLocaleString('en-IN');
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        isHindi: language === 'hi',
        isUrdu: language === 'ur',
        formatCurrency,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
