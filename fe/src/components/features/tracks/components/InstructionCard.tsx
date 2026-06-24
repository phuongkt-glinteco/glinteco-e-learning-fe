'use client';

import { useTranslations } from 'next-intl';

interface InstructionCardProps {
  ready: boolean;
}

export function InstructionCard({ ready }: InstructionCardProps) {
  const t = useTranslations('CreateTrackPage');

  return (
    <div className="p-4 bg-primary-container text-on-primary-container rounded-lg border border-primary flex gap-4">
      <span className="material-symbols-outlined text-[20px] shrink-0">lightbulb</span>
      <p className="text-body-sm leading-relaxed">
        {ready ? t('instructionReady') : t('instructionPending')}
      </p>
    </div>
  );
}
