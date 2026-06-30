'use client';

import type { DocumentResponseDto } from '@/services/api-client';
import { MarkdownRenderer } from '@/lib/md-renderer';
import { BookmarkButton } from '../documents/BookmarkButton';
import type { GuideContent } from './types';

export function ReadingHeader({ document }: { document: DocumentResponseDto }) {
  return (
    <div className="flex items-start mb-8 mt-xl">
      <BookmarkButton documentId={document.id} initialState={document.isBookmarked} onToggle={() => {}} />
    </div>
  );
}

export function ReadingContent({ content }: { content: GuideContent }) {
  if (!content.body) {
    return <p className="text-on-surface-variant italic py-20 text-center">No content.</p>;
  }
  return (
    <article className="space-y-lg">
      <MarkdownRenderer content={content.body} />
    </article>
  );
}
