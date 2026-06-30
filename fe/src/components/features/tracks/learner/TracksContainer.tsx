'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/default/skeleton';
import { TracksTimeline } from './TracksTimeline';
import type { LearnerTrack } from './types';
import { fetchCourses } from './courseLearningApi';
import { getErrorMessage } from './utils';

function TracksLoadingState() {
  return (
    <section className="w-full mx-auto flex max-w-[920px] flex-col gap-6 px-gutter py-8">
      <div className="space-y-2">
        <Skeleton className="w-[240px] h-8 rounded" />
        <Skeleton className="w-[460px] max-w-full h-5 rounded" />
      </div>
      <Skeleton className="w-full h-[112px]" />
      <div className="space-y-5">
        <div className="grid grid-cols-[56px_1fr] gap-4">
          <Skeleton className="w-14 h-14 rounded-lg" />
          <Skeleton className="w-full h-[184px]" />
        </div>
        <div className="grid grid-cols-[56px_1fr] gap-4">
          <Skeleton className="w-14 h-14 rounded-lg" />
          <Skeleton className="w-full h-[184px]" />
        </div>
        <div className="grid grid-cols-[56px_1fr] gap-4">
          <Skeleton className="w-14 h-14 rounded-lg" />
          <Skeleton className="w-full h-[184px]" />
        </div>
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
  const [openingTrackId, setOpeningTrackId] = useState<string | null>(null);

  const loadTracks = useCallback(async (isActive: () => boolean = () => true) => {
    setLoading(true);
    setError(null);

    try {
      const courses = await fetchCourses();
      if (isActive()) setTracks(courses);
    } catch (loadError: unknown) {
      if (isActive()) {
        setError(getErrorMessage(loadError, 'Failed to fetch learning tracks.'));
      }
    } finally {
      if (isActive()) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    loadTracks(() => active);

    return () => {
      active = false;
    };
  }, [loadTracks]);

  function handleOpenTrack(track: LearnerTrack) {
    if (track.status === 'locked') return;

    setOpeningTrackId(track.id);
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
    <TracksTimeline
      tracks={tracks}
      openingTrackId={openingTrackId}
      onOpenTrack={handleOpenTrack}
    />
  );
}
