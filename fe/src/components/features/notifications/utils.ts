import {
  notificationTypes,
  type AppNotification,
  type NotificationSettings,
  type NotificationType,
  type NotificationsResult,
} from './types';

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? value as Record<string, unknown> : null;
}

function readString(record: Record<string, unknown>, keys: string[], fallback = '') {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return fallback;
}

function readNullableString(record: Record<string, unknown>, keys: string[]) {
  const value = readString(record, keys);
  return value || null;
}

function readBoolean(record: Record<string, unknown>, keys: string[], fallback = false) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'boolean') {
      return value;
    }
  }

  return fallback;
}

function readNumber(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }

  return null;
}

function readNestedTargetUrl(record: Record<string, unknown>) {
  const target = asRecord(record.target);
  return target ? readNullableString(target, ['targetUrl', 'url', 'href', 'prUrl']) : null;
}

function isNotificationType(value: string): value is NotificationType {
  return notificationTypes.includes(value as NotificationType);
}

function normalizeNotification(value: unknown): AppNotification | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  const id = readString(record, ['id', 'notificationId']);
  const title = readString(record, ['title', 'subject'], 'Notification');

  if (!id) {
    return null;
  }

  const read = readBoolean(record, ['read', 'isRead'], false);
  const actionUrl =
    readNullableString(record, ['actionUrl', 'targetUrl', 'url', 'href', 'prUrl']) ??
    readNestedTargetUrl(record);
  const typeValue = readNullableString(record, ['type']);

  return {
    id,
    title,
    message: readNullableString(record, ['message', 'body', 'description']),
    isRead: read,
    readAt: readNullableString(record, ['readAt', 'read_at']),
    createdAt: readNullableString(record, ['createdAt', 'created_at', 'date']),
    actionUrl,
    type: typeValue && isNotificationType(typeValue) ? typeValue : null,
  };
}

export function normalizeNotificationsResponse(response: unknown): NotificationsResult {
  const record = asRecord(response);
  const source = Array.isArray(response)
    ? response
    : Array.isArray(record?.data)
      ? record.data
      : Array.isArray(record?.notifications)
        ? record.notifications
        : [];

  const notifications = source
    .map(normalizeNotification)
    .filter((notification): notification is AppNotification => Boolean(notification));

  const explicitUnreadCount = record
    ? readNumber(record, ['unreadCount', 'unread_count', 'totalUnread'])
    : null;

  return {
    notifications,
    unreadCount: Math.max(0, explicitUnreadCount ?? countUnreadNotifications(notifications)),
  };
}

export function createDefaultNotificationSettings(): NotificationSettings {
  return {
    EXERCISE_REVIEWED: true,
    EXERCISE_CHANGES_REQUESTED: true,
    COHORT_ASSIGNED: true,
    NEW_LESSON_PUBLISHED: true,
  };
}

export function normalizeNotificationSettingsResponse(response: unknown): NotificationSettings {
  const defaults = createDefaultNotificationSettings();
  const record = asRecord(response);
  const source = asRecord(record?.settings) ?? asRecord(record?.data) ?? record;

  if (!source) {
    return defaults;
  }

  return notificationTypes.reduce<NotificationSettings>((settings, key) => {
    settings[key] = readBoolean(source, [key], defaults[key]);
    return settings;
  }, { ...defaults });
}

export function formatNotificationTime(value: string | null, locale?: string) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const ranges: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 60 * 24 * 365],
    ['month', 60 * 24 * 30],
    ['week', 60 * 24 * 7],
    ['day', 60 * 24],
    ['hour', 60],
    ['minute', 1],
  ];

  for (const [unit, minutesPerUnit] of ranges) {
    if (Math.abs(diffMinutes) >= minutesPerUnit || unit === 'minute') {
      return formatter.format(Math.round(diffMinutes / minutesPerUnit), unit);
    }
  }

  return '';
}

export function countUnreadNotifications(notifications: AppNotification[]) {
  return notifications.reduce((count, notification) => count + (notification.isRead ? 0 : 1), 0);
}

export function canNavigateNotification(notification: AppNotification) {
  return Boolean(notification.actionUrl);
}
