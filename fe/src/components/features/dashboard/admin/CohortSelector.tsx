'use client';

import { useTranslations } from 'next-intl';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/default/select';

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
      <Select value={selectedId} onValueChange={onChange}>
        <SelectTrigger className="w-full bg-surface border-outline-variant hover:bg-surface-container-low transition-colors text-body-sm font-medium h-10">
          <SelectValue placeholder={t('selectCohort')} />
        </SelectTrigger>
        <SelectContent>
          {cohorts.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
