'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getTracksById,
  getTracksByIdLessons,
  postLessonsByIdComplete,
} from '@/services/api-client';
import type {
  LessonProgressItem,
  LessonSummary,
  TrackDetail,
} from '@/services/api-client';
import Skeleton from '@/components/ui/loading/Skeleton';
import { LessonDetailView } from './LessonDetailView';
import type { LearnerLesson, LearnerTrack, TrackStatus } from './types';

const DEFAULT_STATUS: TrackStatus = 'locked';
const DEFAULT_LESSON_XP = 40;

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

function normalizeTrack(track: TrackDetail, trackId: string, lessonCountFallback: number): LearnerTrack {
  const lessonCount = track.lessons?.length ?? lessonCountFallback;

  return {
    id: track.id ?? trackId,
    title: track.title?.trim() || 'Untitled track',
    description: track.description?.trim() || 'Track details are being prepared.',
    estimatedTime: track.estimatedTime?.trim() || 'TBD',
    lessonCount,
    lessonsCompleted: track.lessonsCompleted ?? 0,
    order: track.order ?? 1,
    status: track.status ?? DEFAULT_STATUS,
    icon: track.icon,
  };
}

function normalizeLesson(
  apiLesson: LessonSummary,
  index: number,
  progressLesson?: LessonProgressItem
): LearnerLesson | null {
  const id = progressLesson?.id ?? apiLesson.id;
  if (!id) return null;

  return {
    id,
    title: apiLesson.title?.trim()
      || progressLesson?.title?.trim()
      || 'Untitled lesson',
    body: '',
    estimatedTime: apiLesson.estimatedTime?.trim() || '15m',
    order: apiLesson.order ?? progressLesson?.order ?? index + 1,
    completed: progressLesson?.completed ?? false,
    xp: DEFAULT_LESSON_XP,
  };
}

function normalizeLessons(
  apiLessons: LessonSummary[],
  progressLessons: LessonProgressItem[]
) {
  const apiLessonById = new Map(
    apiLessons
      .filter((lesson): lesson is LessonSummary & { id: string } => Boolean(lesson.id))
      .map((lesson) => [lesson.id, lesson])
  );

  if (progressLessons.length > 0) {
    return progressLessons
      .map((progressLesson, index) => normalizeLesson(
        apiLessonById.get(progressLesson.id ?? '') ?? {},
        index,
        progressLesson
      ))
      .filter((lesson): lesson is LearnerLesson => Boolean(lesson))
      .sort((a, b) => a.order - b.order);
  }

  return apiLessons
    .map((lesson, index) => normalizeLesson(lesson, index))
    .filter((lesson): lesson is LearnerLesson => Boolean(lesson))
    .sort((a, b) => a.order - b.order);
}

function LessonLoadingState() {
  return (
    <div className="mx-auto flex max-w-container-max flex-col gap-6 px-gutter py-8">
      <Skeleton height={72} />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Skeleton height={360} />
        <Skeleton height={520} className="lg:col-span-2" />
        <Skeleton height={300} />
      </div>
    </div>
  );
}

function LessonErrorState({
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
        <div className="flex gap-3 flex-wrap mt-4">
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

export default function LessonDetailContainer() {
  const params = useParams();
  const router = useRouter();
  const trackId = getRouteParam(params.trackId);
  const lessonId = getRouteParam(params.lessonId);

  const [track, setTrack] = useState<LearnerTrack | null>(null);
  const [lessons, setLessons] = useState<LearnerLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  const [completionError, setCompletionError] = useState<string | null>(null);

  const loadLessonData = useCallback(async () => {
    if (!trackId || !lessonId) {
      setError('Missing track or lesson route parameters.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setCompletionError(null);

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

      if (!trackResponse.data) {
        throw new Error('Track was not found.');
      }

      const normalizedLessons = normalizeLessons(
        lessonsResponse.data?.data ?? [],
        trackResponse.data.lessons ?? []
      );

      setLessons(normalizedLessons);
      setTrack(normalizeTrack(trackResponse.data, trackId, normalizedLessons.length));
    } catch (loadError: unknown) {
      setError(getErrorMessage(loadError, 'Failed to load lesson details.'));
    } finally {
      setLoading(false);
    }
  }, [trackId, lessonId]);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!active) return;
      await loadLessonData();
    }

    load();

    return () => {
      active = false;
    };
  }, [loadLessonData]);

  const activeLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === lessonId) ?? null,
    [lessons, lessonId]
  );

  async function handleCompleteLesson() {
    if (!activeLesson || activeLesson.completed || !track) return;

    setCompleting(true);
    setCompletionError(null);
    setCompletionMessage(null);

    try {
      const response = await postLessonsByIdComplete({
        path: { id: activeLesson.id },
        throwOnError: true,
      });

      const xpAwarded = response.data?.xpAwarded ?? activeLesson.xp;
      const nextCompletedCount = response.data?.lessonsCompleted
        ?? Math.min(track.lessonsCompleted + 1, track.lessonCount);
      const nextStatus = response.data?.trackStatus
        ?? (nextCompletedCount >= track.lessonCount ? 'completed' : 'in_progress');

      setLessons((currentLessons) => currentLessons.map((lesson) => (
        lesson.id === activeLesson.id
          ? { ...lesson, completed: true }
          : lesson
      )));
      setTrack({
        ...track,
        lessonsCompleted: nextCompletedCount,
        status: nextStatus,
      });
      setCompletionMessage(`Lesson completed. +${xpAwarded} XP awarded.`);
    } catch (completeError: unknown) {
      setCompletionError(getErrorMessage(completeError, 'Failed to complete lesson.'));
    } finally {
      setCompleting(false);
    }
  }

  function handleSelectLesson(nextLessonId: string) {
    router.push(`/courses/${trackId}/lessons/${nextLessonId}`);
  }

  if (loading) return <LessonLoadingState />;

  if (error) {
    return (
      <LessonErrorState
        title="Lesson not available"
        message={error}
        onBack={() => router.push('/courses')}
        onRetry={loadLessonData}
      />
    );
  }

  if (!track || !activeLesson) {
    return (
      <LessonErrorState
        title="Lesson not found"
        message="This lesson does not exist in the selected track."
        onBack={() => router.push('/courses')}
        onRetry={loadLessonData}
      />
    );
  }

  return (
    <LessonDetailView
      track={track}
      lessons={lessons}
      activeLesson={activeLesson}
      completing={completing}
      completionMessage={completionMessage}
      completionError={completionError}
      onBackToTracks={() => router.push('/courses')}
      onSelectLesson={handleSelectLesson}
      onCompleteLesson={handleCompleteLesson}
    />
  );
}
