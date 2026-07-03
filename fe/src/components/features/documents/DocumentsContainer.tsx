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
import { Checkbox } from '@/components/ui/default/checkbox';
import { Loader2, PlusIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/default/tabs';
import { ScrollArea } from '@/components/ui/default/scroll-area';
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
  const [deleteProgress, setDeleteProgress] = useState<{ processed: number; total: number } | null>(null);
  const [deleteResult, setDeleteResult] = useState<{
    successCount: number;
    failedCount: number;
    failedIds: string[];
  } | null>(null);
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

  const openDeleteModal = useCallback((docs: { id: string; title: string }[]) => {
    setDeleteResult(null);
    setDeleteProgress(null);
    setDeleteTargets(docs);
  }, []);

  const closeDeleteModal = useCallback(() => {
    if (!isDeleting) {
      setDeleteTargets(null);
      setDeleteResult(null);
      setDeleteProgress(null);
    }
  }, [isDeleting]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTargets || deleteTargets.length === 0) return;
    setIsDeleting(true);
    setDeleteResult(null);
    setDeleteProgress({ processed: 0, total: deleteTargets.length });
    try {
      const ids = deleteTargets.map((d) => d.id);
      const { successIds, failedIds } = await handleBatchDelete(ids, (processed, total) => {
        setDeleteProgress({ processed, total });
      });

      if (successIds.length > 0) {
        setSelectedIds((prev) => prev.filter((id) => !successIds.includes(id)));
      }

      setDeleteResult({
        successCount: successIds.length,
        failedCount: failedIds.length,
        failedIds: failedIds,
      });

      if (failedIds.length > 0) {
        setDeleteTargets((prev) => prev ? prev.filter((d) => failedIds.includes(d.id)) : null);
      }
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTargets, handleBatchDelete]);

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
        onDeleteRequest={openDeleteModal}
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
          <div className="flex items-center gap-2.5">
            <Checkbox
              id="floating-select-all"
              checked={documents.length > 0 && selectedIds.length === documents.length}
              onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
              aria-label="Select all documents"
            />
            <label htmlFor="floating-select-all" className="text-sm font-bold text-on-surface flex items-center gap-2 cursor-pointer select-none">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {t('selectedDocumentsCount', { count: selectedIds.length, defaultValue: `Đã chọn ${selectedIds.length} tài liệu` })}
            </label>
          </div>
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
                openDeleteModal(docs);
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
        onClose={closeDeleteModal}
        title={
          deleteResult
            ? deleteResult.failedCount === 0
              ? t('deleteSuccessModalTitle', { defaultValue: 'Xóa tài liệu thành công' })
              : t('deleteResultModalTitle', { defaultValue: 'Kết quả xóa tài liệu' })
            : t('deleteConfirmTitle')
        }
      >
        <div className="space-y-6">
          {/* Progress Bar during deletion when total > 5 */}
          {isDeleting && deleteProgress && deleteProgress.total > 5 && (
            <div className="space-y-2 p-4 bg-surface-container/60 rounded-xl border border-outline-variant/50 animate-in fade-in">
              <div className="flex justify-between items-center text-xs font-bold text-on-surface-variant">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span>{t('deletingProgress', { processed: deleteProgress.processed, total: deleteProgress.total, defaultValue: `Đang xử lý ${deleteProgress.processed}/${deleteProgress.total} tài liệu...` })}</span>
                </span>
                <span className="text-primary font-mono font-bold">{Math.round((deleteProgress.processed / deleteProgress.total) * 100)}%</span>
              </div>
              <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${(deleteProgress.processed / deleteProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Result State when deletion finished */}
          {deleteResult ? (
            deleteResult.failedCount === 0 ? (
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex flex-col items-center justify-center text-center gap-3 animate-in zoom-in-95 duration-200">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <span className="material-symbols-outlined text-[28px]">check_circle</span>
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-on-surface">
                    {t('deleteSuccessTitle', { count: deleteResult.successCount, defaultValue: `Đã xóa thành công ${deleteResult.successCount} tài liệu` })}
                  </h4>
                  <p className="text-xs text-on-surface-variant">
                    {t('deleteSuccessDesc', { defaultValue: 'Các tài liệu đã được xóa vĩnh viễn khỏi hệ thống.' })}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-200">
                {deleteResult.successCount > 0 ? (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-800 dark:text-amber-300 text-sm space-y-1">
                    <div className="font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px]">info</span>
                      <span>{t('deletePartialHeader', { success: deleteResult.successCount, failed: deleteResult.failedCount, defaultValue: `Đã xóa thành công ${deleteResult.successCount} bài, ${deleteResult.failedCount} bài thất bại` })}</span>
                    </div>
                    <p className="text-amber-800/90 dark:text-amber-300/90 text-xs">
                      {t('deletePartialDesc', { defaultValue: 'Các bài thất bại có thể do kết nối gián đoạn hoặc bị giới hạn tốc độ (rate limit). Bạn có thể thử lại ngay dưới đây.' })}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm space-y-1">
                    <div className="font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px]">warning</span>
                      <span>{t('deleteAllFailedHeader', { count: deleteResult.failedCount, defaultValue: `Không thể xóa ${deleteResult.failedCount} tài liệu` })}</span>
                    </div>
                    <p className="text-error/90 text-xs">
                      {t('deleteAllFailedDesc', { defaultValue: 'Vui lòng kiểm tra lại kết nối hoặc giới hạn từ máy chủ rồi thử lại.' })}
                    </p>
                  </div>
                )}

                {/* Display remaining failed targets */}
                {deleteTargets && deleteTargets.length > 0 && (
                  <div className="rounded-xl border border-outline-variant/60 bg-surface-container-lowest overflow-hidden shadow-2xs">
                    <div className="px-3 py-2 bg-surface-container-low border-b border-outline-variant/40 flex items-center justify-between text-xs font-bold text-on-surface-variant">
                      <span>{t('remainingFailedList', { defaultValue: 'Danh sách tài liệu chưa xóa được' })}</span>
                      <span className="bg-error/10 text-error px-2 py-0.5 rounded-full font-mono">{deleteTargets.length}</span>
                    </div>
                    <ScrollArea className="max-h-52 w-full">
                      <div className="divide-y divide-outline-variant/30">
                        {deleteTargets.map((doc, idx) => (
                          <div key={doc.id} className="px-3 py-2.5 flex items-center gap-2.5 text-sm hover:bg-surface-container-low/50 transition-colors">
                            <span className="text-xs font-mono text-on-surface-variant/60 w-6 shrink-0">{idx + 1}.</span>
                            <span className="material-symbols-outlined text-[18px] text-error/80 shrink-0">description</span>
                            <span className="font-medium text-on-surface truncate flex-1" title={doc.title}>{doc.title}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            )
          ) : (
            /* Initial Confirmation State */
            deleteTargets && deleteTargets.length === 1 ? (
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
                  <ScrollArea className="max-h-52 w-full">
                    <div className="divide-y divide-outline-variant/30">
                      {deleteTargets.map((doc, idx) => (
                        <div key={doc.id} className="px-3 py-2.5 flex items-center gap-2.5 text-sm hover:bg-surface-container-low/50 transition-colors">
                          <span className="text-xs font-mono text-on-surface-variant/60 w-6 shrink-0">{idx + 1}.</span>
                          <span className="material-symbols-outlined text-[18px] text-error/80 shrink-0">description</span>
                          <span className="font-medium text-on-surface truncate flex-1" title={doc.title}>{doc.title}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            ) : null
          )}

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            {deleteResult ? (
              deleteResult.failedCount === 0 ? (
                <Button
                  variant="default"
                  onClick={closeDeleteModal}
                  className="rounded-xl px-6 font-bold cursor-pointer"
                >
                  {t('close', { defaultValue: 'Đóng' })}
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    disabled={isDeleting}
                    onClick={closeDeleteModal}
                    className="rounded-xl px-5 cursor-pointer"
                  >
                    {t('close', { defaultValue: 'Đóng' })}
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={isDeleting || !deleteTargets || deleteTargets.length === 0}
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
                        <span className="material-symbols-outlined text-[18px]">refresh</span>
                        <span>{t('retryDelete', { count: deleteTargets?.length || 0, defaultValue: `Thử lại (${deleteTargets?.length || 0})` })}</span>
                      </>
                    )}
                  </Button>
                </>
              )
            ) : (
              <>
                <Button
                  variant="outline"
                  disabled={isDeleting}
                  onClick={closeDeleteModal}
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
              </>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
