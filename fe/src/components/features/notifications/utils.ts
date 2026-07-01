import type { HeaderNotification, HeaderNotificationsResult } from './types';

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

function normalizeNotification(value: unknown): HeaderNotification | null {
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
  const targetUrl = readNullableString(record, ['targetUrl', 'url', 'href', 'prUrl']) ?? readNestedTargetUrl(record);

  return {
    id,
    title,
    message: readNullableString(record, ['message', 'body', 'description']),
    isRead: read,
    createdAt: readNullableString(record, ['createdAt', 'created_at', 'date']),
    targetUrl,
    type: readNullableString(record, ['type']),
  };
}

export function normalizeNotificationsResponse(response: unknown): HeaderNotificationsResult {
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
    .filter((notification): notification is HeaderNotification => Boolean(notification))
    .filter((notification) => !notification.isRead);

  const explicitUnreadCount = record
    ? readNumber(record, ['unreadCount', 'unread_count', 'totalUnread'])
    : null;

  return {
    notifications,
    unreadCount: Math.max(
      0,
      explicitUnreadCount ?? notifications.length
    ),
  };
}

export function formatNotificationTime(value: string | null) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function canNavigateNotification(notification: HeaderNotification) {
  return Boolean(notification.targetUrl);
}
