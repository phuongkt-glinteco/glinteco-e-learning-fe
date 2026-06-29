'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Skeleton from '@/components/ui/loading/Skeleton';
import SectionHead from '@/components/ui/head/SectionHead';
import { ProgressBar } from '@/components/ui/HPBar';
import type { LearnerTrack } from '@/components/features/tracks/learner/types';
import { fetchCourses } from '@/components/features/tracks/learner/courseLearningApi';
import { getErrorMessage } from '@/components/features/tracks/learner/utils';

export default function ContinueLearningSection() {
  const t = useTranslations('LearnerDashboard');
  const router = useRouter();
  const [tracks, setTracks] = useState<LearnerTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchCourses()
      .then((courses) => {
        if (!cancelled) setTracks(courses);
      })
      .catch((loadError: unknown) => {
        if (!cancelled) setError(getErrorMessage(loadError, 'Failed to load current course.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <Skeleton height={160} />;

  const currentTrack = tracks.find((track) => track.status === 'in_progress')
    ?? tracks.find((track) => track.status !== 'locked');

  function getCourseHref(track: LearnerTrack) {
    return track.currentLessonId
      ? `/courses/${track.id}/lessons/${track.currentLessonId}`
      : `/courses/${track.id}`;
  }

  if (error || !currentTrack) {
    return (
      <section>
        <SectionHead title={t('continueLearning')}>
          <button
            type="button"
            onClick={() => router.push('/courses')}
            className="font-label-sm text-label-sm text-primary hover:opacity-80 transition-opacity flex items-center cursor-pointer"
          >
            {t('viewPath')}
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </SectionHead>
        <div className="rounded-lg border border-dashed border-outline-variant bg-white p-lg">
          <h4 className="font-headline-sm text-headline-sm text-on-surface">
            {error ? 'Unable to load current course' : 'No active course yet'}
          </h4>
          <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
            {error ?? 'Open the course path to choose a course and begin learning.'}
          </p>
        </div>
      </section>
    );
  }

  const moduleLabel = `Module ${currentTrack.order ?? '?'}`;
  const timeLeft = currentTrack.estimatedTime ?? '';
  const title = currentTrack.title ?? '';
  const description = currentTrack.description ?? '';
  const progress = currentTrack.lessonCount
    ? Math.round(((currentTrack.lessonsCompleted ?? 0) / currentTrack.lessonCount) * 100)
    : 0;
  const icon = currentTrack.icon ?? 'data_object';
  const continueHref = getCourseHref(currentTrack);

  return (
    <section>
      <SectionHead title={t('continueLearning')}>
        <button
          type="button"
          onClick={() => router.push('/courses')}
          className="font-label-sm text-label-sm text-primary hover:opacity-80 transition-opacity flex items-center cursor-pointer"
        >
          {t('viewPath')}
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      </SectionHead>
      <div className="bg-white border-2 border-primary rounded-xl p-lg flex flex-col md:flex-row gap-lg md:items-center relative overflow-hidden shadow-sm">
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
        <div className="w-20 h-20 bg-primary-container/10 rounded-xl flex flex-shrink-0 items-center justify-center border border-primary/20 z-10">
          <span className="material-symbols-outlined text-[40px] text-primary">{icon}</span>
        </div>
        <div className="flex-1 flex flex-col gap-2 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-primary text-white font-label-sm text-[10px] uppercase tracking-wider rounded">
              {moduleLabel}
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              {timeLeft}
            </span>
          </div>
          <h4 className="font-headline-md text-headline-md text-on-surface">{title}</h4>
          <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 max-w-2xl">
            {description}
          </p>
          <div className="mt-4 flex flex-col gap-2 max-w-md">
            <div className="flex justify-between items-center font-label-sm text-label-sm">
              <span className="text-on-surface-variant">{t('lessonProgress')}</span>
              <span className="text-primary font-bold">{progress}%</span>
            </div>
            <ProgressBar value={progress} />
          </div>
        </div>
        <div className="mt-4 md:mt-0 z-10">
          <button
            type="button"
            onClick={() => router.push(continueHref)}
            className="w-full md:w-auto bg-primary text-white font-label-md text-label-md px-8 py-4 rounded-lg hover:opacity-90 transition-all whitespace-nowrap shadow-md active:scale-95 cursor-pointer"
          >
            {t('continueLesson')}
          </button>
        </div>
      </div>
    </section>
  );
}
