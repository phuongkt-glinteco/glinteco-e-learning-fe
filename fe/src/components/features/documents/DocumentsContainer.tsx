'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/providers/AuthProvider';
import { useDocuments } from './useDocuments';
import { DocumentsFilters } from './DocumentsFilters';
import { DocumentsView } from './DocumentsView';
import { DocumentsPagination } from './DocumentsPagination';
import Modal from '@/components/ui/Modal';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/default/button';
import { Loader2, PlusIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/default/tabs';
import { TagsManagement } from './TagsManagement';

export default function DocumentsContainer() {
  const t = useTranslations('DocumentsPage');
  const { user, loading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
  }, []);

  const search = useMemo(
    () => searchParams.get('q') ?? searchParams.get('search') ?? '',
    [searchParams],
  );
  const selectedKind = useMemo(() => searchParams.get('kind') ?? '', [searchParams]);
  const selectedTags = useMemo(() => {
    const tagsParam = searchParams.get('tags');
    return tagsParam ? tagsParam.split(',').map((t) => t.trim()).filter(Boolean) : [];
  }, [searchParams]);
  const bookmarkedOnly = useMemo(() => searchParams.get('bookmarked') === 'true', [searchParams]);

  const urlViewMode = useMemo(() => {
    const v = searchParams.get('view');
    return v === 'grid' || v === 'list' ? (v as 'grid' | 'list') : null;
  }, [searchParams]);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const hasActiveFilters = Boolean(search || selectedKind || selectedTags.length > 0 || bookmarkedOnly);

  const updateUrlParams = useCallback(
    (updates: {
      q?: string;
      kind?: string;
      tags?: string[];
      bookmarked?: boolean;
      view?: 'grid' | 'list';
    }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (updates.q !== undefined) {
        params.delete('search');
        const normalized = updates.q.trim();
        if (normalized) params.set('q', normalized);
        else params.delete('q');
      }
      if (updates.kind !== undefined) {
        if (updates.kind) params.set('kind', updates.kind);
        else params.delete('kind');
      }
      if (updates.tags !== undefined) {
        if (updates.tags.length > 0) params.set('tags', updates.tags.join(','));
        else params.delete('tags');
      }
      if (updates.bookmarked !== undefined) {
        if (updates.bookmarked) params.set('bookmarked', 'true');
        else params.delete('bookmarked');
      }
      if (updates.view !== undefined) {
        if (updates.view) params.set('view', updates.view);
        else params.delete('view');
      }

      const currentQuery = searchParams.toString();
      const nextQuery = params.toString();
      if (nextQuery === currentQuery) return;

      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const handleSearchChange = useCallback((val: string) => updateUrlParams({ q: val }), [updateUrlParams]);
  const handleKindChange = useCallback((val: string) => updateUrlParams({ kind: val }), [updateUrlParams]);
  const handleTagsChange = useCallback((val: string[]) => updateUrlParams({ tags: val }), [updateUrlParams]);
  const handleBookmarkedToggle = useCallback(() => updateUrlParams({ bookmarked: !bookmarkedOnly }), [updateUrlParams, bookmarkedOnly]);

  function handleClearFilters() {
    updateUrlParams({ q: '', kind: '', tags: [], bookmarked: false });
  }

  // Consistent: treat as learner while loading to avoid hydration mismatch
  // Admin header is rendered only when auth has resolved and user is confirmed admin
  const isAdmin = mounted && !authLoading && user?.role === 'admin';

  const [localViewMode, setLocalViewMode] = useState<'grid' | 'list'>('grid');
  const [hasInitializedView, setHasInitializedView] = useState(false);

  useEffect(() => {
    if (mounted && !authLoading && !hasInitializedView) {
      const savedMode = localStorage.getItem('documents_view_mode') as 'grid' | 'list' | null;
      if (savedMode === 'grid' || savedMode === 'list') {
        setLocalViewMode(savedMode);
      } else if (user?.role === 'admin') {
        setLocalViewMode('list');
      } else {
        setLocalViewMode('grid');
      }
      setHasInitializedView(true);
    }
  }, [mounted, authLoading, user?.role, hasInitializedView]);

  const viewMode = urlViewMode || localViewMode;

  const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
    setLocalViewMode(mode);
    updateUrlParams({ view: mode });
    if (typeof window !== 'undefined') {
      localStorage.setItem('documents_view_mode', mode);
    }
  }, [updateUrlParams]);

  const {
    documents,
    tags,
    loading,
    initialLoading,
    loadingMore,
    error,
    hasMore,
    fetchDocuments,
    fetchTags,
    handleBookmarkToggle,
    loadMore,
    handleDelete,
  } = useDocuments({ search, selectedKind, selectedTags, bookmarkedOnly });

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground text-sm font-medium">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error && documents.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="material-symbols-outlined text-[48px] text-destructive">error</span>
          <p className="text-foreground font-medium">{t('failedToLoad')}</p>
          <Button onClick={() => fetchDocuments(null, false)}>
            {t('retry')}
          </Button>
        </div>
      </div>
    );
  }

  const documentsViewContent = (
    <div className="space-y-6">
      {isAdmin && (
        <div className="flex justify-end">
          {(() => {
            return (
              <Button onClick={() => router.push('/admin/documents/create')} className="gap-2 rounded-xl h-10 px-6 font-semibold shadow-sm hover:shadow transition-all">
                <PlusIcon className="w-4 h-4" />
                {t('newDocument')}
              </Button>
            );
          })()}
        </div>
      )}

      <DocumentsFilters
        search={search}
        onSearchChange={handleSearchChange}
        selectedKind={selectedKind}
        onKindChange={handleKindChange}
        selectedTags={selectedTags}
        onTagsChange={handleTagsChange}
        bookmarkedOnly={bookmarkedOnly}
        onBookmarkedToggle={handleBookmarkedToggle}
        tags={tags}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />

      <DocumentsView
        documents={documents}
        isAdmin={isAdmin}
        viewMode={viewMode}
        loading={loading}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
        onBookmarkToggle={handleBookmarkToggle}
        onDelete={(id) => setDeleteConfirmId(id)}
      />

      {documents.length > 0 && (
        <DocumentsPagination
          hasMore={hasMore}
          loadingMore={loadingMore}
          onLoadMore={loadMore}
        />
      )}
    </div>
  );

  return (
    <div className="px-gutter py-6 max-w-container-max mx-auto w-full space-y-6">
      {isAdmin ? (
        <Tabs defaultValue="documents" className="w-full space-y-6">
          <div className="border-b border-outline-variant flex items-center justify-between flex-wrap gap-4">
            <TabsList className="bg-transparent h-auto p-0 border-b-0 gap-0 rounded-none">
              <TabsTrigger
                value="documents"
                className="rounded-none !border-t-0 !border-l-0 !border-r-0 border-b-3 border-transparent data-[state=active]:!border-b-primary data-[state=active]:shadow-none py-3.5 px-2 font-bold text-base bg-transparent hover:bg-transparent data-[state=active]:bg-transparent focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none transition-all flex items-center gap-2.5 text-on-surface-variant hover:text-on-surface data-[state=active]:text-primary"
              >
                <span className="material-symbols-outlined text-[20px]">description</span>
                <span>{t('adminTitle', { defaultValue: 'Document Management' })}</span>
              </TabsTrigger>
              <TabsTrigger
                value="tags"
                className="rounded-none !border-t-0 !border-l-0 !border-r-0 border-b-2 border-transparent data-[state=active]:!border-b-primary data-[state=active]:shadow-none py-3.5 px-2 font-bold text-base bg-transparent hover:bg-transparent data-[state=active]:bg-transparent focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none transition-all flex items-center gap-2.5 text-on-surface-variant hover:text-on-surface data-[state=active]:text-primary"
              >
                <span className="material-symbols-outlined text-[20px]">label</span>
                <span>{t('tagsManagement', { defaultValue: 'Tags Management' })}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="documents" className="m-0 border-none outline-none focus:outline-none">
            {documentsViewContent}
          </TabsContent>

          <TabsContent value="tags" className="m-0 border-none outline-none focus:outline-none">
            <TagsManagement
              onTagsUpdated={() => {
                fetchTags();
                fetchDocuments(null, false);
              }}
            />
          </TabsContent>
        </Tabs>
      ) : (
        documentsViewContent
      )}

      <Modal
        open={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title={t('deleteConfirmTitle')}
      >
        <p className="text-foreground text-sm mb-6">{t('deleteConfirmBody')}</p>
        <div className="flex justify-end gap-3">
          {(() => {
            return (
              <>
                <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                  {t('cancel')}
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (deleteConfirmId) {
                      await handleDelete(deleteConfirmId);
                      setDeleteConfirmId(null);
                    }
                  }}
                >
                  {t('delete')}
                </Button>
              </>
            );
          })()}
        </div>
      </Modal>
    </div>
  );
}
