'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/default/button';
import { Input } from '@/components/ui/default/input';
import { Label } from '@/components/ui/default/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/default/dialog';
import { cohortControllerUpdate } from '@/services/api-client';
import { isUiShowError } from '@/services/errors';
import type { CohortDetailDto, UpdateCohortDto } from '@/services/api-client';
import type { UiShowError } from '@/services/errors';

interface EditCohortFormValues {
  name: string;
  targetRampDays: number;
}

type EditableCohort = { id: string; name: string; targetRampDays?: number };

interface EditCohortModalProps {
  cohort: EditableCohort;
  onSuccess: (updated: EditableCohort) => void;
  onCancel: () => void;
}

export function EditCohortModal({ cohort, onSuccess, onCancel }: EditCohortModalProps) {
  const t = useTranslations('CohortDetailPage');
  const [loading, setLoading] = useState(false);
  const c = cohort || {};

  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<EditCohortFormValues>({
    defaultValues: {
      name: c.name || '',
      targetRampDays: c.targetRampDays || 30,
    },
  });

  useEffect(() => {
    reset({
      name: c.name || '',
      targetRampDays: c.targetRampDays || 30,
    });
  }, [c.name, c.targetRampDays, reset]);

  const onSubmit = async (data: EditCohortFormValues) => {
    if (!data.name?.trim()) {
      setError('name', { type: 'manual', message: t('editErrorNameRequired') });
      return;
    }

    setLoading(true);
    try {
      const body: UpdateCohortDto = {
        name: data.name.trim(),
        targetRampDays: Number(data.targetRampDays) || 30,
      };
      const res = await cohortControllerUpdate({
        path: { id: c.id },
        body,
        throwOnError: true,
      });

      toast.success(t('editSuccess'));
      if (res.data) {
        onSuccess(res.data);
      } else {
        onSuccess({ ...c, name: data.name.trim(), targetRampDays: Number(data.targetRampDays) || 30 });
      }
    } catch (err: unknown) {
      if (isUiShowError(err)) {
        const error = err as UiShowError;
        if (error.errorCode === 'VALIDATION_ERROR' || error.errorCode === 'INVALID_NAME') {
          setError('name', { type: 'server', message: error.message || t('editErrorInvalidName') });
        } else {
          toast.error(error.message || t('editErrorInvalidName'));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const codeDisplay = c.id?.slice(0, 8)?.toUpperCase() || '';

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[520px] rounded-2xl border-outline-variant p-6 shadow-xl">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-bold tracking-tight">
            {t('editModalTitle', { code: codeDisplay })}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="edit-code" className="text-sm font-semibold">
              {t('editCodeLabel')}
            </Label>
            <Input
              id="edit-code"
              disabled
              value={codeDisplay}
              className="h-11 rounded-xl font-mono text-on-surface-variant bg-surface-container-highest/50 cursor-not-allowed"
            />
            <p className="text-xs text-on-surface-variant">{t('editCodeHint')}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-sm font-semibold">
              {t('editNameLabel')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-name"
              {...register('name')}
              placeholder={t('editNamePlaceholder')}
              className="h-11 rounded-xl"
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-ramp-days" className="text-sm font-semibold">
                {t('editRampDaysLabel')}
              </Label>
              <Input
                id="edit-ramp-days"
                type="number"
                {...register('targetRampDays')}
                min="1"
                max="365"
                className="h-11 rounded-xl"
              />
              <p className="text-xs text-on-surface-variant">{t('editRampDaysHint')}</p>
            </div>

          </div>

          <DialogFooter className="gap-2 pt-4 border-t border-outline-variant">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="rounded-xl h-10 px-4 font-medium"
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-xl h-10 px-5 font-semibold shadow-sm"
            >
              {loading ? t('editLoading') : t('editSubmit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
