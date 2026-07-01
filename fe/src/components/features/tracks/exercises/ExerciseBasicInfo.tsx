'use client';

import { useEffect, useState } from 'react';
import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormGetValues } from 'react-hook-form';
import { documentsControllerFindAllTags } from '@/services/api-client';
import type { TagResponseDto } from '@/services/api-client';
import type { CreateExerciseFormInput } from '@/schemas';
import { buildTimeString, type TimeUnit } from '@/lib/time-utils';
import { Input } from '@/components/ui/default/input';
import { Label } from '@/components/ui/default/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/default/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/default/card';

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
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center gap-2 pb-4">
        <span className="material-symbols-outlined text-primary">info</span>
        <CardTitle className="text-lg">{t('basicInfo')}</CardTitle>
      </CardHeader>
      <CardContent>

      <div className="grid grid-cols-2 gap-x-lg gap-y-5">
        <div className="col-span-2">
          <Label htmlFor="title" className="mb-2 block">{t('titleLabel')}</Label>
          <Input
            id="title"
            className={errors.title ? 'border-destructive focus-visible:ring-destructive' : ''}
            placeholder={t('titlePlaceholder')}
            {...register('title')}
          />
          {errors.title && (
            <p className="text-destructive text-[12px] mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-destructive">error</span>
              {t(errors.title.message as string)}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="tag" className="mb-2 block">{t('tagLabel')}</Label>
          <Select
            disabled={loadingTags}
            onValueChange={(val) => setValue('tag', val, { shouldValidate: true })}
            defaultValue={getValues('tag') as string}
          >
            <SelectTrigger id="tag" className={errors.tag ? 'border-destructive focus-visible:ring-destructive' : ''}>
              <SelectValue placeholder={loadingTags ? t('tagsLoading') : t('tagPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {tags.map((tag) => (
                <SelectItem key={tag.id} value={tag.name}>
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.tag && (
            <p className="text-destructive text-[12px] mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-destructive">error</span>
              {t(errors.tag.message as string)}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="difficulty" className="mb-2 block">{t('difficultyLabel')}</Label>
          <Select
            onValueChange={(val) => setValue('difficulty', val as any, { shouldValidate: true })}
            defaultValue={getValues('difficulty') as string}
          >
            <SelectTrigger id="difficulty" className={errors.difficulty ? 'border-destructive focus-visible:ring-destructive' : ''}>
              <SelectValue placeholder={t('difficultyPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
          {errors.difficulty && (
            <p className="text-destructive text-[12px] mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-destructive">error</span>
              {t(errors.difficulty.message as string)}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="estimatedTime" className="mb-2 block">{t('estimatedTimeLabel')}</Label>
          <div className={`flex items-center gap-2 rounded-md border bg-background px-3 transition-colors focus-within:ring-1 focus-within:ring-ring ${errors.estimatedTime ? 'border-destructive focus-within:ring-destructive' : 'border-input'}`}>
            <span className="material-symbols-outlined text-muted-foreground text-[20px] shrink-0">schedule</span>
            <input
              type="number"
              min={0}
              step="0.5"
              className="flex h-9 w-[60px] bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="0"
              value={numValue}
              onChange={(e) => handleNumChange(e.target.value)}
            />
            <Select value={unit} onValueChange={handleUnitChange}>
              <SelectTrigger className="flex-1 border-none shadow-none focus:ring-0 focus-visible:ring-0 bg-transparent text-sm h-9 px-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UNIT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {errors.estimatedTime && (
            <p className="text-destructive text-[12px] mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-destructive">error</span>
              {t(errors.estimatedTime.message as string)}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="xp" className="mb-2 block">{t('xpLabel')}</Label>
          <Input
            id="xp"
            type="number"
            min={0}
            className={errors.xp ? 'border-destructive focus-visible:ring-destructive' : ''}
            placeholder={t('xpPlaceholder')}
            {...register('xp')}
          />
          {errors.xp && (
            <p className="text-destructive text-[12px] mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-destructive">error</span>
              {t(errors.xp.message as string)}
            </p>
          )}
        </div>
      </div>
    </CardContent>
    </Card>
  );
}
