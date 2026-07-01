'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { fetchCourses } from '@/components/features/tracks/learner/courseLearningApi';
import { getErrorMessage } from '@/components/features/tracks/learner/utils';
import type { LearnerTrack } from '@/components/features/tracks/learner/types';
import { Skeleton } from '@/components/ui/default/skeleton';
import { CoursesView } from './CoursesView';
import {
  DEFAULT_FILTER,
  PAGE_SIZE,
  filterCourses,
  paginate,
  type CourseFilterState,
  type CourseSortKey,
  type CourseStatusFilter,
} from './types';
import { useBreadcrumbStore } from '@/stores/breadcrumbStore';
import { useTranslations } from 'next-intl';

function CoursesLoadingState() {
  return (
    <div className="w-full mx-auto max-w-container-max px-gutter py-8">
      <Skeleton className="w-[240px] h-8 mb-6" />
      <Skeleton className="w-full h-16 mb-6" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="w-full h-[220px]" />
        ))}
      </div>
    </div>
  );
}

function CoursesErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="mx-auto max-w-container-max px-gutter py-8">
      <div className="rounded-lg border border-error-container bg-error-container/40 p-6 text-error">
        <h2 className="headline-sm">Error loading courses</h2>
        <p className="body-sm mt-2">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 label-sm text-on-primary hover:opacity-90 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          Retry
        </button>
      </div>
    </div>
  );
}

const SEARCH_DEBOUNCE_MS = 400;
type ReadonlyQueryParams = Pick<URLSearchParams, 'get'>;

function getSearchQuery(searchParams: ReadonlyQueryParams): string {
  return searchParams.get('q') ?? searchParams.get('search') ?? DEFAULT_FILTER.search;
}

function parseStatusQuery(value: string | null): CourseStatusFilter {
  switch (value) {
    case 'in-progress':
    case 'in_progress':
      return 'in_progress';
    case 'completed':
      return 'completed';
    case 'locked':
      return 'locked';
    default:
      return DEFAULT_FILTER.status;
  }
}

function formatStatusQuery(value: CourseStatusFilter): string | null {
  if (value === DEFAULT_FILTER.status) return null;
  return value === 'in_progress' ? 'in-progress' : value;
}

function parseSortQuery(value: string | null): CourseSortKey {
  switch (value) {
    case 'title':
    case 'progress':
      return value;
    default:
      return DEFAULT_FILTER.sort;
  }
}

function parsePageQuery(value: string | null): number {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : DEFAULT_FILTER.page;
}

export default function CoursesContainer() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [tracks, setTracks] = useState<LearnerTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const urlSearch = useMemo(() => getSearchQuery(searchParams), [searchParams]);
  const [searchInput, setSearchInput] = useState(urlSearch);
  const { setTree } = useBreadcrumbStore();
  const t = useTranslations('CoursesPage');

  const urlFilter = useMemo(
    (): Omit<CourseFilterState, 'search'> => ({
      status: parseStatusQuery(searchParams.get('status')),
      sort: parseSortQuery(searchParams.get('sort')),
      page: parsePageQuery(searchParams.get('page')),
    }),
    [searchParams],
  );

  const filter = useMemo(
    (): CourseFilterState => ({
      ...urlFilter,
      search: searchInput,
    }),
    [searchInput, urlFilter],
  );

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const courses = await fetchCourses();
      setTracks(courses);
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Failed to fetch courses.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  useEffect(() => {
    setTree([{ label: t('courses', { defaultValue: 'Courses' }), href: '/courses' }]);
  }, [setTree, t]);

  const replaceQuery = useCallback(
    (patch: Partial<CourseFilterState>) => {
      const params = new URLSearchParams(searchParams.toString());

      if (patch.status !== undefined) {
        const nextStatus = formatStatusQuery(patch.status);
        if (nextStatus) {
          params.set('status', nextStatus);
        } else {
          params.delete('status');
        }
      }

      if (patch.sort !== undefined) {
        if (patch.sort === DEFAULT_FILTER.sort) {
          params.delete('sort');
        } else {
          params.set('sort', patch.sort);
        }
      }

      if (patch.page !== undefined) {
        if (patch.page <= DEFAULT_FILTER.page) {
          params.delete('page');
        } else {
          params.set('page', String(patch.page));
        }
      }

      if (patch.search !== undefined) {
        params.delete('search');
        if (patch.search.trim()) {
          params.set('q', patch.search);
        } else {
          params.delete('q');
        }
      }

      const currentQuery = searchParams.toString();
      const nextQuery = params.toString();
      if (nextQuery === currentQuery) return;

      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    if (searchInput === urlSearch) return;

    const timeoutId = window.setTimeout(() => {
      replaceQuery({ search: searchInput, page: DEFAULT_FILTER.page });
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [replaceQuery, searchInput, urlSearch]);

  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  const filtered = useMemo(() => filterCourses(tracks, filter), [tracks, filter]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(filter.page, totalPages);
  const paged = useMemo(() => paginate(filtered, safePage, PAGE_SIZE), [filtered, safePage]);

  function handleFilterChange(patch: Partial<CourseFilterState>) {
    if (patch.search !== undefined) {
      setSearchInput(patch.search);
    }

    const queryPatch: Partial<CourseFilterState> = {};
    if (patch.status !== undefined) queryPatch.status = patch.status;
    if (patch.sort !== undefined) queryPatch.sort = patch.sort;
    if (patch.page !== undefined) queryPatch.page = patch.page;

    if (Object.keys(queryPatch).length > 0) {
      replaceQuery(queryPatch);
    }
  }

  function handleOpen(trackId: string) {
    router.push(`/courses/${trackId}`);
  }

  if (loading) return <CoursesLoadingState />;

  if (error) {
    return <CoursesErrorState message={error} onRetry={loadCourses} />;
  }

  return (
    <CoursesView
      tracks={paged}
      filter={{ ...filter, page: safePage }}
      totalPages={totalPages}
      totalCount={filtered.length}
      onFilterChange={handleFilterChange}
      onOpen={handleOpen}
      onRetry={loadCourses}
    />
  );
}
