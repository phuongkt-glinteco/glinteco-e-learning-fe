'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/providers/AuthProvider';
import { useDocuments } from './useDocuments';
import { DocumentsFilters } from './DocumentsFilters';
import { DocumentsView } from './DocumentsView';
import { DocumentsPagination } from './DocumentsPagination';
import Modal from '@/components/ui/Modal';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/default/button';
import {Loader2, PlusIcon} from 'lucide-react';

export default function DocumentsContainer() {
  const t = useTranslations('DocumentsPage');
  const { user, loading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const [search, setSearch] = useState('');
  const [selectedKind, setSelectedKind] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const hasActiveFilters = Boolean(search || selectedKind || selectedTag || bookmarkedOnly);

  function handleClearFilters() {
    setSearch('');
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

  return (
    <div className="px-gutter py-6 max-w-container-max mx-auto w-full space-y-6">
      {isAdmin && (
        <div className="flex justify-end">
          {(() => {
            return (
              <Button onClick={() => router.push('/admin/documents/create')} className="gap-2 rounded-xl h-10 px-6">
                <PlusIcon className="w-4 h-4" />
                {t('newDocument')}
              </Button>
            );
          })()}
        </div>
      )}

      <DocumentsFilters
        search={search}
        onSearchChange={setSearch}
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
