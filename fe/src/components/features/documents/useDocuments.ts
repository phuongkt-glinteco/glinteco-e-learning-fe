'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  documentsControllerFindAll,
  documentsControllerFindAllTags,
  documentsControllerDelete,
  documentsControllerBookmark,
  documentsControllerUnbookmark,
} from '@/services/api-client';
import type { DocumentListResponseDto } from '@/services/api-client';
import {
  normalizeDocumentListItems,
  normalizeDocumentTags,
  type DocumentKind,
  type DocumentListItem,
  type DocumentTag,
} from './types';

interface UseDocumentsOptions {
  search: string;
  selectedKind: string;
  selectedTags: string[];
  bookmarkedOnly: boolean;
}

export function useDocuments({ search, selectedKind, selectedTags, bookmarkedOnly }: UseDocumentsOptions) {
  const tagsQuery = selectedTags.length > 0 ? selectedTags.join(',') : undefined;
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [tags, setTags] = useState<DocumentTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchDocuments = useCallback(async (cursor?: string | null, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError(false);
    try {
      const res = await documentsControllerFindAll({
        query: {
          cursor: cursor || undefined,
          limit: 20,
          q: search || undefined,
          kind: (selectedKind as DocumentKind) || undefined,
          tags: tagsQuery,
          bookmarked: bookmarkedOnly || undefined,
        },
        throwOnError: true,
      });
      const data = res.data as DocumentListResponseDto;
      const normalizedDocuments = normalizeDocumentListItems(data);
      setDocuments((prev) => (append ? [...prev, ...normalizedDocuments] : normalizedDocuments));
      setHasMore(data.hasMore);
      setNextCursor(data.nextCursor as unknown as string | null);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setInitialLoading(false);
    }
  }, [search, selectedKind, tagsQuery, bookmarkedOnly]);

  useEffect(() => {
    fetchDocuments(null, false);
  }, [fetchDocuments]);

  const fetchTags = useCallback(() => {
    documentsControllerFindAllTags({ throwOnError: true })
      .then((res) => setTags(normalizeDocumentTags(res.data)))
      .catch(() => setTags([]));
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  function handleBookmarkToggle(id: string, bookmarked: boolean) {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, isBookmarked: bookmarked } : doc))
    );
  }

  async function loadMore() {
    if (!hasMore || loadingMore) return;
    await fetchDocuments(nextCursor, true);
  }

  async function handleDelete(id: string): Promise<boolean> {
    try {
      await documentsControllerDelete({ path: { id }, throwOnError: true });
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      return true;
    } catch {
      return false;
    }
  }

  async function handleBatchDelete(
    ids: string[],
    onProgress?: (processed: number, total: number) => void
  ): Promise<{ successIds: string[]; failedIds: string[] }> {
    const successIds: string[] = [];
    const failedIds: string[] = [];
    const chunkSize = 5;
    let processed = 0;

    if (onProgress) onProgress(0, ids.length);

    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunk = ids.slice(i, i + chunkSize);
      const results = await Promise.allSettled(
        chunk.map((id) => documentsControllerDelete({ path: { id }, throwOnError: true }))
      );
      results.forEach((res, idx) => {
        if (res.status === 'fulfilled') {
          successIds.push(chunk[idx]);
        } else {
          failedIds.push(chunk[idx]);
        }
      });
      processed += chunk.length;
      if (onProgress) onProgress(Math.min(processed, ids.length), ids.length);
    }

    if (successIds.length > 0) {
      setDocuments((prev) => prev.filter((doc) => !successIds.includes(doc.id)));
    }

    return { successIds, failedIds };
  }

  async function handleBatchBookmark(ids: string[], targetBookmarked: boolean) {
    setDocuments((prev) =>
      prev.map((doc) => (ids.includes(doc.id) ? { ...doc, isBookmarked: targetBookmarked } : doc))
    );
    const chunkSize = 5;
    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunk = ids.slice(i, i + chunkSize);
      try {
        await Promise.allSettled(
          chunk.map((id) =>
            targetBookmarked
              ? documentsControllerBookmark({ path: { id }, throwOnError: true })
              : documentsControllerUnbookmark({ path: { id }, throwOnError: true })
          )
        );
      } catch {
        // silent
      }
    }
  }

  return {
    documents,
    tags,
    loading,
    initialLoading,
    loadingMore,
    error,
    hasMore,
    nextCursor,
    fetchDocuments,
    fetchTags,
    handleBookmarkToggle,
    loadMore,
    handleDelete,
    handleBatchDelete,
    handleBatchBookmark,
  };
}
