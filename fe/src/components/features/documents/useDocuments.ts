'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  documentsControllerFindAll,
  documentsControllerFindAllTags,
  documentsControllerDelete,
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
        } as never,
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

  async function handleDelete(id: string) {
    try {
      await documentsControllerDelete({ path: { id }, throwOnError: true });
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    } catch {
      // silent
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
  };
}
