'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/default/button';

export function NotificationSettingsCard() {
  const t = useTranslations('SettingsPage');
  const router = useRouter();

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

      <div className="flex flex-col gap-4 rounded-xl border border-outline-variant/40 bg-surface px-4 py-5">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          {t('notificationCardSummary')}
        </p>
        <div>
          <Button type="button" variant="outline" onClick={() => router.push('/settings/notifications')}>
            <span className="material-symbols-outlined text-[16px]">tune</span>
            {t('manageNotificationSettings')}
          </Button>
        </div>
      </div>
    </section>
  );
}
