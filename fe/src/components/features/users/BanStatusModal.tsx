'use client';

import { useTranslations } from 'next-intl';
import { ShieldAlert, X, Unlock } from 'lucide-react';
import type { UserDto } from './types';

interface BanStatusModalProps {
  user: UserDto | null;
  onClose: () => void;
  onOpenUnban: (user: UserDto) => void;
}

export function BanStatusModal({
  user,
  onClose,
  onOpenUnban,
}: BanStatusModalProps) {
  const t = useTranslations('UsersPage');

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-on-background/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-surface-container-lowest dark:bg-surface rounded-2xl shadow-2xl p-6 border border-outline-variant z-10 animate-in zoom-in-95 duration-200 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant pb-4">
          <h3 className="font-bold text-lg text-amber-600 dark:text-amber-400 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" />
            <span>{t('modal_ban_status_title')}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User preview */}
        <div className="flex items-center gap-3 p-3 bg-surface-container-low dark:bg-surface-container rounded-xl border border-outline-variant/60">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0"
            style={{ backgroundColor: user.avatarColorHsl }}
          >
            {user.avatarInitials}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-on-surface truncate">
              {user.fullName}
            </h4>
            <p className="text-xs text-on-surface-variant truncate">
              {user.email}
            </p>
          </div>
        </div>

        {/* Status details */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-outline-variant/40">
            <span className="text-on-surface-variant font-medium">
              {t('label_status')}:
            </span>
            <span className="px-2.5 py-0.5 text-xs font-bold uppercase rounded bg-red-100 text-red-700 border border-red-300 dark:bg-red-950/60 dark:text-red-400 dark:border-red-800">
              {t('status_banned')}
            </span>
          </div>

          <div className="py-2">
            <span className="text-on-surface-variant font-medium block mb-1.5">
              {t('label_ban_reason')}:
            </span>
            <div className="bg-error/5 border border-error/20 rounded-xl p-3.5 text-xs leading-relaxed text-on-surface font-medium">
              {user.banReason || t('no_ban_reason')}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-outline-variant/60">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenUnban(user);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 dark:bg-emerald-500 text-white hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all shadow-md cursor-pointer"
          >
            <Unlock className="w-4 h-4" />
            <span>{t('action_unban')}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
