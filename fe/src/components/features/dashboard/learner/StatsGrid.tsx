'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usersControllerGetStats } from '@/services/api-client';
import type { UserDashboardStatsDto } from '@/services/api-client';
import { Skeleton } from '@/components/ui/default/skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/default/card';
import { ProgressBar } from '@/components/ui/HPBar';

function StreakDots({ days }: { days: number }) {
  const dotCount = Math.min(days, 7);
  const weeklyStreak = Math.min(days >= 7 ? Math.floor(days / 7) : 0, 4);

  if (days >= 7) {
    return (
      <div className="mt-2 overflow-hidden rounded-md border border-cyan-400 animate-neon-pulse">
        <div className="flex h-2 w-full bg-yellow-300 divide-x divide-blue-400">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 transition-all duration-500 ${
                i < weeklyStreak ? 'bg-orange-500' : 'bg-yellow-300'
              } animate-neon-pulse`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 flex overflow-hidden rounded-md border border-outline-variant divide-x divide-outline-variant">
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className={`h-2 w-full ${
            i < dotCount ? 'bg-yellow-300 animate-neon-pulse' : 'bg-slate-200'
          }`}
        />
      ))}
    </div>
  );
}

export default function StatsGrid() {
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

  if (loading) {
    return (
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </section>
    );
  }

  const overallCompletion = stats?.overallCompletion ?? 0;
  const xp = stats?.xp ?? 0;
  const xpThisWeek = stats?.xpThisWeek ?? 0;
  const level = stats?.level ?? 1;
  const streakDays = stats?.streakDays ?? 0;

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="hover:bg-slate-50 transition-colors group cursor-default shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">donut_large</span>
          <CardTitle className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
            {t('overallProgress')}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="font-headline-lg text-headline-lg text-on-surface flex items-baseline gap-1">
            {overallCompletion}<span className="text-headline-sm font-body-md text-on-surface-variant">%</span>
          </div>
          <ProgressBar value={overallCompletion} />
        </CardContent>
      </Card>

      <Card className="hover:bg-slate-50 transition-colors cursor-default shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
          <span className="material-symbols-outlined text-[18px] text-secondary">military_tech</span>
          <CardTitle className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
            {t('totalXp')}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="font-headline-lg text-headline-lg text-on-surface">{xp}</div>
          <div className="font-label-sm text-label-sm text-secondary">{t('thisWeek', { xp: xpThisWeek })}</div>
        </CardContent>
      </Card>

      <Card className="hover:bg-slate-50 transition-colors cursor-default shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
          <span className="material-symbols-outlined text-[18px] text-secondary">trending_up</span>
          <CardTitle className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
            {t('currentLevel')}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="font-headline-sm text-headline-sm text-on-surface">{t('level', { level })}</div>
          <div className="font-label-sm text-label-sm text-on-surface-variant">{t('keepGoing')}</div>
        </CardContent>
      </Card>

      <Card className="hover:bg-slate-50 transition-colors cursor-default shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
          <span className="material-symbols-outlined text-[18px] text-[#F59E0B]">local_fire_department</span>
          <CardTitle className="font-label-sm text-label-sm uppercase tracking-wider text-[#F59E0B]">
            {t('streak')}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="font-headline-lg text-headline-lg text-on-surface flex items-baseline gap-1">
            {streakDays}<span className="text-headline-sm font-body-md text-on-surface-variant">{t('days')}</span>
          </div>
          <StreakDots days={streakDays} />
        </CardContent>
      </Card>
    </section>
  );
}
