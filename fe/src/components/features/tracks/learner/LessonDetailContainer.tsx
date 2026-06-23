'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getTracksById,
  getTracksByIdLessons,
  postLessonsByIdComplete,
} from '@/services/api-client';
import Skeleton from '@/components/ui/loading/Skeleton';
import { LessonDetailView } from './LessonDetailView';
import type { LearnerLesson, LearnerTrack } from './types';
import {
  getErrorMessage,
  getRouteParam,
  normalizeLessons,
  normalizeTrackDetailWithCount,
} from './utils';

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
      setTrack(normalizeTrackDetailWithCount(trackResponse.data, trackId, normalizedLessons.length));
    } catch (loadError: unknown) {
      setError(getErrorMessage(loadError, 'Failed to load lesson details.'));
    } finally {
      setLoading(false);
    }
  }, [trackId, lessonId]);

  useEffect(() => {
    loadLessonData();
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
    router.push(`/tracks/${trackId}/lessons/${nextLessonId}`);
  }

  if (loading) return <LessonLoadingState />;

  if (error) {
    return (
      <LessonErrorState
        title="Lesson not available"
        message={error}
        onBack={() => router.push('/tracks')}
        onRetry={loadLessonData}
      />
    );
  }

  if (!track || !activeLesson) {
    return (
      <LessonErrorState
        title="Lesson not found"
        message="This lesson does not exist in the selected track."
        onBack={() => router.push('/tracks')}
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
      onBackToTracks={() => router.push('/tracks')}
      onSelectLesson={handleSelectLesson}
      onCompleteLesson={handleCompleteLesson}
    />
  );
}
