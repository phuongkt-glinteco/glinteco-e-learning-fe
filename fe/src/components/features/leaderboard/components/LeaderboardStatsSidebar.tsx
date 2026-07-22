import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/default/card';
import { cn } from '@/lib/utils';
import type { LeaderboardCurrentUserSummary, LeaderboardMilestone } from '../types';

interface LeaderboardStatsSidebarProps {
  currentUserSummary: LeaderboardCurrentUserSummary | null;
  milestones: LeaderboardMilestone[];
}

const milestoneToneClasses = {
  violet: 'bg-[#f2ebff] text-[#7c3aed]',
  green: 'bg-[#e8f6ec] text-[#0f7a34]',
  blue: 'bg-[#eaf1ff] text-[#0f4cc9]',
} as const;

export function LeaderboardStatsSidebar({
  currentUserSummary,
  milestones,
}: LeaderboardStatsSidebarProps) {
  const t = useTranslations('LeaderboardPage');

  return (
    <div className="flex flex-col gap-5">
      <Card className="rounded-2xl border border-slate-200 bg-white py-0 shadow-sm">
        <CardHeader className="border-b border-slate-200 px-5 py-4">
          <CardTitle className="headline-md flex items-center gap-2 text-[1.75rem] text-slate-900">
            <span className="material-symbols-outlined text-xl text-[#0f4cc9]">person</span>
            {t('yourStats')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 px-5 py-5">
          {currentUserSummary ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="label-sm uppercase tracking-[0.18em] text-slate-500">
                    {t('currentRank')}
                  </p>
                  <p className="mt-2 text-4xl font-black tracking-[-0.03em] text-[#0f4cc9]">
                    #{currentUserSummary.rank}
                  </p>
                  <p className="body-sm mt-1 text-slate-500">{currentUserSummary.teamLabel}</p>
                </div>
                <div className="text-right">
                  <p className="label-sm uppercase tracking-[0.18em] text-slate-500">
                    {t('totalXp')}
                  </p>
                  <p className="mt-2 text-4xl font-black tracking-[-0.03em] text-slate-900">
                    {currentUserSummary.totalXp.toLocaleString()}
                  </p>
                  <p className="body-sm mt-1 text-slate-500">{currentUserSummary.name}</p>
                </div>
              </div>

              <div>
                <div className="label-sm flex items-center justify-between gap-3 text-slate-500">
                  <span>
                    {currentUserSummary.progressTargetRank
                      ? t('progressToRank', { rank: currentUserSummary.progressTargetRank })
                      : t('holdingRank', { rank: currentUserSummary.rank })}
                  </span>
                  <span className="text-[#0f4cc9]">
                    {currentUserSummary.progressTargetRank
                      ? t('xpToGo', { xp: currentUserSummary.progressDeltaXp })
                      : t('xpLead', { xp: currentUserSummary.progressDeltaXp })}
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-[#dce9ff]">
                  <div
                    className="h-2 rounded-full bg-[#0f4cc9]"
                    style={{ width: `${Math.max(6, Math.round(currentUserSummary.progressRatio * 100))}%` }}
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <p className="label-sm uppercase tracking-[0.18em] text-slate-500">
                  {t('weeklyGoal')}
                </p>
                <div className="mt-3 flex items-center gap-3 rounded-2xl bg-[#f8fbff] p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f6ec] text-[#0f7a34]">
                    <span className="material-symbols-outlined text-xl">target</span>
                  </div>
                  <div className="min-w-0">
                    <p className="body-md font-semibold text-slate-900">
                      {t('earnXpGoal', { xp: currentUserSummary.weeklyGoalTargetXp })}
                    </p>
                    <p className="body-sm font-medium text-[#0f7a34]">
                      {t('goalProgress', {
                        current: currentUserSummary.weeklyGoalCurrentXp,
                        target: currentUserSummary.weeklyGoalTargetXp,
                        percent: Math.round(currentUserSummary.weeklyGoalRatio * 100),
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">{t('statsUnavailable')}</p>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-slate-200 bg-white py-0 shadow-sm">
        <CardHeader className="border-b border-slate-200 px-5 py-4">
          <CardTitle className="headline-md flex items-center gap-2 text-[1.75rem] text-slate-900">
            <span className="material-symbols-outlined text-xl text-[#7c3aed]">public</span>
            {t('globalMilestones')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-5 py-5">
          {milestones.map((milestone) => (
            <div
              key={milestone.id}
              className={cn(
                'rounded-2xl border p-4',
                milestone.progressRatio == null ? 'border-[#dbe5f5] bg-[#eff4ff]' : 'border-slate-200 bg-white',
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-xl',
                    milestoneToneClasses[milestone.tone],
                  )}
                >
                  <span className="material-symbols-outlined text-xl">{milestone.icon}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="body-md font-bold text-slate-900">
                    {milestone.id === 'community-xp' && milestone.targetValue
                      ? t('milestoneCommunityXpTitle', { target: milestone.targetValue })
                      : null}
                    {milestone.id === 'active-engineers' && milestone.targetValue
                      ? t('milestoneActiveEngineersTitle', { target: milestone.targetValue })
                      : null}
                    {milestone.id === 'streak'
                      ? t('milestoneStreakTitle', { count: milestone.streakDays ?? 0 })
                      : null}
                  </p>
                  <p className="body-sm mt-1 text-slate-500">
                    {milestone.id === 'community-xp' ? t('milestoneCommunityXpDescription') : null}
                    {milestone.id === 'active-engineers' ? t('milestoneActiveEngineersDescription') : null}
                    {milestone.id === 'streak'
                      ? milestone.actorName
                        ? t('milestoneStreakDescription', { name: milestone.actorName })
                        : t('milestoneStreakEmptyDescription')
                      : null}
                  </p>

                  {milestone.progressRatio != null && milestone.currentValue != null && milestone.targetValue != null ? (
                    <>
                      <div className="mt-3 h-1.5 rounded-full bg-[#dce9ff]">
                        <div
                          className="h-1.5 rounded-full bg-[#0f7a34]"
                          style={{ width: `${Math.max(6, Math.round(milestone.progressRatio * 100))}%` }}
                        />
                      </div>
                      <p className="label-sm mt-2 text-slate-600">
                        {t('milestoneProgress', {
                          current: milestone.currentValue,
                          target: milestone.targetValue,
                        })}
                      </p>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
