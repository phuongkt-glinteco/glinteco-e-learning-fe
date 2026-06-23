'use client';

import { useTranslations } from 'next-intl';

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
    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-gutter relative overflow-hidden group shadow-sm flex flex-col md:flex-row gap-gutter">
      <div className="absolute top-0 right-0 w-64 h-64 bg-surface-container-low rounded-bl-full -mr-16 -mt-16 opacity-50 pointer-events-none transition-transform group-hover:scale-105"></div>
      <div className="relative z-10 flex-1">
        <div className="inline-flex items-center px-2 py-1 rounded bg-surface-container-low font-label-sm text-label-sm text-on-surface-variant mb-4 uppercase tracking-wider">
          {t('coreCurriculum')}
        </div>
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4">
          {title || t('untitledTrack')}
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mb-8 whitespace-pre-line">
          {description || t('noDescription')}
        </p>
        <div className="flex flex-col gap-6 mb-8">
          <div className="max-w-md">
            <div className="flex justify-between items-center mb-2 font-label-sm text-label-sm">
              <span className="text-on-surface">{t('trackProgress')}</span>
              <span className="text-on-surface-variant">0%</span>
            </div>
            <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full w-[0%]"></div>
            </div>
          </div>
          <div className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]">schedule</span>
            <span>{t('estTotalContent', { time: estimatedTime })}</span>
          </div>
        </div>
        <button
          onClick={onStartTrack}
          className="bg-primary text-on-primary px-6 py-3 rounded-lg font-label-md text-label-md flex items-center gap-2 hover:opacity-90 transition-opacity w-full md:w-auto justify-center cursor-pointer"
        >
          {t('startTrack')}
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </section>
  );
}
