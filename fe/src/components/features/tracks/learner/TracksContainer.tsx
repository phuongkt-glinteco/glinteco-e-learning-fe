'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTracks } from '@/services/api-client';
import type { TrackSummary } from '@/services/api-client';
import Skeleton from '@/components/ui/loading/Skeleton';
import { TracksGrid } from './TracksGrid';
import type { TrackFilter } from './TracksGrid';
import type { LearnerTrack, TrackStatus } from './types';

const DEFAULT_STATUS: TrackStatus = 'locked';

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
}

function normalizeTrack(track: TrackSummary, index: number): LearnerTrack | null {
  if (!track.id) return null;

  return {
    id: track.id,
    title: track.title?.trim() || 'Untitled track',
    description: track.description?.trim() || 'Track details are being prepared.',
    estimatedTime: track.estimatedTime?.trim() || 'TBD',
    lessonCount: track.lessonCount ?? 0,
    lessonsCompleted: track.lessonsCompleted ?? 0,
    order: track.order ?? index + 1,
    status: track.status ?? DEFAULT_STATUS,
    icon: track.icon,
  };
}

function normalizeTracks(tracks: TrackSummary[]) {
  return tracks
    .map(normalizeTrack)
    .filter((track): track is LearnerTrack => Boolean(track))
    .sort((a, b) => a.order - b.order);
}

function TracksLoadingState() {
  return (
    <section className="mx-auto max-w-container-max px-gutter py-8">
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <Skeleton width={240} height={32} rounded="rounded" />
          <Skeleton width={360} height={20} rounded="rounded" />
        </div>
        <Skeleton width={420} height={48} rounded="rounded-full" />
      </div>
      <Skeleton height={56} className="mb-6" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 2xl:grid-cols-3">
        <Skeleton height={292} />
        <Skeleton height={292} />
        <Skeleton height={292} />
      </div>
    </section>
  );
}

function TracksErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <section className="mx-auto max-w-container-max px-gutter py-8">
      <div className="rounded-lg border border-error-container bg-error-container/40 p-6 text-error">
        <h2 className="headline-sm">Error loading tracks</h2>
        <p className="body-sm mt-2">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 label-sm text-on-primary hover:opacity-90 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          Retry
        </button>
      </div>
    </section>
  );
}

export default function TracksContainer() {
  const router = useRouter();
  const [tracks, setTracks] = useState<LearnerTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [openingTrackId, setOpeningTrackId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<TrackFilter>('all');

  async function loadTracks() {
    setLoading(true);
    setError(null);
    setActionError(null);

    try {
      const response = await getTracks({ throwOnError: true });
      setTracks(normalizeTracks(response.data?.data ?? []));
    } catch (loadError: unknown) {
      setError(getErrorMessage(loadError, 'Failed to fetch learning tracks.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      setActionError(null);

      try {
        const response = await getTracks({ throwOnError: true });
        if (active) setTracks(normalizeTracks(response.data?.data ?? []));
      } catch (loadError: unknown) {
        if (active) setError(getErrorMessage(loadError, 'Failed to fetch learning tracks.'));
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const visibleTracks = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return tracks.filter((track) => {
      const matchesFilter = filter === 'all' || track.status === filter;
      const matchesQuery = keyword.length === 0
        || track.title.toLowerCase().includes(keyword)
        || track.description.toLowerCase().includes(keyword);

      return matchesFilter && matchesQuery;
    });
  }, [filter, query, tracks]);

  function handleOpenTrack(track: LearnerTrack) {
    if (track.status === 'locked') return;

    setOpeningTrackId(track.id);
    setActionError(null);
    router.push(`/courses/${track.id}`);
  }

  if (loading) return <TracksLoadingState />;

  if (error) {
    return (
      <TracksErrorState
        message={error}
        onRetry={loadTracks}
      />
    );
  }

  return (
    <TracksGrid
      tracks={visibleTracks}
      query={query}
      filter={filter}
      openingTrackId={openingTrackId}
      actionError={actionError}
      onQueryChange={setQuery}
      onFilterChange={setFilter}
      onOpenTrack={handleOpenTrack}
    />
  );
}
