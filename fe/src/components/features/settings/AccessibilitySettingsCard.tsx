'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useSettingsStore, type AnimationSpeed } from '@/stores/settingsStore';

export function AccessibilitySettingsCard() {
  const t = useTranslations('SettingsPage');
  const {
    compactMode,
    setCompactMode,
    animationSpeed,
    setAnimationSpeed,
  } = useSettingsStore();

  const getProgressWidth = (speed: AnimationSpeed) => {
    switch (speed) {
      case 'reduced':
        return 'w-1/4';
      case 'normal':
        return 'w-1/2';
      case 'fast':
        return 'w-full';
    }
  };

  return (
    <section className="bg-surface-container-lowest dark:bg-inverse-surface/10 rounded-xl p-6 md:p-8 border border-outline-variant dark:border-outline shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-surface-container dark:bg-error/20 flex items-center justify-center text-error">
          <span className="material-symbols-outlined">auto_fix_high</span>
        </div>
        <div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface dark:text-on-surface-dark">{t('accessTitle')}</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{t('accessDesc')}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Compact Mode Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-surface dark:bg-surface-container-high/40 hover:bg-surface-container transition-colors">
          <div>
            <h4 className="font-label-md text-label-md text-on-surface dark:text-on-surface-dark">{t('compactMode')}</h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{t('compactModeDesc')}</p>
          </div>
          <button
            type="button"
            onClick={() => setCompactMode(!compactMode)}
            className={`w-11 h-6 rounded-full relative transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/40 ${
              compactMode ? 'bg-primary' : 'bg-outline-variant'
            }`}
            aria-label="Toggle Compact Mode"
          >
            <span
              className={`inline-block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 absolute top-0.5 left-0.5 ${
                compactMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Animation Speed Selector */}
        <div className="p-4 rounded-lg bg-surface dark:bg-surface-container-high/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
            <div>
              <h4 className="font-label-md text-label-md text-on-surface dark:text-on-surface-dark">{t('animSpeed')}</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{t('animSpeedDesc')}</p>
            </div>
            <div className="flex bg-white dark:bg-inverse-surface/20 rounded-lg border border-outline-variant dark:border-outline p-1 self-start md:self-auto">
              {(['reduced', 'normal', 'fast'] as const).map((speed) => {
                const isActive = animationSpeed === speed;
                let label = '';
                if (speed === 'reduced') label = t('speedReduced');
                if (speed === 'normal') label = t('speedNormal');
                if (speed === 'fast') label = t('speedFast');

                return (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => setAnimationSpeed(speed)}
                    className={`px-4 py-1.5 rounded-md font-label-sm text-label-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-on-primary shadow-sm scale-102'
                        : 'text-on-surface-variant hover:bg-surface-container dark:hover:bg-inverse-surface/30'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="relative w-full h-2 bg-surface-container dark:bg-outline-variant/20 rounded-full overflow-hidden">
            <div
              className={`absolute top-0 left-0 h-full bg-primary transition-all duration-300 ${getProgressWidth(
                animationSpeed
              )}`}
            />
          </div>

          {/* Progress Labels */}
          <div className="flex justify-between mt-2 font-label-sm text-label-sm text-on-surface-variant">
            <span className={animationSpeed === 'reduced' ? 'text-primary font-bold' : ''}>{t('speed05')}</span>
            <span className={animationSpeed === 'normal' ? 'text-primary font-bold' : ''}>{t('speed10')}</span>
            <span className={animationSpeed === 'fast' ? 'text-primary font-bold' : ''}>{t('speed20')}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
