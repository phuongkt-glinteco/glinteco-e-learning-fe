'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface TrackStatusCardProps {
  title: string;
  completionPercent: number;
  prevTrack?: { id?: string; title?: string } | null;
  nextTrack?: { id?: string; title?: string } | null;
}

export default function TrackStatusCard({
  title,
  completionPercent,
  prevTrack,
  nextTrack,
}: TrackStatusCardProps) {
  const t = useTranslations('TrackDetailPage');

  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
      <h3 className="font-headline-sm text-on-surface mb-4">{t('trackStatusTitle')}</h3>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <span className="font-label-md text-on-surface">{t('overallCompletion')}</span>
            <span className="font-headline-sm text-primary">{completionPercent}%</span>
          </div>
          <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-1000"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        <div className="space-y-4">
          {prevTrack?.id ? (
            <Link
              href={`/admin/tracks/${prevTrack.id}`}
              className="w-full p-3 bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/30 rounded-lg flex items-center gap-3 transition-all group block"
            >
              <span className="material-symbols-outlined text-[20px] text-outline group-hover:text-primary transition-colors">
                chevron_left
              </span>
              <div className="text-left">
                <p className="text-[10px] uppercase font-bold text-outline tracking-wider">{t('previous')}</p>
                <p className="font-label-sm text-on-surface-variant">{prevTrack.title || t('noPreviousTrack')}</p>
              </div>
            </Link>
          ) : (
            <div className="w-full p-3 bg-surface-container-low border border-outline-variant/30 rounded-lg flex items-center gap-3 opacity-50">
              <span className="material-symbols-outlined text-[20px] text-outline">chevron_left</span>
              <div className="text-left">
                <p className="text-[10px] uppercase font-bold text-outline tracking-wider">{t('previous')}</p>
                <p className="font-label-sm text-on-surface-variant">{t('noPreviousTrack')}</p>
              </div>
            </div>
          )}

          <div className="w-full p-3 bg-primary text-on-primary rounded-lg border border-primary flex items-center gap-3 shadow-md">
            <span className="material-symbols-outlined text-[20px]">target</span>
            <div className="text-left">
              <p className="text-[10px] uppercase font-bold text-on-primary/70 tracking-wider">{t('current')}</p>
              <p className="font-label-md font-bold">{title}</p>
            </div>
          </div>

          {nextTrack?.id ? (
            <Link
              href={`/admin/tracks/${nextTrack.id}`}
              className="w-full p-3 bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/30 rounded-lg flex items-center gap-3 transition-all group"
            >
              <div className="flex-grow text-left">
                <p className="text-[10px] uppercase font-bold text-outline tracking-wider">{t('next')}</p>
                <p className="font-label-sm text-on-surface-variant">{nextTrack.title || t('noNextTrack')}</p>
              </div>
              <span className="material-symbols-outlined text-[18px] text-outline">lock</span>
            </Link>
          ) : (
            <div className="w-full p-3 bg-surface-container-low border border-outline-variant/30 rounded-lg flex items-center gap-3 opacity-50">
              <div className="flex-grow text-left">
                <p className="text-[10px] uppercase font-bold text-outline tracking-wider">{t('next')}</p>
                <p className="font-label-sm text-on-surface-variant">{t('noNextTrack')}</p>
              </div>
              <span className="material-symbols-outlined text-[18px] text-outline">lock</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
