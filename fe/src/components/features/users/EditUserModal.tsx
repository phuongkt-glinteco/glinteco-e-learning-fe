'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';
import type { UserDto, UserRole } from './types';

interface EditUserModalProps {
  user: UserDto | null;
  onClose: () => void;
  onSave: (id: string, payload: { role?: UserRole; cohortName?: string }) => Promise<void>;
  cohortOptions: string[];
}

export function EditUserModal({
  user,
  onClose,
  onSave,
  cohortOptions,
}: EditUserModalProps) {
  const t = useTranslations('UsersPage');
  const [role, setRole] = useState<UserRole>('Learner');
  const [cohortName, setCohortName] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setRole(user.role);
      setCohortName(user.cohortName || '');
    }
  }, [user]);

  if (!user) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      await onSave(user.id, { role, cohortName });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-on-background/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={!isSaving ? onClose : undefined}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-surface-container-lowest dark:bg-surface rounded-2xl shadow-2xl p-6 border border-outline-variant z-10 animate-in zoom-in-95 duration-200 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant pb-4">
          <h2 className="font-bold text-lg text-on-surface">
            {t('modal_edit_title')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="p-1.5 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant cursor-pointer disabled:opacity-50"
          >
            <Icon icon="lucide:x" className="w-5 h-5" />
          </button>
        </div>

        {/* User preview banner */}
        <div className="flex items-center gap-3 p-4 bg-surface-container-low dark:bg-surface-container rounded-xl border border-outline-variant/60">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base shadow-sm flex-shrink-0"
            style={{ backgroundColor: user.avatarColorHsl }}
          >
            {user.avatarInitials}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-on-surface truncate">
              {user.fullName}
            </p>
            <p className="text-xs text-on-surface-variant truncate">
              {user.email}
            </p>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role */}
          <div className="space-y-1.5">
            <label className="font-semibold text-xs uppercase tracking-wider text-on-surface-variant px-0.5">
              {t('label_role')}
            </label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-4 py-2.5 bg-surface-bright dark:bg-surface-container border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-colors cursor-pointer"
              >
                <option value="Learner">{t('role_learner')}</option>
                <option value="Admin">{t('role_admin')}</option>
              </select>
              <Icon
                icon="lucide:chevron-down"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none w-4 h-4"
              />
            </div>
          </div>

          {/* Cohort */}
          <div className="space-y-1.5">
            <label className="font-semibold text-xs uppercase tracking-wider text-on-surface-variant px-0.5">
              {t('label_cohort')}
            </label>
            <div className="relative">
              <select
                value={cohortName}
                onChange={(e) => setCohortName(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-bright dark:bg-surface-container border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-colors cursor-pointer"
              >
                <option value="">{t('placeholder_cohort')}</option>
                <option value="Central Admin Group">Central Admin Group</option>
                {cohortOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <Icon
                icon="lucide:chevron-down"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none w-4 h-4"
              />
            </div>
          </div>

          {/* Form actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-outline-variant">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 font-semibold text-sm border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer disabled:opacity-50"
            >
              {t('btn_cancel')}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 font-semibold text-sm bg-primary text-white hover:bg-primary/90 rounded-lg transition-all shadow-sm active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isSaving ? (
                <>
                  <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                  <span>{t('btn_saving')}</span>
                </>
              ) : (
                <>
                  <Icon icon="lucide:save" className="w-4 h-4" />
                  <span>{t('btn_save')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
