'use client';

import { useState } from 'react';
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
import { cohortControllerCreate } from '@/services/api-client';
import { isUiShowError } from '@/services/errors';
import type { CohortSummaryDto, CreateCohortDto } from '@/services/api-client';
import type { UiShowError } from '@/services/errors';

interface CreateCohortFormValues {
  name: string;
  code: string;
  startDate: string;
  targetRampDays: number;
}

interface CreateCohortModalProps {
  onSuccess: (newCohort: CohortSummaryDto) => void;
  onCancel: () => void;
}

export function CreateCohortModal({ onSuccess, onCancel }: CreateCohortModalProps) {
  const t = useTranslations('CohortDetailPage');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setError, formState: { errors } } = useForm<CreateCohortFormValues>({
    defaultValues: {
      name: '',
      code: '',
      startDate: new Date().toISOString().split('T')[0],
      targetRampDays: 30,
    },
  });

  const onSubmit = async (data: CreateCohortFormValues) => {
    if (!data.name?.trim()) {
      setError('name', { type: 'manual', message: t('editErrorNameRequired') });
      return;
    }
    if (!data.code?.trim()) {
      setError('code', { type: 'manual', message: t('createErrorCodeRequired') });
      return;
    }

    setLoading(true);
    try {
      const body: CreateCohortDto & { code: string; startDate: string } = {
        name: data.name.trim(),
        targetRampDays: Number(data.targetRampDays) || 30,
        code: data.code.trim().toUpperCase(),
        startDate: data.startDate,
      };
      const res = await cohortControllerCreate({
        body,
        throwOnError: true,
      });

      toast.success(t('createSuccess'));
      if (res.data) {
        onSuccess(res.data as unknown as CohortSummaryDto);
      } else {
        onSuccess({ id: 'new', name: data.name.trim(), learnerCount: 0, avgCompletion: 0 });
      }
    } catch (err: unknown) {
      if (isUiShowError(err)) {
        const error = err as UiShowError;
        if (error.errorCode === 'VALIDATION_ERROR' || error.errorCode === 'COHORT_CODE_EXISTS') {
          setError('code', { type: 'server', message: error.message || t('editErrorInvalidName') });
        } else {
          toast.error(error.message || t('editErrorInvalidName'));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[520px] rounded-2xl border-outline-variant p-6 shadow-xl">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-bold tracking-tight">
            {t('createModalTitle')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="create-name" className="text-sm font-semibold">
              {t('createNameLabel')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="create-name"
              {...register('name')}
              placeholder={t('createNamePlaceholder')}
              className="h-11 rounded-xl"
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-code" className="text-sm font-semibold">
              {t('createCodeLabel')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="create-code"
              {...register('code')}
              placeholder={t('createCodePlaceholder')}
              className="h-11 rounded-xl font-mono uppercase"
            />
            <p className="text-xs text-on-surface-variant">{t('createCodeHint')}</p>
            {errors.code && <p className="text-xs text-destructive mt-1">{errors.code.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-start-date" className="text-sm font-semibold">
                {t('createStartDateLabel')}
              </Label>
              <Input
                id="create-start-date"
                type="date"
                {...register('startDate')}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-ramp-days" className="text-sm font-semibold">
                {t('createRampDaysLabel')}
              </Label>
              <Input
                id="create-ramp-days"
                type="number"
                {...register('targetRampDays')}
                min="1"
                max="365"
                className="h-11 rounded-xl"
              />
              <p className="text-xs text-on-surface-variant">{t('createRampDaysHint')}</p>
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
              {loading ? t('createLoading') : t('createSubmit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
