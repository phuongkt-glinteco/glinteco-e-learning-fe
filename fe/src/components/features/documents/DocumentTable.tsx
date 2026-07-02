'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Badge } from '@/components/ui/default/badge';
import { toTitleCase } from '@/lib/utils';
import { DataTable, type ColumnDef } from '@/components/ui/data-display/DataTable';
import { EmptyState } from '@/components/ui/fallback/EmptyState';
import { DocumentActionsMenu } from './DocumentActionsMenu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/default/alert-dialog';
import type { DocumentListItem } from './types';

interface DocumentTableProps {
  documents: DocumentListItem[];
  isAdmin?: boolean;
  emptyTitle: string;
  emptyDescription: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  onBookmarkToggle: (id: string, bookmarked: boolean) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const KIND_STYLES: Record<string, { bg: string; text: string }> = {
  Guide: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300' },
  Reference: { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-300' },
  Runbook: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300' },
  Tutorial: { bg: 'bg-green-50 dark:bg-green-950/40', text: 'text-green-700 dark:text-green-300' },
  Link: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-300' },
};

export function DocumentTable({
  documents,
  isAdmin,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  onBookmarkToggle,
  onEdit,
  onDelete,
}: DocumentTableProps) {
  const t = useTranslations('DocumentsPage');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const columns: ColumnDef<DocumentListItem>[] = [
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
      key: 'type',
      headerClassName: 'font-caption-bold text-on-surface-variant uppercase tracking-wider',
      header: t('typeLabel'),
      cell: (doc) => {
        const style = KIND_STYLES[doc.kind] || KIND_STYLES.Link;
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${style.bg} ${style.text}`}>
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
          <div className="flex flex-wrap gap-1.5 max-w-[260px]">
            {doc.tags.length > 0 ? (
              doc.tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="font-caption-bold max-w-[140px] truncate block text-xs bg-surface-container text-on-surface-variant"
                  title={toTitleCase(tag.name)}
                 >
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
      headerClassName: 'w-10 px-2',
      cellClassName: 'w-10 px-2 text-right',
      header: null,
      cell: (doc) => (
        <DocumentActionsMenu
          documentId={doc.id}
          isBookmarked={doc.isBookmarked}
          title={doc.title}
          isAdmin={isAdmin}
          onBookmarkToggle={onBookmarkToggle}
          onEdit={onEdit}
          onDeleteRequest={(id, title) => setDeleteTarget({ id, title })}
        />
      ),
    },
  ];

  return (
    <>
      <DataTable
        data={documents}
        columns={columns}
        emptyMessage={(
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            actionLabel={emptyActionLabel}
            onAction={onEmptyAction}
          />
        )}
        rowKey={(doc) => doc.id}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-surface-container-lowest border-outline-variant">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-on-surface font-bold text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-error">warning</span>
              {t('deleteConfirmTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-on-surface-variant text-sm">
              {t('deleteConfirmBody')}
              {deleteTarget && (
                <span className="block mt-2 font-semibold text-on-surface p-2 bg-surface-container rounded border border-outline-variant/50">
                  &quot;{deleteTarget.title}&quot;
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-surface border-outline-variant text-on-surface hover:bg-surface-container">
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget && onDelete) {
                  onDelete(deleteTarget.id);
                  setDeleteTarget(null);
                }
              }}
              className="bg-error hover:bg-error/90 text-white font-bold"
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
