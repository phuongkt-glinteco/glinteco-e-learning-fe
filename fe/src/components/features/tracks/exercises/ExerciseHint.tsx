'use client';

import type { UseFormRegister } from 'react-hook-form';
import type { CreateExerciseFormInput } from '@/schemas';

interface ExerciseHintProps {
  register: UseFormRegister<CreateExerciseFormInput>;
  t: (key: string) => string;
}

export default function ExerciseHint({ register, t }: ExerciseHintProps) {
  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary">lightbulb</span>
        <h3 className="font-headline-sm text-on-surface">{t('hintTitle')}</h3>
        <span className="text-label-sm text-outline ml-1">{t('hintOptional')}</span>
      </div>
      <textarea
        className="w-full border border-outline-variant rounded-lg px-md py-sm text-body-base focus:border-primary focus:ring-0 transition-colors outline-none bg-surface-container-lowest resize-none"
        rows={3}
        placeholder={t('hintPlaceholder')}
        {...register('hint')}
      />
    </section>
  );
}
