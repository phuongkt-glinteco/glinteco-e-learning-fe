'use client';

import NotificationIcon from './NotificationIcon';
import UserProfileAvatar from './UserProfileAvatar';
import { useTranslations } from 'next-intl';
import LanguageToggle from '@/components/ui/LanguageToggle';

export default function Header() {
  const t = useTranslations('AppShell');

  return (
    <header className="sticky top-0 z-30 flex justify-between items-center px-lg py-sm w-full bg-surface border-b border-outline-variant shadow-sm">
      <div className="flex items-center gap-sm">
        {/* Empty left side on desktop header since sidebar is on left */}
      </div>

      <div className="flex items-center gap-4 ml-auto">
        {/* Search Input */}
        <div className="relative hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
          <input
            className="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-full text-sm focus:outline-none focus:border-primary w-64"
            placeholder={t('searchPlaceholder')}
            type="text"
          />
        </div>

        {/* Language Switcher Toggle (VI/EN) - Only on PC Header */}
        <LanguageToggle size="sm" />

        <NotificationIcon />

        <UserProfileAvatar size="sm" />
      </div>
    </header>
  );
}



