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
  const [selectedKind, setSelectedKind] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const hasActiveFilters = Boolean(search || selectedKind || selectedTag || bookmarkedOnly);

  const replaceSearchQuery = useCallback(
    (nextSearch: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const normalizedSearch = nextSearch.trim();

      params.delete('search');
      if (normalizedSearch) {
        params.set('q', normalizedSearch);
      } else {
        params.delete('q');
      }

      const currentQuery = searchParams.toString();
      const nextQuery = params.toString();
      if (nextQuery === currentQuery) return;

      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  function handleClearFilters() {
    replaceSearchQuery('');
    setSelectedKind('');
    setSelectedTag('');
    setBookmarkedOnly(false);
  }

  // Consistent: treat as learner while loading to avoid hydration mismatch
  // Admin header is rendered only when auth has resolved and user is confirmed admin
  const isAdmin = mounted && !authLoading && user?.role === 'admin';

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
  } = useDocuments({ search, selectedKind, selectedTag, bookmarkedOnly });

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
        onSearchChange={replaceSearchQuery}
        selectedKind={selectedKind}
        onKindChange={setSelectedKind}
        selectedTag={selectedTag}
        onTagChange={setSelectedTag}
        bookmarkedOnly={bookmarkedOnly}
        onBookmarkedToggle={() => setBookmarkedOnly((prev) => !prev)}
        tags={tags}
      />

      <DocumentsView
        documents={documents}
        isAdmin={isAdmin}
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
            <TabsList className="bg-transparent h-auto p-0 border-b-0 space-x-8 rounded-none">
              <TabsTrigger
                value="documents"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-3.5 px-2 font-bold text-base bg-transparent data-[state=active]:bg-transparent transition-all flex items-center gap-2.5 text-on-surface-variant data-[state=active]:text-primary"
              >
                <span className="material-symbols-outlined text-[20px]">description</span>
                <span>{t('adminTitle', { defaultValue: 'Document Management' })}</span>
              </TabsTrigger>
              <TabsTrigger
                value="tags"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-3.5 px-2 font-bold text-base bg-transparent data-[state=active]:bg-transparent transition-all flex items-center gap-2.5 text-on-surface-variant data-[state=active]:text-primary"
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
