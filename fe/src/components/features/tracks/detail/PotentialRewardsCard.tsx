'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/default/card';

interface PotentialRewardsCardProps {
  xp?: number;
}

export function PotentialRewardsCard({ xp = 2400 }: PotentialRewardsCardProps) {
  const t = useTranslations('TrackPreview');

  return (
    <Card className="border-outline-variant shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-secondary">stars</span>
          <h3 className="text-[18px] font-semibold text-on-surface">{t('potentialRewardsTitle')}</h3>
        </div>
        <div className="p-4 bg-secondary/5 rounded-xl border border-secondary/10">
          <p className="text-[14px] font-medium text-secondary mb-1">{t('totalCompletionXp')}</p>
          <p className="text-[20px] font-bold text-secondary">{xp.toLocaleString()} XP</p>
          <div className="w-full h-1 bg-secondary/20 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-secondary w-0"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
