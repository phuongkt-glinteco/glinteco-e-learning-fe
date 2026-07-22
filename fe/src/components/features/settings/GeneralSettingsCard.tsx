'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLanguage } from '@/providers/LanguageProvider';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTheme } from 'next-themes';
import { type Locale } from '@/i18n/locales';

export function GeneralSettingsCard() {
  const t = useTranslations('SettingsPage');
  const { locale, changeLanguage } = useLanguage();
  const { timezone, setTimezone } = useSettingsStore();
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  // Tránh hydratation mismatch cho icon theme
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const currentTheme = mounted ? (theme === 'system' ? resolvedTheme : theme) : 'light';
  const isDark = currentTheme === 'dark';

  const handleToggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <section className="bg-surface-container-lowest dark:bg-inverse-surface/10 rounded-xl p-6 md:p-8 border border-outline-variant dark:border-outline shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-surface-container dark:bg-primary/20 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined">language</span>
        </div>
        <div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface dark:text-on-surface-dark">{t('generalTitle')}</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{t('generalDesc')}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* System Language */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg bg-surface dark:bg-surface-container-high/40 hover:bg-surface-container transition-colors">
          <div>
            <h4 className="font-label-md text-label-md text-on-surface dark:text-on-surface-dark">{t('systemLanguage')}</h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{t('systemLanguageDesc')}</p>
          </div>
          <select
            value={locale}
            onChange={(e) => changeLanguage(e.target.value as Locale)}
            className="w-full md:w-56 bg-white dark:bg-inverse-surface/20 border border-outline-variant dark:border-outline rounded-lg px-4 py-2 font-body-sm text-body-sm focus:ring-2 focus:ring-primary/20 transition-colors"
          >
            <option value="en">{t('languageEn')}</option>
            <option value="vi">{t('languageVi')}</option>
          </select>
        </div>

        {/* Timezone */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg bg-surface dark:bg-surface-container-high/40 hover:bg-surface-container transition-colors">
          <div>
            <h4 className="font-label-md text-label-md text-on-surface dark:text-on-surface-dark">{t('timezone')}</h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{t('timezoneDesc')}</p>
          </div>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full md:w-64 bg-white dark:bg-inverse-surface/20 border border-outline-variant dark:border-outline rounded-lg px-4 py-2 font-body-sm text-body-sm focus:ring-2 focus:ring-primary/20 transition-colors"
          >
            <option value="Asia/Ho_Chi_Minh">{t('tzBangkok')}</option>
            <option value="UTC">{t('tzLondon')}</option>
            <option value="America/Los_Angeles">{t('tzPacific')}</option>
          </select>
        </div>

        {/* Appearance (Theme Toggle) */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-surface dark:bg-surface-container-high/40 hover:bg-surface-container transition-colors">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-on-surface-variant">
              {isDark ? 'dark_mode' : 'light_mode'}
            </span>
            <div>
              <h4 className="font-label-md text-label-md text-on-surface dark:text-on-surface-dark">{t('appearance')}</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{t('appearanceDesc')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleTheme}
            className={`w-11 h-6 rounded-full relative transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/40 ${
              isDark ? 'bg-primary' : 'bg-outline-variant'
            }`}
            aria-label="Toggle Theme"
          >
            <span
              className={`inline-block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 absolute top-0.5 left-0.5 ${
                isDark ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </section>
  );
}
