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

  async function toggleBookmark() {
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
      onToggle(documentId, newStatus);
    } catch {
      // Silent error
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggleBookmark}
      disabled={loading}
      className={`transition-colors ${
        bookmarked
          ? 'text-warning-amber'
          : 'text-on-surface-variant hover:text-warning-amber'
      }`}
      title={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      <span
        className={`material-symbols-outlined transition-all ${loading ? 'animate-pulse' : ''}`}
        style={bookmarked ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        star
      </span>
    </button>
  );
}
