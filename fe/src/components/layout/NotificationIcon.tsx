'use client';

import React, { forwardRef } from 'react';

interface NotificationIconProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  badgeCount?: number;
  className?: string;
}

const NotificationIcon = forwardRef<HTMLButtonElement, NotificationIconProps>(
  ({ badgeCount, className = '', ...buttonProps }, ref) => {
    const visibleBadge = badgeCount !== undefined && badgeCount > 0;
    const badgeLabel = badgeCount && badgeCount > 99 ? '99+' : String(badgeCount);

    return (
      <button
        {...buttonProps}
        ref={ref}
        type="button"
        className={`relative hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors p-2 rounded-full text-on-surface-variant ${className}`}
      >
        <span className="material-symbols-outlined">notifications</span>
        {visibleBadge ? (
          <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 bg-error text-white text-[10px] rounded-full flex items-center justify-center font-bold leading-none">
            {badgeLabel}
          </span>
        ) : null}
      </button>
    );
  }
);

NotificationIcon.displayName = 'NotificationIcon';

export default NotificationIcon;
