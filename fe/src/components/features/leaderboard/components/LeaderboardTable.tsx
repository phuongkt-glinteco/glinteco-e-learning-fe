import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/default/badge';
import { Card, CardContent } from '@/components/ui/default/card';
import type { LeaderboardRow } from '../types';
import { cn } from '@/lib/utils';

interface LeaderboardTableProps {
  rows: LeaderboardRow[];
}

function CurrentUserBadge() {
  const t = useTranslations('LeaderboardPage');

  return (
    <Badge className="border-none bg-primary/15 text-primary shadow-none">
      {t('you')}
    </Badge>
  );
}

export function LeaderboardTable({ rows }: LeaderboardTableProps) {
  const t = useTranslations('LeaderboardPage');

  return (
    <>
      <Card className="hidden overflow-hidden border-border/70 bg-card/95 shadow-sm md:block">
        <CardContent className="p-0">
          <div className="grid grid-cols-[88px_minmax(0,1.8fr)_132px_132px_132px] gap-4 border-b border-border/70 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <span>{t('rank')}</span>
            <span>{t('learner')}</span>
            <span>{t('level')}</span>
            <span>{t('xp')}</span>
            <span>{t('streak')}</span>
          </div>

          <div className="divide-y divide-border/60">
            {rows.map((row) => (
              <div
                key={row.userId}
                className={cn(
                  'grid grid-cols-[88px_minmax(0,1.8fr)_132px_132px_132px] gap-4 px-6 py-4 transition-colors',
                  row.isCurrentUser && 'bg-primary/8',
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-muted text-sm font-bold text-foreground">
                    #{row.rank}
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">{row.name}</p>
                    {row.isCurrentUser ? <CurrentUserBadge /> : null}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{t('learnerRowHint')}</p>
                </div>

                <div className="flex items-center text-sm font-semibold text-foreground">
                  {row.level}
                </div>
                <div className="flex items-center text-sm font-semibold text-foreground">
                  {row.xp.toLocaleString()}
                </div>
                <div className="flex items-center text-sm font-semibold text-foreground">
                  {t('streakDaysValue', { count: row.streakDays })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:hidden">
        {rows.map((row) => (
          <Card
            key={row.userId}
            className={cn(
              'border-border/70 bg-card/95 shadow-sm',
              row.isCurrentUser && 'border-primary/35 bg-primary/8',
            )}
          >
            <CardContent className="flex flex-col gap-4 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-2xl bg-muted px-2 text-sm font-bold text-foreground">
                      #{row.rank}
                    </span>
                    {row.isCurrentUser ? <CurrentUserBadge /> : null}
                  </div>
                  <p className="mt-3 break-words text-base font-semibold text-foreground">{row.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 rounded-2xl bg-muted/60 p-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {t('level')}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{row.level}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {t('xp')}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{row.xp.toLocaleString()}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {t('streak')}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {t('streakDaysValue', { count: row.streakDays })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
