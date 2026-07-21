'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';
import { cohortControllerFindAll, type CohortSummaryDto } from '@/services/api-client';
import { CohortProgressSummaryBanner } from './CohortProgressSummaryBanner';
import { CohortLearnersTable } from './CohortLearnersTable';

export function AdminLearnerProgressClient() {
  const t = useTranslations('CohortDetailPage');

  const [cohorts, setCohorts] = useState<CohortSummaryDto[]>([]);
  const [selectedCohortId, setSelectedCohortId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCohorts() {
      setLoading(true);
      try {
        const res = await cohortControllerFindAll();
        const list = (res.data as { data?: CohortSummaryDto[] } | undefined)?.data || [];
        setCohorts(list);
        if (list.length > 0) {
          setSelectedCohortId(list[0].id);
        }
      } catch {
        // handled silently
      } finally {
        setLoading(false);
      }
    }
    loadCohorts();
  }, []);

  const cohortList = useMemo(() => cohorts.map((c) => ({ id: c.id, name: c.name })), [cohorts]);
  const selectedCohort = useMemo(() => cohorts.find((c) => c.id === selectedCohortId), [cohorts, selectedCohortId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-surface rounded-xl border border-outline-variant shadow-sm">
        <div className="relative flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full border-4 border-surface-container-highest border-t-primary loading-spinner" />
          <div className="absolute w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon icon="lucide:layers" className="w-4 h-4 text-primary" />
          </div>
        </div>
        <p className="text-lg font-bold text-on-surface">{t('loadingTitle')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <CohortProgressSummaryBanner
        cohortId={selectedCohortId}
        cohortName={selectedCohort?.name}
        cohortList={cohortList}
        onSelectCohort={setSelectedCohortId}
        avgProgressPct={0}
      />

      <CohortLearnersTable
        cohortId={selectedCohortId}
        cohortName={selectedCohort?.name}
      />
    </div>
  );
}
