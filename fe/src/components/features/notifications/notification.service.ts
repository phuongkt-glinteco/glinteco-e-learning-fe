import {
  notificationsControllerFindAll,
  notificationsControllerMarkRead,
  usersControllerGetNotificationSettings,
  usersControllerUpdateNotificationSettings,
} from '@/services/api-client';
import type { AppNotification, NotificationSettings } from './types';
import { normalizeNotificationSettingsResponse, normalizeNotificationsResponse } from './utils';

export const notificationSettingsSupported = true;

export async function fetchNotifications() {
  const response = await notificationsControllerFindAll({ throwOnError: true });
  return normalizeNotificationsResponse(response.data);
}

export async function markNotificationRead(notificationId: string) {
  await notificationsControllerMarkRead({
    path: { id: notificationId },
    throwOnError: true,
  });
}

export async function fetchNotificationSettings() {
  const response = await usersControllerGetNotificationSettings({ throwOnError: true });
  return normalizeNotificationSettingsResponse(response.data);
}

export async function updateNotificationSettings(
  nextSettings: NotificationSettings,
): Promise<NotificationSettings> {
  const response = await usersControllerUpdateNotificationSettings({
    body: nextSettings,
    throwOnError: true,
  });
  return normalizeNotificationSettingsResponse(response.data);
}

export function markNotificationReadLocally(
  notifications: AppNotification[],
  notificationId: string,
) {
  const now = new Date().toISOString();

  return notifications.map((notification) =>
    notification.id === notificationId
      ? {
          ...notification,
          isRead: true,
          readAt: notification.readAt ?? now,
        }
      : notification,
  );
}
