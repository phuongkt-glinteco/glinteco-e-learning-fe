'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Skeleton from '@/components/ui/loading/Skeleton';
import { LessonDetailView } from './LessonDetailView';
import type { LearnerExercise, LearnerLesson, LearnerTrack } from './types';
import { completeLesson, fetchLessonPage } from './courseLearningApi';
import {
  getErrorMessage,
  getRouteParam,
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
  const courseId = getRouteParam(params.courseId ?? params.trackId);
  const lessonId = getRouteParam(params.lessonId);

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

  const activeLessonIndex = useMemo(
    () => lessons.findIndex((lesson) => lesson.id === lessonId),
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
    router.push(`/courses/${courseId}/lessons/${nextLessonId}`);
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
      activeLessonIndex={activeLessonIndex}
      exercises={exercises}
      completing={completing}
      completionMessage={completionMessage}
      completionError={completionError}
      onBackToTracks={() => router.push(`/courses/${courseId}`)}
      onSelectLesson={handleSelectLesson}
      onCompleteLesson={handleCompleteLesson}
    />
  );
}
