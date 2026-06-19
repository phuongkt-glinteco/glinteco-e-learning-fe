'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getUsersMeStats } from '@/services/api-client';
import type { UserDashboardStats } from '@/services/api-client';
import Skeleton from '@/components/ui/Skeleton';
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
  const [stats, setStats] = useState<UserDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getUsersMeStats({ throwOnError: true })
      .then((res) => {
        if (!cancelled) setStats(res.data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <Skeleton height={128} />;

  const overallCompletion = stats?.overallCompletion ?? 0;
  const xp = stats?.xp ?? 0;
  const xpThisWeek = stats?.xpThisWeek ?? 0;
  const level = stats?.level ?? 1;
  const streakDays = stats?.streakDays ?? 0;

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white border border-outline-variant p-md rounded-lg flex flex-col gap-2 hover:bg-slate-50 transition-colors group cursor-default">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-[18px]">donut_large</span>
          <span className="font-label-sm text-label-sm uppercase tracking-wider">{t('overallProgress')}</span>
        </div>
        <div className="font-headline-lg text-headline-lg text-on-surface flex items-baseline gap-1">
          {overallCompletion}<span className="text-headline-sm font-body-md text-on-surface-variant">%</span>
        </div>
        <ProgressBar value={overallCompletion} />
      </div>

      <div className="bg-white border border-outline-variant p-md rounded-lg flex flex-col gap-2 hover:bg-slate-50 transition-colors cursor-default">
        <div className="flex items-center gap-2 text-secondary">
          <span className="material-symbols-outlined text-[18px]">military_tech</span>
          <span className="font-label-sm text-label-sm uppercase tracking-wider">{t('totalXp')}</span>
        </div>
        <div className="font-headline-lg text-headline-lg text-on-surface">{xp}</div>
        <div className="font-label-sm text-label-sm text-secondary mt-2">{t('thisWeek', { xp: xpThisWeek })}</div>
      </div>

      <div className="bg-white border border-outline-variant p-md rounded-lg flex flex-col gap-2 hover:bg-slate-50 transition-colors cursor-default">
        <div className="flex items-center gap-2 text-secondary">
          <span className="material-symbols-outlined text-[18px]">trending_up</span>
          <span className="font-label-sm text-label-sm uppercase tracking-wider">{t('currentLevel')}</span>
        </div>
        <div className="font-headline-sm text-headline-sm text-on-surface">{t('level', { level })}</div>
        <div className="font-label-sm text-label-sm text-on-surface-variant mt-2">{t('keepGoing')}</div>
      </div>

      <div className="bg-white border border-outline-variant p-md rounded-lg flex flex-col gap-2 hover:bg-slate-50 transition-colors cursor-default">
        <div className="flex items-center gap-2 text-[#F59E0B]">
          <span className="material-symbols-outlined text-[18px]">local_fire_department</span>
          <span className="font-label-sm text-label-sm uppercase tracking-wider">{t('streak')}</span>
        </div>
        <div className="font-headline-lg text-headline-lg text-on-surface flex items-baseline gap-1">
          {streakDays}<span className="text-headline-sm font-body-md text-on-surface-variant">{t('days')}</span>
        </div>
        <StreakDots days={streakDays} />
      </div>
    </section>
  );
}
