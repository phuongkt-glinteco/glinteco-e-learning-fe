import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/default/badge';
import { Button } from '@/components/ui/default/button';
import { Card, CardContent } from '@/components/ui/default/card';
import type { LeaderboardRow } from '../types';
import { cn } from '@/lib/utils';

interface LeaderboardTableProps {
  rows: LeaderboardRow[];
  hasMore: boolean;
}

const badgeToneClasses = {
  blue: 'bg-[#eaf1ff] text-[#0f4cc9]',
  violet: 'bg-[#f3ebff] text-[#7c3aed]',
  green: 'bg-[#e8f6ec] text-[#0f7a34]',
  amber: 'bg-[#fff4d6] text-[#9a6700]',
  slate: 'bg-slate-100 text-slate-500',
} as const;

function CurrentUserBadge() {
  const t = useTranslations('LeaderboardPage');

  return (
    <span className="inline-flex h-6 items-center rounded-full bg-[#bfdbfe] px-2.5 text-[12px] font-semibold leading-none text-[#1d4ed8]">
      {t('you')}
    </span>
  );
}

export function LeaderboardTable({ rows, hasMore }: LeaderboardTableProps) {
  const t = useTranslations('LeaderboardPage');
  const mobileRows = rows.slice(0, 8);
  const getBadgeLabel = (badge: LeaderboardRow['badges'][number]) => {
    if (badge.id === 'podium') return t('badgePodium');
    if (badge.id === 'streak') return t('badgeStreak', { count: badge.value ?? 0 });
    if (badge.id === 'level') return t('badgeLevel', { level: badge.value ?? 0 });
    return t('badgeXpClub');
  };

  return (
    <>
      <Card className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white py-0 shadow-sm md:block">
        <CardContent className="px-0 py-0">
          <div className="border-b border-slate-200 px-6 py-5">
            <h3 className="headline-md text-[2rem] tracking-[-0.02em] text-slate-900">
              {t('fullRankings')}
            </h3>
          </div>

          <div className="label-sm grid grid-cols-[72px_minmax(0,1.9fr)_1fr_120px_96px_116px] gap-4 border-b border-slate-200 px-6 py-4 uppercase tracking-[0.18em] text-slate-500">
            <span>{t('rank')}</span>
            <span>{t('engineer')}</span>
            <span>{t('team')}</span>
            <span className="text-right">{t('xpEarned')}</span>
            <span>{t('streak')}</span>
            <span>{t('badges')}</span>
          </div>

          <div className="divide-y divide-slate-200">
            {rows.map((row) => (
              <div
                key={row.userId}
                className={cn(
                  'grid grid-cols-[72px_minmax(0,1.9fr)_1fr_120px_96px_116px] gap-4 px-6 py-4 transition-colors',
                  row.isCurrentUser && 'bg-[#d9e8ff]',
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl font-semibold text-slate-700">{row.rank}</span>
                </div>

                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 flex-none items-center justify-center rounded-full bg-[#dbe7ff] text-sm font-bold text-[#0f4cc9]">
                    {row.initials}
                  </div>
                  <div className="flex min-w-0 flex-col items-start justify-center">
                    <p className="body-md w-full truncate font-semibold text-slate-900">{row.name}</p>
                    {row.isCurrentUser ? <span className="mt-1"><CurrentUserBadge /></span> : null}
                  </div>
                </div>

                <div className="body-md flex min-w-0 items-center text-slate-600">
                  <span className="truncate">{row.teamLabel}</span>
                </div>

                <div className="flex items-center justify-end text-lg font-semibold text-[#0f4cc9]">
                  {row.xp.toLocaleString()}
                </div>
                <div className="flex items-center gap-1 text-base font-medium text-[#7c3aed]">
                  <span className="material-symbols-outlined text-base">local_fire_department</span>
                  <span>{row.streakDays > 0 ? row.streakDays : '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {row.badges.length > 0 ? (
                    row.badges.map((badge) => (
                      <span
                        key={badge.id}
                        title={getBadgeLabel(badge)}
                        className={cn(
                          'inline-flex h-7 w-7 items-center justify-center rounded-full',
                          badgeToneClasses[badge.tone],
                        )}
                      >
                        <span className="material-symbols-outlined text-base">{badge.icon}</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {hasMore ? (
            <div className="border-t border-slate-200 px-6 py-4 text-center">
              <Button
                type="button"
                variant="link"
                disabled
                className="h-auto px-0 text-sm font-semibold text-[#0f4cc9] opacity-100 disabled:opacity-100"
              >
                {t('loadMore')}
                <span className="material-symbols-outlined text-base">keyboard_arrow_down</span>
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-3 md:hidden">
        <Card className="rounded-2xl border border-slate-200 bg-white py-0 shadow-sm">
          <CardContent className="px-4 py-4">
            <h3 className="headline-sm text-slate-900">{t('fullRankings')}</h3>
          </CardContent>
        </Card>

        {mobileRows.map((row) => (
          <Card
            key={row.userId}
            className={cn(
              'rounded-2xl border border-slate-200 bg-white py-0 shadow-sm',
              row.isCurrentUser && 'border-[#9fc0ff] bg-[#eef5ff]',
            )}
          >
            <CardContent className="flex flex-col gap-4 px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-2xl bg-slate-100 px-2 text-sm font-bold text-slate-700">
                      #{row.rank}
                  </span>
                  <div className="flex h-10 w-10 shrink-0 flex-none items-center justify-center rounded-full bg-[#dbe7ff] text-sm font-bold text-[#0f4cc9]">
                    {row.initials}
                  </div>
                  <div className="flex min-w-0 flex-col items-start justify-center">
                    <p className="body-md w-full break-words font-semibold text-slate-900">{row.name}</p>
                    {row.isCurrentUser ? <span className="mt-1"><CurrentUserBadge /></span> : null}
                    <p className="body-sm text-slate-500">{row.teamLabel}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-3">
                <div className="min-w-0">
                  <p className="label-sm uppercase tracking-[0.14em] text-slate-500">
                    {t('xp')}
                  </p>
                  <p className="body-sm mt-1 font-semibold text-[#0f4cc9]">{row.xp.toLocaleString()}</p>
                </div>
                <div className="min-w-0">
                  <p className="label-sm uppercase tracking-[0.14em] text-slate-500">
                    {t('streak')}
                  </p>
                  <p className="body-sm mt-1 font-semibold text-[#7c3aed]">
                    {t('streakDaysValue', { count: row.streakDays })}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="label-sm uppercase tracking-[0.14em] text-slate-500">
                    {t('level')}
                  </p>
                  <p className="body-sm mt-1 font-semibold text-slate-900">{row.level}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {row.badges.length > 0 ? (
                  row.badges.map((badge) => (
                    <Badge
                      key={badge.id}
                      className={cn('h-auto rounded-full px-2.5 py-1 shadow-none', badgeToneClasses[badge.tone])}
                    >
                      <span className="material-symbols-outlined text-sm">{badge.icon}</span>
                      {getBadgeLabel(badge)}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">{t('noBadges')}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
