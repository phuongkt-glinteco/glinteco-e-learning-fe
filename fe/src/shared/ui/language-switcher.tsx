'use client';

import { useLocale } from 'next-intl';
import { locales } from '@/i18n/locales';
import { useLanguage } from '@/providers/LanguageProvider';

type LanguageSwitcherProps = {
  className?: string;
};

export function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const activeLocale = useLocale();
  const { changeLanguage } = useLanguage();

  function handleChangeLanguage(locale: (typeof locales)[number]) {
    if (locale === activeLocale) {
      return;
    }

    changeLanguage(locale);
    window.location.reload();
  }

  return (
    <div
      aria-label="Language selector"
      className={[
        'inline-flex items-center rounded-[8px] border border-[#dbe3ef] bg-white/85 p-0.5 shadow-sm backdrop-blur',
        className,
      ].join(' ')}
    >
      {locales.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => handleChangeLanguage(locale)}
          aria-pressed={activeLocale === locale}
          className={[
            'min-h-8 rounded-[6px] px-3 text-[12px] font-semibold leading-4 transition-colors',
            activeLocale === locale
              ? 'bg-[#2563eb] text-white shadow-sm'
              : 'text-[#434655] hover:text-[#0b1c30]',
          ].join(' ')}
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
