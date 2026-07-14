import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { AdminTrackListTable } from '@/components/features/tracks/AdminTrackListTable';

export default async function TracksPage() {
  const t = await getTranslations('AdminTracksPage');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 w-full flex-1">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-on-surface">{t('title')}</h1>
          <p className="text-xs text-on-surface-variant mt-1">
            {t('subtitle')}
          </p>
        </div>

        <Link
          href="/admin/tracks/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm hover:bg-primary/90 transition-all"
        >
          <span>+</span>
          <span>{t('createTrack')}</span>
        </Link>
      </div>

      <AdminTrackListTable />
    </div>
  );
}
