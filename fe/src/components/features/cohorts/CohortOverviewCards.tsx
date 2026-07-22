'use client';

import { useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/default/button';
import { Card, CardContent } from '@/components/ui/default/card';
import Skeleton from '@/components/ui/loading/Skeleton';
import type { CohortDashboardStatsDto } from '@/services/api-client';

interface CohortOverviewCardsProps {
  stats?: CohortDashboardStatsDto | null;
  isLoading: boolean;
  error?: string | null;
  onReload?: () => void;
}

export function CohortOverviewCards({
  stats,
  isLoading,
  error,
  onReload,
}: CohortOverviewCardsProps) {
  const t = useTranslations('CohortDetailPage');

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-outline-variant shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-outline-variant shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-amber-500" />
        <CardContent className="p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
              <Icon icon="lucide:alert-triangle" className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-on-surface">{t('errorStatsTitle')}</h4>
              <p className="text-xs text-on-surface-variant">{error}</p>
            </div>
          </div>
          {onReload && (
            <Button onClick={onReload} variant="outline" className="shrink-0 flex items-center gap-2 border-outline-variant px-3 py-1.5 text-xs h-auto">
              <Icon icon="lucide:refresh-cw" className="w-3.5 h-3.5" />
              {t('errorStatsAction')}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      label: t('cardActiveLearners'),
      value: stats.activeLearners.toLocaleString(),
      subtext: stats.newThisWeek > 0
        ? t('cardNewThisWeek', { count: stats.newThisWeek })
        : t('cardNoNewThisWeek'),
      icon: 'lucide:users',
      color: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      label: t('cardCompletionRate'),
      value: `${stats.avgCompletion}%`,
      subtext: stats.avgCompletionDelta !== 0
        ? t('cardVsLastWeek', { delta: `${stats.avgCompletionDelta > 0 ? '+' : ''}${stats.avgCompletionDelta}` })
        : t('cardStable'),
      icon: 'lucide:trending-up',
      color: 'bg-green-50 text-green-600 border-green-100',
    },
    {
      label: t('cardPendingReviews'),
      value: stats.pendingReview.toLocaleString(),
      subtext: stats.oldestPendingAgo
        ? t('cardOldestPending', { time: stats.oldestPendingAgo })
        : t('cardNoPending'),
      icon: 'lucide:file-text',
      color: stats.pendingReview > 5 ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-600 border-slate-100',
    },
    {
      label: t('cardRampDays'),
      value: `${stats.avgRampDays} ngày`,
      subtext: t('cardTargetRamp', { days: stats.targetRampDays }),
      icon: 'lucide:clock',
      color: stats.avgRampDays > stats.targetRampDays ? 'bg-red-50 text-red-600 border-red-100' : 'bg-purple-50 text-purple-600 border-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <Card key={idx} className="border-outline-variant shadow-sm hover:border-outline transition-all">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div className="flex items-start justify-between gap-3">
              <span className="text-xs font-semibold text-on-surface-variant">{card.label}</span>
              <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${card.color}`}>
                <Icon icon={card.icon} className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-black text-on-surface tracking-tight">{card.value}</div>
              <p className="text-[11px] text-on-surface-variant mt-1 leading-snug">{card.subtext}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
