export const notificationTypes = [
  'EXERCISE_REVIEWED',
  'EXERCISE_CHANGES_REQUESTED',
  'COHORT_ASSIGNED',
  'NEW_LESSON_PUBLISHED',
] as const;

export type NotificationType = (typeof notificationTypes)[number];

export interface AppNotification {
  id: string;
  title: string;
  message: string | null;
  type: NotificationType | null;
  actionUrl: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string | null;
}

export interface NotificationsResult {
  notifications: AppNotification[];
  unreadCount: number;
}

export type NotificationSettings = Record<NotificationType, boolean>;
