'use client';

import { useTranslations } from 'next-intl';

interface CohortOption {
  id: string;
  name: string;
}

interface CohortSelectorProps {
  cohorts: CohortOption[];
  selectedId: string;
  onChange: (id: string) => void;
}

export default function CohortSelector({ cohorts, selectedId, onChange }: CohortSelectorProps) {
  const t = useTranslations('AdminDashboardPage');

  return (
    <div className="relative w-full max-w-xs">
      <label className="sr-only">{t('selectCohort')}</label>
      <div className="relative">
        <select
          value={selectedId}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 pr-8 text-body-sm font-medium text-on-surface-variant focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer transition-all hover:bg-surface-container-low"
        >
          {cohorts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-sm">expand_more</span>
        </div>
      </div>
    </div>
  );
}
