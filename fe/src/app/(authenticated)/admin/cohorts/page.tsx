import { getTranslations } from 'next-intl/server';
import { CohortListClient } from '@/components/features/cohorts';

export default async function CohortsPage() {
  const t = await getTranslations('AppShell');

  return (
    <div className="p-gutter max-w-7xl mx-auto space-y-xl w-full flex-1">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="headline-lg text-on-surface">
            {t('cohortManager')}
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            {t('cohortManagerDesc')}
          </p>
        </div>
      </div>

      <CohortListClient />
    </div>
  );
}
