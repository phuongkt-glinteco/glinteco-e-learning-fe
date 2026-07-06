'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { UserDashboardStatsDto } from '@/services/client';
import CircleMeter from '@/components/ui/CircleMeter';
interface ActivityBreakdownProps {
  stats: UserDashboardStatsDto | null;
}

export function ActivityBreakdown({ stats }: ActivityBreakdownProps) {
  const t = useTranslations('ProfilePage');

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Fallback Card 1: Tracks */}
        <div className="bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl p-5 shadow-2xs flex flex-col justify-center items-center text-center min-h-[220px]">
          <div className="flex flex-col items-center gap-2 text-amber-500">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">error_outline</span>
            </div>
            <h3 className="font-bold text-sm text-on-surface">{t('loadTracksFailed')}</h3>
          </div>
        </div>

        {/* Fallback Card 2: Exercises */}
        <div className="bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl p-5 shadow-2xs flex flex-col justify-center items-center text-center min-h-[220px]">
          <div className="flex flex-col items-center gap-2 text-amber-500">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">error_outline</span>
            </div>
            <h3 className="font-bold text-sm text-on-surface">{t('loadExercisesFailed')}</h3>
          </div>
        </div>

        {/* Fallback Card 3: Saved Docs */}
        <div className="bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl p-5 shadow-2xs flex flex-col justify-center items-center text-center min-h-[220px]">
          <div className="flex flex-col items-center gap-2 text-amber-500">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">error_outline</span>
            </div>
            <h3 className="font-bold text-sm text-on-surface">{t('loadDocsFailed')}</h3>
          </div>
        </div>
      </div>
    );
  }

  const overall = stats?.overallCompletion || 0;
  const tracksCompleted = stats?.tracks?.completed || 0;
  const tracksTotal = stats?.tracks?.total || 0;
  const exApproved = stats?.exercises?.approved || 0;
  const exAwaiting = stats?.exercises?.awaitingReview || 0;
  const docsTotal = stats?.savedDocs?.total || 0;
  const docsUnread = stats?.savedDocs?.unread || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 1. Merged Tracks & Overall Progress Card */}
      <div className="bg-surface rounded-xl border border-outline-variant p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">route</span>
            </div>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              {overall}% {t('complete')}
            </span>
          </div>
          <h3 className="text-lg font-bold text-on-surface mb-2">{t('tracksAndProgress')}</h3>
          
          <div className="flex items-center gap-4 my-3">
            <CircleMeter value={overall} size={52} label={`${overall}%`} />
            <div className="flex flex-col gap-1 flex-1">
              <span className="text-sm text-on-surface font-semibold">
                {t('tracksCompleted', { completed: tracksCompleted, total: tracksTotal })}
              </span>
              <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-primary h-full transition-all duration-500"
                  style={{ width: `${tracksTotal > 0 ? (tracksCompleted / tracksTotal) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-primary text-xs font-bold mt-4 pt-3 border-t border-outline-variant/40 group-hover:translate-x-1 transition-transform">
          <span>{t('viewDetails')}</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </div>
      </div>

      {/* 2. Exercises Card */}
      <div className="bg-surface rounded-xl border border-outline-variant p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between">
        <div>
          <div className="w-10 h-10 rounded-lg bg-surface-container mb-4 flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-emerald-600 transition-colors">code</span>
          </div>
          <h3 className="text-lg font-bold text-on-surface mb-1">{t('exercises')}</h3>
          <div className="text-sm text-on-surface-variant mb-3 flex flex-col gap-1.5 font-medium mt-3">
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              {exApproved} {t('exercisesApproved')}
            </span>
            <span className="text-amber-500 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">pending</span>
              {exAwaiting} {t('exercisesAwaiting')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold mt-4 pt-3 border-t border-outline-variant/40 group-hover:translate-x-1 transition-transform">
          <span>{t('viewExercises')}</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </div>
      </div>

      {/* 3. Saved Docs Card */}
      <div className="bg-surface rounded-xl border border-outline-variant p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between">
        <div>
          <div className="w-10 h-10 rounded-lg bg-surface-container mb-4 flex items-center justify-center group-hover:bg-purple-500/10 transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-purple-600 transition-colors">menu_book</span>
          </div>
          <h3 className="text-lg font-bold text-on-surface mb-1">{t('savedDocs')}</h3>
          <div className="text-sm text-on-surface-variant mb-3 flex flex-col gap-1.5 font-medium mt-3">
            <span>{docsTotal} {t('docsTotal')}</span>
            <span className="text-on-surface font-bold flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
              <span className="material-symbols-outlined text-[16px]">bookmark_added</span>
              {docsUnread} {t('docsUnread')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 text-xs font-bold mt-4 pt-3 border-t border-outline-variant/40 group-hover:translate-x-1 transition-transform">
          <span>{t('viewDocs')}</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </div>
      </div>
    </div>
  );
}
