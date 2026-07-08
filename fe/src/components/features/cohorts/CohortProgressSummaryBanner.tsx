'use client';

import { useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';
import { Card, CardContent } from '@/components/ui/default/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/default/select';

interface CohortProgressSummaryBannerProps {
  cohortId: string;
  cohortName?: string;
  cohortList?: { id: string; name: string }[];
  onSelectCohort?: (id: string) => void;
  avgProgressPct: number;
  aheadCount: number;
  onTrackCount: number;
  behindCount: number;
  avgRampDays?: number;
  targetRampDays?: number;
}

export function CohortProgressSummaryBanner({
  cohortId,
  cohortName,
  cohortList = [],
  onSelectCohort,
  avgProgressPct,
  aheadCount,
  onTrackCount,
  behindCount,
  avgRampDays = 28,
  targetRampDays = 30,
}: CohortProgressSummaryBannerProps) {
  const t = useTranslations('CohortDetailPage');

  return (
    <div className="space-y-4">
      {/* Banner Header with Select Cohort and Overall Progress */}
      <Card className="relative overflow-hidden border-outline-variant bg-gradient-to-br from-surface to-surface-container/60 shadow-sm">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-indigo-500 to-emerald-500" />
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left Title & Cohort Switcher */}
            <div className="space-y-2 max-w-md">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                <Icon icon="lucide:gauge" className="w-4 h-4" />
                <span>{t('progressSummaryTitle')}</span>
              </div>

              <div className="flex items-center gap-3">
                {cohortList.length > 0 && onSelectCohort ? (
                  <Select value={cohortId} onValueChange={onSelectCohort}>
                    <SelectTrigger className="w-[240px] h-10 font-bold text-sm bg-surface">
                      <SelectValue placeholder={t('selectCohort')} />
                    </SelectTrigger>
                    <SelectContent>
                      {cohortList.map((c) => (
                        <SelectItem key={c.id} value={c.id} className="font-medium text-sm">
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <h3 className="text-xl font-black text-on-surface tracking-tight">
                    {cohortName || `Cohort ${cohortId.slice(0, 8).toUpperCase()}`}
                  </h3>
                )}
              </div>
            </div>

            {/* Overall Progress Meter */}
            <div className="flex-1 max-w-xl bg-surface-container/60 rounded-2xl p-4.5 border border-outline-variant/60 shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  {t('cohortOverallProgress')}
                </span>
                <span className="text-lg font-black text-primary">
                  {Math.round(avgProgressPct)}%
                </span>
              </div>

              <div className="w-full bg-surface-container-highest/60 rounded-full h-3 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(100, Math.max(0, avgProgressPct))}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-on-surface-variant mt-2">
                <span>{t('avgRampMetric', { days: avgRampDays })}</span>
                <span>{t('targetRampMetric', { days: targetRampDays })}</span>
              </div>
            </div>
          </div>

          {/* Pacing Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-outline-variant/60">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <Icon icon="lucide:trending-up" className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  {t('learnersAhead')}
                </div>
                <div className="text-base font-black text-emerald-800 dark:text-emerald-200">
                  {aheadCount} học viên
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-primary/10 border border-primary/20">
              <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center text-primary shrink-0">
                <Icon icon="lucide:check-circle-2" className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-primary">
                  {t('learnersOnTrack')}
                </div>
                <div className="text-base font-black text-on-surface">
                  {onTrackCount} học viên
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <Icon icon="lucide:alert-circle" className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                  {t('learnersBehind')}
                </div>
                <div className="text-base font-black text-amber-800 dark:text-amber-200">
                  {behindCount} học viên
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
