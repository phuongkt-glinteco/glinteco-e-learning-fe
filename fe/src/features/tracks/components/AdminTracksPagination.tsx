import { useTranslations } from 'next-intl';
import type { AdminTracksPagination as AdminTracksPaginationState } from '../types';

interface AdminTracksPaginationProps {
  pagination: AdminTracksPaginationState;
  onPageChange: (page: number) => void;
}

export function AdminTracksPagination({ pagination, onPageChange }: AdminTracksPaginationProps) {
  const t = useTranslations('AdminTracksPage');
  const { total, page, limit, lastPage } = pagination;
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="body-sm text-on-surface-variant">
        {t('paginationSummary', {
          start,
          end,
          total,
          page,
          limit,
          lastPage,
        })}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-outline-variant px-3 label-sm text-on-surface hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          {t('previousPage')}
        </button>
        <span className="min-w-20 text-center label-sm text-on-surface">
          {t('pageLabel', { page, lastPage })}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= lastPage}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-outline-variant px-3 label-sm text-on-surface hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t('nextPage')}
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      </div>
    </div>
  );
}
