'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/default/dropdown-menu';
import { Button } from '@/components/ui/default/button';
import { documentsControllerBookmark, documentsControllerUnbookmark } from '@/services/api-client';

interface DocumentActionsMenuProps {
  documentId: string;
  isBookmarked: boolean;
  title: string;
  isAdmin?: boolean;
  onBookmarkToggle: (id: string, bookmarked: boolean) => void;
  onEdit?: (id: string) => void;
  onDeleteRequest?: (id: string, title: string) => void;
}

export function DocumentActionsMenu({
  documentId,
  isBookmarked: initialBookmarked,
  title,
  isAdmin,
  onBookmarkToggle,
  onEdit,
  onDeleteRequest,
}: DocumentActionsMenuProps) {
  const t = useTranslations('DocumentsPage');
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    const newStatus = !bookmarked;

    try {
      if (newStatus) {
        await documentsControllerBookmark({ path: { id: documentId }, throwOnError: true });
      } else {
        await documentsControllerUnbookmark({ path: { id: documentId }, throwOnError: true });
      }
      setBookmarked(newStatus);
      onBookmarkToggle(documentId, newStatus);
    } catch {
      // Silent error
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-on-surface-variant hover:text-on-surface shrink-0 cursor-pointer"
          title={t('moreActions')}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="material-symbols-outlined text-[20px]">more_vert</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-surface-container-lowest border-outline-variant shadow-lg z-50">
        <DropdownMenuItem
          onClick={handleBookmarkClick}
          disabled={loading}
          className="cursor-pointer flex items-center gap-2.5 font-medium py-2"
        >
          <span
            className="material-symbols-outlined text-[18px] text-amber-500"
            style={bookmarked ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            star
          </span>
          <span>{bookmarked ? t('unbookmark') : t('bookmark')}</span>
        </DropdownMenuItem>

        {isAdmin && (onEdit || onDeleteRequest) && <DropdownMenuSeparator />}

        {isAdmin && onEdit && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onEdit(documentId);
            }}
            className="cursor-pointer flex items-center gap-2.5 font-medium py-2 text-on-surface"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">edit</span>
            <span>{t('edit')}</span>
          </DropdownMenuItem>
        )}

        {isAdmin && onDeleteRequest && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onDeleteRequest(documentId, title);
            }}
            className="cursor-pointer flex items-center gap-2.5 font-semibold py-2 text-error hover:text-error hover:bg-error/10 focus:text-error focus:bg-error/10"
          >
            <span className="material-symbols-outlined text-[18px] text-error">delete</span>
            <span>{t('delete')}</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
