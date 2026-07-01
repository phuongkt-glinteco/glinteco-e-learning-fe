export interface HeaderNotification {
  id: string;
  title: string;
  message: string | null;
  isRead: boolean;
  createdAt: string | null;
  targetUrl: string | null;
  type: string | null;
}

export interface HeaderNotificationsResult {
  notifications: HeaderNotification[];
  unreadCount: number;
}
