import { getTranslations } from 'next-intl/server';
import TrackListTable from '@/components/features/tracks/TrackListTable';

export default async function TracksPage() {
  const t = await getTranslations('TracksPage');

  return (
    <div className="p-gutter max-w-7xl mx-auto space-y-xl">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="headline-lg text-on-surface">{t('title')}</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            {t('subtitle')}
          </p>
        </div>
      </div>

      <TrackListTable />
    </div>
  );
}

