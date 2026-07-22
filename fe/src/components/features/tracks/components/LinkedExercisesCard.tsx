'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { useTranslations } from 'next-intl';
import type { ExerciseSummaryDto } from '@/services/api-client';
import { isTrackDirectExercise } from '../utils';
import { TrackExercisesActionsDropdown } from './TrackExercisesActionsDropdown';
import { TrackExercisesManagerModal } from './TrackExercisesManagerModal';

interface LinkedExercisesCardProps {
  trackId: string;
  exercises?: ExerciseSummaryDto[];
  onRemove?: (id: string) => void;
  onAdd?: () => void;
  disabled?: boolean;
}

const ICON_MAP: Record<string, string> = {
  quiz: 'lucide:help-circle',
  assignment: 'lucide:file-text',
  code: 'lucide:code',
  lab: 'lucide:flask',
  default: 'lucide:clipboard-list',
};

function exerciseIcon(tag?: string): string {
  if (!tag) return ICON_MAP.default;
  return ICON_MAP[tag.toLowerCase()] ?? ICON_MAP.default;
}

export function LinkedExercisesCard({
  trackId,
  exercises = [],
  onRemove,
  onAdd,
  disabled = false,
}: LinkedExercisesCardProps) {
  const t = useTranslations('LinkedExercisesCard');
  const filteredExercises = useMemo(() => exercises.filter(isTrackDirectExercise), [exercises]);
  const [managerModalOpen, setManagerModalOpen] = useState(false);

  return (
    <>
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg shadow-sm sticky top-24">
        <div className="flex items-center justify-between mb-6">
          <h3 className="headline-sm text-on-surface">{t('title')}</h3>
          {!disabled && (
            <button
              onClick={onAdd}
              className="bg-primary text-on-primary px-3 py-1.5 rounded-lg text-label-sm font-label-sm flex items-center gap-1 hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Icon icon="lucide:plus" className="text-[18px]" />
              {t('addExercise')}
            </button>
          )}
        </div>

        {disabled && (
          <p className="body-sm text-secondary text-center py-6">
            {t('disabledText')}
          </p>
        )}

        {!disabled && filteredExercises.length === 0 && (
          <p className="body-sm text-secondary text-center py-6">
            {t('noExercises')}
          </p>
        )}

        {!disabled && filteredExercises.length > 0 && (
          <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto custom-scrollbar pr-1">
            {filteredExercises.slice(0, 3).map((ex) => (
              <div
                key={ex.id}
                className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg border border-outline-variant hover:bg-surface-container-lowest transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Icon icon={exerciseIcon(ex.tag)} className="text-secondary text-[20px] shrink-0" />
                  <span className="body-sm text-on-surface truncate font-medium">{ex.title}</span>
                </div>
                {onRemove && (
                  <div className="shrink-0 self-center ml-2">
                    <TrackExercisesActionsDropdown
                      trackId={trackId}
                      exerciseId={ex.id!}
                      onDelete={() => onRemove(ex.id ?? '')}
                    />
                  </div>
                )}
              </div>
            ))}

            {filteredExercises.length > 3 && (
              <button
                type="button"
                onClick={() => setManagerModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2 text-primary hover:text-primary-dark hover:bg-primary/5 rounded-lg transition-all mt-2 border border-dashed border-primary/30 cursor-pointer font-bold text-xs"
              >
                <span className="label-sm">
                  {t('viewAllAndManage', {
                    count: filteredExercises.length,
                    defaultValue: `Xem & quản lý tất cả (${filteredExercises.length})`,
                  })}
                </span>
                <Icon icon="lucide:arrow-up-right" className="text-[16px]" />
              </button>
            )}
          </div>
        )}
      </div>

      <TrackExercisesManagerModal
        open={managerModalOpen}
        onOpenChange={setManagerModalOpen}
        trackId={trackId}
        exercises={exercises}
        onDeleteExercise={(id) => onRemove?.(id)}
      />
    </>
  );
}
