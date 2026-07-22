'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/default/popover';
import NotificationIcon from '@/components/layout/NotificationIcon';
import { useAuth } from '@/providers/AuthProvider';
import { NotificationPopover } from '../components/NotificationPopover';
import {
  fetchNotifications,
  markNotificationRead,
  markNotificationReadLocally,
} from '../notification.service';
import type { AppNotification } from '../types';
import { countUnreadNotifications } from '../utils';

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
  const { user, loading: authLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const pendingLoadRef = useRef<Promise<void> | null>(null);

  const loadNotifications = useCallback(async (options?: { manual?: boolean }) => {
    if (!user) {
      return;
    }
    if (pendingLoadRef.current) {
      return pendingLoadRef.current;
    }

    const manual = options?.manual ?? false;

    if (manual) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(false);

    const request = (async () => {
      try {
        const normalized = await fetchNotifications();
        setNotifications(normalized.notifications);
        setUnreadCount(normalized.unreadCount);
      } catch {
        if (notifications.length === 0) {
          setError(true);
        }
        if (manual) {
          toast.error(t('notificationsRefreshError'));
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
        pendingLoadRef.current = null;
      }
    })();

    pendingLoadRef.current = request;
    return request;
  }, [notifications.length, t, user]);

  useEffect(() => {
    if (!user || authLoading) {
      return;
    }
    void loadNotifications();
  }, [authLoading, loadNotifications, user]);

  if (authLoading || !user) {
    return null;
  }

  async function markAsRead(notification: AppNotification) {
    if (notification.isRead || markingId) {
      return;
    }

    setMarkingId(notification.id);
    const previousNotifications = notifications;
    const nextNotifications = markNotificationReadLocally(notifications, notification.id);
    setNotifications(nextNotifications);
    setUnreadCount(countUnreadNotifications(nextNotifications));

    try {
      await markNotificationRead(notification.id);
    } catch {
      setNotifications(previousNotifications);
      setUnreadCount(countUnreadNotifications(previousNotifications));
      toast.error(t('notificationsMarkReadError'));
    } finally {
      setMarkingId(null);
    }
  }

  async function handleOpenNotification(notification: AppNotification) {
    if (!notification.isRead) {
      await markAsRead(notification);
    }

    if (notification.actionUrl) {
      setOpen(false);
      navigateToTarget(notification.actionUrl, router);
    }
  }

  function handleOpenSettings() {
    setOpen(false);
    router.push('/settings/notifications');
  }

  function handleRefresh() {
    void loadNotifications({ manual: true });
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
          refreshLabel={t('notificationsRefresh')}
          settingsLabel={t('notificationsSettings')}
          markReadLabel={t('notificationsMarkRead')}
          loadingLabel={t('notificationsLoading')}
          errorTitle={t('notificationsErrorTitle')}
          errorDescription={t('notificationsErrorDescription')}
          retryLabel={t('notificationsRetry')}
          emptyTitle={t('notificationsEmptyTitle')}
          emptyDescription={t('notificationsEmptyDescription')}
          notifications={notifications}
          loading={loading}
          refreshing={refreshing}
          error={error}
          markingId={markingId}
          onRetry={handleRefresh}
          onOpenSettings={handleOpenSettings}
          onMarkRead={markAsRead}
          onOpenNotification={handleOpenNotification}
        />
      </PopoverContent>
    </Popover>
  );
}
