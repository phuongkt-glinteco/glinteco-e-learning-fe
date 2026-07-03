'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/default/checkbox';
import { toTitleCase } from '@/lib/utils';
import { DataGrid } from '@/components/ui/data-display/DataGrid';
import { EmptyState } from '@/components/ui/fallback/EmptyState';
import { DocumentActionsMenu } from './DocumentActionsMenu';
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
  onDeleteRequest?: (docs: { id: string; title: string }[]) => void;
  isSelectMode?: boolean;
  selectedIds?: string[];
  onSelectToggle?: (id: string, selected: boolean) => void;
  onSelectAll?: (selectAll: boolean) => void;
}

const KIND_STYLES: Record<string, { bg: string; text: string }> = {
  Guide: { bg: 'bg-blue-100 dark:bg-blue-950/60', text: 'text-blue-800 dark:text-blue-300' },
  Reference: { bg: 'bg-purple-100 dark:bg-purple-950/60', text: 'text-purple-800 dark:text-purple-300' },
  Runbook: { bg: 'bg-red-100 dark:bg-red-950/60', text: 'text-red-800 dark:text-red-300' },
  Tutorial: { bg: 'bg-green-100 dark:bg-green-950/60', text: 'text-green-800 dark:text-green-300' },
  Link: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-300' },
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
  onDeleteRequest,
  isSelectMode = false,
  selectedIds = [],
  onSelectToggle,
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
        const isSelected = selectedIds.includes(doc.id);
        
        return (
          <div
            onClick={() => {
              if (isSelectMode && onSelectToggle) {
                onSelectToggle(doc.id, !isSelected);
              }
            }}
            className={`bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full overflow-hidden relative ${
              isSelectMode ? 'cursor-pointer hover:border-primary/60' : ''
            } ${
              isSelected ? 'border-primary ring-2 ring-primary/20 bg-primary/5 dark:bg-primary/10' : ''
            }`}
          >
            {/* Top Body Content */}
            <div className="p-6 flex-grow flex flex-col">
              {/* Title and Action Menu */}
              <div className="flex justify-between items-start mb-4 gap-2">
                {isSelectMode && (
                  <div className="pt-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => onSelectToggle?.(doc.id, Boolean(checked))}
                      aria-label={`Select ${doc.title}`}
                    />
                  </div>
                )}
                <h2 className="font-headline-sm text-lg font-bold text-on-surface line-clamp-2 pr-2 flex-grow hover:text-primary transition-colors">
                  <Link
                    href={`/documents/${doc.id}`}
                    onClick={(e) => {
                      if (isSelectMode) e.preventDefault();
                    }}
                  >
                    {doc.title}
                  </Link>
                </h2>
                <div onClick={(e) => e.stopPropagation()} className="shrink-0 -mr-2 -mt-1">
                  <DocumentActionsMenu
                    documentId={doc.id}
                    isBookmarked={doc.isBookmarked}
                    title={doc.title}
                    isAdmin={isAdmin}
                    onBookmarkToggle={onBookmarkToggle}
                    onEdit={onEdit}
                    onDeleteRequest={(id, title) => onDeleteRequest?.([{ id, title }])}
                  />
                </div>
              </div>

              {/* Kind Badge right below title */}
              <div className="mb-4">
                <span className={`inline-block px-2 py-1 ${style.bg} ${style.text} rounded font-semibold text-xs uppercase tracking-wider`}>
                  {t(doc.kind.toLowerCase())}
                </span>
              </div>

              {/* Tags at bottom of content area */}
              <div className="flex flex-wrap gap-2 mt-auto overflow-hidden max-h-[64px]">
                {doc.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag.id}
                    className="bg-surface-container-low text-on-surface-variant px-2 py-1 rounded text-xs font-medium max-w-[140px] truncate"
                    title={toTitleCase(tag.name)}
                  >
                    #{toTitleCase(tag.name)}
                  </span>
                ))}
                {doc.tags.length > 3 && (
                  <span className="bg-surface-container-high text-on-surface-variant px-2 py-1 rounded text-xs font-semibold">
                    +{doc.tags.length - 3}
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Footer Bar */}
            <div className="bg-surface-container-low dark:bg-zinc-800/50 p-4 mt-auto border-t border-outline-variant/50">
              <Link
                href={`/documents/${doc.id}`}
                onClick={(e) => {
                  if (isSelectMode) e.preventDefault();
                }}
                className="flex items-center gap-2 text-primary font-semibold text-sm hover:text-primary/80 transition-colors group/link"
              >
                {t('readDocumentation')}
                <span className="material-symbols-outlined text-[16px] transition-transform group-hover/link:translate-x-1">arrow_forward</span>
              </Link>
            </div>
          </div>
        );
      }}
    />
  );
}
