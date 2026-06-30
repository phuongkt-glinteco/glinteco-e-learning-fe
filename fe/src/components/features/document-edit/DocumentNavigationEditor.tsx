'use client';

import { useTranslations } from 'next-intl';

interface DocumentNavigationEditorProps {
  description: string;
  onDescriptionChange: (value: string) => void;
  overview: string;
  onOverviewChange: (value: string) => void;
}

export function DocumentNavigationEditor({
  description,
  onDescriptionChange,
  overview,
  onOverviewChange,
}: DocumentNavigationEditorProps) {
  const t = useTranslations('DocumentEdit');

  return (
    <div className="space-y-6">
      <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm">
        <h3 className="font-label-md text-on-surface mb-4 border-b border-outline-variant pb-2">
          {t('description')}
        </h3>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 font-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary resize-none"
          rows={4}
          placeholder={t('descriptionPlaceholder')}
        />
      </div>

      <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm">
        <h3 className="font-label-md text-on-surface mb-4 border-b border-outline-variant pb-2">
          {t('overview')}
        </h3>
        <textarea
          value={overview}
          onChange={(e) => onOverviewChange(e.target.value)}
          className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 font-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary resize-none"
          rows={10}
          placeholder={t('overviewPlaceholder')}
        />
      </div>
    </div>
  );
}
