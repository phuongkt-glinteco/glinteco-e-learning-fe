'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getAccessToken,
  getTracksById,
  getTracksByIdLessons,
  postLessonsByIdComplete,
} from '@/services/api-client';
import Skeleton from '@/components/ui/loading/Skeleton';
import { LessonDetailView } from './LessonDetailView';
import { getMockTrackById } from './mockData';
import type { LearnerLesson, LearnerTrack } from './types';
import {
  getErrorMessage,
  getRouteParam,
  normalizeLessons,
  normalizeTrackDetail,
} from './utils';

function LessonLoadingState() {
  return (
    <div className="max-w-[960px] mx-auto py-4">
      <Skeleton height={56} className="mb-4" />
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_240px] gap-4">
        <Skeleton height={320} />
        <Skeleton height={480} />
        <Skeleton height={280} />
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
    <div className="max-w-2xl mx-auto my-8">
      <div className="p-lg bg-red-50 border border-red-200 rounded-lg text-red-700">
        <h3 className="font-bold">{title}</h3>
        <p className="text-sm mt-1">{message}</p>
        <div className="flex gap-3 mt-3">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 border border-outline-variant text-on-surface text-xs font-semibold rounded-md hover:bg-surface-container-low cursor-pointer"
          >
            Back to tracks
          </button>
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-md hover:opacity-90 cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
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
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  const [completionError, setCompletionError] = useState<string | null>(null);

  const useMockLessonDetail = useCallback((message?: string) => {
    if (!trackId || !lessonId) return false;

    const mockTrack = getMockTrackById(trackId);
    if (!mockTrack) return false;

    if (mockTrack.status === 'locked') {
      setTrack(null);
      setLessons([]);
      setIsUsingMockData(true);
      setFallbackMessage(message ?? null);
      setError('This track is locked. Complete previous milestones first.');
      return true;
    }

    const hasLesson = mockTrack.lessons.some((lesson) => lesson.id === lessonId);
    if (!hasLesson) return false;

    setTrack(mockTrack);
    setLessons(mockTrack.lessons);
    setIsUsingMockData(true);
    setFallbackMessage(message ?? null);
    setError(null);
    return true;
  }, [lessonId, trackId]);

  const loadLessonData = useCallback(async () => {
    if (!trackId || !lessonId) {
      setError('Missing track or lesson route parameters.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setFallbackMessage(null);
    setCompletionError(null);

    try {
      if (!getAccessToken()) {
        if (!useMockLessonDetail('Showing sample lesson content because you are not connected to the API yet.')) {
          setError('This lesson does not exist in the selected track.');
        }
        return;
      }

      const [trackResponse, lessonsResponse] = await Promise.all([
        getTracksById({ path: { id: trackId }, throwOnError: true }),
        getTracksByIdLessons({ path: { id: trackId }, throwOnError: true }),
      ]);

      if (!trackResponse.data) {
        throw new Error('Track was not found.');
      }

      if (trackResponse.data.status === 'locked') {
        throw new Error('This track is locked. Complete previous milestones first.');
      }

      const normalizedLessons = normalizeLessons(
        lessonsResponse.data?.data ?? [],
        trackResponse.data.lessons ?? [],
        trackResponse.data
      );

      setLessons(normalizedLessons);
      setTrack(normalizeTrackDetail(trackResponse.data, trackId, normalizedLessons));
      setIsUsingMockData(false);
    } catch (loadError: unknown) {
      if (!useMockLessonDetail(getErrorMessage(loadError, 'Showing sample lesson content because the API is not available.'))) {
        setError(getErrorMessage(loadError, 'Failed to load lesson details.'));
      }
    } finally {
      setLoading(false);
    }
  }, [trackId, lessonId, useMockLessonDetail]);

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
      if (isUsingMockData) {
        const nextCompletedCount = Math.min(track.lessonsCompleted + 1, track.lessonCount);

        setLessons((currentLessons) => currentLessons.map((lesson) => (
          lesson.id === activeLesson.id
            ? { ...lesson, completed: true }
            : lesson
        )));
        setTrack({
          ...track,
          lessonsCompleted: nextCompletedCount,
          status: nextCompletedCount >= track.lessonCount ? 'completed' : 'in_progress',
        });
        setCompletionMessage(`Lesson completed locally. +${activeLesson.xp} XP awarded in sample data.`);
        return;
      }

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
      isUsingMockData={isUsingMockData}
      fallbackMessage={fallbackMessage}
      completing={completing}
      completionMessage={completionMessage}
      completionError={completionError}
      onBackToTracks={() => router.push(`/courses/${trackId}`)}
      onSelectLesson={handleSelectLesson}
      onCompleteLesson={handleCompleteLesson}
    />
  );
}
