'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useSettingsStore, type ProfileVisibility } from '@/stores/settingsStore';

export function SecuritySettingsCard() {
  const t = useTranslations('SettingsPage');
  const {
    profileVisibility,
    setProfileVisibility,
    activityStatus,
    toggleActivityStatus,
  } = useSettingsStore();

  return (
    <section className="bg-surface-container-lowest dark:bg-inverse-surface/10 rounded-xl p-6 md:p-8 border border-outline-variant dark:border-outline shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-surface-container dark:bg-tertiary/20 flex items-center justify-center text-tertiary">
          <span className="material-symbols-outlined">fingerprint</span>
        </div>
        <div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface dark:text-on-surface-dark">{t('securityTitle')}</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{t('securityDesc')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Visibility */}
        <div className="p-6 rounded-xl border border-outline-variant dark:border-outline bg-white dark:bg-surface-container-high/20 flex flex-col justify-between">
          <div>
            <h4 className="font-label-md text-label-md text-on-surface dark:text-on-surface-dark mb-1">{t('profileVis')}</h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">{t('profileVisDesc')}</p>
          </div>
          <select
            value={profileVisibility}
            onChange={(e) => setProfileVisibility(e.target.value as ProfileVisibility)}
            className="w-full bg-surface dark:bg-inverse-surface/20 border border-outline-variant dark:border-outline rounded-lg px-3 py-2 font-body-sm text-body-sm focus:ring-2 focus:ring-primary/20 transition-colors"
          >
            <option value="Public to Cohort">{t('visPublic')}</option>
            <option value="Private">{t('visPrivate')}</option>
            <option value="Management Only">{t('visManagement')}</option>
          </select>
        </div>

        {/* Activity Status */}
        <div className="p-6 rounded-xl border border-outline-variant dark:border-outline bg-white dark:bg-surface-container-high/20 flex flex-col justify-between">
          <div>
            <h4 className="font-label-md text-label-md text-on-surface dark:text-on-surface-dark mb-1">{t('activityStatus')}</h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">{t('activityStatusDesc')}</p>
          </div>
          <div className="flex items-center justify-between mt-auto pt-2">
            <span className={`font-label-sm text-label-sm flex items-center gap-1.5 ${activityStatus ? 'text-tertiary dark:text-tertiary-fixed' : 'text-on-surface-variant'}`}>
              <span className={`w-2 h-2 rounded-full ${activityStatus ? 'bg-tertiary dark:bg-tertiary-fixed animate-pulse' : 'bg-outline'}`} />
              {activityStatus ? t('currentlyVisible') : t('currentlyHidden')}
            </span>
            <button
              type="button"
              onClick={toggleActivityStatus}
              className={`w-11 h-6 rounded-full relative transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                activityStatus ? 'bg-primary' : 'bg-outline-variant'
              }`}
              aria-label="Toggle Activity Status"
            >
              <span
                className={`inline-block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 absolute top-0.5 left-0.5 ${
                  activityStatus ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
