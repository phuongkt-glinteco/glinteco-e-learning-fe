'use client';

import { useTranslations } from 'next-intl';

interface BarItem {
  label: string;
  value: number;
}

interface CohortVelocityChartProps {
  data: BarItem[];
}

function DonutChart({ completed, above50, below50 }: { completed: number; above50: number; below50: number }) {
  const total = completed + above50 + below50;
  if (total === 0) return null;

  const r = 15.9;
  const c = 2 * Math.PI * r;

  const completedLen = (completed / total) * c;
  const above50Len = (above50 / total) * c;

  return (
    <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
      <circle cx="18" cy="18" r={r} fill="none" stroke="#d3e4fe" strokeWidth="3" />
      <circle
        cx="18" cy="18" r={r} fill="none" stroke="#22c55e"
        strokeWidth="3" strokeDasharray={`${completedLen} ${c - completedLen}`}
        strokeLinecap="round"
      />
      {above50 > 0 && (
        <circle
          cx="18" cy="18" r={r} fill="none" stroke="#eab308"
          strokeWidth="3" strokeDasharray={`${above50Len} ${c - above50Len}`}
          strokeDashoffset={`-${completedLen}`}
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

export default function CohortVelocityChart({ data }: CohortVelocityChartProps) {
  const t = useTranslations('AdminDashboardPage');

  const total = data.length;
  const completed = data.filter((d) => d.value >= 100).length;
  const above50 = data.filter((d) => d.value >= 50 && d.value < 100).length;
  const below50 = data.filter((d) => d.value < 50).length;

  return (
    <div className="bg-surface border border-outline-variant rounded-lg p-md">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-label-md text-label-md text-primary">{t('trackCompletion')}</h4>
        <span className="material-symbols-outlined text-sm text-on-surface-variant">donut_small</span>
      </div>
      <div className="flex items-center gap-lg">
        <DonutChart completed={completed} above50={above50} below50={below50} />
        <div className="flex flex-col gap-2 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
            <span>{t('chartCompleted', { count: completed, total })}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500 flex-shrink-0" />
            <span>{t('chartAbove50', { count: above50, total })}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-surface-container-highest flex-shrink-0" />
            <span>{t('chartBelow50', { count: below50, total })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
