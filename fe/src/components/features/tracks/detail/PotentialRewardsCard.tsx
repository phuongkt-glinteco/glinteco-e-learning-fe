'use client';

import { useTranslations } from 'next-intl';

interface PotentialRewardsCardProps {
  xp?: number;
}

export function PotentialRewardsCard({ xp = 2400 }: PotentialRewardsCardProps) {
  const t = useTranslations('TrackPreview');

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <span className="material-symbols-outlined text-secondary">stars</span>
        <h3 className="font-headline-sm text-[18px] text-on-surface">{t('potentialRewardsTitle')}</h3>
      </div>
      <div className="p-4 bg-secondary/5 rounded-xl border border-secondary/10">
        <p className="text-label-sm text-secondary mb-1">{t('totalCompletionXp')}</p>
        <p className="font-headline-md text-secondary">{xp.toLocaleString()} XP</p>
        <div className="w-full h-1 bg-secondary/20 rounded-full mt-3 overflow-hidden">
          <div className="h-full bg-secondary w-0"></div>
        </div>
      </div>
    </div>
  );
}
