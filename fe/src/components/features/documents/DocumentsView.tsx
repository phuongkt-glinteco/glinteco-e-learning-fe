'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { DocumentGrid } from './DocumentGrid';
import { DocumentTable } from './DocumentTable';
import { Loader2 } from 'lucide-react';
import type { DocumentListItem } from './types';

interface DocumentsViewProps {
  documents: DocumentListItem[];
  isAdmin: boolean;
  viewMode: 'grid' | 'list';
  loading: boolean;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onBookmarkToggle: (id: string, bookmarked: boolean) => void;
  onDelete: (id: string) => void;
}

export function DocumentsView({
  documents,
  isAdmin,
  viewMode,
  loading,
  hasActiveFilters,
  onClearFilters,
  onBookmarkToggle,
  onDelete,
}: DocumentsViewProps) {
  const t = useTranslations('DocumentsPage');
  const router = useRouter();

  const content = viewMode === 'list' ? (
    <DocumentTable
      documents={documents}
      isAdmin={isAdmin}
      emptyTitle={hasActiveFilters ? t('emptySearchTitle') : t('emptyDataTitle')}
      emptyDescription={hasActiveFilters ? t('emptySearchDescription') : t('emptyDataDescription')}
      emptyActionLabel={hasActiveFilters ? t('clearFilters') : undefined}
      onEmptyAction={hasActiveFilters ? onClearFilters : undefined}
      onBookmarkToggle={onBookmarkToggle}
      onEdit={(id) => router.push(`/admin/documents/${id}/edit`)}
      onDelete={onDelete}
    />
  ) : (
    <DocumentGrid
      documents={documents}
      isAdmin={isAdmin}
      emptyTitle={hasActiveFilters ? t('emptySearchTitle') : t('emptyDataTitle')}
      emptyDescription={hasActiveFilters ? t('emptySearchDescription') : t('emptyDataDescription')}
      emptyActionLabel={hasActiveFilters ? t('clearFilters') : undefined}
      onEmptyAction={hasActiveFilters ? onClearFilters : undefined}
      onBookmarkToggle={onBookmarkToggle}
      onEdit={(id) => router.push(`/admin/documents/${id}/edit`)}
      onDelete={onDelete}
    />
  );

  if (loading) {
    return (
      <div className="relative">
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-xl">
          <div className="flex items-center gap-2 px-4 py-2 bg-card border rounded-full shadow-sm">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">{t('loading')}</span>
          </div>
        </div>
        {content}
      </div>
    );
  }

  return content;
}

