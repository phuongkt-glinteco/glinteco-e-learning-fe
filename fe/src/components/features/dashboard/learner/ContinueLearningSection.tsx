'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/default/skeleton';
import { Card, CardContent } from '@/components/ui/default/card';
import { Badge } from '@/components/ui/default/badge';
import { Button } from '@/components/ui/default/button';
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

  if (loading) return <Skeleton className="h-40 w-full rounded-xl" />;

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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/courses')}
            className="text-primary hover:text-primary/80 flex items-center gap-1"
          >
            {t('viewPath')}
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </Button>
        </SectionHead>
        <Card className="border-dashed shadow-sm">
          <CardContent className="p-8 flex flex-col items-center justify-center text-center gap-2">
            <h4 className="font-semibold text-lg text-on-surface">
              {error ? 'Unable to load current course' : 'No active course yet'}
            </h4>
            <p className="text-sm text-on-surface-variant max-w-sm">
              {error ?? 'Open the course path to choose a course and begin learning.'}
            </p>
            {!error && (
              <Button className="mt-2" onClick={() => router.push('/courses')}>
                Browse Courses
              </Button>
            )}
          </CardContent>
        </Card>
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/courses')}
          className="text-primary hover:text-primary/80 flex items-center gap-1"
        >
          {t('viewPath')}
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </Button>
      </SectionHead>
      <Card className="relative overflow-hidden border-primary/50 bg-gradient-to-r from-primary/5 to-transparent shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:from-primary/10 hover:to-primary/5 hover:shadow-lg">
        <CardContent className="p-6 flex flex-col lg:flex-row gap-6 lg:items-center relative z-10">
          <div className="w-16 h-16 bg-primary/20 rounded-xl flex shrink-0 items-center justify-center text-primary border border-primary/30">
            <span className="material-symbols-outlined text-[32px]">{icon}</span>
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-[10px] uppercase tracking-wider">{moduleLabel}</Badge>
              <span className="font-label-sm text-sm text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                {timeLeft}
              </span>
            </div>
            <h4 className="font-semibold text-xl text-on-surface">{title}</h4>
            <p className="text-sm text-on-surface-variant line-clamp-2 max-w-2xl">
              {description}
            </p>
            <div className="mt-2 flex flex-col gap-2 max-w-md">
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant font-medium">{t('lessonProgress')}</span>
                <span className="text-primary font-bold">{progress}%</span>
              </div>
              <ProgressBar value={progress} />
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <Button size="lg" className="w-full md:w-auto shadow-md" onClick={() => router.push(continueHref)}>
              {t('continueLesson')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
