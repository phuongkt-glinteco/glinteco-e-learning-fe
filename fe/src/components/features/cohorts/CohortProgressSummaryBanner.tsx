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
  avgRampDays?: number;
  targetRampDays?: number;
}

export function CohortProgressSummaryBanner({
  cohortId,
  cohortName,
  cohortList = [],
  onSelectCohort,
  avgProgressPct,
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
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
