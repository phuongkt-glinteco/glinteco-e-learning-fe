'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Badge } from '@/components/ui/default/badge';
import { Button } from '@/components/ui/default/button';
import { ArrowRightIcon } from 'lucide-react';
import { toTitleCase } from '@/lib/utils';
import { DataGrid } from '@/components/ui/data-display/DataGrid';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/default/card';
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

interface DocumentGridProps {
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

export function DocumentGrid({
  documents,
  isAdmin,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  onBookmarkToggle,
  onEdit,
  onDelete,
}: DocumentGridProps) {
  const t = useTranslations('DocumentsPage');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  return (
    <>
      <DataGrid
        data={documents}
        emptyMessage={(
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            actionLabel={emptyActionLabel}
            onAction={onEmptyAction}
          />
        )}
        renderItem={(doc) => {
          const style = KIND_STYLES[doc.kind] || KIND_STYLES.Link;
          
          return (
            <Card className="flex flex-col h-full hover:shadow-md transition-all group relative border-outline-variant bg-surface-container-lowest p-5">
              {/* Title and 3-dots action menu in same div at top */}
              <div className="flex items-start justify-between gap-3 pb-2">
                <CardTitle className="font-headline-sm text-lg font-bold text-on-surface line-clamp-2 group-hover:text-primary transition-colors flex-grow">
                  <Link href={`/documents/${doc.id}`}>
                    {doc.title}
                  </Link>
                </CardTitle>
                <DocumentActionsMenu
                  documentId={doc.id}
                  isBookmarked={doc.isBookmarked}
                  title={doc.title}
                  isAdmin={isAdmin}
                  onBookmarkToggle={onBookmarkToggle}
                  onEdit={onEdit}
                  onDeleteRequest={(id, title) => setDeleteTarget({ id, title })}
                />
              </div>

              {/* Body: kind and tag moved to bottom, url removed */}
              <CardContent className="flex-grow p-0 flex flex-col justify-end mt-4 pt-3 border-t border-outline-variant/40 gap-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 ${style.bg} ${style.text} text-xs font-semibold rounded-full uppercase tracking-wider`}>
                    {t(doc.kind.toLowerCase())}
                  </span>
                </div>

                {doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {doc.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="max-w-[150px] truncate block font-medium text-xs bg-surface-container text-on-surface-variant"
                        title={toTitleCase(tag.name)}
                      >
                        #{toTitleCase(tag.name)}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>

              <CardFooter className="p-0 mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between">
                <Button asChild variant="link" className="p-0 h-auto font-semibold text-primary">
                  <Link href={`/documents/${doc.id}`} className="inline-flex items-center gap-1.5 text-sm">
                    {t('readDocumentation')}
                    <ArrowRightIcon className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        }}
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
