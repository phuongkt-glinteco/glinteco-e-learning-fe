'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  documentsControllerFindAll,
  documentsControllerFindAllTags,
  documentsControllerDelete,
} from '@/services/api-client';
import type { DocumentResponseDto, TagResponseDto, DocumentListResponseDto } from '@/services/api-client';

interface UseDocumentsOptions {
  search: string;
  selectedKind: string;
  selectedTag: string;
  bookmarkedOnly: boolean;
}

export function useDocuments({ search, selectedKind, selectedTag, bookmarkedOnly }: UseDocumentsOptions) {
  const [documents, setDocuments] = useState<DocumentResponseDto[]>([]);
  const [tags, setTags] = useState<TagResponseDto[]>([]);
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
          kind: (selectedKind as DocumentResponseDto['kind']) || undefined,
          tags: selectedTag || undefined,
          bookmarked: bookmarkedOnly || undefined,
        } as never,
        throwOnError: true,
      });
      const data = res.data as DocumentListResponseDto;
      setDocuments((prev) => (append ? [...prev, ...(data.data || [])] : (data.data || [])));
      setHasMore(data.hasMore);
      setNextCursor(data.nextCursor as unknown as string | null);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setInitialLoading(false);
    }
  }, [search, selectedKind, selectedTag, bookmarkedOnly]);

  useEffect(() => {
    fetchDocuments(null, false);
  }, [fetchDocuments]);

  useEffect(() => {
    documentsControllerFindAllTags({ throwOnError: true })
      .then((res) => setTags((res.data as TagResponseDto[] | undefined) ?? []))
      .catch(() => setTags([]));
  }, []);

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
    handleBookmarkToggle,
    loadMore,
    handleDelete,
  };
}
