'use client';

import { useEffect, useState } from 'react';
import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormGetValues } from 'react-hook-form';
import { documentsControllerFindAllTags } from '@/services/api-client';
import type { TagResponseDto } from '@/services/api-client';
import type { CreateExerciseFormInput } from '@/schemas';
import { buildTimeString, type TimeUnit } from '@/lib/time-utils';

const UNIT_OPTIONS: { value: TimeUnit; label: string }[] = [
  { value: 'm', label: 'Minutes' },
  { value: 'h', label: 'Hours' },
  { value: 'd', label: 'Days' },
  { value: 'w', label: 'Weeks' },
  { value: 'M', label: 'Months' },
];

interface ExerciseBasicInfoProps {
  register: UseFormRegister<CreateExerciseFormInput>;
  errors: FieldErrors<CreateExerciseFormInput>;
  setValue: UseFormSetValue<CreateExerciseFormInput>;
  getValues: UseFormGetValues<CreateExerciseFormInput>;
  t: (key: string) => string;
}

export default function ExerciseBasicInfo({ register, errors, setValue, getValues, t }: ExerciseBasicInfoProps) {
  const [tags, setTags] = useState<TagResponseDto[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);

  const [numValue, setNumValue] = useState('');
  const [unit, setUnit] = useState<TimeUnit>('m');

  const currentEstimated = (getValues('estimatedTime') as string) || '';
  useEffect(() => {
    const match = currentEstimated.match(/^(\d+(?:\.\d+)?)(m|h|d|w|M)$/);
    setNumValue(match ? match[1] : '');
    setUnit(match ? (match[2] as TimeUnit) : 'm');
  }, [currentEstimated]);

  function handleNumChange(value: string) {
    setNumValue(value);
    if (value && !isNaN(Number(value))) {
      setValue('estimatedTime', buildTimeString(Number(value), unit), { shouldValidate: true });
    } else {
      setValue('estimatedTime', '', { shouldValidate: true });
    }
  }

  function handleUnitChange(newUnit: string) {
    const u = newUnit as TimeUnit;
    setUnit(u);
    if (numValue && !isNaN(Number(numValue))) {
      setValue('estimatedTime', buildTimeString(Number(numValue), u), { shouldValidate: true });
    }
  }

  useEffect(() => {
    setLoadingTags(true);
    documentsControllerFindAllTags({ throwOnError: true })
      .then((res) => setTags((res.data as TagResponseDto[] | undefined) ?? []))
      .catch(() => setTags([]))
      .finally(() => setLoadingTags(false));
  }, []);

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
          <select
            className={`w-full border rounded-lg px-md py-sm text-body-base focus:ring-0 transition-colors outline-none bg-surface-container-lowest ${
              errors.tag ? 'border-error' : 'border-outline-variant focus:border-primary'
            }`}
            disabled={loadingTags}
            {...register('tag')}
          >
            <option value="">{loadingTags ? t('tagsLoading') : t('tagPlaceholder')}</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.name}>
                {tag.name}
              </option>
            ))}
          </select>
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
          <div className={`flex items-center gap-2 border rounded-lg px-3 py-2 bg-surface-container-lowest focus-within:border-primary transition-colors ${
            errors.estimatedTime ? 'border-error' : 'border-outline-variant'
          }`}>
            <span className="material-symbols-outlined text-secondary text-[20px] shrink-0">schedule</span>
            <input
              type="number"
              min={0}
              step="0.5"
              className="w-[60px] border-none p-0 focus:ring-0 bg-transparent text-body-base font-medium outline-none"
              placeholder="0"
              value={numValue}
              onChange={(e) => handleNumChange(e.target.value)}
            />
            <select
              className="flex-1 border-none bg-transparent text-body-sm text-secondary outline-none cursor-pointer appearance-none pr-4 bg-no-repeat bg-[right_0_center]"
              value={unit}
              onChange={(e) => handleUnitChange(e.target.value)}
            >
              {UNIT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
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
