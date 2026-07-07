'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useSettingsStore } from '@/stores/settingsStore';

export function NotificationSettingsCard() {
  const t = useTranslations('SettingsPage');
  const {
    newCourseAssignments,
    deadlineReminders,
    weeklyReports,
    toggleNotification,
  } = useSettingsStore();

  const notificationsList = [
    {
      key: 'newCourseAssignments' as const,
      title: t('newCourse'),
      desc: t('newCourseDesc'),
      active: newCourseAssignments,
    },
    {
      key: 'deadlineReminders' as const,
      title: t('deadline'),
      desc: t('deadlineDesc'),
      active: deadlineReminders,
    },
    {
      key: 'weeklyReports' as const,
      title: t('weeklyReport'),
      desc: t('weeklyReportDesc'),
      active: weeklyReports,
    },
  ];

  return (
    <section className="bg-surface-container-lowest dark:bg-inverse-surface/10 rounded-xl p-6 md:p-8 border border-outline-variant dark:border-outline shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-surface-container dark:bg-secondary/20 flex items-center justify-center text-secondary">
          <span className="material-symbols-outlined">mail</span>
        </div>
        <div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface dark:text-on-surface-dark">{t('notifTitle')}</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{t('notifDesc')}</p>
        </div>
      </div>

      <div className="space-y-4">
        {notificationsList.map((item, index) => (
          <div
            key={item.key}
            className={`flex items-center justify-between py-3 ${
              index < notificationsList.length - 1 ? 'border-b border-outline-variant/30 dark:border-outline/30' : ''
            }`}
          >
            <div>
              <h4 className="font-label-md text-label-md text-on-surface dark:text-on-surface-dark">{item.title}</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{item.desc}</p>
            </div>
            <button
              type="button"
              onClick={() => toggleNotification(item.key)}
              className={`w-11 h-6 rounded-full relative transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                item.active ? 'bg-primary' : 'bg-outline-variant'
              }`}
              aria-label={`Toggle ${item.title}`}
            >
              <span
                className={`inline-block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 absolute top-0.5 left-0.5 ${
                  item.active ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
