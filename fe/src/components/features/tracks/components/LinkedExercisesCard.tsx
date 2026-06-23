'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';
import type { ExerciseSummary } from '@/services/api-client';

interface LinkedExercisesCardProps {
  exercises?: ExerciseSummary[];
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
  exercises = [],
  onRemove,
  onAdd,
  disabled = false,
}: LinkedExercisesCardProps) {
  const [showAll, setShowAll] = useState(false);
  const display = showAll ? exercises : exercises.slice(0, 3);
  const hiddenCount = exercises.length - display.length;

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg shadow-sm sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="headline-sm text-on-surface">Linked Exercises</h3>
        {!disabled && (
          <button
            onClick={onAdd}
            className="bg-primary text-on-primary px-3 py-1.5 rounded-lg text-label-sm font-label-sm flex items-center gap-1 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Icon icon="lucide:plus" className="text-[18px]" />
            Add Exercise
          </button>
        )}
      </div>

      {disabled && (
        <p className="body-sm text-secondary text-center py-6">
          Exercises can be linked after the track is created.
        </p>
      )}

      {!disabled && exercises.length === 0 && (
        <p className="body-sm text-secondary text-center py-6">
          No linked exercises yet.
        </p>
      )}

      {!disabled && exercises.length > 0 && (
        <div className="flex flex-col gap-2">
          {display.map((ex) => (
            <div
              key={ex.id}
              className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg border border-outline-variant hover:bg-surface-container-lowest transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon icon={exerciseIcon(ex.tag)} className="text-secondary text-[20px] shrink-0" />
                <span className="body-sm text-on-surface truncate">{ex.title}</span>
              </div>
              {onRemove && (
                <button
                  onClick={() => onRemove(ex.id ?? '')}
                  className="p-1 rounded text-secondary hover:text-error opacity-0 group-hover:opacity-100 transition-all shrink-0 cursor-pointer"
                >
                  <Icon icon="lucide:x" className="text-[18px]" />
                </button>
              )}
            </div>
          ))}

          {hiddenCount > 0 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full flex items-center justify-center gap-2 py-2 text-secondary hover:text-primary hover:bg-primary/5 rounded-lg transition-all mt-2 border border-dashed border-outline-variant cursor-pointer"
            >
              <span className="label-sm">
                {showAll ? 'Show less' : `Show ${hiddenCount} more exercise${hiddenCount > 1 ? 's' : ''}`}
              </span>
              <Icon
                icon={showAll ? 'lucide:chevron-up' : 'lucide:chevron-down'}
                className="text-[18px]"
              />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
