'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { UserDashboardStatsDto } from '@/services/client';
import { Progress } from '@/components/ui/default/progress';
interface GamificationStatsProps {
  stats: UserDashboardStatsDto | null;
}

export function GamificationStats({ stats }: GamificationStatsProps) {
  const t = useTranslations('ProfilePage');

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Level & XP Progress Fallback Card (col-span-2) */}
        <div className="bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl p-6 shadow-2xs flex flex-col justify-center items-center text-center md:col-span-2 min-h-[160px]">
          <div className="flex flex-col items-center gap-2 text-amber-500">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">error_outline</span>
            </div>
            <h3 className="font-bold text-base text-on-surface">{t('loadLevelFailed')}</h3>
          </div>
        </div>

        {/* Streak Fallback Card (col-span-1) */}
        <div className="bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl p-6 shadow-2xs flex flex-col justify-center items-center text-center min-h-[160px]">
          <div className="flex flex-col items-center gap-2 text-amber-500">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">error_outline</span>
            </div>
            <h3 className="font-bold text-sm text-on-surface">{t('loadStreakFailed')}</h3>
          </div>
        </div>
      </div>
    );
  }

  const level = stats?.level || 1;
  const totalXp = stats?.xp || 0;
  const streakDays = stats?.streakDays || 0;

  // Calculate progress toward next level tier (assume 500 XP per tier for clean UI representation)
  const xpForCurrentTier = totalXp % 500;
  const progressPercent = Math.min(100, Math.round((xpForCurrentTier / 500) * 100));
  const xpNeeded = 500 - xpForCurrentTier;
  const tierNumber = Math.ceil(level / 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Level & XP Progress Card (col-span-2) */}
      <div className="bg-surface rounded-xl border border-outline-variant p-6 shadow-sm flex flex-col justify-between md:col-span-2 relative overflow-hidden transition-all hover:shadow-md">
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              {t('currentLevel')}
            </span>
            <div className="text-3xl font-black text-on-surface flex items-center gap-2">
              <span>{t('level')} {level}</span>
              <span className="material-symbols-outlined text-primary text-3xl">military_tech</span>
            </div>
          </div>
          <div className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full uppercase tracking-wide">
            ★ {t('tier')} {tierNumber}
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-2">
          <div className="flex justify-between text-xs font-semibold text-on-surface-variant mb-1">
            <span>{t('levelProgress', { level: level + 1 })}</span>
            <span className="font-mono text-on-surface">{totalXp.toLocaleString()} XP (+{xpNeeded} {t('nextLevel')})</span>
          </div>
          <Progress
            value={progressPercent}
            className="h-2.5 bg-surface-container border border-outline-variant/40 rounded-full overflow-hidden"
          />
        </div>
      </div>

      {/* Streak Card (col-span-1) */}
      <div className="bg-surface rounded-xl border border-outline-variant p-6 shadow-sm flex flex-col items-center justify-center text-center transition-all hover:shadow-md">
        <div className="w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-3 animate-pulse">
          <span className="text-3xl">🔥</span>
        </div>
        <div className="text-2xl font-black text-on-surface font-mono">
          {streakDays}
        </div>
        <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mt-1">
          {t('streakDays')}
        </div>
      </div>
    </div>
  );
}
