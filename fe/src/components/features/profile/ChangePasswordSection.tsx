'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { isUiShowError } from '@/services/errors';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/default/card';
import { Input } from '@/components/ui/default/input';
import { Label } from '@/components/ui/default/label';
import { Button } from '@/components/ui/default/button';
import { authControllerResetPassword } from '@/services/api-client';

interface ChangePasswordFormValues {
  newPassword: string;
  confirmPassword: string;
}

export function ChangePasswordSection() {
  const t = useTranslations('ProfilePage');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<ChangePasswordFormValues>({
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ChangePasswordFormValues) => {
    if (data.newPassword.length < 6) {
      setError('newPassword', { type: 'manual', message: t('errors.passwordTooShort') });
      return;
    }
    if (data.newPassword !== data.confirmPassword) {
      setError('confirmPassword', { type: 'manual', message: t('errors.passwordMismatch') });
      return;
    }

    setLoading(true);
    try {
      
      await authControllerResetPassword({
        body: {
          password: data.newPassword,
          token: '',
        },
        throwOnError: true,
      });
      toast.success(t('passwordSuccess'));
      reset();
    } catch (err) {
      if (isUiShowError(err)) {
        toast.error(t(`errors.${err.errorCode}`) || err.message);
      } else {
        // Fallback for temporary un-deployed endpoint
        toast.error(t('errors.PASSWORD_CHANGE_FAILED'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-outline-variant bg-surface-container-low shadow-sm max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-red-500">lock_reset</span>
          {t('tabSecurity')}
        </CardTitle>
        <CardDescription className="text-on-surface-variant">
          {t('securityDescription')}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4">
            {/* New Password */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="newPassword" className="text-sm font-semibold text-on-surface">
                {t('newPassword')} <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  {...register('newPassword')}
                  placeholder={t('newPasswordPlaceholder')}
                  className="bg-surface border-outline-variant text-on-surface pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.newPassword && (
                <span className="text-xs text-red-500 font-medium">{errors.newPassword.message}</span>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-on-surface">
                {t('confirmPassword')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                placeholder={t('confirmPasswordPlaceholder')}
                className="bg-surface border-outline-variant text-on-surface"
              />
              {errors.confirmPassword && (
                <span className="text-xs text-red-500 font-medium">{errors.confirmPassword.message}</span>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-outline-variant">
            <Button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 shadow"
            >
              <span className="material-symbols-outlined text-sm mr-2">security</span>
              {loading ? t('updatingPassword') : t('updatePassword')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
