import { useTranslations } from 'next-intl';
import { TimeBadge } from '@/components/ui';
import type { LearnerTrack } from '@/components/features/tracks/learner/types';
import { getProgressPercent } from './types';

interface CourseCatalogCardProps {
  track: LearnerTrack;
  onOpen: (trackId: string) => void;
}

const statusIcon: Record<LearnerTrack['status'], string> = {
  completed: 'check_circle',
  in_progress: 'play_circle',
  locked: 'lock',
};

export function CourseCatalogCard({ track, onOpen }: CourseCatalogCardProps) {
  const t = useTranslations('CoursesPage');
  const isLocked = track.status === 'locked';
  const isCompleted = track.status === 'completed';
  const isInProgress = track.status === 'in_progress';
  const progress = getProgressPercent(track);

  const statusLabel = t(`status_${track.status}`);

  return (
    <article
      className={`flex min-w-0 flex-col gap-4 overflow-hidden rounded-xl border bg-surface-container-lowest p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        isLocked
          ? 'border-dashed border-outline-variant/80 opacity-70'
          : isInProgress
            ? 'border-primary/60 ring-1 ring-primary/15 hover:border-primary/60'
            : 'border-outline-variant/70 hover:border-primary/40'
      }`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border ${
              isLocked
                ? 'border-outline-variant bg-surface-container text-outline'
                : isCompleted
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-primary/20 bg-primary-container/10 text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">
              {track.icon || statusIcon[track.status]}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <span className="label-sm uppercase text-on-surface-variant">
              {t('milestone', { order: String(track.order).padStart(2, '0') })}
            </span>
            <h3 className="headline-sm text-on-surface line-clamp-2 break-words">{track.title}</h3>
          </div>
        </div>
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
        <span
          className={`inline-flex w-fit max-w-full items-center gap-1 rounded-full px-2.5 py-1 label-sm ${
            isLocked
              ? 'bg-surface-container text-outline'
              : isCompleted
                ? 'bg-green-50 text-green-700'
                : 'bg-primary-fixed text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">
            {statusIcon[track.status]}
          </span>
          <span className="min-w-0 truncate">{statusLabel}</span>
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

      {track.lockedReason && isLocked && (
        <p className="body-sm line-clamp-3 break-words text-on-surface-variant italic">
          {track.lockedReason}
        </p>
      )}

      <div className="mt-auto pt-2">
        {isLocked ? (
          <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-outline-variant px-4 py-2 label-sm text-outline cursor-not-allowed">
            <span className="material-symbols-outlined text-[16px]">lock</span>
            {t('locked')}
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onOpen(track.id)}
            className={`inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-4 py-2 label-sm transition-colors ${
              isInProgress
                ? 'bg-primary text-on-primary hover:opacity-90 cursor-pointer'
                : 'border border-outline-variant text-on-surface hover:bg-surface-container-low cursor-pointer'
            }`}
          >
            {isCompleted ? t('review') : t('continue')}
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        )}
      </div>
    </article>
  );
}
