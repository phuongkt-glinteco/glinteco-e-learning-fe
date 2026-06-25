'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { tracksControllerFindAll } from '@/services/api-client';
import type { TrackSummaryDto } from '@/services/api-client';

interface TrackPickerProps {
  selectedTrackId: string;
  onSelectTrack: (track: TrackSummaryDto | null) => void;
}

export function TrackPicker({ selectedTrackId, onSelectTrack }: TrackPickerProps) {
  const t = useTranslations('CreateTrackPage');
  const [tracks, setTracks] = useState<TrackSummaryDto[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    tracksControllerFindAll({ query: { limit: 50 }, throwOnError: true })
      .then((res) => setTracks(res.data?.data ?? []))
      .catch(() => setTracks([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredTracks = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return tracks;
    return tracks.filter((track) => track.title.toLowerCase().includes(normalized));
  }, [query, tracks]);

  const selectedTrack = tracks.find((track) => track.id === selectedTrackId);

  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <span className="material-symbols-outlined text-primary">account_tree</span>
        <h3 className="headline-sm text-on-surface">{t('placement')}</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block label-sm text-on-surface-variant mb-2">{t('previousTrack')}</label>
          <div className="flex items-center gap-2 border border-outline-variant rounded-lg px-3 py-2 bg-surface-container-lowest focus-within:border-primary transition-colors">
            <span className="material-symbols-outlined text-outline text-[20px]">search</span>
            <input
              className="flex-1 bg-transparent outline-none text-body-base"
              placeholder={t('previousTrackSearchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="border border-outline-variant rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => onSelectTrack(null)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-container-low transition-colors ${
              !selectedTrackId ? 'bg-primary-container/30 text-primary' : 'text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">vertical_align_bottom</span>
            <span className="font-label-md">{t('appendToEnd')}</span>
          </button>

          <div className="max-h-[240px] overflow-y-auto border-t border-outline-variant">
            {loading ? (
              <div className="px-4 py-6 text-center text-outline font-label-sm">
                {t('loadingTracks')}
              </div>
            ) : filteredTracks.length === 0 ? (
              <div className="px-4 py-6 text-center text-outline font-label-sm">
                {t('noTracksFound')}
              </div>
            ) : (
              filteredTracks.map((track) => (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => onSelectTrack(track)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-surface-container-low transition-colors border-b border-outline-variant last:border-b-0 ${
                    selectedTrackId === track.id ? 'bg-primary-container/30 text-primary' : 'text-on-surface'
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block font-label-md truncate">{track.title}</span>
                    <span className="block text-label-sm text-outline">
                      {t('trackOrder', { order: track.order })}
                    </span>
                  </span>
                  {selectedTrackId === track.id && (
                    <span className="material-symbols-outlined text-[18px]">check</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        <p className="text-label-sm text-outline">
          {selectedTrack ? t('selectedPreviousTrack', { title: selectedTrack.title }) : t('selectedAppendToEnd')}
        </p>
      </div>
    </section>
  );
}
