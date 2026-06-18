'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';

import en from '../../messages/en.json';
import vi from '../../messages/vi.json';

const messages: Record<string, typeof en> = { en, vi };

interface LanguageContextType {
  locale: string;
  changeLanguage: (nextLocale: string) => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

interface LanguageProviderProps {
  children: ReactNode;
  initialLocale: string;
}

export function LanguageProvider({ children, initialLocale }: LanguageProviderProps) {
  const [locale, setLocale] = useState(initialLocale);

  const changeLanguage = useCallback((nextLocale: string) => {
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    setLocale(nextLocale);
  }, []);

  return (
    <LanguageContext.Provider value={{ locale, changeLanguage }}>
      <NextIntlClientProvider messages={messages[locale]} locale={locale}>
        {children}
      </NextIntlClientProvider>
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
