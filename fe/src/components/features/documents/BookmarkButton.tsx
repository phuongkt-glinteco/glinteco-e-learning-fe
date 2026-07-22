'use client';

import { useState } from 'react';
import { documentsControllerBookmark, documentsControllerUnbookmark } from '@/services/api-client';

interface BookmarkButtonProps {
  documentId: string;
  initialState: boolean;
  onToggle: (id: string, bookmarked: boolean) => void;
}

export function BookmarkButton({ documentId, initialState, onToggle }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialState);
  const [loading, setLoading] = useState(false);

  async function toggleBookmark(e: React.MouseEvent) {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);

    const nextState = !bookmarked;

    // 1. Optimistic UI update immediately without waiting for API response
    setBookmarked(nextState);
    onToggle(documentId, nextState);

    try {
      if (nextState) {
        await documentsControllerBookmark({ path: { id: documentId }, throwOnError: true });
      } else {
        await documentsControllerUnbookmark({ path: { id: documentId }, throwOnError: true });
      }
    } catch {
      // 2. Revert optimistic update if request fails.
      // Notice: No need for manual alert/toast here because our ADD_TO_ITEMS handler
      // registered in add-item-error.ts automatically dispatches the BOOKMARK_FAILED toast!
      setBookmarked(!nextState);
      onToggle(documentId, !nextState);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggleBookmark}
      disabled={loading}
      className={`transition-all duration-150 cursor-pointer p-1.5 rounded-full hover:bg-surface-container-low flex items-center justify-center ${
        bookmarked
          ? 'text-amber-500 text-[#F59E0B] dark:text-[#FACC15] scale-110'
          : 'text-on-surface-variant/60 hover:text-amber-500 hover:text-[#F59E0B] dark:hover:text-[#FACC15]'
      }`}
      title={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      <span
        className={`material-symbols-outlined text-[24px] transition-transform ${loading ? 'animate-pulse' : ''}`}
        style={bookmarked ? { fontVariationSettings: "'FILL' 1, 'wght' 600" } : { fontVariationSettings: "'FILL' 0, 'wght' 400" }}
      >
        star
      </span>
    </button>
  );
}
