'use client';

import { useTranslations } from 'next-intl';

interface BarItem {
  label: string;
  value: number;
}

interface CohortVelocityChartProps {
  data: BarItem[];
}

export default function CohortVelocityChart({ data }: CohortVelocityChartProps) {
  const t = useTranslations('AdminDashboardPage');
  return (
    <div className="bg-surface border border-outline-variant rounded-lg p-md">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-label-md text-label-md text-primary">{t('trackCompletion')}</h4>
        <span className="material-symbols-outlined text-sm text-on-surface-variant">trending_up</span>
      </div>
      <div className="flex items-end justify-between h-32 gap-1 px-2">
        {data.map((item) => {
          const isPeak = item.value >= 75;
          return (
            <div key={item.label} className="w-full bg-surface-container rounded-t-sm group relative">
              <div
                className={`w-full rounded-t-sm absolute bottom-0 transition-all duration-500 ${
                  isPeak ? 'bg-primary' : 'bg-primary-container/20'
                }`}
                style={{ height: `${item.value}%` }}
              />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-primary text-on-primary text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {item.value}%
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-4 text-[10px] font-bold text-on-surface-variant uppercase">
        {data.map((item) => (
          <span key={item.label} className="truncate text-[9px] max-w-[40px] text-center" title={item.label}>
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
