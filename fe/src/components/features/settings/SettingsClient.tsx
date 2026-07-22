'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSettingsStore } from '@/stores/settingsStore';
import { GeneralSettingsCard } from './GeneralSettingsCard';
import { NotificationSettingsCard } from './NotificationSettingsCard';
import { SecuritySettingsCard } from './SecuritySettingsCard';
import { AccessibilitySettingsCard } from './AccessibilitySettingsCard';

export function SettingsClient() {
  const t = useTranslations('SettingsPage');
  const { compactMode, animationSpeed, resetToDefault } = useSettingsStore();
  
  const [toastType, setToastType] = useState<'none' | 'save' | 'reset'>('none');

  // Kích hoạt thực sự tính năng Compact Mode & Animation Speed lên Root HTML
  useEffect(() => {
    const root = document.documentElement;

    // 1. Áp dụng class Compact Mode
    if (compactMode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }

    // 2. Áp dụng tốc độ chuyển cảnh toàn cục
    if (animationSpeed === 'reduced') {
      root.style.setProperty('--animate-duration', '1.5s');
      root.style.setProperty('--transition-speed-multiplier', '2');
    } else if (animationSpeed === 'fast') {
      root.style.setProperty('--animate-duration', '0.3s');
      root.style.setProperty('--transition-speed-multiplier', '0.5');
    } else {
      root.style.removeProperty('--animate-duration');
      root.style.removeProperty('--transition-speed-multiplier');
    }
  }, [compactMode, animationSpeed]);

  const handleSave = () => {
    setToastType('save');
    setTimeout(() => {
      setToastType('none');
    }, 3500);
  };

  const handleReset = () => {
    resetToDefault();
    setToastType('reset');
    setTimeout(() => {
      setToastType('none');
    }, 3500);
  };

  return (
    <div className="flex-1 p-4 sm:p-8 lg:p-12 max-w-container-max mx-auto w-full relative animate-fade-in">
      {/* Header Section */}
      <header className="mb-8 md:mb-10">
        <div className="flex items-center gap-2 text-primary dark:text-primary-fixed mb-2">
          <span className="material-symbols-outlined">settings</span>
          <span className="font-label-md text-label-md uppercase tracking-wider">{t('subTitle')}</span>
        </div>
        <h2 className="font-display-lg text-3xl sm:text-4xl md:text-display-lg text-on-surface dark:text-on-surface-dark font-bold mb-2">
          {t('title')}
        </h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl">
          {t('description')}
        </p>
      </header>

      {/* Settings Cards Grid Layout */}
      <div className="space-y-8">
        <GeneralSettingsCard />
        <NotificationSettingsCard />
        <SecuritySettingsCard />
        <AccessibilitySettingsCard />

        {/* Action Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-outline-variant/30 dark:border-outline/30">
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto px-6 py-2.5 border border-outline text-on-surface-variant dark:text-on-surface-dark rounded-lg font-label-md text-label-md hover:bg-surface dark:hover:bg-inverse-surface/20 transition-colors focus:outline-none focus:ring-2 focus:ring-outline/40"
          >
            {t('resetDefault')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="w-full sm:w-auto px-8 py-2.5 bg-primary text-on-primary rounded-lg font-label-md text-label-md shadow-md hover:bg-primary-container hover:shadow-lg transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {t('saveChanges')}
          </button>
        </div>
      </div>

      {/* Animated Feedback Toast (tái hiện chính xác mẫu HTML user-problems.md) */}
      <div
        className={`fixed bottom-8 right-8 bg-inverse-surface dark:bg-surface-container-highest text-inverse-on-surface dark:text-on-surface px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 transition-all duration-500 z-50 border border-outline-variant/20 ${
          toastType !== 'none' ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-24 opacity-0 scale-95 pointer-events-none'
        }`}
        role="status"
        aria-live="polite"
      >
        <span className="material-symbols-outlined text-tertiary-fixed text-2xl">check_circle</span>
        <div>
          <p className="font-label-md text-label-md font-semibold">
            {toastType === 'save' ? t('toastTitle') : t('resetToastTitle')}
          </p>
          <p className="font-body-sm text-body-sm opacity-80">
            {toastType === 'save' ? t('toastDesc') : t('resetToastDesc')}
          </p>
        </div>
      </div>
    </div>
  );
}
