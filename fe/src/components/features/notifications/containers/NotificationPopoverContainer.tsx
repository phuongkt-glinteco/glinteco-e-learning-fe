'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/default/popover';
import NotificationIcon from '@/components/layout/NotificationIcon';
import {
  notificationsControllerFindAll,
  notificationsControllerMarkRead,
} from '@/services/api-client';
import { NotificationPopover } from '../components/NotificationPopover';
import type { HeaderNotification } from '../types';
import { normalizeNotificationsResponse } from '../utils';

function navigateToTarget(targetUrl: string, router: ReturnType<typeof useRouter>) {
  if (/^https?:\/\//i.test(targetUrl)) {
    window.location.assign(targetUrl);
    return;
  }

  router.push(targetUrl);
}

export function NotificationPopoverContainer() {
  const t = useTranslations('AppShell');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<HeaderNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const response = await notificationsControllerFindAll({ throwOnError: true });
      const normalized = normalizeNotificationsResponse(response.data);
      setNotifications(normalized.notifications);
      setUnreadCount(normalized.unreadCount);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  async function markAsRead(notification: HeaderNotification) {
    if (notification.isRead || markingId) {
      return;
    }

    setMarkingId(notification.id);
    const previousNotifications = notifications;
    const previousUnreadCount = unreadCount;
    setNotifications((current) => current.filter((item) => item.id !== notification.id));
    setUnreadCount((current) => Math.max(0, current - 1));

    try {
      await notificationsControllerMarkRead({
        path: { id: notification.id },
        throwOnError: true,
      });
    } catch {
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
    } finally {
      setMarkingId(null);
    }
  }

  async function handleOpenNotification(notification: HeaderNotification) {
    if (!notification.isRead) {
      await markAsRead(notification);
    }

    if (notification.targetUrl) {
      setOpen(false);
      navigateToTarget(notification.targetUrl, router);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <NotificationIcon
          badgeCount={unreadCount}
          aria-label={t('notifications')}
          className={open ? 'bg-surface-container-low text-on-surface' : ''}
        />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={12}
        className="w-auto border-0 bg-transparent p-0 shadow-none ring-0"
      >
        <NotificationPopover
          title={t('notifications')}
          unreadText={t('notificationsUnreadCount', { count: unreadCount })}
          markReadLabel={t('notificationsMarkRead')}
          loadingLabel={t('notificationsLoading')}
          errorTitle={t('notificationsErrorTitle')}
          errorDescription={t('notificationsErrorDescription')}
          retryLabel={t('notificationsRetry')}
          emptyTitle={t('notificationsEmptyTitle')}
          emptyDescription={t('notificationsEmptyDescription')}
          notifications={notifications}
          loading={loading}
          error={error}
          markingId={markingId}
          onRetry={loadNotifications}
          onMarkRead={markAsRead}
          onOpenNotification={handleOpenNotification}
        />
      </PopoverContent>
    </Popover>
  );
}
