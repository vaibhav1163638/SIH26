'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
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

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [language, setLanguageState] = useState<Language>('en');

  // Trigger Google Translate engine programmatically
  const triggerGoogleTranslation = useCallback((targetLang: Language) => {
    if (typeof window === 'undefined') return;

    // Set translation cookies for current domain and root path
    const googTransVal = targetLang === 'hi' ? '/en/hi' : '/en/en';
    const expires = new Date(Date.now() + 365 * 864e5).toUTCString();

    document.cookie = `googtrans=${googTransVal}; expires=${expires}; path=/;`;
    if (window.location.hostname) {
      document.cookie = `googtrans=${googTransVal}; expires=${expires}; domain=${window.location.hostname}; path=/;`;
    }

    const applyToCombo = () => {
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
      if (select) {
        select.value = targetLang;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
      return false;
    };

    if (!applyToCombo()) {
      // Retry in intervals if Google script is still initializing
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (applyToCombo() || attempts > 15) {
          clearInterval(interval);
        }
      }, 300);
    }
  }, []);

  useEffect(() => {
    // 1. Check local storage
    const saved = localStorage.getItem('agrosarthi-lang') as Language | null;
    const initialLang: Language = (saved === 'en' || saved === 'hi') ? saved : 'en';
    setLanguageState(initialLang);

    // 2. Initialize Google Translate Script
    if (typeof window !== 'undefined') {
      window.googleTranslateElementInit = () => {
        try {
          if (window.google?.translate?.TranslateElement) {
            new window.google.translate.TranslateElement(
              {
                pageLanguage: 'en',
                includedLanguages: 'en,hi',
                autoDisplay: false,
              },
              'google_translate_element'
            );

            if (initialLang === 'hi') {
              setTimeout(() => triggerGoogleTranslation('hi'), 500);
            }
          }
        } catch (e) {
          console.error('Google Translate init error:', e);
        }
      };

      if (!document.getElementById('google-translate-script')) {
        const script = document.createElement('script');
        script.id = 'google-translate-script';
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        document.body.appendChild(script);
      } else if (window.google?.translate) {
        window.googleTranslateElementInit?.();
      }
    }

    // 3. Sync from backend user preferences if available
    api.getLanguage()
      .then(data => {
        if (data && (data.language === 'en' || data.language === 'hi')) {
          setLanguageState(data.language as Language);
          localStorage.setItem('agrosarthi-lang', data.language);
          triggerGoogleTranslation(data.language as Language);
        }
      })
      .catch(() => {});
  }, [triggerGoogleTranslation]);

  // Re-apply translation when user navigates between pages
  useEffect(() => {
    if (language === 'hi') {
      const timer = setTimeout(() => {
        triggerGoogleTranslation('hi');
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [pathname, language, triggerGoogleTranslation]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('agrosarthi-lang', lang);
      triggerGoogleTranslation(lang);
    }
    // Update backend asynchronously
    api.updateLanguage(lang).catch(err => console.error('Failed to update language on backend:', err));
  }, [triggerGoogleTranslation]);

  const t = translations[language] || translations.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {/* Hidden container for Google Translate Engine */}
      <div id="google_translate_element" style={{ display: 'none', position: 'absolute', top: '-9999px' }} />
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
