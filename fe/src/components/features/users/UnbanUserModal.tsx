'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Unlock, X } from 'lucide-react';
import type { UserDto } from './types';

interface UnbanUserModalProps {
  user: UserDto | null;
  onClose: () => void;
  onConfirm: (user: UserDto) => Promise<void>;
}

export function UnbanUserModal({
  user,
  onClose,
  onConfirm,
}: UnbanUserModalProps) {
  const t = useTranslations('UsersPage');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return null;

  async function handleConfirm() {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await onConfirm(user);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-on-background/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-surface-container-lowest dark:bg-surface rounded-2xl shadow-2xl p-6 border border-outline-variant z-10 animate-in zoom-in-95 duration-200 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant pb-4">
          <h3 className="font-bold text-lg text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <Unlock className="w-5 h-5" />
            <span>{t('btn_confirm_unban')}</span>
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
        <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
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

        <p className="text-xs text-on-surface-variant leading-relaxed">
          {t('confirm_unban_desc')}
        </p>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-outline-variant/60">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
          >
            {t('btn_cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 dark:bg-emerald-500 text-white hover:bg-emerald-700 dark:hover:bg-emerald-600 disabled:opacity-50 transition-all shadow-md cursor-pointer"
          >
            {isSubmitting ? t('btn_saving') : t('btn_confirm_unban')}
          </button>
        </div>
      </div>
    </div>
  );
}
