import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import TrackListTable from '@/components/features/tracks/TrackListTable';

export default async function TracksPage() {
  const t = await getTranslations('TracksPage');

  return (
    <div className="p-gutter max-w-7xl mx-auto space-y-xl">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-body-sm text-on-surface-variant">
        <Link href="/dashboard" className="hover:text-primary transition-colors duration-200">
          Dashboard
        </Link>
        <Icon aria-hidden="true" />
        <span className="text-on-surface font-medium">{t('title')}</span>
      </nav>

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

function Icon({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={ariaHidden ?? true}
      className="shrink-0"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
