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

  const [deleteTargets, setDeleteTargets] = useState<{ id: string; title: string }[] | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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

  useEffect(() => {
    setSelectedIds([]);
  }, [search, selectedKind, selectedTags, bookmarkedOnly]);

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
    handleBatchDelete,
    handleBatchBookmark,
  } = useDocuments({ search, selectedKind, selectedTags, bookmarkedOnly });

  const handleSelectToggle = useCallback((id: string, selected: boolean) => {
    setSelectedIds((prev) => (selected ? [...prev, id] : prev.filter((item) => item !== id)));
  }, []);

  const handleSelectAll = useCallback((selectAll: boolean) => {
    if (selectAll) {
      setSelectedIds(documents.map((d) => d.id));
    } else {
      setSelectedIds([]);
    }
  }, [documents]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTargets || deleteTargets.length === 0) return;
    setIsDeleting(true);
    try {
      const ids = deleteTargets.map((d) => d.id);
      if (ids.length === 1) {
        await handleDelete(ids[0]);
      } else {
        await handleBatchDelete(ids);
      }
      setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
    } finally {
      setIsDeleting(false);
      setDeleteTargets(null);
    }
  }, [deleteTargets, handleDelete, handleBatchDelete]);

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
    <div className="space-y-6 pb-16">
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
        isSelectMode={isSelectMode}
        onSelectModeToggle={() => {
          setIsSelectMode((prev) => !prev);
          if (isSelectMode) setSelectedIds([]);
        }}
      />

      <DocumentsView
        documents={documents}
        isAdmin={isAdmin}
        viewMode={viewMode}
        loading={loading}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
        onBookmarkToggle={handleBookmarkToggle}
        onDeleteRequest={(docs) => setDeleteTargets(docs)}
        isSelectMode={isSelectMode}
        selectedIds={selectedIds}
        onSelectToggle={handleSelectToggle}
        onSelectAll={handleSelectAll}
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
    <div className="px-gutter py-6 max-w-container-max mx-auto w-full space-y-6 relative">
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

      {/* Floating Bottom Action Bar for Batch Actions */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-surface-container-lowest/95 dark:bg-zinc-900/95 border border-outline-variant shadow-2xl rounded-full px-6 py-3 flex items-center gap-4 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-300">
          <span className="text-sm font-bold text-on-surface flex items-center gap-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {t('selectedDocumentsCount', { count: selectedIds.length, defaultValue: `Đã chọn ${selectedIds.length} tài liệu` })}
          </span>
          <div className="h-4 w-px bg-outline-variant" />
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBatchBookmark(selectedIds, true)}
            className="rounded-full gap-1.5 border-amber-500/50 text-amber-500 hover:bg-amber-500/10 cursor-pointer text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            {t('batchBookmark', { count: selectedIds.length, defaultValue: `Đánh dấu (${selectedIds.length})` })}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBatchBookmark(selectedIds, false)}
            className="rounded-full gap-1.5 text-on-surface-variant hover:bg-surface-container cursor-pointer text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">star_border</span>
            {t('batchUnbookmark', { count: selectedIds.length, defaultValue: `Bỏ đánh dấu (${selectedIds.length})` })}
          </Button>
          {isAdmin && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                const docs = documents
                  .filter((d) => selectedIds.includes(d.id))
                  .map((d) => ({ id: d.id, title: d.title }));
                setDeleteTargets(docs);
              }}
              className="rounded-full gap-1.5 font-bold cursor-pointer text-xs"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
              {t('batchDelete', { count: selectedIds.length, defaultValue: `Xóa (${selectedIds.length})` })}
            </Button>
          )}
          <button
            onClick={() => setSelectedIds([])}
            className="ml-1 text-on-surface-variant/60 hover:text-on-surface cursor-pointer p-1 rounded-full transition-colors"
            title={t('clearSelection', { defaultValue: 'Bỏ chọn tất cả' })}
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      )}

      {/* Centralized Delete Confirmation Modal */}
      <Modal
        open={!!deleteTargets && deleteTargets.length > 0}
        onClose={() => {
          if (!isDeleting) setDeleteTargets(null);
        }}
        title={t('deleteConfirmTitle')}
      >
        <div className="space-y-6">
          {deleteTargets && deleteTargets.length === 1 ? (
            <div className="space-y-3">
              <p className="text-on-surface-variant text-sm">
                {t('deleteSingleConfirmBody', { defaultValue: 'Bạn có chắc chắn muốn xóa vĩnh viễn tài liệu này không? Hành động này không thể hoàn tác.' })}
              </p>
              <div className="p-3 bg-surface-container/70 dark:bg-zinc-800/70 rounded-xl border border-outline-variant/60 flex items-center gap-3 shadow-2xs">
                <span className="material-symbols-outlined text-error shrink-0 text-[22px]">description</span>
                <span className="font-bold text-on-surface truncate text-sm" title={deleteTargets[0].title}>
                  {deleteTargets[0].title}
                </span>
              </div>
            </div>
          ) : deleteTargets && deleteTargets.length > 1 ? (
            <div className="space-y-3">
              <p className="text-on-surface-variant text-sm">
                {t('deleteMultiConfirmBody', { count: deleteTargets.length, defaultValue: `Bạn có chắc chắn muốn xóa vĩnh viễn ${deleteTargets.length} tài liệu đã chọn không? Hành động này không thể hoàn tác.` })}
              </p>
              <div className="rounded-xl border border-outline-variant/60 bg-surface-container-lowest overflow-hidden shadow-2xs">
                <div className="px-3 py-2 bg-surface-container-low border-b border-outline-variant/40 flex items-center justify-between text-xs font-bold text-on-surface-variant">
                  <span>{t('selectedDocumentsList', { defaultValue: 'Danh sách tài liệu bị xóa' })}</span>
                  <span className="bg-error/10 text-error px-2 py-0.5 rounded-full font-mono">{deleteTargets.length}</span>
                </div>
                <div className="max-h-52 overflow-y-auto divide-y divide-outline-variant/30 scrollbar-thin">
                  {deleteTargets.map((doc, idx) => (
                    <div key={doc.id} className="px-3 py-2.5 flex items-center gap-2.5 text-sm hover:bg-surface-container-low/50 transition-colors">
                      <span className="text-xs font-mono text-on-surface-variant/60 w-6 shrink-0">{idx + 1}.</span>
                      <span className="material-symbols-outlined text-[18px] text-error/80 shrink-0">description</span>
                      <span className="font-medium text-on-surface truncate flex-1" title={doc.title}>{doc.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              disabled={isDeleting}
              onClick={() => setDeleteTargets(null)}
              className="rounded-xl px-5 cursor-pointer"
            >
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDeleteConfirm}
              className="rounded-xl px-5 gap-2 font-bold cursor-pointer min-w-[130px]"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('deleting', { defaultValue: 'Đang xóa...' })}</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                  <span>{t('delete')}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
