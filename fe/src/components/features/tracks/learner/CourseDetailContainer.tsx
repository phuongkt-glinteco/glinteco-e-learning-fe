'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getTracksById, getTracksByIdLessons } from '@/services/api-client';
import type {
  LessonProgressItem,
  LessonSummary,
  TrackDetail,
} from '@/services/api-client';
import Skeleton from '@/components/ui/loading/Skeleton';
import { CourseDetailView } from './CourseDetailView';
import type { LearnerTrack, TrackLessonPreview, TrackStatus } from './types';

const DEFAULT_STATUS: TrackStatus = 'locked';

function getRouteParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
}

function normalizeTrack(
  track: TrackDetail,
  trackId: string,
  lessons: TrackLessonPreview[]
): LearnerTrack {
  const lessonCount = lessons.length;
  const lessonsCompleted = track.lessonsCompleted
    ?? lessons.filter((lesson) => lesson.completed).length;

  return {
    id: track.id ?? trackId,
    title: track.title?.trim() || 'Untitled track',
    description: track.description?.trim() || 'Track details are being prepared.',
    estimatedTime: track.estimatedTime?.trim() || 'TBD',
    lessonCount,
    lessonsCompleted,
    order: track.order ?? 1,
    status: track.status ?? DEFAULT_STATUS,
    icon: track.icon,
  };
}

function normalizeLessonPreview(
  lesson: LessonSummary,
  index: number,
  progressLesson?: LessonProgressItem
): TrackLessonPreview | null {
  const id = progressLesson?.id ?? lesson.id;
  if (!id) return null;

  return {
    id,
    title: lesson.title?.trim() || progressLesson?.title?.trim() || 'Untitled lesson',
    estimatedTime: lesson.estimatedTime?.trim() || '15m',
    order: lesson.order ?? progressLesson?.order ?? index + 1,
    completed: progressLesson?.completed ?? false,
  };
}

function normalizeLessons(
  lessons: LessonSummary[],
  progressLessons: LessonProgressItem[]
) {
  const lessonById = new Map(
    lessons
      .filter((lesson): lesson is LessonSummary & { id: string } => Boolean(lesson.id))
      .map((lesson) => [lesson.id, lesson])
  );

  if (progressLessons.length > 0) {
    return progressLessons
      .map((progressLesson, index) => normalizeLessonPreview(
        lessonById.get(progressLesson.id ?? '') ?? {},
        index,
        progressLesson
      ))
      .filter((lesson): lesson is TrackLessonPreview => Boolean(lesson))
      .sort((a, b) => a.order - b.order);
  }

  return lessons
    .map((lesson, index) => normalizeLessonPreview(lesson, index))
    .filter((lesson): lesson is TrackLessonPreview => Boolean(lesson))
    .sort((a, b) => a.order - b.order);
}

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
  message,
  onBack,
  onRetry,
}: {
  message: string;
  onBack: () => void;
  onRetry: () => void;
}) {
  return (
    <section className="mx-auto max-w-[760px] px-gutter py-8">
      <div className="rounded-lg border border-error-container bg-error-container/40 p-6 text-error">
        <h1 className="headline-sm">Course not available</h1>
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
  const trackId = getRouteParam(params.trackId);

  const [track, setTrack] = useState<LearnerTrack | null>(null);
  const [lessons, setLessons] = useState<TrackLessonPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCourseDetail = useCallback(async () => {
    if (!trackId) {
      setError('Missing track route parameter.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [trackResponse, lessonsResponse] = await Promise.all([
        getTracksById({
          path: { id: trackId },
          throwOnError: true,
        }),
        getTracksByIdLessons({
          path: { id: trackId },
          throwOnError: true,
        }),
      ]);

      if (!trackResponse.data) throw new Error('Track was not found.');

      const normalizedLessons = normalizeLessons(
        lessonsResponse.data?.data ?? [],
        trackResponse.data.lessons ?? []
      );

      setLessons(normalizedLessons);
      setTrack(normalizeTrack(trackResponse.data, trackId, normalizedLessons));
    } catch (loadError: unknown) {
      setError(getErrorMessage(loadError, 'Failed to load course details.'));
    } finally {
      setLoading(false);
    }
  }, [trackId]);

  useEffect(() => {
    loadCourseDetail();
  }, [loadCourseDetail]);

  const currentLessonId = useMemo(() => (
    lessons.find((lesson) => !lesson.completed)?.id ?? lessons[0]?.id ?? null
  ), [lessons]);

  function handleOpenLesson(lessonId: string) {
    router.push(`/courses/${trackId}/lessons/${lessonId}`);
  }

  if (loading) return <CourseDetailLoadingState />;

  if (error || !track) {
    return (
      <CourseDetailErrorState
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
      onOpenLesson={handleOpenLesson}
    />
  );
}
