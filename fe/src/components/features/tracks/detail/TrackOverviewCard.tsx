'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface TrackOverviewCardProps {
  trackId: string;
  title: string;
  estimatedTime?: string;
  description?: string;
  onPreview: () => void;
}

export default function TrackOverviewCard({
  trackId,
  title,
  estimatedTime,
  description,
  onPreview,
}: TrackOverviewCardProps) {
  const t = useTranslations('TrackDetailPage');

  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
      <div className="flex flex-col gap-4 mb-6">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-[32px] font-bold text-on-surface flex-grow line-clamp-3">
              {title}
            </h2>
            <div className="flex items-center gap-1 text-outline font-label-sm shrink-0 pt-2">
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              <span>{estimatedTime ? t('duration', { time: estimatedTime }) : 'N/A'}</span>
            </div>
          </div>
          <p className="text-body-md text-on-surface-variant max-w-2xl mt-4 min-h-[40px]">
            {description || t('noDescription')}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-outline-variant">
        <Link
          href={`/admin/tracks/${trackId}/edit`}
          className="flex items-center gap-2 px-4 py-2 border border-primary text-primary font-label-md rounded-lg hover:bg-primary/5 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">edit</span>
          {t('editTrack')}
        </Link>
        <button
          type="button"
          onClick={onPreview}
          className="flex items-center gap-2 px-4 py-2 border border-primary text-primary font-label-md rounded-lg hover:bg-primary/5 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">visibility</span>
          {t('previewTrack')}
        </button>
        <Link
          href={`/admin/tracks/${trackId}/lessons/new`}
          className="flex items-center gap-2 px-4 py-2 border border-primary text-primary font-label-md rounded-lg hover:bg-primary/5 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          {t('addLesson')}
        </Link>
        <Link
          href={`/admin/tracks/${trackId}/exercises/new`}
          className="flex items-center gap-2 px-6 py-2 bg-primary text-on-primary font-label-md rounded-lg hover:opacity-90 shadow-md transition-all ml-auto"
        >
          <span className="material-symbols-outlined text-[18px]">fitness_center</span>
          {t('addExercise')}
        </Link>
      </div>
    </section>
  );
}
