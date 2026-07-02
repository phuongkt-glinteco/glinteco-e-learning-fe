'use client';

import { useTranslations } from 'next-intl';
import { BookmarkButton } from './BookmarkButton';
import Link from 'next/link';
import { Badge } from '@/components/ui/default/badge';
import { Button } from '@/components/ui/default/button';
import { ArrowRightIcon, Edit2Icon, Trash2Icon } from 'lucide-react';
import { toTitleCase } from '@/lib/utils';
import { DataGrid } from '@/components/ui/data-display/DataGrid';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/default/card';
import { EmptyState } from '@/components/ui/fallback/EmptyState';
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
  Guide: { bg: 'bg-blue-50', text: 'text-blue-700' },
  Reference: { bg: 'bg-purple-50', text: 'text-purple-700' },
  Runbook: { bg: 'bg-amber-50', text: 'text-amber-700' },
  Tutorial: { bg: 'bg-green-50', text: 'text-green-700' },
  Link: { bg: 'bg-gray-100', text: 'text-gray-600' },
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

  return (
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
        const urlStr = doc.url;
        
        return (
          <Card className="flex flex-col h-full hover:shadow-md transition-all group relative border-outline-variant bg-surface-container-lowest">
            <CardHeader className="pb-2 flex flex-row justify-between items-center gap-2">
              <span className={`px-2 py-1 ${style.bg} ${style.text} text-caption-bold rounded uppercase truncate max-w-[180px]`}>
                {t(doc.kind.toLowerCase())}
              </span>
              <BookmarkButton
                documentId={doc.id}
                initialState={doc.isBookmarked}
                onToggle={onBookmarkToggle}
              />
            </CardHeader>
            <CardContent className="flex-grow">
              <CardTitle className="font-headline-sm text-headline-sm text-on-surface mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {doc.title}
              </CardTitle>
              {urlStr && (
                <a
                  className="inline-flex items-center gap-2 text-primary hover:underline text-body-sm mb-6 max-w-full truncate"
                  href={urlStr}
                  target="_blank"
                  rel="noreferrer"
                  title={urlStr}
                >
                  <span className="material-symbols-outlined text-[16px] shrink-0">public</span>
                  <span className="truncate">{t('visitLink') || 'Visit Link'}</span>
                </a>
              )}
              {doc.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {doc.tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="max-w-[150px] truncate block font-medium text-xs"
                      title={toTitleCase(tag.name)}
                    >
                      #{toTitleCase(tag.name)}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="mt-auto pt-4 bg-transparent border-t-0 flex items-center justify-between gap-2">
              <Button asChild variant="link" className="p-0 h-auto font-label-md">
                <Link href={`/documents/${doc.id}`} className="inline-flex items-center gap-2">
                  {t('readDocumentation')}
                  <ArrowRightIcon className="w-4 h-4 shrink-0" />
                </Link>
              </Button>
              {isAdmin && onEdit && onDelete && (
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(doc.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                    title={t('edit')}
                  >
                    <Edit2Icon className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(doc.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                    title={t('delete')}
                  >
                    <Trash2Icon className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        );
      }}
    />
  );
}
