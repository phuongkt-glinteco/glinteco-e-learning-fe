import { useTranslations } from 'next-intl';
import type { LearnerTrack } from '@/components/features/tracks/learner/types';
import { CourseCatalogCard } from './CourseCatalogCard';
import type { CourseFilterState, CourseStatusFilter, CourseSortKey } from './types';
import { Button } from '@/components/ui/default/button';
import { Input } from '@/components/ui/default/input';

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
        <h1 className="text-[32px] font-bold text-primary">{t('title')}</h1>
        <p className="mt-2 text-[16px] text-on-surface-variant">{t('subtitle')}</p>
      </header>

      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((value) => {
            const active = filter.status === value;
            return (
              <Button
                key={value}
                variant={active ? 'default' : 'secondary'}
                onClick={() => onFilterChange({ status: value, page: 1 })}
                className="rounded-full px-4 py-1.5 h-8 text-[14px]"
              >
                {t(`filter_${value}`)}
              </Button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full lg:w-64">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
              search
            </span>
            <Input
              type="text"
              value={filter.search}
              onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
              placeholder={t('searchPlaceholder')}
              className="pl-9 h-10 w-full"
            />
          </div>

          <select
            value={filter.sort}
            onChange={(e) => onFilterChange({ sort: e.target.value as CourseSortKey, page: 1 })}
            className="h-10 rounded-lg border border-outline-variant bg-surface px-3 py-2 text-[14px] text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(opt.labelKey)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between text-[14px] font-medium text-on-surface-variant">
        <span>{t('resultCount', { count: totalCount })}</span>
      </div>

      {tracks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest p-10 text-center">
          <span className="material-symbols-outlined text-[40px] text-outline">search_off</span>
          <h2 className="mt-2 text-[20px] font-semibold text-on-surface">{t('emptyTitle')}</h2>
          <p className="mt-1 text-[14px] text-on-surface-variant">{t('emptyDescription')}</p>
          <Button
            variant="outline"
            onClick={() => onFilterChange({ status: 'all', search: '', sort: 'order', page: 1 })}
            className="mt-4 gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
            {t('clearFilters')}
          </Button>
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
              <Button
                variant="outline"
                onClick={() => onFilterChange({ page: Math.max(1, filter.page - 1) })}
                disabled={filter.page <= 1}
                className="gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                {t('previous')}
              </Button>

              <span className="text-[14px] font-medium text-on-surface-variant px-2">
                {t('pageOf', { page: filter.page, total: totalPages })}
              </span>

              <Button
                variant="outline"
                onClick={() => onFilterChange({ page: Math.min(totalPages, filter.page + 1) })}
                disabled={filter.page >= totalPages}
                className="gap-1"
              >
                {t('next')}
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
