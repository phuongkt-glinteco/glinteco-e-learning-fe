'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getTracksById, getExercises } from '@/services/api-client';
import type { TrackDetail, ExerciseSummary } from '@/services/api-client';
import TrackOverviewCard from './TrackOverviewCard';
import AdminCurriculumRoadmap from './AdminCurriculumRoadmap';
import TrackStatusCard from './TrackStatusCard';
import LinkedExercisesCard from './LinkedExercisesCard';

type LessonStatus = 'completed' | 'in_progress' | 'locked';

interface LessonItem {
  id: string;
  title: string;
  order: number;
  status: LessonStatus;
}

function determineLessonStatus(lessons: TrackDetail['lessons']): LessonItem[] {
  if (!lessons) return [];
  const sorted = [...lessons].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  let foundActive = false;
  return sorted.map((l) => {
    if (l.completed) return { id: l.id!, title: l.title!, order: l.order!, status: 'completed' as const };
    if (!foundActive) {
      foundActive = true;
      return { id: l.id!, title: l.title!, order: l.order!, status: 'in_progress' as const };
    }
    return { id: l.id!, title: l.title!, order: l.order!, status: 'locked' as const };
  });
}

export default function AdminTrackDetail({ trackId }: { trackId: string }) {
  const t = useTranslations('TrackDetailPage');
  const [track, setTrack] = useState<TrackDetail | null>(null);
  const [exercises, setExercises] = useState<ExerciseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [trackRes, exRes] = await Promise.all([
        getTracksById({ path: { id: trackId }, throwOnError: true }),
        getExercises({ query: { trackId }, throwOnError: true }).catch(() => null),
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
    fetchData();
  }, [fetchData]);

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
