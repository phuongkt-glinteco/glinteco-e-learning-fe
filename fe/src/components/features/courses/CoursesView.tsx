import { useTranslations } from 'next-intl';
import type { LearnerTrack } from '@/components/features/tracks/learner/types';
import { CourseCatalogCard } from './CourseCatalogCard';
import type { CourseFilterState, CourseStatusFilter, CourseSortKey } from './types';

interface CoursesViewProps {
  tracks: LearnerTrack[];
  filter: CourseFilterState;
  totalPages: number;
  totalCount: number;
  onFilterChange: (patch: Partial<CourseFilterState>) => void;
  onOpen: (trackId: string) => void;
  onRetry: () => void;
}

const statusFilters: CourseStatusFilter[] = ['all', 'in_progress', 'completed', 'locked'];
const sortOptions: { value: CourseSortKey; labelKey: string }[] = [
  { value: 'order', labelKey: 'sort_order' },
  { value: 'title', labelKey: 'sort_title' },
  { value: 'progress', labelKey: 'sort_progress' },
];

export function CoursesView({
  tracks,
  filter,
  totalPages,
  totalCount,
  onFilterChange,
  onOpen,
}: CoursesViewProps) {
  const t = useTranslations('CoursesPage');

  return (
    <div className="mx-auto max-w-container-max px-gutter py-8">
      <header className="mb-6">
        <h1 className="headline-lg text-primary">{t('title')}</h1>
        <p className="mt-2 body-md text-on-surface-variant">{t('subtitle')}</p>
      </header>

      <div className="mb-6 flex flex-col gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((value) => {
            const active = filter.status === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onFilterChange({ status: value, page: 1 })}
                className={`rounded-full px-4 py-1.5 label-sm transition-colors cursor-pointer ${
                  active
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                {t(`filter_${value}`)}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
              search
            </span>
            <input
              type="text"
              value={filter.search}
              onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
              placeholder={t('searchPlaceholder')}
              className="w-full rounded-lg border border-outline-variant bg-surface py-2 pl-9 pr-3 body-sm text-on-surface placeholder:text-outline focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary lg:w-64"
            />
          </div>

          <select
            value={filter.sort}
            onChange={(e) => onFilterChange({ sort: e.target.value as CourseSortKey, page: 1 })}
            className="rounded-lg border border-outline-variant bg-surface px-3 py-2 body-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(opt.labelKey)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between label-sm text-on-surface-variant">
        <span>{t('resultCount', { count: totalCount })}</span>
      </div>

      {tracks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest p-10 text-center">
          <span className="material-symbols-outlined text-[40px] text-outline">search_off</span>
          <h2 className="mt-2 headline-sm text-on-surface">{t('emptyTitle')}</h2>
          <p className="mt-1 body-sm text-on-surface-variant">{t('emptyDescription')}</p>
          <button
            type="button"
            onClick={() =>
              onFilterChange({ status: 'all', search: '', sort: 'order', page: 1 })
            }
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 label-sm text-on-surface hover:bg-surface-container-low cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
            {t('clearFilters')}
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tracks.map((track) => (
              <CourseCatalogCard key={track.id} track={track} onOpen={onOpen} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => onFilterChange({ page: Math.max(1, filter.page - 1) })}
                disabled={filter.page <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-2 label-sm text-on-surface hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                {t('previous')}
              </button>

              <span className="label-sm text-on-surface-variant">
                {t('pageOf', { page: filter.page, total: totalPages })}
              </span>

              <button
                type="button"
                onClick={() => onFilterChange({ page: Math.min(totalPages, filter.page + 1) })}
                disabled={filter.page >= totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-2 label-sm text-on-surface hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                {t('next')}
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
