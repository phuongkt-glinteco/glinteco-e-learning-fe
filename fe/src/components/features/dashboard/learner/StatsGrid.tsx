import { ProgressBar } from '@/components/ui/HPBar';

interface StatsGridProps {
  overallCompletion: number;
  xp: number;
  xpThisWeek: number;
  level: number;
  streakDays: number;
}

function StreakDots({ days }: { days: number }) {
  const dotCount = Math.min(days, 7);

  const weeklyStreak = Math.min(
    days >= 7 ? Math.floor(days / 7) : 0,
    4
  );

  if (days >= 7) {
    return (
      <div
        className="
          mt-2
          overflow-hidden
          rounded-md
          border border-cyan-400
          animate-neon-pulse
        "
      >
        <div className="flex h-2 w-full bg-yellow-300 divide-x divide-blue-400">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`
                flex-1 transition-all duration-500
                ${i < weeklyStreak
                  ? 'bg-orange-500'
                  : 'bg-yellow-300'} animate-neon-pulse
              `}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 flex overflow-hidden rounded-md border border-outline-variant divide-x divide-outline-variant">
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className={`h-2 w-full ${
            i < dotCount
              ? 'bg-yellow-300 animate-neon-pulse'
              : 'bg-slate-200'
          }`}
        />
      ))}
    </div>
  );
}

export default function StatsGrid({
  overallCompletion,
  xp,
  xpThisWeek,
  level,
  streakDays,
}: StatsGridProps) {
  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white border border-outline-variant p-md rounded-lg flex flex-col gap-2 hover:bg-slate-50 transition-colors group cursor-default">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-[18px]">donut_large</span>
          <span className="font-label-sm text-label-sm uppercase tracking-wider">Overall Progress</span>
        </div>
        <div className="font-headline-lg text-headline-lg text-on-surface flex items-baseline gap-1">
          {overallCompletion}<span className="text-headline-sm font-body-md text-on-surface-variant">%</span>
        </div>
        <ProgressBar value={overallCompletion} />
      </div>

      <div className="bg-white border border-outline-variant p-md rounded-lg flex flex-col gap-2 hover:bg-slate-50 transition-colors cursor-default">
        <div className="flex items-center gap-2 text-secondary">
          <span className="material-symbols-outlined text-[18px]">military_tech</span>
          <span className="font-label-sm text-label-sm uppercase tracking-wider">Total XP</span>
        </div>
        <div className="font-headline-lg text-headline-lg text-on-surface">{xp}</div>
        <div className="font-label-sm text-label-sm text-secondary mt-2">This Week: +{xpThisWeek} XP</div>
      </div>

      <div className="bg-white border border-outline-variant p-md rounded-lg flex flex-col gap-2 hover:bg-slate-50 transition-colors cursor-default">
        <div className="flex items-center gap-2 text-secondary">
          <span className="material-symbols-outlined text-[18px]">trending_up</span>
          <span className="font-label-sm text-label-sm uppercase tracking-wider">Current Level</span>
        </div>
        <div className="font-headline-sm text-headline-sm text-on-surface">Level {level}</div>
        <div className="font-label-sm text-label-sm text-on-surface-variant mt-2">Keep going!</div>
      </div>

      <div className="bg-white border border-outline-variant p-md rounded-lg flex flex-col gap-2 hover:bg-slate-50 transition-colors cursor-default">
        <div className="flex items-center gap-2 text-[#F59E0B]">
          <span className="material-symbols-outlined text-[18px]">local_fire_department</span>
          <span className="font-label-sm text-label-sm uppercase tracking-wider">Streak</span>
        </div>
        <div className="font-headline-lg text-headline-lg text-on-surface flex items-baseline gap-1">
          {streakDays}<span className="text-headline-sm font-body-md text-on-surface-variant">Days</span>
        </div>
        <StreakDots days={streakDays} />
      </div>
    </section>
  );
}
