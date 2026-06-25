'use client';

import { useTranslations } from 'next-intl';

interface CreateTrackSummaryCardProps {
  title: string;
  description: string;
  previousTrackTitle?: string;
}

export function CreateTrackSummaryCard({ title, description, previousTrackTitle }: CreateTrackSummaryCardProps) {
  const t = useTranslations('CreateTrackPage');

  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="material-symbols-outlined text-primary">summarize</span>
        <h3 className="headline-sm text-on-surface">{t('summaryTitle')}</h3>
      </div>

      <dl className="space-y-4">
        <div>
          <dt className="label-sm text-outline mb-1">{t('trackTitle')}</dt>
          <dd className="text-body-base text-on-surface font-medium">{title.trim() || t('emptyTitle')}</dd>
        </div>
        <div>
          <dt className="label-sm text-outline mb-1">{t('description')}</dt>
          <dd className="text-body-sm text-on-surface-variant whitespace-pre-line">
            {description.trim() || t('emptyDescription')}
          </dd>
        </div>
        <div>
          <dt className="label-sm text-outline mb-1">{t('previousTrack')}</dt>
          <dd className="text-body-sm text-on-surface-variant">
            {previousTrackTitle || t('appendToEnd')}
          </dd>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="rounded-lg bg-surface-container-low p-3">
            <p className="label-sm text-outline">{t('summaryLessons')}</p>
            <p className="text-[24px] font-bold text-on-surface">0</p>
          </div>
          <div className="rounded-lg bg-surface-container-low p-3">
            <p className="label-sm text-outline">{t('summaryExercises')}</p>
            <p className="text-[24px] font-bold text-on-surface">0</p>
          </div>
        </div>
      </dl>
    </section>
  );
}
