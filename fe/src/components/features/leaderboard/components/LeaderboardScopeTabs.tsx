'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { LeaderboardPeriod } from '../types';

interface LeaderboardScopeTabsProps {
  period: LeaderboardPeriod;
  onPeriodChange: (period: LeaderboardPeriod) => void;
}

export function LeaderboardScopeTabs({
  period,
  onPeriodChange,
}: LeaderboardScopeTabsProps) {
  const t = useTranslations('LeaderboardPage');
  const options = [
    { id: 'weekly' as const, label: t('weekly') },
    { id: 'monthly' as const, label: t('monthly') },
    { id: 'all-time' as const, label: t('allTimeCompact') },
  ];

  return (
    <div
      className="inline-flex h-14 w-full items-center rounded-[10px] border border-[#cfd8f6] bg-[#e8eeff] p-1.5 shadow-[0_2px_8px_rgba(37,99,235,0.08)] sm:w-auto"
      role="tablist"
      aria-label={t('scopeLabel')}
    >
      {options.map((option) => {
        const isActive = option.id === period;

        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onPeriodChange(option.id)}
            className={cn(
              'label-md flex h-full min-w-[82px] flex-1 items-center justify-center rounded-[7px] px-4 text-center transition-colors sm:flex-none',
              isActive
                ? 'bg-white text-[#3d2cf3] shadow-[0_1px_3px_rgba(15,23,42,0.08)]'
                : 'text-slate-600',
              'hover:bg-white/70 hover:text-slate-900',
            )}
          >
            <span className="leading-tight">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
