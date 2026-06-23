'use client';

import { useTranslations } from 'next-intl';

interface TrackStatusItem {
  title: string;
  status: 'completed' | 'in_progress' | 'locked';
}

interface TrackStatusCardProps {
  prevTrack?: TrackStatusItem;
  nextTrack?: TrackStatusItem;
  currentTitle: string;
  progress: number;
  totalXP: number;
}

function PrevNextItem({ item, label }: { item?: TrackStatusItem; label: string }) {
  const t = useTranslations('TrackPreview');

  if (!item) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-label-sm text-outline-variant uppercase tracking-wider">{label}</p>
        <div className="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-lg border border-outline-variant opacity-50">
          <span className="material-symbols-outlined text-[20px] text-outline">remove</span>
          <div className="flex-1">
            <p className="font-label-md text-label-md text-on-surface-variant">{t('noPrevNextTrack')}</p>
          </div>
        </div>
      </div>
    );
  }

  const isCompleted = item.status === 'completed';
  const isLocked = item.status === 'locked';

  return (
    <div className="flex flex-col gap-2">
      <p className="text-label-sm text-outline-variant uppercase tracking-wider">{label}</p>
      <div
        className={`flex items-center gap-3 p-3 rounded-lg border ${
          isCompleted
            ? 'bg-surface-container-low border-outline-variant'
            : isLocked
              ? 'bg-surface-container-lowest border-outline-variant opacity-60'
              : 'bg-surface-container-low border-outline-variant'
        }`}
      >
        <span
          className={`material-symbols-outlined text-[20px] ${
            isCompleted ? 'text-tertiary' : isLocked ? 'text-outline' : 'text-primary'
          }`}
        >
          {isCompleted ? 'check_circle' : isLocked ? 'lock' : 'hourglass_top'}
        </span>
        <div className="flex-1">
          <p className={`font-label-md text-label-md ${isLocked ? 'text-on-surface-variant' : 'text-on-surface'}`}>
            {item.title}
          </p>
          <p
            className={`text-[10px] font-bold uppercase ${
              isCompleted ? 'text-tertiary' : isLocked ? 'text-outline' : 'text-primary'
            }`}
          >
            {isCompleted ? t('statusCompleted') : isLocked ? t('statusLocked') : t('statusInProgress')}
          </p>
        </div>
      </div>
    </div>
  );
}

export function PrerequisitesCard({
  prevTrack,
  nextTrack,
  currentTitle,
  progress,
  totalXP,
}: TrackStatusCardProps) {
  const t = useTranslations('TrackPreview');

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col gap-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="material-symbols-outlined text-primary">analytics</span>
        <h3 className="font-headline-sm text-[18px] text-on-surface">{t('trackStatusTitle')}</h3>
      </div>
      <div className="flex flex-col gap-4">
        <PrevNextItem item={prevTrack} label={t('previousLabel')} />
        <div className="flex flex-col gap-2">
          <p className="text-label-sm text-outline-variant uppercase tracking-wider">{t('currentLabel')}</p>
          <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
            <div className="flex justify-between items-center mb-2">
              <p className="font-label-md text-primary">{currentTitle}</p>
              <p className="text-label-sm text-primary font-bold">{progress}%</p>
            </div>
            <div className="w-full h-1.5 bg-primary/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-label-sm text-secondary">{t('potentialRewardLabel')}</span>
              <span className="font-label-md text-secondary">{totalXP.toLocaleString()} XP</span>
            </div>
          </div>
        </div>
        <PrevNextItem item={nextTrack} label={t('nextLabel')} />
      </div>
    </div>
  );
}
