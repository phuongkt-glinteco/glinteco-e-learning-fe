'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Icon } from '@iconify/react';

const createUserSchema = z.object({
  fullName: z.string().min(2, 'Vui lòng nhập họ và tên hợp lệ'),
  email: z.string().email('Địa chỉ email không hợp lệ'),
  title: z.string().optional(),
  role: z.enum(['Admin', 'Learner'] as const),
  cohortName: z.string().optional(),
  bio: z.string().optional(),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateUserFormValues) => Promise<void>;
  cohortOptions: string[];
}

export function CreateUserModal({
  open,
  onClose,
  onSave,
  cohortOptions,
}: CreateUserModalProps) {
  const t = useTranslations('UsersPage');
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      fullName: '',
      email: '',
      title: '',
      role: 'Learner',
      cohortName: 'Engineering 2024',
      bio: '',
    },
  });

  if (!open) return null;

  async function onSubmit(data: CreateUserFormValues) {
    setIsSaving(true);
    try {
      await onSave(data);
      reset();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-on-background/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={!isSaving ? onClose : undefined}
      />

      {/* Side Drawer */}
      <div className="relative w-full max-w-md bg-surface-container-lowest dark:bg-inverse-surface shadow-2xl border-l border-outline-variant z-10 flex flex-col h-full animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-6 border-b border-outline-variant bg-surface dark:bg-surface-container">
          <h2 className="font-bold text-xl text-on-surface">
            {t('modal_create_title')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="p-2 text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Icon icon="lucide:x" className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Form */}
        <div className="flex-1 overflow-y-auto p-6 bg-surface-bright dark:bg-inverse-surface">
          <form id="create-user-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="font-semibold text-sm text-on-surface flex items-center gap-1">
                {t('label_fullname')} <span className="text-error">*</span>
              </label>
              <input
                {...register('fullName')}
                type="text"
                placeholder={t('placeholder_fullname')}
                className="w-full px-4 py-3 bg-surface-container-lowest dark:bg-surface-container border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
              {errors.fullName && (
                <p className="text-xs text-error font-medium">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="font-semibold text-sm text-on-surface flex items-center gap-1">
                {t('label_email')} <span className="text-error">*</span>
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder={t('placeholder_email')}
                className="w-full px-4 py-3 bg-surface-container-lowest dark:bg-surface-container border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
              {errors.email && (
                <p className="text-xs text-error font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="font-semibold text-sm text-on-surface flex items-center gap-1">
                {t('label_title')}{' '}
                <span className="text-xs text-on-surface-variant font-normal">
                  {t('label_title_optional')}
                </span>
              </label>
              <input
                {...register('title')}
                type="text"
                placeholder={t('placeholder_title')}
                className="w-full px-4 py-3 bg-surface-container-lowest dark:bg-surface-container border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <label className="font-semibold text-sm text-on-surface flex items-center gap-1">
                {t('label_role')} <span className="text-error">*</span>
              </label>
              <div className="relative">
                <select
                  {...register('role')}
                  className="w-full px-4 py-3 bg-surface-container-lowest dark:bg-surface-container border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-colors cursor-pointer"
                >
                  <option value="Learner">{t('role_learner')}</option>
                  <option value="Admin">{t('role_admin')}</option>
                </select>
                <Icon
                  icon="lucide:chevron-down"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none w-4 h-4"
                />
              </div>
            </div>

            {/* Cohort */}
            <div className="space-y-1.5">
              <label className="font-semibold text-sm text-on-surface">
                {t('label_cohort')}
              </label>
              <div className="relative">
                <select
                  {...register('cohortName')}
                  className="w-full px-4 py-3 bg-surface-container-lowest dark:bg-surface-container border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-colors cursor-pointer"
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none w-4 h-4"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <label className="font-semibold text-sm text-on-surface">
                {t('label_bio')}
              </label>
              <textarea
                {...register('bio')}
                rows={4}
                placeholder={t('placeholder_bio')}
                className="w-full px-4 py-3 bg-surface-container-lowest dark:bg-surface-container border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
              />
            </div>
          </form>
        </div>

        {/* Drawer Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-outline-variant bg-surface dark:bg-surface-container">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-5 py-2.5 font-semibold text-sm text-on-surface-variant hover:bg-surface-variant rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {t('btn_cancel')}
          </button>
          <button
            type="submit"
            form="create-user-form"
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
      </div>
    </div>
  );
}
