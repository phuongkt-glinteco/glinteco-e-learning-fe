'use client';

import React from 'react';
import type { DocumentKind } from './types';
import { DocumentActionsMenu } from './DocumentActionsMenu';
import { Badge } from '@/components/ui/default/badge';
import { toTitleCase } from '@/lib/utils';

interface DocumentCardProps {
  id: string;
  title: string;
  kind: DocumentKind;
  tags: { name: string }[];
  isBookmarked: boolean;
  url?: string | null;
  onBookmarkToggle: (id: string, bookmarked: boolean) => void;
  isAdmin?: boolean;
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

export function DocumentCard({
  id,
  title,
  kind,
  tags,
  isBookmarked,
  onBookmarkToggle,
  isAdmin = false,
  onEdit,
  onDelete,
}: DocumentCardProps) {
  const style = KIND_STYLES[kind] || KIND_STYLES.Link;

  return (
    <div className="group bg-surface-container-lowest border border-outline-variant rounded-xl p-5 transition-all hover:shadow-md hover:border-primary/30 flex flex-col h-full">
      <div className="flex items-start justify-between gap-3 pb-2">
        <h3 className="font-headline-sm text-lg font-bold text-on-surface line-clamp-2 group-hover:text-primary transition-colors flex-grow">
          {title}
        </h3>
        <DocumentActionsMenu
          documentId={id}
          isBookmarked={isBookmarked}
          title={title}
          isAdmin={isAdmin}
          onBookmarkToggle={onBookmarkToggle}
          onEdit={onEdit}
          onDeleteRequest={(docId) => onDelete?.(docId)}
        />
      </div>

      <div className="flex-grow p-0 flex flex-col justify-end mt-4 pt-3 border-t border-outline-variant/40 gap-3">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 ${style.bg} ${style.text} text-xs font-semibold rounded-full uppercase tracking-wider`}>
            {kind}
          </span>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge
                key={tag.name}
                variant="secondary"
                className="max-w-[150px] truncate block font-medium text-xs bg-surface-container text-on-surface-variant"
                title={`#${toTitleCase(tag.name)}`}
              >
                #{toTitleCase(tag.name)}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}