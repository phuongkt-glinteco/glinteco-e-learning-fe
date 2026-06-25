'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getUsersMeStats } from '@/services/api-client';
import type { UserDashboardStats } from '@/services/api-client';
import Skeleton from '@/components/ui/loading/Skeleton';
import SectionHead from '@/components/ui/head/SectionHead';
import { ProgressBar } from '@/components/ui/HPBar';

export default function LearningActivitySection() {
  const t = useTranslations('LearnerDashboard');
  const [stats, setStats] = useState<UserDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getUsersMeStats({ throwOnError: true })
      .then((res) => {
        if (!cancelled) setStats(res.data as UserDashboardStats);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <Skeleton height={256} />;

  if (!stats) return null;

  const tracksCompleted = stats.tracks?.completed ?? 0;
  const tracksTotal = stats.tracks?.total ?? 0;
  const exercisesTotal = stats.exercises?.total ?? 0;
  const exercisesApproved = stats.exercises?.approved ?? 0;
  const exercisesAwaiting = stats.exercises?.awaitingReview ?? 0;
  const savedDocsTotal = stats.savedDocs?.total ?? 0;
  const savedDocsUnread = stats.savedDocs?.unread ?? 0;

  return (
    <section>
      <SectionHead title={t('learningActivity')} />
      <div className="bg-white border border-outline-variant rounded-xl p-lg flex flex-col gap-6 h-full shadow-sm">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">route</span>
              <span className="font-label-md text-label-md">{t('tracksCompleted')}</span>
            </div>
            <span className="font-label-md text-label-md text-primary">
              {tracksCompleted}/{tracksTotal}
            </span>
          </div>
          <ProgressBar value={tracksTotal > 0 ? (tracksCompleted / tracksTotal) * 100 : 0} />
        </div>
        <div className="grid grid-cols-2 gap-gutter">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-on-surface-variant mb-1">
              <span className="material-symbols-outlined text-[18px]">assignment_turned_in</span>
              <span className="font-label-sm text-label-sm">{t('exercises')}</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-headline-sm">{exercisesTotal}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">{t('total')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-tertiary" />
                <span className="text-body-sm text-body-sm">{t('approved', { count: exercisesApproved })}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200 uppercase tracking-tighter">
                  {t('awaitingReview', { count: exercisesAwaiting })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-on-surface-variant mb-1">
              <span className="material-symbols-outlined text-[18px]">bookmark</span>
              <span className="font-label-sm text-label-sm">{t('savedDocs')}</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-headline-sm">{savedDocsTotal}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">{t('total')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                <span className="text-body-sm text-body-sm font-semibold text-secondary">{t('unread', { count: savedDocsUnread })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
