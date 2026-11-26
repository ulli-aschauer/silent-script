import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { translations } from './translations';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('de');
  const toggle = useCallback(() => setLang((l) => (l === 'de' ? 'en' : 'de')), []);
  const t = translations[lang];
  const value = useMemo(() => ({ lang, setLang, toggle, t }), [lang, toggle, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLang = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
};
