'use client';

import Link from 'next/link';
import type { DocumentResponseDto } from '@/services/api-client';
import { MarkdownRenderer } from '@/lib/md-renderer';
import { BookmarkButton } from '../documents/BookmarkButton';
import type { GuideContent } from './types';

export function ReadingHeader({ document }: { document: DocumentResponseDto }) {
  return (
    <div className="flex items-start justify-between mb-8 mt-xl">
      <Link href="/documents" className="flex items-center gap-2 text-primary font-label-md hover:translate-x-[-4px] transition-transform duration-200">
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Back to Documents
      </Link>
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
