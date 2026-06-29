'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import type { DocumentResponseDto } from '@/services/api-client';
import { DocumentGrid } from './DocumentGrid';
import { DocumentTable } from './DocumentTable';

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
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface-container-lowest/60 rounded-xl">
          <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-full shadow-sm">
            <span className="material-symbols-outlined text-[20px] text-outline animate-spin">refresh</span>
            <span className="text-outline font-label-md">{t('loading')}</span>
          </div>
        </div>
        {content}
      </div>
    );
  }

  return content;
}
