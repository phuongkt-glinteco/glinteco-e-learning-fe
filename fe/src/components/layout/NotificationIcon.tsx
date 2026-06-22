'use client';

import React from 'react';

interface NotificationIconProps {
  badgeCount?: number;
  className?: string;
  onClick?: () => void;
}

export default function NotificationIcon({ badgeCount, className = '', onClick }: NotificationIconProps) {
  return (
    <button
      onClick={onClick}
      className={`relative hover:bg-surface-container-low transition-colors p-2 rounded-full text-on-surface-variant ${className}`}
    >
      <span className="material-symbols-outlined">notifications</span>
      {badgeCount !== undefined && badgeCount > 0 && (
        <span className="absolute top-1 right-1 bg-error text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
          {badgeCount}
        </span>
      )}
    </button>
  );
}
