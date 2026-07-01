'use client';

import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import type { CreateExerciseFormInput } from '@/schemas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/default/card';
import { Label } from '@/components/ui/default/label';
import { Textarea } from '@/components/ui/default/textarea';

interface ExerciseDescriptionProps {
  register: UseFormRegister<CreateExerciseFormInput>;
  errors: FieldErrors<CreateExerciseFormInput>;
  t: (key: string) => string;
}

export default function ExerciseDescription({ register, errors, t }: ExerciseDescriptionProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center gap-2 pb-4">
        <span className="material-symbols-outlined text-primary">description</span>
        <CardTitle className="text-lg">{t('briefOverview')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <Label htmlFor="brief" className="mb-2 block">{t('briefLabel')}</Label>
          <Textarea
            id="brief"
            className={`resize-none ${errors.brief ? 'border-destructive focus-visible:ring-destructive' : ''}`}
            rows={3}
            placeholder={t('briefPlaceholder')}
            {...register('brief')}
          />
          {errors.brief && (
            <p className="text-destructive text-[12px] mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-destructive text-[14px]">error</span>
              {t(errors.brief.message as string)}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="overview" className="mb-2 block">{t('overviewLabel')}</Label>
          <Textarea
            id="overview"
            className={`resize-none ${errors.overview ? 'border-destructive focus-visible:ring-destructive' : ''}`}
            rows={6}
            placeholder={t('overviewPlaceholder')}
            {...register('overview')}
          />
          {errors.overview && (
            <p className="text-destructive text-[12px] mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-destructive text-[14px]">error</span>
              {t(errors.overview.message as string)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
