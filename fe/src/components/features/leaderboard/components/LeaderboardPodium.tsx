import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback } from '@/components/ui/default/avatar';
import { Badge } from '@/components/ui/default/badge';
import { Card, CardContent } from '@/components/ui/default/card';
import { cn } from '@/lib/utils';
import type { LeaderboardRow } from '../types';

interface LeaderboardPodiumProps {
  rows: LeaderboardRow[];
}

const podiumOrder = [1, 0, 2] as const;

const cardToneClasses = {
  1: {
    card: 'border-[#2563eb] bg-white shadow-[0_16px_40px_-24px_rgba(37,99,235,0.5)] lg:-mt-6',
    rankChip: 'bg-[#fff4d6] text-[#9a6700]',
    avatarRing: 'ring-[#facc15]',
    name: 'text-[#0f4cc9]',
    statPanel: 'bg-[#eff4ff] text-[#0f4cc9]',
    streakBadge: 'bg-[#f4ebff] text-[#7c3aed]',
  },
  2: {
    card: 'border-slate-200 bg-white shadow-sm',
    rankChip: 'bg-slate-100 text-slate-500',
    avatarRing: 'ring-slate-200',
    name: 'text-slate-900',
    statPanel: 'bg-white text-[#0f4cc9]',
    streakBadge: 'bg-transparent text-[#7c3aed]',
  },
  3: {
    card: 'border-[#e8c8a6] bg-white shadow-sm',
    rankChip: 'bg-[#fff4ea] text-[#b45309]',
    avatarRing: 'ring-[#ead2b9]',
    name: 'text-slate-900',
    statPanel: 'bg-white text-[#0f4cc9]',
    streakBadge: 'bg-transparent text-[#7c3aed]',
  },
} as const;

export function LeaderboardPodium({ rows }: LeaderboardPodiumProps) {
  const t = useTranslations('LeaderboardPage');

  const cards = podiumOrder
    .map((index) => rows[index])
    .filter((row): row is LeaderboardRow => Boolean(row));

  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 pt-2 lg:grid-cols-3 lg:items-end">
      {cards.map((row) => {
        const tone = row.rank <= 3 ? cardToneClasses[row.rank as 1 | 2 | 3] : cardToneClasses[3];

        return (
          <Card
            key={row.userId}
            className={cn(
              'overflow-visible rounded-2xl border bg-white py-0',
              tone.card,
              row.rank === 1 ? 'order-2 lg:h-[18.75rem]' : '',
              row.rank === 2 ? 'order-1 lg:h-[17.5rem]' : '',
              row.rank === 3 ? 'order-3 lg:h-[17.5rem]' : '',
            )}
          >
            <CardContent className="relative flex h-full flex-col items-center px-5 pb-6 pt-5 text-center">
              <div
                className={cn(
                  'absolute left-4 top-4 inline-flex h-12 w-12 items-center justify-center rounded-full text-base font-black',
                  tone.rankChip,
                )}
              >
                #{row.rank}
              </div>

              <Avatar
                size="lg"
                className={cn(
                  'mt-2 h-24 w-24 ring-4 ring-offset-2 ring-offset-white',
                  tone.avatarRing,
                  row.rank === 1 ? 'h-28 w-28' : '',
                )}
              >
                <AvatarFallback className="bg-[#dbe7ff] text-lg font-bold text-[#0f4cc9]">
                  {row.initials}
                </AvatarFallback>
              </Avatar>

              <div className="mt-4 min-w-0">
                <p className={cn('headline-md truncate text-[1.75rem] tracking-[-0.02em]', tone.name)}>
                  {row.name}
                </p>
                <p className="body-sm mt-1 text-slate-500">{row.teamLabel}</p>
              </div>

              {row.rank === 1 ? (
                <div className={cn('mt-4 rounded-xl px-5 py-3', tone.statPanel)}>
                  <p className="text-[2rem]/8 font-black tracking-[-0.03em]">{row.xp.toLocaleString()}</p>
                  <p className="label-sm uppercase tracking-[0.16em]">{t('totalXp')}</p>
                </div>
              ) : null}

              <div className="mt-auto flex items-center gap-4 pt-4">
                {row.rank !== 1 ? (
                  <>
                    <div>
                      <p className="headline-sm text-[#0f4cc9]">{row.xp.toLocaleString()}</p>
                      <p className="label-sm text-slate-500">
                        {t('xpShort')}
                      </p>
                    </div>
                    <div className="h-8 w-px bg-slate-200" />
                  </>
                ) : null}

                <Badge
                  className={cn(
                    'label-sm h-auto rounded-full px-3 py-1',
                    row.rank === 1 
                    ? cn('inline-flex items-center gap-1 px-3 py-1', tone.streakBadge)
                    : 'inline-flex flex-col items-center justify-center gap-0 border-0 bg-white px-3 py-1 text-[#7c3aed] shadow-none hover:bg-white',
                  )}
                >
                  {row.rank === 1 ? (
                    <>
                      <span className="material-symbols-outlined text-sm">
                        local_fire_department
                      </span>

                      <span className="whitespace-nowrap">
                        {t('podiumStreak', { count: row.streakDays })}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="inline-flex items-center gap-1 whitespace-nowrap leading-none">
                        <span className="material-symbols-outlined text-sm">
                          local_fire_department
                        </span>

                        <span>{row.streakDays}</span>
                      </span>

                      <span className="label-sm whitespace-nowrap text-[10px] leading-none">
                        {t('podiumStreakLabel')}
                      </span>
                    </>
                  )}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
