'use client';

import type { DocumentKind } from './types';
import { BookmarkButton } from './BookmarkButton';

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

const KIND_STYLES: Record<DocumentKind, { icon: string; color: string }> = {
  Guide: { icon: 'book', color: 'text-primary' },
  Reference: { icon: 'search', color: 'text-secondary' },
  Runbook: { icon: 'emergency', color: 'text-error' },
  Tutorial: { icon: 'school', color: 'text-tertiary' },
  Link: { icon: 'open_in_new', color: 'text-on-surface-variant' },
};

export function DocumentCard({
  id,
  title,
  kind,
  tags,
  isBookmarked,
  url,
  onBookmarkToggle,
  isAdmin = false,
  onEdit,
  onDelete,
}: DocumentCardProps) {
  const style = KIND_STYLES[kind] || KIND_STYLES.Link;

  return (
    <div className="group bg-surface-container-lowest border border-outline-variant rounded-xl p-lg transition-all hover:shadow-md hover:border-primary/30">
      <div className="flex items-start justify-between gap-md">
        <div className="flex items-center gap-sm">
          <span className={`material-symbols-outlined text-[24px] ${style.color}`}>
            {style.icon}
          </span>
          <span className="text-label-sm font-semibold px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">
            {kind}
          </span>
        </div>
        <div className="flex items-center gap-xs">
          <BookmarkButton
            documentId={id}
            initialState={isBookmarked}
            onToggle={onBookmarkToggle}
          />
          {isAdmin && (
            <>
              <button
                onClick={() => onEdit?.(id)}
                className="p-sm hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer"
                title="Edit"
              >
                <span className="material-symbols-outlined text-on-surface-variant">edit</span>
              </button>
              <button
                onClick={() => onDelete?.(id)}
                className="p-sm hover:bg-error/10 rounded-lg transition-colors cursor-pointer"
                title="Delete"
              >
                <span className="material-symbols-outlined text-error">delete</span>
              </button>
            </>
          )}
        </div>
      </div>

      <h3 className="font-headline-sm text-headline-sm text-on-surface mt-3 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
        {title}
      </h3>

      {url && (
        <p className="text-body-sm text-on-surface-variant truncate mb-3">
          {url}
        </p>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-xs">
          {tags.map((tag) => (
            <span
              key={tag.name}
              className="text-label-sm px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}