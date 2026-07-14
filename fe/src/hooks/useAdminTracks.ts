'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminTracksControllerAdminList } from '@/services/api-client';
import type { AdminTrackItemDto, AdminTrackListResponseDto } from '@/services/api-client';

export interface UseAdminTracksResult {
  tracks: AdminTrackItemDto[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useAdminTracks(): UseAdminTracksResult {
  const [tracks, setTracks] = useState<AdminTrackItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTracks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminTracksControllerAdminList({
        throwOnError: true,
      });
      const data = res.data as AdminTrackListResponseDto;
      setTracks(data.data);
    } catch (err) {
      console.error('Failed to fetch admin tracks:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch admin tracks'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  return { tracks, loading, error, refetch: fetchTracks };
}
