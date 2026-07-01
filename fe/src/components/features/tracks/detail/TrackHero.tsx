'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/default/card';
import { Button } from '@/components/ui/default/button';
import { Badge } from '@/components/ui/default/badge';

interface TrackHeroProps {
  title: string;
  description: string;
  estimatedTime?: string;
  onStartTrack?: () => void;
}

export function TrackHero({
  title,
  description,
  estimatedTime = '0m',
  onStartTrack,
}: TrackHeroProps) {
  const t = useTranslations('TrackPreview');

  return (
    <Card className="relative overflow-hidden group flex flex-col md:flex-row gap-gutter border-outline-variant shadow-sm">
      <div className="absolute top-0 right-0 w-64 h-64 bg-surface-container-low rounded-bl-full -mr-16 -mt-16 opacity-50 pointer-events-none transition-transform group-hover:scale-105"></div>
      <CardContent className="relative z-10 flex-1 p-gutter border-none">
        <Badge variant="secondary" className="mb-4 uppercase tracking-wider text-[12px] font-medium text-on-surface-variant bg-surface-container-low hover:bg-surface-container-low">
          {t('coreCurriculum')}
        </Badge>
        <h1 className="text-[32px] md:text-[40px] font-bold text-primary mb-4">
          {title || t('untitledTrack')}
        </h1>
        <p className="text-[16px] text-on-surface-variant max-w-2xl mb-8 whitespace-pre-line">
          {description || t('noDescription')}
        </p>
        <div className="flex flex-col gap-6 mb-8">
          <div className="max-w-md">
            <div className="flex justify-between items-center mb-2 text-[14px] font-medium">
              <span className="text-on-surface">{t('trackProgress')}</span>
              <span className="text-on-surface-variant">0%</span>
            </div>
            <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full w-[0%]"></div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[14px] font-medium text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]">schedule</span>
            <span>{t('estTotalContent', { time: estimatedTime })}</span>
          </div>
        </div>
        <Button
          onClick={onStartTrack}
          className="w-full md:w-auto gap-2"
        >
          {t('startTrack')}
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Button>
      </CardContent>
    </Card>
  );
}
