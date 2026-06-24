'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken, getTracks } from '@/services/api-client';
import type { TrackSummary } from '@/services/api-client';
import Skeleton from '@/components/ui/loading/Skeleton';
import { TracksTimeline } from './TracksTimeline';
import { mockLearnerTracks } from './mockData';
import type { LearnerTrack } from './types';
import { getErrorMessage, normalizeTrackSummaries } from './utils';

function TracksLoadingState() {
  return (
    <div className="max-w-[720px] mx-auto py-4">
      <Skeleton height={48} className="mb-4" />
      <Skeleton height={80} className="mb-6" />
      <div className="space-y-4">
        <Skeleton height={120} />
        <Skeleton height={120} />
        <Skeleton height={120} />
      </div>
    </div>
  );
}

function TracksErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="max-w-2xl mx-auto my-8">
      <div className="p-lg bg-red-50 border border-red-200 rounded-lg text-red-700">
        <h3 className="font-bold">Error loading tracks</h3>
        <p className="text-sm mt-1">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-md hover:bg-red-700 transition-colors cursor-pointer"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

function TracksEmptyState() {
  return (
    <div className="max-w-2xl mx-auto my-8">
      <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest p-10 text-center">
        <h3 className="headline-sm text-on-surface">No learning tracks found</h3>
        <p className="mt-2 body-sm text-on-surface-variant">
          Your learning journey has not been set up yet. Please check back later or contact your mentor.
        </p>
      </div>
    </div>
  );
}

export default function TracksContainer() {
  const router = useRouter();
  const [tracks, setTracks] = useState<LearnerTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);
  const [openingTrackId, setOpeningTrackId] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  const useMockTracks = useCallback((message?: string) => {
    setTracks(mockLearnerTracks);
    setIsUsingMockData(true);
    setFallbackMessage(message ?? null);
    setError(null);
  }, []);

  const loadTracks = useCallback(async () => {
    setLoading(true);
    setError(null);
    setFallbackMessage(null);

    try {
      if (!getAccessToken()) {
        useMockTracks('Showing sample tracks because you are not connected to the API yet.');
        return;
      }

      const response = await getTracks({ throwOnError: true });
      const rawTracks: TrackSummary[] = response.data?.data ?? [];
      setTracks(normalizeTrackSummaries(rawTracks));
      setIsUsingMockData(false);
    } catch (loadError: unknown) {
      useMockTracks(getErrorMessage(loadError, 'Showing sample tracks because the API is not available.'));
    } finally {
      setLoading(false);
    }
  }, [useMockTracks]);

  useEffect(() => {
    void loadTracks();
  }, [loadTracks]);

  function handleOpenTrack(track: LearnerTrack) {
    if (track.status === 'locked') return;

    setOpeningTrackId(track.id);
    router.push(`/courses/${track.id}`);
  }

  if (loading) return <TracksLoadingState />;

  if (error) {
    return <TracksErrorState message={error} onRetry={loadTracks} />;
  }

  if (tracks.length === 0) return <TracksEmptyState />;

  return (
    <TracksTimeline
      tracks={tracks}
      openingTrackId={openingTrackId}
      isUsingMockData={isUsingMockData}
      fallbackMessage={fallbackMessage}
      onOpenTrack={handleOpenTrack}
    />
  );
}
