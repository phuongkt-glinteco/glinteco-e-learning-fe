'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAccessToken, getTracksById, getTracksByIdLessons } from '@/services/api-client';
import Skeleton from '@/components/ui/loading/Skeleton';
import { CourseDetailView } from './CourseDetailView';
import { getMockTrackById } from './mockData';
import type { LearnerTrack, TrackLessonPreview } from './types';
import {
  getErrorMessage,
  getRouteParam,
  normalizeLessonsPreview,
  normalizeTrackDetail,
} from './utils';

function CourseDetailLoadingState() {
  return (
    <div className="max-w-[960px] mx-auto py-4">
      <Skeleton height={28} width={160} className="mb-4" />
      <Skeleton height={160} className="mb-6" />
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="space-y-3">
          <Skeleton height={80} />
          <Skeleton height={80} />
          <Skeleton height={80} />
        </div>
        <Skeleton height={160} />
      </div>
    </div>
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
    <div className="max-w-2xl mx-auto my-8">
      <div className="p-lg bg-red-50 border border-red-200 rounded-lg text-red-700">
        <h3 className="font-bold">Course not available</h3>
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

export default function CourseDetailContainer() {
  const params = useParams();
  const router = useRouter();
  const trackId = getRouteParam(params.trackId);

  const [track, setTrack] = useState<LearnerTrack | null>(null);
  const [lessons, setLessons] = useState<TrackLessonPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  const useMockCourseDetail = useCallback((message?: string) => {
    if (!trackId) return false;

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

    setTrack(mockTrack);
    setLessons(mockTrack.lessons);
    setIsUsingMockData(true);
    setFallbackMessage(message ?? null);
    setError(null);
    return true;
  }, [trackId]);

  const loadCourseDetail = useCallback(async () => {
    if (!trackId) {
      setError('Missing track route parameter.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setFallbackMessage(null);

    try {
      if (!getAccessToken()) {
        if (!useMockCourseDetail('Showing sample course detail because you are not connected to the API yet.')) {
          setError('Track was not found.');
        }
        return;
      }

      const [trackResponse, lessonsResponse] = await Promise.all([
        getTracksById({ path: { id: trackId }, throwOnError: true }),
        getTracksByIdLessons({ path: { id: trackId }, throwOnError: true }),
      ]);

      if (!trackResponse.data) throw new Error('Track was not found.');
      if (trackResponse.data.status === 'locked') {
        throw new Error('This track is locked. Complete previous milestones first.');
      }

      const normalizedLessons = normalizeLessonsPreview(
        lessonsResponse.data?.data ?? [],
        trackResponse.data.lessons ?? []
      );

      setLessons(normalizedLessons);
      setTrack(normalizeTrackDetail(trackResponse.data, trackId, normalizedLessons));
      setIsUsingMockData(false);
    } catch (loadError: unknown) {
      if (!useMockCourseDetail(getErrorMessage(loadError, 'Showing sample course detail because the API is not available.'))) {
        setError(getErrorMessage(loadError, 'Failed to load course details.'));
      }
    } finally {
      setLoading(false);
    }
  }, [trackId, useMockCourseDetail]);

  useEffect(() => {
    loadCourseDetail();
  }, [loadCourseDetail]);

  const currentLessonId = useMemo(
    () => lessons.find((l) => !l.completed)?.id ?? lessons[0]?.id ?? null,
    [lessons]
  );

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
      isUsingMockData={isUsingMockData}
      fallbackMessage={fallbackMessage}
      onBackToTracks={() => router.push('/courses')}
      onOpenLesson={handleOpenLesson}
    />
  );
}
