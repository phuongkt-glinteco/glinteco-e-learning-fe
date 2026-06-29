'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Skeleton from '@/components/ui/loading/Skeleton';
import { LessonDetailView } from './LessonDetailView';
import type { LearnerExercise, LearnerLesson, LearnerTrack } from './types';
import { completeLesson, fetchLessonPage } from './courseLearningApi';
import {
  getAdjacentLessonIds,
  getErrorMessage,
  getLearnerRouteBase,
  getRouteParam,
} from './utils';

function LessonLoadingState() {
  return (
    <div className="mx-auto flex max-w-container-max flex-col gap-6 px-gutter py-8">
      <div className="rounded-lg border border-outline-variant bg-surface p-4 shadow-sm">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Skeleton width={36} height={36} rounded="rounded-lg" />
            <div>
              <Skeleton width={112} height={16} rounded="rounded" />
              <Skeleton width={260} height={28} rounded="rounded" className="mt-2 max-w-full" />
            </div>
          </div>
          <Skeleton width={104} height={30} rounded="rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-4">
        <div className="rounded-lg border border-outline-variant bg-surface p-4 shadow-sm">
          <Skeleton width={140} height={18} rounded="rounded" />
          <Skeleton width="100%" height={1} rounded="rounded-none" className="my-3" />
          <div className="space-y-2">
            <Skeleton height={40} rounded="rounded-lg" />
            <Skeleton height={40} rounded="rounded-lg" />
            <Skeleton height={40} rounded="rounded-lg" />
            <Skeleton height={40} rounded="rounded-lg" />
          </div>
        </div>
        <div className="rounded-lg border border-outline-variant bg-surface p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex flex-wrap gap-2">
            <Skeleton width={82} height={24} rounded="rounded" />
            <Skeleton width={68} height={24} rounded="rounded" />
            <Skeleton width={92} height={24} rounded="rounded" />
          </div>
          <Skeleton width="78%" height={34} rounded="rounded" />
          <Skeleton width="92%" height={18} rounded="rounded" className="mt-3" />
          <Skeleton width="64%" height={18} rounded="rounded" className="mt-2" />
          <Skeleton height={180} rounded="rounded-lg" className="mt-6" />
          <Skeleton height={150} rounded="rounded-lg" className="mt-6" />
        </div>
        <div className="flex flex-col gap-6">
          <Skeleton height={245} rounded="rounded-lg" />
          <Skeleton height={180} rounded="rounded-lg" />
        </div>
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
    <section className="mx-auto max-w-container-max px-gutter py-8">
      <div className="max-w-[760px] rounded-lg border border-error-container bg-error-container/40 p-6 text-error">
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
  const courseId = getRouteParam(params.courseId ?? params.trackId);
  const lessonId = getRouteParam(params.lessonId);
  const routeBase = getLearnerRouteBase(params.trackId);

  const [track, setTrack] = useState<LearnerTrack | null>(null);
  const [lessons, setLessons] = useState<LearnerLesson[]>([]);
  const [exercises, setExercises] = useState<LearnerExercise[]>([]);
  const [activeLesson, setActiveLesson] = useState<LearnerLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  const [completionError, setCompletionError] = useState<string | null>(null);

  const loadLessonData = useCallback(async () => {
    if (!courseId || !lessonId) {
      setError('Missing course or lesson route parameters.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setCompletionError(null);

    try {
      const lessonPage = await fetchLessonPage(courseId, lessonId);
      setLessons(lessonPage.lessons);
      setTrack(lessonPage.course);
      setActiveLesson(lessonPage.activeLesson);
      setExercises(lessonPage.exercises);
    } catch (loadError: unknown) {
      setError(getErrorMessage(loadError, 'Failed to load lesson details.'));
    } finally {
      setLoading(false);
    }
  }, [courseId, lessonId]);

  useEffect(() => {
    loadLessonData();
  }, [loadLessonData]);

  const { previousLessonId, nextLessonId } = useMemo(
    () => getAdjacentLessonIds(lessons, lessonId),
    [lessons, lessonId]
  );

  async function handleCompleteLesson() {
    if (!activeLesson || activeLesson.completed || !track) return;

    setCompleting(true);
    setCompletionError(null);
    setCompletionMessage(null);

    try {
      const response = await completeLesson(activeLesson.id);

      const xpAwarded = response.xpAwarded ?? activeLesson.xp;
      const nextCompletedCount = response.lessonsCompleted
        ?? Math.min(track.lessonsCompleted + 1, track.lessonCount);
      const nextStatus = response.trackStatus
        ?? (nextCompletedCount >= track.lessonCount ? 'completed' : 'in_progress');
      setCompletionMessage(`Lesson completed. +${xpAwarded} XP awarded.`);
      setActiveLesson({ ...activeLesson, completed: true });
      setTrack({ ...track, lessonsCompleted: nextCompletedCount, status: nextStatus });
      await loadLessonData();
    } catch (completeError: unknown) {
      setCompletionError(getErrorMessage(completeError, 'Failed to complete lesson.'));
    } finally {
      setCompleting(false);
    }
  }

  function handleSelectLesson(nextLessonId: string) {
    if (!courseId || !nextLessonId) return;
    router.push(`/${routeBase}/${courseId}/lessons/${nextLessonId}`);
  }

  function handleOpenExercise(exerciseId: string) {
    if (!courseId || !lessonId || !exerciseId) return;
    router.push(`/${routeBase}/${courseId}/lessons/${lessonId}/exercises/${exerciseId}`);
  }

  if (loading) return <LessonLoadingState />;

  if (error) {
    return (
      <LessonErrorState
        title="Lesson not available"
        message={error}
        onBack={() => router.push(`/${routeBase}`)}
        onRetry={loadLessonData}
      />
    );
  }

  if (!track || !activeLesson) {
    return (
      <LessonErrorState
        title="Lesson not found"
        message="This lesson does not exist in the selected track."
        onBack={() => router.push(`/${routeBase}`)}
        onRetry={loadLessonData}
      />
    );
  }

  return (
    <LessonDetailView
      track={track}
      lessons={lessons}
      activeLesson={activeLesson}
      previousLessonId={previousLessonId}
      nextLessonId={nextLessonId}
      exercises={exercises}
      completing={completing}
      completionMessage={completionMessage}
      completionError={completionError}
      onBackToTracks={() => router.push(`/${routeBase}/${courseId}`)}
      onSelectLesson={handleSelectLesson}
      onOpenExercise={handleOpenExercise}
      onCompleteLesson={handleCompleteLesson}
    />
  );
}
