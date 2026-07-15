'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { MoreVertical, Ban, Unlock, Trash2, ShieldAlert } from 'lucide-react';
import type { UserDto } from './types';

interface UserActionsDropdownProps {
  user: UserDto;
  onBan: (user: UserDto) => void;
  onUnban: (user: UserDto) => void;
  onViewBanStatus: (user: UserDto) => void;
  onDelete: (user: UserDto) => void;
}

export function UserActionsDropdown({
  user,
  onBan,
  onUnban,
  onViewBanStatus,
  onDelete,
}: UserActionsDropdownProps) {
  const t = useTranslations('UsersPage');
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg hover:bg-surface-container-highest dark:hover:bg-surface-container transition-colors text-on-surface-variant active:scale-90 cursor-pointer"
        aria-expanded={open}
        aria-label="User actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-48 rounded-xl bg-surface-container-lowest dark:bg-surface-container shadow-lg border border-outline-variant py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
          {user.status === 'banned' ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onUnban(user);
                }}
                className="w-full px-3.5 py-2 text-left text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Unlock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t('action_unban')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onViewBanStatus(user);
                }}
                className="w-full px-3.5 py-2 text-left text-xs text-on-surface hover:bg-surface-container-low dark:hover:bg-surface-container flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>{t('action_view_ban_status')}</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onBan(user);
              }}
              className="w-full px-3.5 py-2 text-left text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Ban className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{t('action_ban')}</span>
            </button>
          )}

          <div className="my-1 border-t border-outline-variant/60" />

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onDelete(user);
            }}
            className="w-full px-3.5 py-2 text-left text-xs text-error hover:bg-error/10 flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t('action_delete')}</span>
          </button>
        </div>
      )}
    </div>
  );
}
