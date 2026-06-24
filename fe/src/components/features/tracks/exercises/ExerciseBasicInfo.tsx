'use client';

import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import type { CreateExerciseFormInput } from '@/schemas';

interface ExerciseBasicInfoProps {
  register: UseFormRegister<CreateExerciseFormInput>;
  errors: FieldErrors<CreateExerciseFormInput>;
  t: (key: string) => string;
}

export default function ExerciseBasicInfo({ register, errors, t }: ExerciseBasicInfoProps) {
  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <span className="material-symbols-outlined text-primary">info</span>
        <h3 className="font-headline-sm text-on-surface">{t('basicInfo')}</h3>
      </div>

      <div className="grid grid-cols-2 gap-x-lg gap-y-5">
        <div className="col-span-2">
          <label className="block text-label-sm text-on-surface-variant mb-1.5">{t('titleLabel')}</label>
          <input
            className={`w-full border rounded-lg px-md py-sm text-body-base focus:ring-0 transition-colors outline-none bg-surface-container-lowest ${
              errors.title ? 'border-error' : 'border-outline-variant focus:border-primary'
            }`}
            placeholder={t('titlePlaceholder')}
            {...register('title')}
          />
          {errors.title && (
            <p className="text-error text-[12px] mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">error</span>
              {t(errors.title.message as string)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-label-sm text-on-surface-variant mb-1.5">{t('tagLabel')}</label>
          <input
            className={`w-full border rounded-lg px-md py-sm text-body-base focus:ring-0 transition-colors outline-none bg-surface-container-lowest ${
              errors.tag ? 'border-error' : 'border-outline-variant focus:border-primary'
            }`}
            placeholder={t('tagPlaceholder')}
            {...register('tag')}
          />
          {errors.tag && (
            <p className="text-error text-[12px] mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">error</span>
              {t(errors.tag.message as string)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-label-sm text-on-surface-variant mb-1.5">{t('difficultyLabel')}</label>
          <select
            className={`w-full border rounded-lg px-md py-sm text-body-base focus:ring-0 transition-colors outline-none bg-surface-container-lowest cursor-pointer ${
              errors.difficulty ? 'border-error' : 'border-outline-variant focus:border-primary'
            }`}
            {...register('difficulty')}
          >
            <option value="">{t('difficultyPlaceholder')}</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
          {errors.difficulty && (
            <p className="text-error text-[12px] mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">error</span>
              {t(errors.difficulty.message as string)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-label-sm text-on-surface-variant mb-1.5">{t('estimatedTimeLabel')}</label>
          <input
            className={`w-full border rounded-lg px-md py-sm text-body-base focus:ring-0 transition-colors outline-none bg-surface-container-lowest ${
              errors.estimatedTime ? 'border-error' : 'border-outline-variant focus:border-primary'
            }`}
            placeholder={t('estimatedTimePlaceholder')}
            {...register('estimatedTime')}
          />
          {errors.estimatedTime && (
            <p className="text-error text-[12px] mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">error</span>
              {t(errors.estimatedTime.message as string)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-label-sm text-on-surface-variant mb-1.5">{t('xpLabel')}</label>
          <input
            type="number"
            min={0}
            className={`w-full border rounded-lg px-md py-sm text-body-base focus:ring-0 transition-colors outline-none bg-surface-container-lowest ${
              errors.xp ? 'border-error' : 'border-outline-variant focus:border-primary'
            }`}
            placeholder={t('xpPlaceholder')}
            {...register('xp')}
          />
          {errors.xp && (
            <p className="text-error text-[12px] mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">error</span>
              {t(errors.xp.message as string)}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
