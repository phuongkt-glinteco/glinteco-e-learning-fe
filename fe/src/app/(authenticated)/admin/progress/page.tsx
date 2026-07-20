import { getTranslations } from 'next-intl/server';
import { AdminLearnerProgressClient } from '@/components/features/cohorts';

export async function generateMetadata() {
  const t = await getTranslations('AppShell');
  return {
    title: `${t('learnerProgress')} | Admin`,
    description: t('learnerProgressDesc'),
  };
}

export default async function AdminLearnerProgressPage() {
  const t = await getTranslations('AppShell');

  return (
    <div className="p-gutter max-w-7xl mx-auto space-y-xl w-full flex-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="headline-lg text-on-surface font-black tracking-tight">
            {t('learnerProgress')}
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            {t('learnerProgressDesc')}
          </p>
        </div>
      </div>
      <AdminLearnerProgressClient />
    </div>
  );
}
