import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/default/button';
import { Card, CardContent } from '@/components/ui/default/card';
import { Skeleton } from '@/components/ui/default/skeleton';
import { LeaderboardPodium } from './LeaderboardPodium';
import { LeaderboardScopeTabs } from './LeaderboardScopeTabs';
import { LeaderboardStatsSidebar } from './LeaderboardStatsSidebar';
import { LeaderboardTable } from './LeaderboardTable';
import type { LeaderboardData, LeaderboardPeriod, LeaderboardScope } from '../types';

interface LeaderboardViewProps {
  period: LeaderboardPeriod;
  scope: LeaderboardScope;
  onPeriodChange: (period: LeaderboardPeriod) => void;
  leaderboard: LeaderboardData;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

function LeaderboardLoadingState() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
        <Card className="rounded-2xl border border-slate-200 bg-white py-0 shadow-sm">
          <CardContent className="space-y-4 px-0 py-0">
            <Skeleton className="h-16 rounded-none" />
            <Skeleton className="h-16 rounded-none" />
            <Skeleton className="h-16 rounded-none" />
            <Skeleton className="h-16 rounded-none" />
          </CardContent>
        </Card>
      </div>
      <div className="space-y-5">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-56 rounded-2xl" />
      </div>
    </div>
  );
}

export function LeaderboardView({
  period,
  scope,
  onPeriodChange,
  leaderboard,
  loading,
  error,
  onRetry,
}: LeaderboardViewProps) {
  const t = useTranslations('LeaderboardPage');
  const hasRows = leaderboard.rows.length > 0;

  return (
    <section className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 px-gutter py-8">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="headline-lg text-slate-950">
            {t('title')}
          </h1>
          <p className="body-md max-w-xl text-slate-600">
            {t('description')}
          </p>
        </div>
        <LeaderboardScopeTabs period={period} onPeriodChange={onPeriodChange} />
      </header>

      {loading ? <LeaderboardLoadingState /> : null}

      {!loading && error ? (
        <Card className="rounded-2xl border border-red-200 bg-[#fff7f7] py-0 shadow-sm">
          <CardContent className="px-6 py-6">
            <h2 className="text-lg font-semibold text-red-700">{t('errorTitle')}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-red-600">{error}</p>
            <Button type="button" onClick={onRetry} className="mt-5 h-11 rounded-xl px-4">
              {t('retry')}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {!loading && !error && !hasRows ? (
        <Card className="rounded-2xl border border-dashed border-slate-300 bg-white py-0 shadow-sm">
          <CardContent className="px-6 py-10 text-center">
            <h2 className="text-xl font-semibold text-slate-900">{t('emptyTitle')}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              {t('emptyDescription')}
            </p>
          </CardContent>
        </Card>
      ) : null}

      {!loading && !error && hasRows ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <p className="label-sm uppercase tracking-[0.18em] text-slate-500">
                  {t('scopeLabel')}
                </p>
                <h2 className="headline-md text-slate-900">
                  {scope === 'cohort' ? t('myCohortTitle') : t('globalTitle')}
                </h2>
              </div>
              <LeaderboardPodium rows={leaderboard.topRows} />
            </div>

            <LeaderboardTable
              rows={leaderboard.rows}
              hasMore={Boolean(leaderboard.nextCursor)}
            />
          </div>

          <LeaderboardStatsSidebar
            currentUserSummary={leaderboard.currentUserSummary}
            milestones={leaderboard.milestones}
          />
        </div>
      ) : null}
    </section>
  );
}
