'use client';

import { useTranslations } from 'next-intl';

interface BasicInfoCardProps {
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

export function BasicInfoCard({ title, description, onTitleChange, onDescriptionChange }: BasicInfoCardProps) {
  const t = useTranslations('CreateTrackPage');

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
            onChange={(e) => onTitleChange(e.target.value)}
          />
        </div>
        <div>
          <label className="block label-sm text-on-surface-variant mb-2">{t('description')}</label>
          <textarea
            className="w-full border border-outline-variant rounded-lg p-3 text-body-base focus:border-primary focus:ring-0 transition-colors outline-none resize-none"
            placeholder={t('descriptionPlaceholder')}
            rows={4}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
          />
        </div>
      </div>
    </section>
  );
}
