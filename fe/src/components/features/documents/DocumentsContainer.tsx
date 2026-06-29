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
          <span className="material-symbols-outlined text-[32px] text-outline animate-spin">refresh</span>
          <p className="text-outline font-label-md">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error && documents.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="material-symbols-outlined text-[48px] text-error">error</span>
          <p className="text-on-surface font-label-lg">{t('failedToLoad')}</p>
          <button
            onClick={() => fetchDocuments(null, false)}
            className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md hover:opacity-90 transition-opacity"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-gutter py-6 max-w-container-max mx-auto w-full space-y-6">
      {isAdmin && (
        <div className="flex justify-end">
          <button
            onClick={() => router.push('/admin/documents/create')}
            className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-label-md flex items-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98]"
          >
            <span className="material-symbols-outlined">add</span>
            {t('newDocument')}
          </button>
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
        <p className="text-on-surface font-label-md mb-6">{t('deleteConfirmBody')}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setDeleteConfirmId(null)}
            className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface font-label-md hover:bg-surface-container-low transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={async () => {
              if (deleteConfirmId) {
                await handleDelete(deleteConfirmId);
                setDeleteConfirmId(null);
              }
            }}
            className="px-4 py-2 rounded-lg bg-error text-white font-label-md hover:opacity-90 transition-opacity"
          >
            {t('delete')}
          </button>
        </div>
      </Modal>
    </div>
  );
}