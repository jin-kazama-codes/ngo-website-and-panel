'use client';

import React from 'react';
import { useDynamicTranslatedText } from '../lib/autoTranslate';
import { Language } from '../context/LanguageContext';

interface DynamicTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  text?: string;
  lang: Language;
  fallback?: string;
}

export const DynamicText: React.FC<DynamicTextProps> = ({
  text,
  lang,
  fallback,
  children,
  ...props
}) => {
  const content = text || (typeof children === 'string' ? children : '');
  const translated = useDynamicTranslatedText(content, lang);
  return (
    <span {...props}>
      {translated || fallback || content}
    </span>
  );
};

export default DynamicText;
