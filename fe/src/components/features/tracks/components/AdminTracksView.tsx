import { useTranslations } from 'next-intl';
import { AppButton } from '@/components/ui/buttons';
import { AdminTrackList } from './AdminTrackList';
import { AdminTracksPagination } from './AdminTracksPagination';
import type { AdminTrackItem, AdminTracksPagination as AdminTracksPaginationState } from '../types';

interface AdminTracksViewProps {
  tracks: AdminTrackItem[];
  pagination: AdminTracksPaginationState;
  loadError: string | null;
  actionError: string | null;
  deletingId: string | null;
  reorderingId: string | null;
  onCreateTrack: () => void;
  onEditTrack: (trackId: string) => void;
  onDeleteTrack: (trackId: string) => void;
  onMoveTrack: (trackId: string, direction: 'up' | 'down') => void;
  onPageChange: (page: number) => void;
  onRetry: () => void;
}

export function AdminTracksView({
  tracks,
  pagination,
  loadError,
  actionError,
  deletingId,
  reorderingId,
  onCreateTrack,
  onEditTrack,
  onDeleteTrack,
  onMoveTrack,
  onPageChange,
  onRetry,
}: AdminTracksViewProps) {
  const t = useTranslations('AdminTracksPage');

  return (
    <div className="p-8">
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">{t('title')}</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">{t('subtitle')}</p>
        </div>
        <AppButton icon="lucide:plus" onClick={onCreateTrack}>
          {t('createTrack')}
        </AppButton>
      </div>

      {loadError ? (
        <div className="rounded-lg border border-error-container bg-error-container/40 p-6 text-error">
          <h2 className="headline-sm">{t('loadError')}</h2>
          <p className="body-sm mt-2">{loadError}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 label-sm text-on-primary hover:opacity-90 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            {t('retry')}
          </button>
        </div>
      ) : tracks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest p-10 text-center">
          <span className="material-symbols-outlined text-[40px] text-outline">route</span>
          <h2 className="mt-2 headline-sm text-on-surface">{t('emptyTitle')}</h2>
          <p className="mt-1 body-sm text-on-surface-variant">{t('emptyDescription')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {actionError && (
            <div className="rounded-lg border border-error-container bg-error-container/30 p-4 body-sm text-error">
              {actionError}
            </div>
          )}
          <AdminTracksPagination pagination={pagination} onPageChange={onPageChange} />
          <AdminTrackList
            tracks={tracks}
            pagination={pagination}
            deletingId={deletingId}
            reorderingId={reorderingId}
            onEditTrack={onEditTrack}
            onDeleteTrack={onDeleteTrack}
            onMoveTrack={onMoveTrack}
          />
        </div>
      )}
    </div>
  );
}
