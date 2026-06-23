'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getTracks } from '@/services/api-client';
import type { TrackSummary } from '@/services/api-client';
import Skeleton from '@/components/ui/loading/Skeleton';
import SectionHead from '@/components/ui/head/SectionHead';
import { ProgressBar } from '@/components/ui/HPBar';
import { normalizeTrackIcon } from '@/utils/track-icons';

export default function ContinueLearningSection() {
  const t = useTranslations('LearnerDashboard');
  const [tracks, setTracks] = useState<TrackSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getTracks({ throwOnError: true })
      .then((res) => {
        if (!cancelled) setTracks((res.data as { data?: TrackSummary[] })?.data ?? []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <Skeleton height={160} />;

  const currentTrack = tracks.find((t) => t.status === 'in_progress');
  if (!currentTrack) return null;

  const moduleLabel = `Module ${currentTrack.order ?? '?'}`;
  const timeLeft = currentTrack.estimatedTime ?? '';
  const title = currentTrack.title ?? '';
  const description = currentTrack.description ?? '';
  const progress = currentTrack.lessonCount
    ? Math.round(((currentTrack.lessonsCompleted ?? 0) / currentTrack.lessonCount) * 100)
    : 0;
  const icon = normalizeTrackIcon(currentTrack.icon) ?? 'data_object';

  return (
    <section>
      <SectionHead title={t('continueLearning')}>
        <button className="font-label-sm text-label-sm text-primary hover:opacity-80 transition-opacity flex items-center cursor-pointer">
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
          <button className="w-full md:w-auto bg-primary text-white font-label-md text-label-md px-8 py-4 rounded-lg hover:opacity-90 transition-all whitespace-nowrap shadow-md active:scale-95 cursor-pointer">
            {t('continueLesson')}
          </button>
        </div>
      </div>
    </section>
  );
}
