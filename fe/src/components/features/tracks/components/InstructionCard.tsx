'use client';

import { useTranslations } from 'next-intl';
import { useTrackDraftStore } from '@/stores/trackDraftStore';

export function InstructionCard() {
  const t = useTranslations('CreateTrackPage');
  const { title, lessons } = useTrackDraftStore();
  const ready = title.trim() && lessons.length > 0;

  return (
    <div className="mt-6 p-4 bg-primary-container text-on-primary-container rounded-lg border border-primary flex gap-4">
      <span className="material-symbols-outlined text-[20px] shrink-0">lightbulb</span>
      <p className="text-body-sm leading-relaxed">
        {ready ? t('instructionReady') : t('instructionPending')}
      </p>
    </div>
  );
}
