'use client';

import { useTranslations } from 'next-intl';
import type { DocumentResponseDto } from '@/services/api-client';
import { BookmarkButton } from './BookmarkButton';
import { useRouter } from 'next/dist/client/components/navigation';

interface DocumentTableProps {
  documents: DocumentResponseDto[];
  onBookmarkToggle: (id: string, bookmarked: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const KIND_STYLES: Record<string, { bg: string; text: string }> = {
  Guide: { bg: 'bg-blue-50', text: 'text-blue-700' },
  Reference: { bg: 'bg-purple-50', text: 'text-purple-700' },
  Runbook: { bg: 'bg-amber-50', text: 'text-amber-700' },
  Tutorial: { bg: 'bg-green-50', text: 'text-green-700' },
  Link: { bg: 'bg-gray-100', text: 'text-gray-600' },
};

export function DocumentTable({ documents, onBookmarkToggle, onEdit, onDelete }: DocumentTableProps) {
  const t = useTranslations('DocumentsPage');
  const router = useRouter();
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-low border-b border-outline-variant">
            <th className="px-6 py-4 w-12">
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">bookmark</span>
            </th>
            <th className="px-6 py-4 font-caption-bold text-on-surface-variant uppercase tracking-wider">
              {t('titleLabel')}
            </th>
            <th className="px-6 py-4 font-caption-bold text-on-surface-variant uppercase tracking-wider">
              {t('urlLabel')}
            </th>
            <th className="px-6 py-4 font-caption-bold text-on-surface-variant uppercase tracking-wider">
              {t('typeLabel')}
            </th>
            <th className="px-6 py-4 font-caption-bold text-on-surface-variant uppercase tracking-wider">
              {t('tagsLabel')}
            </th>
            <th className="px-6 py-4 font-caption-bold text-on-surface-variant uppercase tracking-wider text-right">
              {t('actions')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {
             (documents.length === 0) ?
             (
              <tr>

                <td colSpan={6} className="px-6 py-4 text-center text-on-surface-variant font-label-md">

                  {t('noDocuments')}
                
                </td>
                
              </tr>
            )
        :
      documents.map((doc) => {
            const style = KIND_STYLES[doc.kind] || KIND_STYLES.Link;
            const urlRaw = doc.url as unknown as string;
            const displayUrl = urlRaw
              ? urlRaw.replace(/https?:\/\//, '')
              : '';

            return (
              <tr key={doc.id} className="hover:bg-surface-container-lowest transition-colors group">
                <td className="px-6 py-4">
                  <BookmarkButton
                    documentId={doc.id}
                    initialState={doc.isBookmarked}
                    onToggle={onBookmarkToggle}
                  />
                </td>
                <td className="px-6 py-4">
                  <div
                  onClick={() => router.push(`/documents/${doc.id}`)}
                  >
                  <span className="font-label-md text-primary font-semibold">{doc.title}</span>

                  </div>
                </td>
                <td className="px-6 py-4">
                  {urlRaw ? (
                    <a
                      className="flex items-center gap-2 text-primary hover:underline font-label-sm"
                      href={urlRaw}
                      target="_blank"
                    >
                      <span className="material-symbols-outlined text-[16px]">link</span>
                      {displayUrl.length > 30
                        ? displayUrl.substring(0, 27) + '...'
                        : displayUrl}
                    </a>
                  ) : (
                    <span className="font-label-sm text-on-surface-variant opacity-50">—</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-caption-bold uppercase ${style.bg} ${style.text}`}
                  >
                    {t(doc.kind.toLowerCase())}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {doc.tags.length > 0
                      ? doc.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="px-2 py-0.5 bg-surface-container-low rounded-lg font-caption-bold text-on-surface-variant"
                          >
                            #{tag.name}
                          </span>
                        ))
                      : <span className="font-label-sm text-on-surface-variant opacity-50">—</span>}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(doc.id)}
                      className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-primary transition-colors"
                      title={t('edit')}
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                    <button
                      onClick={() => onDelete(doc.id)}
                      className="p-2 hover:bg-error-container rounded-lg text-on-surface-variant hover:text-error-red transition-colors"
                      title={t('delete')}
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })
            }
          
        </tbody>
      </table>
    </div>
  );
}
