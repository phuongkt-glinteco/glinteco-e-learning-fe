'use client';

import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import type { CreateExerciseFormInput } from '@/schemas';

interface ExerciseDescriptionProps {
  register: UseFormRegister<CreateExerciseFormInput>;
  errors: FieldErrors<CreateExerciseFormInput>;
  t: (key: string) => string;
}

export default function ExerciseDescription({ register, errors, t }: ExerciseDescriptionProps) {
  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm space-y-5">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">description</span>
        <h3 className="font-headline-sm text-on-surface">{t('briefOverview')}</h3>
      </div>

      <div>
        <label className="block text-label-sm text-on-surface-variant mb-1.5">{t('briefLabel')}</label>
        <textarea
          className={`w-full border rounded-lg px-md py-sm text-body-base focus:ring-0 transition-colors outline-none bg-surface-container-lowest resize-none ${
            errors.brief ? 'border-error' : 'border-outline-variant focus:border-primary'
          }`}
          rows={3}
          placeholder={t('briefPlaceholder')}
          {...register('brief')}
        />
        {errors.brief && (
          <p className="text-error text-[12px] mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">error</span>
            {t(errors.brief.message as string)}
          </p>
        )}
      </div>

      <div>
        <label className="block text-label-sm text-on-surface-variant mb-1.5">{t('overviewLabel')}</label>
        <textarea
          className={`w-full border rounded-lg px-md py-sm text-body-base focus:ring-0 transition-colors outline-none bg-surface-container-lowest resize-none ${
            errors.overview ? 'border-error' : 'border-outline-variant focus:border-primary'
          }`}
          rows={6}
          placeholder={t('overviewPlaceholder')}
          {...register('overview')}
        />
        {errors.overview && (
          <p className="text-error text-[12px] mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">error</span>
            {t(errors.overview.message as string)}
          </p>
        )}
      </div>
    </section>
  );
}
