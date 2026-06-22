'use client';

import { useTranslations } from 'next-intl';
import { useTrackDraftStore } from '@/stores/trackDraftStore';
import { formatMinutes, parseTimeToMinutes } from '@/lib/time-utils';

export function BasicInfoCard() {
  const t = useTranslations('CreateTrackPage');
  const tu = useTranslations('TimeUnit');
  const { title, description, lessons, setTitle, setDescription } = useTrackDraftStore();
  const totalMin = lessons.reduce((sum, l) => sum + parseTimeToMinutes(l.estimatedTime), 0);

  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <span className="material-symbols-outlined text-primary">info</span>
        <h3 className="headline-sm text-on-surface">{t('basicInfo')}</h3>
      </div>
      <div className="space-y-6">
        <div>
          <label className="block label-sm text-on-surface-variant mb-2">{t('trackTitle')}</label>
          <input
            className="w-full border border-outline-variant rounded-lg p-3 text-body-base focus:border-primary focus:ring-0 transition-colors outline-none"
            placeholder={t('trackTitlePlaceholder')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="block label-sm text-on-surface-variant mb-2">{t('description')}</label>
          <textarea
            className="w-full border border-outline-variant rounded-lg p-3 text-body-base focus:border-primary focus:ring-0 transition-colors outline-none resize-none"
            placeholder={t('descriptionPlaceholder')}
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label className="block label-sm text-on-surface-variant mb-2">{t('estimatedCompletionTime')}</label>
          <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant rounded-lg p-3 text-secondary">
            <span className="material-symbols-outlined text-body-sm">schedule</span>
            <span className="text-body-base font-medium">
              {totalMin > 0 ? formatMinutes(totalMin, tu) : t('calculatedAutomatically')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
