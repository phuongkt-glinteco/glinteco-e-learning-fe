'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { UserDashboardStatsDto } from '@/services/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/default/card';
import { Badge } from '@/components/ui/default/badge';
import CircleMeter from '@/components/ui/CircleMeter';

interface ActivityBreakdownProps {
  stats: UserDashboardStatsDto | null;
}

export function ActivityBreakdown({ stats }: ActivityBreakdownProps) {
  const t = useTranslations('ProfilePage');

  const overall = stats?.overallCompletion || 0;
  const tracksCompleted = stats?.tracks?.completed || 0;
  const tracksTotal = stats?.tracks?.total || 0;
  const exApproved = stats?.exercises?.approved || 0;
  const exAwaiting = stats?.exercises?.awaitingReview || 0;
  const exTotal = stats?.exercises?.total || 0;
  const docsTotal = stats?.savedDocs?.total || 0;
  const docsUnread = stats?.savedDocs?.unread || 0;

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">analytics</span>
        {t('overallProgress')}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Overall Completion Circle Meter */}
        <Card className="border border-outline-variant bg-surface-container-low shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center p-4">
          <CardHeader className="p-0 pb-3 text-center">
            <CardTitle className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">
              {t('overallProgress')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex flex-col items-center justify-center">
            <CircleMeter value={overall} size={110} label={`${overall}%`} />
            <span className="text-xs font-semibold text-primary mt-3">
              {overall}% {t('complete')}
            </span>
          </CardContent>
        </Card>

        {/* 2. Tracks Breakdown */}
        <Card className="border border-outline-variant bg-surface-container-low shadow-sm hover:shadow-md transition-all flex flex-col justify-between p-5">
          <CardHeader className="p-0 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-500">route</span>
              {t('tracks')}
            </CardTitle>
            <Badge variant="secondary" className="font-mono text-xs">
              {tracksCompleted}/{tracksTotal}
            </Badge>
          </CardHeader>
          <CardContent className="p-0 pt-3 flex flex-col gap-3">
            <div className="text-2xl font-black text-on-surface font-mono">
              {tracksCompleted} <span className="text-sm font-normal text-on-surface-variant">/ {tracksTotal}</span>
            </div>
            <p className="text-xs text-on-surface-variant">
              {t('tracksCompleted', { completed: tracksCompleted, total: tracksTotal })}
            </p>
            <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
              <div
                className="bg-cyan-500 h-full transition-all duration-500"
                style={{ width: `${tracksTotal > 0 ? (tracksCompleted / tracksTotal) * 100 : 0}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* 3. Exercises Breakdown */}
        <Card className="border border-outline-variant bg-surface-container-low shadow-sm hover:shadow-md transition-all flex flex-col justify-between p-5">
          <CardHeader className="p-0 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-500">code</span>
              {t('exercises')}
            </CardTitle>
            <Badge variant="outline" className="font-mono text-xs text-emerald-600 border-emerald-500/40">
              {exTotal} {t('exercisesTotal')}
            </Badge>
          </CardHeader>
          <CardContent className="p-0 pt-3 flex flex-col gap-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-on-surface-variant flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                {t('exercisesApproved')}:
              </span>
              <strong className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{exApproved}</strong>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-on-surface-variant flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                {t('exercisesAwaiting')}:
              </span>
              <strong className="font-mono text-amber-600 dark:text-amber-400 font-bold">{exAwaiting}</strong>
            </div>

            <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${exTotal > 0 ? (exApproved / exTotal) * 100 : 0}%` }}
              />
              <div
                className="bg-amber-500 h-full transition-all duration-500"
                style={{ width: `${exTotal > 0 ? (exAwaiting / exTotal) * 100 : 0}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* 4. Saved Docs Breakdown */}
        <Card className="border border-outline-variant bg-surface-container-low shadow-sm hover:shadow-md transition-all flex flex-col justify-between p-5">
          <CardHeader className="p-0 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-500">menu_book</span>
              {t('savedDocs')}
            </CardTitle>
            <Badge variant="secondary" className="font-mono text-xs">
              {docsTotal} {t('docsTotal')}
            </Badge>
          </CardHeader>
          <CardContent className="p-0 pt-3 flex flex-col gap-3">
            <div className="text-2xl font-black text-on-surface font-mono">
              {docsTotal}
            </div>
            <div className="flex justify-between items-center text-sm border-t border-outline-variant/40 pt-2">
              <span className="text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-purple-500">bookmark_added</span>
                {t('docsUnread')}:
              </span>
              <Badge variant="outline" className="font-mono text-xs text-purple-600 border-purple-500/40">
                {docsUnread} {t('unread')}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
