
"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import esTranslations from '@/locales/es.json';
import enTranslations from '@/locales/en.json';

type Language = 'es' | 'en';

interface Translations {
  [key: string]: string | NestedTranslations;
}
interface NestedTranslations {
  [key: string]: string;
}

const translationsData: Record<Language, Translations> = {
  es: esTranslations,
  en: enTranslations,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translate: (key: string, replacements?: Record<string, string>) => string;
  toggleLanguage: () => void;
  currentTranslations: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es');
  // `mounted` is primarily to gate client-side only operations like localStorage access.
  const [mounted, setMounted] = useState(false);

  // Helper: normalize any variant (e.g., 'EN', 'en-US', 'ES_cl') to our supported set
  const normalizeLanguage = (val?: string | null): Language => {
    const s = String(val || '').toLowerCase();
    if (s.startsWith('en')) return 'en';
    if (s.startsWith('es')) return 'es';
    return 'es';
  };

  useEffect(() => {
    // Read primary key, fall back to a few historical/alternative keys
    const raw =
      localStorage.getItem('smart-student-lang') ||
      localStorage.getItem('language') ||
      localStorage.getItem('locale') ||
      localStorage.getItem('i18n-language');

    const normalized = normalizeLanguage(raw);
    setLanguageState(normalized);
    document.documentElement.lang = normalized;

    // Persist normalized value back to the canonical key to avoid future mismatches
    try { localStorage.setItem('smart-student-lang', normalized); } catch {}
    setMounted(true);
  }, []); // Runs once on client mount
  
  const setLanguage = useCallback((lang: Language) => {
    // Defensive: ensure only 'es'|'en' is stored, even if callers pass variants
    const normalized = (String(lang).toLowerCase() === 'en' ? 'en' : 'es') as Language;
    setLanguageState(normalized);
    if (typeof window !== 'undefined') {
      localStorage.setItem('smart-student-lang', normalized);
      document.documentElement.lang = normalized;
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'es' ? 'en' : 'es');
  }, [language, setLanguage]);

  const translate = useCallback((key: string, replacements?: Record<string, string>): string => {
    // `language` state is 'es' on SSR/initial client render, then updates from localStorage via useEffect.
    // This ensures consistent rendering during hydration.
    const langToUse = language;
    
    const keys = key.split('.');
    let M_TEXT_VALUE: string | Translations | NestedTranslations = translationsData[langToUse];
    for (const k of keys) {
      if (M_TEXT_VALUE && typeof M_TEXT_VALUE === 'object' && k in (M_TEXT_VALUE as Record<string, any>)) {
        M_TEXT_VALUE = (M_TEXT_VALUE as Record<string, any>)[k] as string | NestedTranslations;
      } else {
        // console.warn(`Translation key "${key}" not found for language "${langToUse}".`);
        return key; // Return the key itself if not found
      }
    }
    
    let M_TEXT = typeof M_TEXT_VALUE === 'string' ? M_TEXT_VALUE : key;

    if (replacements) {
      Object.keys(replacements).forEach(placeholder => {
        M_TEXT = M_TEXT.replace(`{{${placeholder}}}`, replacements[placeholder]);
      });
    }
    return M_TEXT;
  }, [language]);

  // The LanguageContext.Provider must always be rendered.
  // The `translate` function handles behavior based on the `language` state,
  // which correctly transitions from initial to client-side resolved state.
  return (
    <LanguageContext.Provider value={{ 
        language, 
        setLanguage, 
        translate, 
        toggleLanguage, 
        currentTranslations: translationsData[language] 
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

    