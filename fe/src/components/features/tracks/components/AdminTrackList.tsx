import { useTranslations } from 'next-intl';
import type { AdminTrackItem, AdminTracksPagination } from '../types';

interface AdminTrackListProps {
  tracks: AdminTrackItem[];
  pagination: AdminTracksPagination;
  deletingId: string | null;
  reorderingId: string | null;
  onEditTrack: (trackId: string) => void;
  onDeleteTrack: (trackId: string) => void;
  onMoveTrack: (trackId: string, direction: 'up' | 'down') => void;
}

export function AdminTrackList({
  tracks,
  pagination,
  deletingId,
  reorderingId,
  onEditTrack,
  onDeleteTrack,
  onMoveTrack,
}: AdminTrackListProps) {
  const t = useTranslations('AdminTracksPage');
  const pageStartIndex = (pagination.page - 1) * pagination.limit;
  const isAnyTrackReordering = Boolean(reorderingId);

  return (
    <div className="flex flex-col gap-3">
      {tracks.map((track, index) => {
        const globalIndex = pageStartIndex + index;
        const isGlobalFirst = globalIndex === 0;
        const isGlobalLast = globalIndex >= pagination.total - 1;

        return (
          <article
            key={track.id}
            className="flex flex-col gap-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-outline-variant bg-surface-container text-primary">
                <span className="material-symbols-outlined text-[24px]">{track.icon}</span>
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="label-sm uppercase text-on-surface-variant">
                    {t('orderLabel', { order: String(globalIndex + 1).padStart(2, '0') })}
                  </span>
                  <span className="inline-flex items-center gap-1 label-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-[14px]">menu_book</span>
                    {t('lessonCount', { count: track.lessonCount })}
                  </span>
                  <span className="inline-flex items-center gap-1 label-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                    {track.estimatedTime}
                  </span>
                </div>
                <h3 className="mt-1 headline-sm text-on-surface truncate">{track.title}</h3>
                {track.description && (
                  <p className="mt-1 body-sm text-on-surface-variant line-clamp-1">{track.description}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <div className="flex items-center rounded-lg border border-outline-variant">
                <button
                  type="button"
                  title={t('moveUp')}
                  aria-label={t('moveUp')}
                  onClick={() => onMoveTrack(track.id, 'up')}
                  disabled={isGlobalFirst || isAnyTrackReordering}
                  className="inline-flex h-10 w-10 items-center justify-center text-on-surface hover:bg-surface-container-low transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-[18px]">keyboard_arrow_up</span>
                </button>
                <button
                  type="button"
                  title={t('moveDown')}
                  aria-label={t('moveDown')}
                  onClick={() => onMoveTrack(track.id, 'down')}
                  disabled={isGlobalLast || isAnyTrackReordering}
                  className="inline-flex h-10 w-10 items-center justify-center border-l border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => onEditTrack(track.id)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant px-4 py-2 label-sm text-on-surface hover:bg-surface-container-low cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                {t('edit')}
              </button>
              <button
                type="button"
                onClick={() => onDeleteTrack(track.id)}
                disabled={deletingId === track.id}
                className="inline-flex items-center gap-1.5 rounded-lg border border-error-container px-4 py-2 label-sm text-error hover:bg-error-container/10 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {deletingId === track.id ? 'progress_activity' : 'delete'}
                </span>
                {deletingId === track.id ? t('deleting') : t('delete')}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
