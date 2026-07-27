'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NotificationIcon from './NotificationIcon';
import UserProfileAvatar from './UserProfileAvatar';
import { useTranslations } from 'next-intl';
import LanguageToggle from '@/components/ui/buttons/LanguageToggle';
import { useAuth } from '@/providers/AuthProvider';

export default function Header() {
  const t = useTranslations('AppShell');
  const router = useRouter();
  const { user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            suppressHydrationWarning
            className="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-full text-sm focus:outline-none focus:border-primary w-64"
            placeholder={t('searchPlaceholder')}
            type="text"
          />
        </div>

        {/* Language Switcher Toggle (VI/EN) - Only on PC Header */}
        <LanguageToggle size="sm" />

        <NotificationIcon />

        <div className="relative" ref={dropdownRef}>
          <div onClick={() => setDropdownOpen(!dropdownOpen)} className="cursor-pointer">
            <UserProfileAvatar size="sm" />
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-surface border border-outline-variant rounded-lg shadow-card py-1 z-50">
              <div className="px-4 py-2 border-b border-outline-variant">
                <p className="text-label-sm font-bold text-on-surface truncate">
                  {user?.name ?? 'User'}
                </p>
                <p className="text-[11px] text-on-surface-variant truncate">
                  {user?.email ?? ''}
                </p>
              </div>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  router.push('/profile');
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-body-sm text-on-surface hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined text-lg flex-shrink-0">person</span>
                <span className="truncate">{t('profile')}</span>
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  router.push('/logout');
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-body-sm text-on-surface hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined text-lg flex-shrink-0">logout</span>
                <span className="truncate">{t('logout')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}



