'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import type { DocumentResponseDto } from '@/services/api-client';
import { DocumentGrid } from './DocumentGrid';
import { DocumentTable } from './DocumentTable';
import { Loader2 } from 'lucide-react';

interface DocumentsViewProps {
  documents: DocumentResponseDto[];
  isAdmin: boolean;
  loading: boolean;
  onBookmarkToggle: (id: string, bookmarked: boolean) => void;
  onDelete: (id: string) => void;
}

export function DocumentsView({ documents, isAdmin, loading, onBookmarkToggle, onDelete }: DocumentsViewProps) {
  const t = useTranslations('DocumentsPage');
  const router = useRouter();

  // if (documents.length === 0 && !loading) {
  //   return (
  //     <div className="py-20 text-center">
  //       <p className="text-on-surface-variant font-label-md">{t('noDocuments')}</p>
  //     </div>
  //   );
  // }

  const content = isAdmin ? (
    <DocumentTable
      documents={documents}
      onBookmarkToggle={onBookmarkToggle}
      onEdit={(id) => router.push(`/admin/documents/${id}/edit`)}
      onDelete={onDelete}
    />
  ) : (
    <DocumentGrid documents={documents} onBookmarkToggle={onBookmarkToggle} />
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
