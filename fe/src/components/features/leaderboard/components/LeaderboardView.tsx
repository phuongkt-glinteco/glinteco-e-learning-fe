import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/default/card';
import { Skeleton } from '@/components/ui/default/skeleton';
import { LeaderboardScopeTabs } from './LeaderboardScopeTabs';
import { LeaderboardTable } from './LeaderboardTable';
import type { LeaderboardRow, LeaderboardScope } from '../types';

interface LeaderboardViewProps {
  scope: LeaderboardScope;
  onScopeChange: (scope: LeaderboardScope) => void;
  rows: LeaderboardRow[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

function LeaderboardLoadingState() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full rounded-2xl sm:w-72" />
      <Card className="border-border/70 bg-card/95 shadow-sm">
        <CardContent className="space-y-4 p-5">
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
        </CardContent>
      </Card>
    </div>
  );
}

export function LeaderboardView({
  scope,
  onScopeChange,
  rows,
  loading,
  error,
  onRetry,
}: LeaderboardViewProps) {
  const t = useTranslations('LeaderboardPage');

  return (
    <section className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 px-gutter py-8">
      <header className="space-y-3">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          <span className="material-symbols-outlined text-[16px]">social_leaderboard</span>
          {t('eyebrow')}
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t('title')}
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            {t('description')}
          </p>
        </div>
      </header>

      <Card className="border-border/70 bg-card/95 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {t('scopeLabel')}
              </p>
              <h2 className="text-xl font-semibold text-foreground whitespace-nowrap">
                {scope === 'cohort' ? t('myCohortTitle') : t('globalTitle')}
              </h2>
            </div>
            <LeaderboardScopeTabs scope={scope} onScopeChange={onScopeChange} />
          </div>

          {loading ? <LeaderboardLoadingState /> : null}

          {!loading && error ? (
            <div className="rounded-3xl border border-destructive/30 bg-destructive/8 p-5 text-destructive">
              <h3 className="text-base font-semibold">{t('errorTitle')}</h3>
              <p className="mt-2 text-sm leading-6">{error}</p>
              <button
                type="button"
                onClick={onRetry}
                className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground  hover:opacity-90"
              >
                {t('retry')}
              </button>
            </div>
          ) : null}

          {!loading && !error && rows.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/80 bg-muted/35 p-8 text-center">
              <h3 className="text-lg font-semibold text-foreground">{t('emptyTitle')}</h3>
              <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {t('emptyDescription')}
              </p>
            </div>
          ) : null}

          {!loading && !error && rows.length > 0 ? <LeaderboardTable rows={rows} /> : null}
        </CardContent>
      </Card>
    </section>
  );
}
