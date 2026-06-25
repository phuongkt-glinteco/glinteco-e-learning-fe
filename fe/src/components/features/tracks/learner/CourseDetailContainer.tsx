'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Skeleton from '@/components/ui/loading/Skeleton';
import { CourseDetailView } from './CourseDetailView';
import type { LearnerTrack, TrackLessonPreview } from './types';
import { fetchCourseDetail } from './courseLearningApi';
import {
  getErrorStatus,
  getErrorMessage,
  getRouteParam,
} from './utils';

function CourseDetailLoadingState() {
  return (
    <section className="mx-auto max-w-container-max px-gutter py-8">
      <Skeleton width={240} height={28} rounded="rounded" className="mb-5" />
      <Skeleton height={240} className="mb-6" />
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Skeleton height={128} />
          <Skeleton height={128} />
          <Skeleton height={128} />
        </div>
        <div className="space-y-4">
          <Skeleton height={160} />
          <Skeleton height={136} />
        </div>
      </div>
    </section>
  );
}

function CourseDetailErrorState({
  title,
  message,
  onBack,
  onRetry,
}: {
  title: string;
  message: string;
  onBack: () => void;
  onRetry: () => void;
}) {
  return (
    <section className="mx-auto max-w-[760px] px-gutter py-8">
      <div className="rounded-lg border border-error-container bg-error-container/40 p-6 text-error">
        <h1 className="headline-sm">{title}</h1>
        <p className="body-sm mt-2">{message}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 label-sm text-on-surface hover:bg-surface-container-low cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to tracks
          </button>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 label-sm text-on-primary hover:opacity-90 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            Retry
          </button>
        </div>
      </div>
    </section>
  );
}

export default function CourseDetailContainer() {
  const params = useParams();
  const router = useRouter();
  const courseId = getRouteParam(params.courseId ?? params.trackId);

  const [track, setTrack] = useState<LearnerTrack | null>(null);
  const [lessons, setLessons] = useState<TrackLessonPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCourseDetail = useCallback(async () => {
    if (!courseId) {
      setError('Missing course route parameter.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const courseDetail = await fetchCourseDetail(courseId);
      setLessons(courseDetail.lessons);
      setTrack(courseDetail.course);
    } catch (loadError: unknown) {
      setError(getErrorMessage(loadError, 'Failed to load course details.'));
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadCourseDetail();
  }, [loadCourseDetail]);

  const currentLessonId = useMemo(() => (
    track?.currentLessonId
      ?? lessons.find((lesson) => !lesson.completed)?.id
      ?? lessons[0]?.id
      ?? null
  ), [lessons, track?.currentLessonId]);

  function handleOpenLesson(lessonId: string) {
    router.push(`/courses/${courseId}/lessons/${lessonId}`);
  }

  function handleContinueCourse() {
    if (!currentLessonId) return;
    handleOpenLesson(currentLessonId);
  }

  if (loading) return <CourseDetailLoadingState />;

  if (error || !track) {
    const errorTitle = getErrorStatus(error) === 404 || /not found/i.test(error ?? '')
      ? 'Course not found'
      : 'Course not available';

    return (
      <CourseDetailErrorState
        title={errorTitle}
        message={error ?? 'Track was not found.'}
        onBack={() => router.push('/courses')}
        onRetry={loadCourseDetail}
      />
    );
  }

  return (
    <CourseDetailView
      track={track}
      lessons={lessons}
      currentLessonId={currentLessonId}
      onBackToTracks={() => router.push('/courses')}
      onContinueCourse={handleContinueCourse}
      onOpenLesson={handleOpenLesson}
    />
  );
}
