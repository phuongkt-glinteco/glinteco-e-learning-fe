'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { defaultLocale, isLocale, type Locale } from '@/i18n/locales';

import en from '../../messages/en.json';
import vi from '../../messages/vi.json';

const messages: Record<Locale, typeof en> = { en, vi };

interface LanguageContextType {
  locale: Locale;
  changeLanguage: (nextLocale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

interface LanguageProviderProps {
  children: ReactNode;
  initialLocale: string;
}

export function LanguageProvider({ children, initialLocale }: LanguageProviderProps) {
  const [locale, setLocale] = useState<Locale>(
    isLocale(initialLocale) ? initialLocale : defaultLocale,
  );

  const changeLanguage = useCallback((nextLocale: Locale) => {
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    setLocale(nextLocale);
  }, []);

  return (
    <LanguageContext.Provider value={{ locale, changeLanguage }}>
      <NextIntlClientProvider
        messages={messages[locale]}
        locale={locale}
        timeZone="Asia/Ho_Chi_Minh"
      >
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
