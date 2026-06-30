'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usersControllerGetStats } from '@/services/api-client';
import type { UserDashboardStatsDto } from '@/services/api-client';
import { Skeleton } from '@/components/ui/default/skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/default/card';
import { Badge } from '@/components/ui/default/badge';
import SectionHead from '@/components/ui/head/SectionHead';
import { ProgressBar } from '@/components/ui/HPBar';

export default function LearningActivitySection() {
  const t = useTranslations('LearnerDashboard');
  const [stats, setStats] = useState<UserDashboardStatsDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    usersControllerGetStats({ throwOnError: true })
      .then((res) => {
        if (!cancelled) setStats(res.data as UserDashboardStatsDto);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <Skeleton className="h-[120px] w-full rounded-xl" />;

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tracks Completed */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">route</span>
              {t('tracksCompleted')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tracksCompleted} <span className="text-sm font-normal text-on-surface-variant">/ {tracksTotal}</span></div>
            <div className="mt-3">
              <ProgressBar value={tracksTotal > 0 ? (tracksCompleted / tracksTotal) * 100 : 0} />
            </div>
          </CardContent>
        </Card>

        {/* Exercises */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">assignment_turned_in</span>
              {t('exercises')}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="text-2xl font-bold">{exercisesTotal} <span className="text-sm font-normal text-on-surface-variant">{t('total')}</span></div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-tertiary border-tertiary/30 bg-tertiary/10">
                {t('approved', { count: exercisesApproved })}
              </Badge>
              <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">
                {t('awaitingReview', { count: exercisesAwaiting })}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Saved Docs */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">bookmark</span>
              {t('savedDocs')}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="text-2xl font-bold">{savedDocsTotal} <span className="text-sm font-normal text-on-surface-variant">{t('total')}</span></div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-secondary/10 text-secondary hover:bg-secondary/20">
                {t('unread', { count: savedDocsUnread })}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
