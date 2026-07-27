'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchCourses } from '@/components/features/tracks/learner/courseLearningApi';
import { getErrorMessage } from '@/components/features/tracks/learner/utils';
import type { LearnerTrack } from '@/components/features/tracks/learner/types';
import Skeleton from '@/components/ui/loading/Skeleton';
import { MyCoursesView } from './MyCoursesView';
import {
  filterMyCourses,
  hasAnyActiveCourse,
  type MyCourseTab,
} from './types';

function MyCoursesLoadingState() {
  return (
    <div className="mx-auto max-w-container-max px-gutter py-8">
      <Skeleton width={240} height={32} className="mb-6" />
      <Skeleton height={48} className="mb-6 w-fit" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} height={220} />
        ))}
      </div>
    </div>
  );
}

function MyCoursesErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="mx-auto max-w-container-max px-gutter py-8">
      <div className="rounded-lg border border-error-container bg-error-container/40 p-6 text-error">
        <h2 className="headline-sm">Error loading your courses</h2>
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

export default function MyCoursesContainer() {
  const router = useRouter();
  const [tracks, setTracks] = useState<LearnerTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<MyCourseTab>('in_progress');

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const courses = await fetchCourses();
      setTracks(courses);
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Failed to fetch your courses.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const inProgressList = useMemo(
    () => filterMyCourses(tracks, 'in_progress'),
    [tracks]
  );
  const completedList = useMemo(
    () => filterMyCourses(tracks, 'completed'),
    [tracks]
  );
  const hasActive = useMemo(() => hasAnyActiveCourse(tracks), [tracks]);

  const visibleTracks = activeTab === 'in_progress' ? inProgressList : completedList;

  const handleOpen = useCallback(
    (trackId: string, currentLessonId: string | null) => {
      if (currentLessonId) {
        router.push(`/courses/${trackId}/lessons/${currentLessonId}`);
      } else {
        router.push(`/courses/${trackId}`);
      }
    },
    [router]
  );

  if (loading) return <MyCoursesLoadingState />;

  if (error) {
    return <MyCoursesErrorState message={error} onRetry={loadCourses} />;
  }

  return (
    <MyCoursesView
      tracks={visibleTracks}
      activeTab={activeTab}
      inProgressCount={inProgressList.length}
      completedCount={completedList.length}
      hasAnyActiveCourse={hasActive}
      onTabChange={setActiveTab}
      onOpen={handleOpen}
    />
  );
}
