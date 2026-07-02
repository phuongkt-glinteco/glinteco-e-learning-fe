'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { UserDashboardStatsDto } from '@/services/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/default/card';
import { Progress } from '@/components/ui/default/progress';
import { Button } from '@/components/ui/default/button';
import { Badge } from '@/components/ui/default/badge';

interface GamificationStatsProps {
  stats: UserDashboardStatsDto | null;
  onClaimDailyXp?: () => Promise<void>;
  claiming?: boolean;
}

export function GamificationStats({
  stats,
  onClaimDailyXp,
  claiming = false,
}: GamificationStatsProps) {
  const t = useTranslations('ProfilePage');

  const level = stats?.level || 1;
  const totalXp = stats?.xp || 0;
  const weeklyXp = stats?.xpThisWeek || 0;
  const streakDays = stats?.streakDays || 0;

  // Calculate progress toward next level (assume 500 XP per level tier for visual representation)
  const xpForCurrentTier = totalXp % 500;
  const progressPercent = Math.min(100, Math.round((xpForCurrentTier / 500) * 100));
  const xpNeeded = 500 - xpForCurrentTier;

  return (
    <Card className="border border-outline-variant bg-surface-container-low shadow-sm flex flex-col justify-between h-full">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            {t('gamificationEngine')}
          </span>
          <CardTitle className="text-2xl md:text-3xl font-black text-on-surface flex items-center gap-2">
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              {t('level')} {level}
            </span>
            <Badge variant="outline" className="border-amber-500/50 text-amber-500 text-xs py-0 px-2 font-mono">
              ★ {t('tier')} {Math.ceil(level / 5)}
            </Badge>
          </CardTitle>
        </div>

        {/* Streak Display with Neon Pulse */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 px-3 py-1.5 rounded-full shadow-inner animate-pulse">
          <span className="text-xl">🔥</span>
          <div className="flex flex-col text-right">
            <span className="text-sm font-bold text-orange-500 leading-none">
              {streakDays}
            </span>
            <span className="text-[10px] uppercase font-semibold text-on-surface-variant leading-none mt-0.5">
              {t('streakDays')}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-6 pt-4">
        {/* Progress Bar Section */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-end text-sm font-medium">
            <span className="text-on-surface-variant flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-primary">bolt</span>
              {t('totalXp')}: <strong className="text-on-surface font-mono">{totalXp.toLocaleString()} XP</strong>
            </span>
            <span className="text-xs text-primary font-semibold">
              +{xpNeeded} XP {t('nextLevel')} ({progressPercent}%)
            </span>
          </div>

          <div className="relative">
            <Progress
              value={progressPercent}
              className="h-3.5 bg-surface-container border border-outline-variant/40 rounded-full overflow-hidden shadow-inner"
            />
          </div>
        </div>

        {/* Stats Grid & Daily Claim Button */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-outline-variant pt-4 items-center">
          <div className="flex flex-col gap-1 bg-surface-container/50 p-3 rounded-lg border border-outline-variant/30">
            <span className="text-xs font-semibold text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-cyan-500">trending_up</span>
              {t('weeklyXp')}
            </span>
            <span className="text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400">
              +{weeklyXp.toLocaleString()} XP
            </span>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={onClaimDailyXp}
              disabled={claiming || !onClaimDailyXp}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 hover:from-amber-600 to-orange-500 hover:to-orange-600 text-white font-bold shadow-md hover:shadow-lg transition-all duration-200 gap-2"
            >
              <span className="material-symbols-outlined text-base">redeem</span>
              {claiming ? t('updatingPassword') : t('claimDailyXp')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
