'use client';

import { useTranslations } from 'next-intl';
import type { DocumentResponseDto } from '@/services/api-client';
import { BookmarkButton } from './BookmarkButton';
import Link from 'next/link';
import { Badge } from '@/components/ui/default/badge';
import { Button } from '@/components/ui/default/button';
import { Edit2Icon, Trash2Icon } from 'lucide-react';
import { toTitleCase } from '@/lib/utils';
import { DataTable, type ColumnDef } from '@/components/ui/data-display/DataTable';

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

  const columns: ColumnDef<DocumentResponseDto>[] = [
    {
      key: 'bookmark',
      headerClassName: 'w-12',
      header: <span className="material-symbols-outlined text-on-surface-variant text-[18px]">bookmark</span>,
      cell: (doc) => (
        <BookmarkButton
          documentId={doc.id}
          initialState={doc.isBookmarked}
          onToggle={onBookmarkToggle}
        />
      ),
    },
    {
      key: 'title',
      headerClassName: 'font-caption-bold text-on-surface-variant uppercase tracking-wider',
      header: t('titleLabel'),
      cell: (doc) => (
        <Link href={`/documents/${doc.id}`} className="cursor-pointer inline-block">
          <span className="font-label-md text-primary font-semibold hover:underline">{doc.title}</span>
        </Link>
      ),
    },
    {
      key: 'url',
      headerClassName: 'font-caption-bold text-on-surface-variant uppercase tracking-wider',
      header: t('urlLabel'),
      cell: (doc) => {
        const urlRaw = doc.url as unknown as string;
        return urlRaw ? (
          <a
            className="flex items-center gap-2 text-primary hover:underline font-label-sm"
            href={urlRaw}
            target="_blank"
            rel="noreferrer"
            title={urlRaw}
          >
            <span className="material-symbols-outlined text-[16px]">public</span>
            {t('visitLink') || 'Visit Link'}
          </a>
        ) : (
          <span className="font-label-sm text-on-surface-variant opacity-50">—</span>
        );
      },
    },
    {
      key: 'type',
      headerClassName: 'font-caption-bold text-on-surface-variant uppercase tracking-wider',
      header: t('typeLabel'),
      cell: (doc) => {
        const style = KIND_STYLES[doc.kind] || KIND_STYLES.Link;
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-caption-bold uppercase ${style.bg} ${style.text}`}>
            {t(doc.kind.toLowerCase())}
          </span>
        );
      },
    },
    {
      key: 'tags',
      headerClassName: 'font-caption-bold text-on-surface-variant uppercase tracking-wider',
      header: t('tagsLabel'),
      cell: (doc) => {
        return (
          <div className="flex flex-wrap gap-2">
            {doc.tags.length > 0 ? (
              doc.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="font-caption-bold">
                  #{toTitleCase(tag.name)}
                </Badge>
              ))
            ) : (
              <span className="font-label-sm text-on-surface-variant opacity-50">—</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'actions',
      headerClassName: 'font-caption-bold text-on-surface-variant uppercase tracking-wider text-right',
      cellClassName: 'text-right',
      header: t('actions'),
      cell: (doc) => {
        return (
          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(doc.id)}
              className="text-on-surface-variant hover:text-primary transition-colors"
              title={t('edit')}
            >
              <Edit2Icon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(doc.id)}
              className="text-on-surface-variant hover:text-error-red transition-colors"
              title={t('delete')}
            >
              <Trash2Icon className="w-4 h-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      data={documents}
      columns={columns}
      emptyMessage={<span className="font-label-md text-on-surface-variant">{t('noDocuments')}</span>}
      rowKey={(doc) => doc.id}
    />
  );
}
