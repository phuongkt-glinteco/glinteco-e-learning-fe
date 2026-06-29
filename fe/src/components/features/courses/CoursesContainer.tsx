'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchCourses } from '@/components/features/tracks/learner/courseLearningApi';
import { getErrorMessage } from '@/components/features/tracks/learner/utils';
import type { LearnerTrack } from '@/components/features/tracks/learner/types';
import Skeleton from '@/components/ui/loading/Skeleton';
import { CoursesView } from './CoursesView';
import {
  DEFAULT_FILTER,
  PAGE_SIZE,
  filterCourses,
  paginate,
  type CourseFilterState,
} from './types';

function CoursesLoadingState() {
  return (
    <div className="mx-auto max-w-container-max px-gutter py-8">
      <Skeleton width={240} height={32} className="mb-6" />
      <Skeleton height={64} className="mb-6" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} height={220} />
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

export default function CoursesContainer() {
  const router = useRouter();
  const [tracks, setTracks] = useState<LearnerTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<CourseFilterState>(DEFAULT_FILTER);

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

  const filtered = useMemo(() => filterCourses(tracks, filter), [tracks, filter]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(filter.page, totalPages);
  const paged = useMemo(() => paginate(filtered, safePage, PAGE_SIZE), [filtered, safePage]);

  function handleFilterChange(patch: Partial<CourseFilterState>) {
    setFilter((prev) => ({ ...prev, ...patch }));
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
