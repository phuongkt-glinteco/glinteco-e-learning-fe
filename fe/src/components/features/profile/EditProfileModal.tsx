'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { usersControllerUpdateProfile } from '@/services/api-client';
import type { UserProfileDto } from '@/services/client';
import { isUiShowError } from '@/services/errors';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/default/card';
import { Input } from '@/components/ui/default/input';
import { Label } from '@/components/ui/default/label';
import { Button } from '@/components/ui/default/button';
import { Slider } from '@/components/ui/default/slider';

interface EditProfileModalProps {
  user: UserProfileDto;
  onSuccess?: (updated: UserProfileDto) => void;
}

interface EditProfileFormValues {
  name: string;
  title: string;
  avatarHue: number[];
}

export function EditProfileModal({ user, onSuccess }: EditProfileModalProps) {
  const t = useTranslations('ProfilePage');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, control, watch, reset, setError, formState: { errors } } = useForm<EditProfileFormValues>({
    defaultValues: {
      name: user.name || '',
      title: user.title || '',
      avatarHue: [user.avatarHue ?? 210],
    },
  });

  useEffect(() => {
    reset({
      name: user.name || '',
      title: user.title || '',
      avatarHue: [user.avatarHue ?? 210],
    });
  }, [user, reset]);

  const watchedHue = watch('avatarHue')?.[0] ?? 210;
  const watchedName = watch('name') || user.name || 'U';
  const initial = watchedName.charAt(0).toUpperCase();

  const onSubmit = async (data: EditProfileFormValues) => {
    if (!data.name.trim()) {
      setError('name', { type: 'manual', message: t('errors.nameRequired') });
      return;
    }

    setLoading(true);
    try {
      const hueValue = data.avatarHue[0];
      const res = await usersControllerUpdateProfile({
        body: {
          name: data.name.trim(),
          title: data.title.trim(),
          avatarHue: hueValue,
        },
        throwOnError: true,
      });

      toast.success(t('updateSuccess'));
      if (onSuccess && res.data) {
        onSuccess(res.data as UserProfileDto);
      }
    } catch (err) {
      if (isUiShowError(err)) {
        if (err.errorCode === 'VALIDATION_ERROR' || err.errorCode === 'INVALID_NAME') {
          setError('name', { type: 'server', message: err.message || t('errors.nameRequired') });
        } else {
          toast.error(t(`errors.${err.errorCode}`) || err.message);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-outline-variant bg-surface-container-low shadow-sm max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">manage_accounts</span>
          {t('tabEdit')}
        </CardTitle>
        <CardDescription className="text-on-surface-variant">
          {t('editDescription')}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          {/* Avatar Preview Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-surface-container border border-outline-variant/50 justify-center sm:justify-start">
            <div
              style={{ backgroundColor: `hsl(${watchedHue}, 70%, 50%)`, color: '#ffffff' }}
              className="w-20 h-20 rounded-full border-4 border-surface shadow-md flex items-center justify-center font-bold text-3xl shrink-0 transition-colors duration-200"
            >
              {initial}
            </div>

            <div className="flex flex-col gap-1 text-center sm:text-left flex-1">
              <span className="text-sm font-semibold text-on-surface">
                {t('colorPreview')}: <code className="text-primary font-mono">HSL({watchedHue}, 70%, 50%)</code>
              </span>
              <span className="text-xs text-on-surface-variant">
                {t('colorPreviewDesc')}
              </span>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="text-sm font-semibold text-on-surface">
                {t('fullName')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...register('name')}
                placeholder={t('fullNamePlaceholder')}
                className="bg-surface border-outline-variant text-on-surface"
              />
              {errors.name && (
                <span className="text-xs text-red-500 font-medium">{errors.name.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="title" className="text-sm font-semibold text-on-surface">
                {t('userTitle')}
              </Label>
              <Input
                id="title"
                {...register('title')}
                placeholder={t('userTitlePlaceholder')}
                className="bg-surface border-outline-variant text-on-surface"
              />
            </div>

            {/* Hue Slider */}
            <div className="flex flex-col gap-3 pt-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="hue-slider" className="text-sm font-semibold text-on-surface">
                  {t('avatarHue')}
                </Label>
                <span className="text-xs font-mono font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">
                  {watchedHue}°
                </span>
              </div>
              <Controller
                name="avatarHue"
                control={control}
                render={({ field }) => (
                  <Slider
                    id="hue-slider"
                    min={0}
                    max={360}
                    step={1}
                    value={field.value}
                    onValueChange={field.onChange}
                    className="py-2"
                  />
                )}
              />
              <div className="h-2 w-full rounded-full bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-cyan-500 via-blue-500 via-purple-500 to-red-500 opacity-80" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-4 border-t border-outline-variant">
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-on-primary font-bold px-6 shadow"
            >
              <span className="material-symbols-outlined text-sm mr-2">save</span>
              {loading ? t('saving') : t('saveChanges')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
