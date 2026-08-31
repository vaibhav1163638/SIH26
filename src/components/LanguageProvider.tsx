'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { type Language } from '@/lib/i18n';
import { api } from '@/lib/api';

export type { Language };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t?: any;
}

const emptyTranslationProxy: any = new Proxy({}, {
  get: () => new Proxy({}, {
    get: (_target, prop) => String(prop),
  }),
});

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: emptyTranslationProxy,
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
    const saved = localStorage.getItem('agrosarthi-lang') as Language | null;
    const initialLang: Language = (saved === 'en' || saved === 'hi') ? saved : 'en';
    setLanguageState(initialLang);

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
    api.updateLanguage(lang).catch(err => console.error('Failed to update language on backend:', err));
  }, [triggerGoogleTranslation]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: emptyTranslationProxy }}>
      <div id="google_translate_element" style={{ display: 'none', position: 'absolute', top: '-9999px' }} />
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
