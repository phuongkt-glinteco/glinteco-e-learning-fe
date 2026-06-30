import { useTranslations } from 'next-intl';
import { TimeBadge } from '@/components/ui';
import type { LearnerTrack } from '@/components/features/tracks/learner/types';
import { getProgressPercent } from './types';

interface MyCourseCardProps {
  track: LearnerTrack;
  onOpen: (trackId: string, currentLessonId: string | null) => void;
}

export function MyCourseCard({ track, onOpen }: MyCourseCardProps) {
  const t = useTranslations('MyCoursesPage');
  const isCompleted = track.status === 'completed';
  const progress = getProgressPercent(track);

  return (
    <article
      className={`flex min-w-0 flex-col gap-4 overflow-hidden rounded-xl border bg-surface-container-lowest p-5 shadow-sm transition-all ${
        isCompleted
          ? 'border-green-200 hover:border-green-400'
          : 'border-primary ring-1 ring-primary/20 hover:border-primary/60'
      }`}
    >
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border ${
              isCompleted
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-primary/20 bg-primary-container/10 text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">
              {track.icon || (isCompleted ? 'check_circle' : 'play_circle')}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <span className="label-sm uppercase text-on-surface-variant">
              {t('milestone', { order: String(track.order).padStart(2, '0') })}
            </span>
            <h3 className="headline-sm line-clamp-2 break-words text-on-surface">{track.title}</h3>
          </div>
        </div>

        <span
          className={`inline-flex max-w-full items-center gap-1 rounded-full px-2.5 py-1 label-sm ${
            isCompleted
              ? 'bg-green-50 text-green-700'
              : 'bg-primary-fixed text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">
            {isCompleted ? 'check_circle' : 'play_circle'}
          </span>
          <span className="min-w-0 truncate">
            {isCompleted ? t('status_completed') : t('status_in_progress')}
          </span>
        </span>
      </div>

      <p className="body-sm min-w-0 line-clamp-3 break-words text-on-surface-variant">
        {track.description || t('noDescription')}
      </p>

      <div className="flex min-w-0 flex-wrap gap-3 label-sm text-on-surface-variant">
        <TimeBadge time={track.estimatedTime} />
        <span className="inline-flex min-w-0 max-w-full items-center gap-1">
          <span className="material-symbols-outlined text-[15px]">menu_book</span>
          <span className="min-w-0 truncate">{t('lessonCount', { count: track.lessonCount })}</span>
        </span>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between label-sm text-on-surface-variant">
          <span>{t('progress')}</span>
          <span className="text-on-surface">{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-surface-container">
          <div
            className={`h-full rounded-full ${isCompleted ? 'bg-green-500' : 'bg-primary'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-auto pt-2">
        <button
          type="button"
          onClick={() => onOpen(track.id, track.currentLessonId)}
          className={`inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-4 py-2 label-sm transition-colors ${
            isCompleted
              ? 'border border-outline-variant text-on-surface hover:bg-surface-container-low cursor-pointer'
              : 'bg-primary text-on-primary hover:opacity-90 cursor-pointer'
          }`}
        >
          {isCompleted ? t('review') : t('continue')}
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
    </article>
  );
}
