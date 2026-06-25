'use client';

import { Icon } from '@iconify/react';
import { AppButton } from '@/components/ui/buttons';
import { useTranslations } from 'next-intl';

interface ReorderTopBarProps {
  isDirty: boolean;
  saving: boolean;
  selectedCount: number;
  onBack: () => void;
  onApply: () => void;
}

export default function ReorderTopBar({ isDirty, saving, selectedCount, onBack, onApply }: ReorderTopBarProps) {
  const t = useTranslations('ReorderTracksPage');

  return (
    <div className="flex items-center justify-between px-lg py-md border-b border-outline-variant bg-surface-container-lowest flex-shrink-0">
      <div className="flex items-center gap-md">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
        >
          <Icon icon="lucide:arrow-left" className="w-4 h-4" />
          <span className="font-label-sm">{t('tracks')}</span>
        </button>
        <div className="w-px h-5 bg-outline-variant/50" />
        <h1 className="font-label-md text-on-surface">{t('title')}</h1>
      </div>
      <div className="flex items-center gap-md">
        {selectedCount > 0 && (
          <span className="text-body-sm text-on-surface-variant">{t('selectedCount', { count: selectedCount })}</span>
        )}
        <AppButton
          icon="lucide:save"
          disabled={!isDirty || saving}
          onClick={onApply}
        >
          {saving ? t('saving') : t('apply')}
        </AppButton>
      </div>
    </div>
  );
}
