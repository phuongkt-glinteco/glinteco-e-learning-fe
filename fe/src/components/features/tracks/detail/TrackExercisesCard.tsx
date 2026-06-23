'use client';

import { useTranslations } from 'next-intl';
import type { ExerciseSummary } from '@/services/api-client';

interface TrackExercisesCardProps {
  exercises?: ExerciseSummary[];
  activeExerciseId?: string;
}

export function TrackExercisesCard({
  exercises = [],
  activeExerciseId,
}: TrackExercisesCardProps) {
  const t = useTranslations('TrackPreview');

  if (exercises.length === 0) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-primary">assignment</span>
          <h3 className="font-headline-sm text-[18px] text-on-surface">{t('exercisesTitle')}</h3>
          <span className="ml-auto bg-surface-container-low text-on-surface-variant text-label-sm font-label-sm px-2 py-0.5 rounded-full">
            {t('exercisesTotal', { count: 0 })}
          </span>
        </div>
        <p className="body-sm text-secondary text-center py-6">
          {t('noExercises')}
        </p>
      </div>
    );
  }

  // Determine which exercise is unlocked.
  // If activeExerciseId is passed, that exercise and preceding ones are unlocked.
  // Otherwise, default to unlocking the first exercise.
  const unlockedIndex = activeExerciseId
    ? exercises.findIndex((e) => e.id === activeExerciseId)
    : 0;

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <span className="material-symbols-outlined text-primary">assignment</span>
        <h3 className="font-headline-sm text-[18px] text-on-surface">{t('exercisesTitle')}</h3>
        <span className="ml-auto bg-surface-container-low text-on-surface-variant text-label-sm font-label-sm px-2 py-0.5 rounded-full">
          {t('exercisesTotal', { count: exercises.length })}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {exercises.map((ex, index) => {
          const isLocked = index > unlockedIndex;

          if (isLocked) {
            return (
              <div
                key={ex.id || index}
                className="border border-outline-variant rounded-lg p-3 flex items-start gap-3 opacity-50 bg-surface-container-lowest"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary mt-0.5">
                  lock
                </span>
                <p className="font-label-md text-label-md text-on-surface-variant">
                  {ex.title}
                </p>
              </div>
            );
          }

          return (
            <div
              key={ex.id || index}
              className="border border-primary rounded-lg p-3 flex items-start gap-3 bg-surface-container-low relative"
            >
              <div className="absolute -left-[1px] top-3 bottom-3 w-1 bg-primary rounded-r"></div>
              <span className="material-symbols-outlined text-[18px] text-primary mt-0.5">
                radio_button_unchecked
              </span>
              <div className="flex-1">
                <p className="font-label-md text-label-md text-primary font-bold">
                  {ex.title}
                </p>
                {ex.brief && (
                  <p className="font-body-sm text-body-sm text-primary/80 mt-1">
                    {ex.brief}
                  </p>
                )}
              </div>
              <span className="material-symbols-outlined text-secondary text-[18px]">
                chevron_right
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
