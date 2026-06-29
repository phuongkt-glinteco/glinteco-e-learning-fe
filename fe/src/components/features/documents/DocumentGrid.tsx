'use client';

import { useTranslations } from 'next-intl';
import type { DocumentResponseDto } from '@/services/api-client';
import { BookmarkButton } from './BookmarkButton';

interface DocumentGridProps {
  documents: DocumentResponseDto[];
  onBookmarkToggle: (id: string, bookmarked: boolean) => void;
}

const KIND_STYLES: Record<string, { bg: string; text: string }> = {
  Guide: { bg: 'bg-blue-50', text: 'text-blue-700' },
  Reference: { bg: 'bg-purple-50', text: 'text-purple-700' },
  Runbook: { bg: 'bg-amber-50', text: 'text-amber-700' },
  Tutorial: { bg: 'bg-green-50', text: 'text-green-700' },
  Link: { bg: 'bg-gray-100', text: 'text-gray-600' },
};

export function DocumentGrid({ documents, onBookmarkToggle }: DocumentGridProps) {
  const t = useTranslations('DocumentsPage');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {documents.map((doc) => {
        const style = KIND_STYLES[doc.kind] || KIND_STYLES.Link;
        const urlStr = doc.url as unknown as string;
        return (
          <div
            key={doc.id}
            className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col hover:shadow-md transition-all group relative"
          >
            <div className="flex justify-between items-start mb-4">
              <span
                className={`px-2 py-1 ${style.bg} ${style.text} text-caption-bold rounded uppercase`}
              >
                {t(doc.kind.toLowerCase())}
              </span>
              <BookmarkButton
                documentId={doc.id}
                initialState={doc.isBookmarked}
                onToggle={onBookmarkToggle}
              />
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {doc.title}
            </h3>
            {urlStr && (
              <p className="text-body-sm text-on-surface-variant mb-6 line-clamp-3">
                {urlStr}
              </p>
            )}
            {doc.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {doc.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="text-caption-bold text-on-surface-variant"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-auto">
              <a
                className="inline-flex items-center gap-2 text-primary font-label-md hover:underline"
                href={`/documents/${doc.id}`}
              >
                {t('readDocumentation')}
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
