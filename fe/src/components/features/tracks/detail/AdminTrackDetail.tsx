'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { tracksControllerFindOne, exercisesControllerFindAll } from '@/services/api-client';
import type { TrackDetailDto, ExerciseSummaryDto } from '@/services/api-client';
import { useTrackCreatedStore } from '@/stores/trackCreatedStore';
import TrackOverviewCard from './TrackOverviewCard';
import AdminCurriculumRoadmap from './AdminCurriculumRoadmap';
import TrackStatusCard from './TrackStatusCard';
import LinkedExercisesCard from './LinkedExercisesCard';
import AdminTrackPreview from './AdminTrackPreview';

type LessonStatus = 'completed' | 'in_progress' | 'locked';

interface LessonItem {
  id: string;
  title: string;
  order: number;
  status: LessonStatus;
  type?: 'video' | 'reading' | 'quiz' | 'coding' | 'assignment';
  description?: string | null;
}

function determineLessonStatus(lessons: TrackDetailDto['lessons']): LessonItem[] {
  if (!lessons) return [];
  const sorted = [...lessons].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  let foundActive = false;
  return sorted.map((l) => {
    const base = { id: l.id!, title: l.title!, order: l.order!, type: l.type, description: l.description };
    if (l.completed) return { ...base, status: 'completed' as const };
    if (!foundActive) {
      foundActive = true;
      return { ...base, status: 'in_progress' as const };
    }
    return { ...base, status: 'locked' as const };
  });
}

export default function AdminTrackDetail({ trackId, isFromCreate }: { trackId: string; isFromCreate?: boolean }) {
  const t = useTranslations('TrackDetailPage');
  const { trackData: createdTrack, clearTrackData } = useTrackCreatedStore();

  const [track, setTrack] = useState<TrackDetailDto | null>(isFromCreate && createdTrack ? createdTrack : null);
  const [exercises, setExercises] = useState<ExerciseSummaryDto[]>([]);
  const [loading, setLoading] = useState(!isFromCreate);
  const [error, setError] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [trackRes, exRes] = await Promise.all([
        tracksControllerFindOne({ path: { id: trackId }, throwOnError: true }),
        exercisesControllerFindAll({ query: { trackId }, throwOnError: true }).catch(() => null),
      ]);
      setTrack(trackRes.data ?? null);
      setExercises(exRes?.data?.data ?? []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [trackId]);

  useEffect(() => {
    if (isFromCreate) {
      clearTrackData();
      setLoading(false);
      return;
    }
    fetchData();
  }, [fetchData, isFromCreate, clearTrackData]);

  useEffect(() => {
    if (!isFromCreate) return;
    exercisesControllerFindAll({ query: { trackId }, throwOnError: true })
      .then((res) => setExercises(res.data?.data ?? []))
      .catch(() => {});
  }, [isFromCreate, trackId]);

  const handleDeleteLesson = useCallback((lessonId: string) => {
    setTrack((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        lessons: prev.lessons?.filter((l) => l.id !== lessonId),
      };
    });
    fetchData();
  }, [fetchData]);

  const handleDeleteExercise = useCallback((exerciseId: string) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-[32px] text-outline animate-spin">refresh</span>
          <p className="text-outline font-label-md">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="material-symbols-outlined text-[48px] text-error">error</span>
          <p className="text-on-surface font-label-lg">{t('failedToLoad')}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md hover:opacity-90 transition-opacity cursor-pointer"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  const lessonsWithStatus = determineLessonStatus(track.lessons);
  const totalLessons = lessonsWithStatus.length;
  const completedLessons = lessonsWithStatus.filter((l) => l.status === 'completed').length;
  const completionPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  if (previewing) {
    return (
      <AdminTrackPreview
        track={track}
        exercises={exercises}
        onBack={() => setPreviewing(false)}
      />
    );
  }

  return (
    <div className="px-gutter py-6 max-w-[1440px] mx-auto w-full">
      <nav className="flex items-center gap-2 text-outline font-label-sm mb-6">
        <Link href="/admin/tracks" className="hover:text-primary transition-colors">
          {t('breadcrumbTracks')}
        </Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary">{track.title}</span>
      </nav>

      <div className="grid grid-cols-12 gap-lg">
        <div className="col-span-12 lg:col-span-8 space-y-lg">
          <TrackOverviewCard
            trackId={trackId}
            title={track.title ?? ''}
            estimatedTime={track.estimatedTime}
            description={track.description}
            onPreview={() => setPreviewing(true)}
          />

          <AdminCurriculumRoadmap
            trackId={trackId}
            lessons={lessonsWithStatus}
            onDeleteLesson={handleDeleteLesson}
          />
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-lg">
          <TrackStatusCard
            title={track.title ?? ''}
            completionPercent={completionPercent}
            prevTrack={track.prevTrack}
            nextTrack={track.nextTrack}
          />

          <LinkedExercisesCard trackId={trackId} exercises={exercises} onDeleteExercise={handleDeleteExercise} />
        </div>
      </div>
    </div>
  );
}
