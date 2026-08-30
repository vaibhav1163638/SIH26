'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { translations, type Language, type TranslationKeys } from '@/lib/i18n';
import { api } from '@/lib/api';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: translations.en,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  // Load from DB on mount
  useEffect(() => {
    // try to get from localstorage first for fast paint
    const local = typeof window !== 'undefined' ? localStorage.getItem('cropscan-lang') : null;
    if (local && (local === 'en' || local === 'hi')) {
       setLanguageState(local as Language);
    }
    
    // fetch real from backend
    api.getLanguage().then(data => {
       if (data && (data.language === 'en' || data.language === 'hi')) {
           setLanguageState(data.language as Language);
           if (typeof window !== 'undefined') {
              localStorage.setItem('cropscan-lang', data.language);
           }
       }
    }).catch(console.error);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cropscan-lang', lang);
    }
    // Fire and forget to update backend
    api.updateLanguage(lang).catch(err => console.error('Failed to update language on backend:', err));
  }, []);

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
