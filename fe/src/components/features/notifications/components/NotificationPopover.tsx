'use client';

import { ScrollArea } from '@/components/ui/default/scroll-area';
import { Button } from '@/components/ui/default/button';
import type { HeaderNotification } from '../types';
import { canNavigateNotification, formatNotificationTime } from '../utils';

interface NotificationPopoverProps {
  title: string;
  unreadText: string;
  markReadLabel: string;
  loadingLabel: string;
  errorTitle: string;
  errorDescription: string;
  retryLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  notifications: HeaderNotification[];
  loading: boolean;
  error: boolean;
  markingId: string | null;
  onRetry: () => void;
  onMarkRead: (notification: HeaderNotification) => void;
  onOpenNotification: (notification: HeaderNotification) => void;
}

export function NotificationPopover({
  title,
  unreadText,
  markReadLabel,
  loadingLabel,
  errorTitle,
  errorDescription,
  retryLabel,
  emptyTitle,
  emptyDescription,
  notifications,
  loading,
  error,
  markingId,
  onRetry,
  onMarkRead,
  onOpenNotification,
}: NotificationPopoverProps) {
  return (
    <div className="w-[calc(100vw-2rem)] max-w-[360px] overflow-hidden rounded-lg border border-outline-variant bg-surface text-on-surface shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-outline-variant px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-label-md font-bold text-on-surface">{title}</h2>
          <p className="text-[11px] text-on-surface-variant">
            {unreadText}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[180px] flex-col items-center justify-center gap-2 px-4 py-8 text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-[28px] animate-spin">progress_activity</span>
          <p className="text-body-sm">{loadingLabel}</p>
        </div>
      ) : error ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center px-5 py-8 text-center">
          <span className="material-symbols-outlined text-[34px] text-error">error</span>
          <h3 className="mt-3 text-label-md font-bold text-on-surface">{errorTitle}</h3>
          <p className="mt-1 text-body-sm text-on-surface-variant">{errorDescription}</p>
          <Button className="mt-4" size="sm" variant="outline" onClick={onRetry}>
            {retryLabel}
          </Button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center px-5 py-8 text-center">
          <span className="material-symbols-outlined text-[34px] text-on-surface-variant">notifications_off</span>
          <h3 className="mt-3 text-label-md font-bold text-on-surface">{emptyTitle}</h3>
          <p className="mt-1 text-body-sm text-on-surface-variant">{emptyDescription}</p>
        </div>
      ) : (
        <ScrollArea className="max-h-[420px]">
          <ul className="divide-y divide-outline-variant">
            {notifications.map((notification) => {
              const isUnread = !notification.isRead;
              const isMarking = markingId === notification.id;
              const hasTarget = canNavigateNotification(notification);

              return (
                <li key={notification.id}>
                  <div
                    className={`group flex w-full gap-3 px-4 py-3 text-left transition-colors ${
                      isUnread ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-surface-container-low'
                    }`}
                  >
                    <span
                      className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${
                        isUnread ? 'bg-primary' : 'bg-outline-variant'
                      }`}
                    />
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left focus-visible:outline-none"
                      onClick={() => onOpenNotification(notification)}
                    >
                      <div className="flex min-w-0 items-start justify-between gap-2">
                        <p className={`min-w-0 truncate text-label-sm ${isUnread ? 'font-bold text-on-surface' : 'font-semibold text-on-surface'}`}>
                          {notification.title}
                        </p>
                        {hasTarget ? (
                          <span className="material-symbols-outlined mt-0.5 flex-shrink-0 text-[16px] text-on-surface-variant">
                            open_in_new
                          </span>
                        ) : null}
                      </div>
                      {notification.message ? (
                        <p className="mt-1 line-clamp-2 break-words text-body-sm text-on-surface-variant">
                          {notification.message}
                        </p>
                      ) : null}
                      <p className="mt-2 text-[11px] text-on-surface-variant">
                        {formatNotificationTime(notification.createdAt)}
                      </p>
                    </button>
                    {isUnread ? (
                      <button
                        type="button"
                        disabled={isMarking}
                        className="mt-0.5 h-7 flex-shrink-0 rounded-full px-2 text-[11px] font-bold text-primary transition-colors hover:bg-primary/10 disabled:pointer-events-none disabled:opacity-50"
                        onClick={() => onMarkRead(notification)}
                      >
                        {isMarking ? (
                          <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                        ) : (
                          markReadLabel
                        )}
                      </button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      )}
    </div>
  );
}
