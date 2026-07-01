'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { tracksControllerFindAll, tracksControllerDelete, tracksControllerReorder } from '@/services/api-client';
import type { TrackListResponseDto, TrackSummaryDto } from '@/services/api-client';
import Skeleton from '@/components/ui/loading/Skeleton';
import { AdminTracksView } from '../components/AdminTracksView';
import { normalizeAdminTrack, type AdminTrackItem, type AdminTracksPagination } from '../types';

const DEFAULT_LIMIT = 10;
const MAX_REORDER_FETCH_LIMIT = 50;

const initialPagination: AdminTracksPagination = {
  total: 0,
  page: 1,
  limit: DEFAULT_LIMIT,
  lastPage: 1,
};

function normalizePagination(
  meta: TrackListResponseDto['meta'] | undefined,
  itemCount: number,
  fallbackPage: number,
  fallbackLimit: number,
): AdminTracksPagination {
  const total = meta?.total ?? itemCount;
  const limit = meta?.limit ?? fallbackLimit;
  const page = meta?.page ?? fallbackPage;
  const lastPage = meta?.lastPage ?? Math.max(1, Math.ceil(total / limit));

  return { total, page, limit, lastPage };
}

function extractTracksResponse(response: TrackListResponseDto | undefined) {
  const data = response?.data;
  return {
    tracks: Array.isArray(data) ? data : ([] as TrackSummaryDto[]),
    pagination: response?.meta,
  };
}

async function loadAllTrackIds(): Promise<string[]> {
  const firstResponse = await tracksControllerFindAll({
    query: { page: 1, limit: MAX_REORDER_FETCH_LIMIT },
    throwOnError: true,
  });
  const firstPage = extractTracksResponse(firstResponse.data);
  const firstItems = firstPage.tracks
    .map(normalizeAdminTrack)
    .filter((item): item is AdminTrackItem => Boolean(item))
    .sort((a, b) => a.order - b.order);
  const lastPage = firstPage.pagination?.lastPage ?? 1;

  if (lastPage <= 1) {
    return firstItems.map((track) => track.id);
  }

  const remainingResponses = await Promise.all(
    Array.from({ length: lastPage - 1 }, (_, index) =>
      tracksControllerFindAll({
        query: { page: index + 2, limit: MAX_REORDER_FETCH_LIMIT },
        throwOnError: true,
      })
    )
  );
  const remainingItems = remainingResponses.flatMap((response) => {
    const page = extractTracksResponse(response.data);
    return page.tracks
      .map(normalizeAdminTrack)
      .filter((item): item is AdminTrackItem => Boolean(item));
  });

  return [...firstItems, ...remainingItems]
    .sort((a, b) => a.order - b.order)
    .map((track) => track.id);
}

export default function AdminTracksContainer() {
  const t = useTranslations('AdminTracksPage');
  const router = useRouter();
  const [tracks, setTracks] = useState<AdminTrackItem[]>([]);
  const [pagination, setPagination] = useState<AdminTracksPagination>(initialPagination);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  const loadTracks = useCallback(async (page: number, limit: number) => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await tracksControllerFindAll({
        query: { page, limit },
        throwOnError: true,
      });
      const { tracks: raw, pagination: meta } = extractTracksResponse(res.data);
      const items = raw
        .map(normalizeAdminTrack)
        .filter((item): item is AdminTrackItem => Boolean(item))
        .sort((a, b) => a.order - b.order);
      setTracks(items);
      setPagination(normalizePagination(meta, items.length, page, limit));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : t('loadError'));
    } finally {
      setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadTracks(pagination.page, pagination.limit);
  }, [loadTracks, pagination.page, pagination.limit]);

  function handleCreateTrack() {
    router.push('/admin/tracks/create');
  }

  function handleEditTrack(trackId: string) {
    router.push(`/admin/tracks/${trackId}/edit`);
  }

  function handlePageChange(page: number) {
    setActionError(null);
    setPagination((prev) => ({
      ...prev,
      page: Math.min(Math.max(page, 1), prev.lastPage),
    }));
  }

  async function handleDeleteTrack(trackId: string) {
    const shouldDelete = window.confirm(t('deleteConfirm'));
    if (!shouldDelete) return;

    setDeletingId(trackId);
    setActionError(null);
    try {
      await tracksControllerDelete({ path: { id: trackId }, throwOnError: true });
      const nextTotal = Math.max(0, pagination.total - 1);
      const nextLastPage = Math.max(1, Math.ceil(nextTotal / pagination.limit));
      const nextPage = Math.min(pagination.page, nextLastPage);
      await loadTracks(nextPage, pagination.limit);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t('deleteError'));
    } finally {
      setDeletingId(null);
    }
  }

  async function handleMoveTrack(trackId: string, direction: 'up' | 'down') {
    setReorderingId(trackId);
    setActionError(null);

    try {
      const allTrackIds = await loadAllTrackIds();
      const currentIndex = allTrackIds.indexOf(trackId);
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (currentIndex < 0 || targetIndex < 0 || targetIndex >= allTrackIds.length) return;

      const nextTrackIds = [...allTrackIds];
      const [movedTrackId] = nextTrackIds.splice(currentIndex, 1);
      nextTrackIds.splice(targetIndex, 0, movedTrackId);

      await tracksControllerReorder({
        body: { order: nextTrackIds },
        throwOnError: true,
      });
      await loadTracks(pagination.page, pagination.limit);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t('reorderError'));
    } finally {
      setReorderingId(null);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <Skeleton width={240} height={32} rounded="rounded" className="mb-6" />
        <div className="flex flex-col gap-3">
          <Skeleton height={88} />
          <Skeleton height={88} />
          <Skeleton height={88} />
        </div>
      </div>
    );
  }

  return (
    <AdminTracksView
      tracks={tracks}
      pagination={pagination}
      loadError={loadError}
      actionError={actionError}
      deletingId={deletingId}
      reorderingId={reorderingId}
      onCreateTrack={handleCreateTrack}
      onEditTrack={handleEditTrack}
      onDeleteTrack={handleDeleteTrack}
      onMoveTrack={handleMoveTrack}
      onPageChange={handlePageChange}
      onRetry={() => loadTracks(pagination.page, pagination.limit)}
    />
  );
}
