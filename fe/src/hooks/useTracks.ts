'use client';

import { useState, useEffect, useCallback } from 'react';
import { tracksControllerFindAll } from '@/services/api-client';
import type { TrackSummaryDto, TrackMetaDto, TrackListResponseDto } from '@/services/api-client';

export interface UseTracksParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface UseTracksResult {
  tracks: TrackSummaryDto[];
  meta: TrackMetaDto | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTracks({ page = 1, limit = 10, status }: UseTracksParams = {}): UseTracksResult {
  const [tracks, setTracks] = useState<TrackSummaryDto[]>([]);
  const [meta, setMeta] = useState<TrackMetaDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTracks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await tracksControllerFindAll({
        query: {
          page,
          limit,
          status: status as 'completed' | 'in_progress' | 'locked' | undefined,
        },
        throwOnError: true,
      });
      const data = res.data as TrackListResponseDto;
      setTracks(data.data);
      setMeta(data.meta);
    } catch {
      setError('Failed to fetch tracks');
    } finally {
      setLoading(false);
    }
  }, [page, limit, status]);

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  return { tracks, meta, loading, error, refetch: fetchTracks };
}
