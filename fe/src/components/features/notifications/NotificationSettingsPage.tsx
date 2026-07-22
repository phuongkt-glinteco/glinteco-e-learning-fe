'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { NotificationSettingsView } from './NotificationSettingsView';
import {
  fetchNotificationSettings,
  notificationSettingsSupported,
  updateNotificationSettings,
} from './notification.service';
import { createDefaultNotificationSettings } from './utils';
import {
  notificationTypes,
  type NotificationSettings,
  type NotificationType,
} from './types';

export function NotificationSettingsPage() {
  const t = useTranslations('SettingsPage');
  const router = useRouter();
  const [settings, setSettings] = useState<NotificationSettings>(createDefaultNotificationSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [savingKey, setSavingKey] = useState<NotificationType | null>(null);

  const items = useMemo(
    () =>
      notificationTypes.map((key) => ({
        key,
        title: t(`notificationItems.${key}`),
      })),
    [t],
  );

  const loadSettings = useCallback(async () => {
    if (!notificationSettingsSupported) {
      setError(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    try {
      const nextSettings = await fetchNotificationSettings();
      setSettings(nextSettings);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  async function handleToggle(key: NotificationType, checked: boolean) {
    if (savingKey || !notificationSettingsSupported) {
      return;
    }

    const previousSettings = settings;
    const nextSettings = { ...settings, [key]: checked };

    setSettings(nextSettings);
    setSavingKey(key);

    try {
      const savedSettings = await updateNotificationSettings(nextSettings);
      setSettings(savedSettings);
    } catch {
      setSettings(previousSettings);
      toast.error(t('notificationSaveError'));
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <NotificationSettingsView
      title={t('notificationSettingsTitle')}
      description={t('notificationSettingsDescription')}
      backLabel={t('backToSettings')}
      loadingLabel={t('notificationLoading')}
      errorTitle={t(notificationSettingsSupported ? 'notificationErrorTitle' : 'notificationUnavailableTitle')}
      errorDescription={t(
        notificationSettingsSupported ? 'notificationErrorDescription' : 'notificationUnavailableDescription',
      )}
      retryLabel={t('notificationRetry')}
      savingLabel={t('notificationSaving')}
      settings={settings}
      items={items}
      loading={loading}
      error={error}
      savingKey={savingKey}
      onRetry={() => void loadSettings()}
      onBack={() => router.push('/settings')}
      onToggle={handleToggle}
    />
  );
}
