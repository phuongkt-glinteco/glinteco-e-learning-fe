'use client';

import { useTranslations } from 'next-intl';
import type { DocumentResponseDto } from '@/services/api-client';
import { BookmarkButton } from './BookmarkButton';
import Link from 'next/link';
import { Badge } from '@/components/ui/default/badge';
import { Button } from '@/components/ui/default/button';
import { ArrowRightIcon } from 'lucide-react';
import { toTitleCase } from '@/lib/utils';
import { DataGrid } from '@/components/ui/data-display/DataGrid';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/default/card';

interface DocumentGridProps {
  documents: DocumentResponseDto[];
  onBookmarkToggle: (id: string, bookmarked: boolean) => void;
}

const KIND_STYLES: Record<string, { bg: string; text: string }> = {
  Guide: { bg: 'bg-blue-50', text: 'text-blue-700' },
  Reference: { bg: 'bg-purple-50', text: 'text-purple-700' },
  Runbook: { bg: 'bg-amber-50', text: 'text-amber-700' },
  Tutorial: { bg: 'bg-green-50', text: 'text-green-700' },
  Link: { bg: 'bg-gray-100', text: 'text-gray-600' },
};

export function DocumentGrid({ documents, onBookmarkToggle }: DocumentGridProps) {
  const t = useTranslations('DocumentsPage');

  return (
    <DataGrid
      data={documents}
      emptyMessage={<span className="font-label-md text-on-surface-variant">{t('noDocuments')}</span>}
      renderItem={(doc) => {
        const style = KIND_STYLES[doc.kind] || KIND_STYLES.Link;
        const urlStr = doc.url as unknown as string;
        
        return (
          <Card className="flex flex-col h-full hover:shadow-md transition-all group relative border-outline-variant bg-surface-container-lowest">
            <CardHeader className="pb-2 flex flex-row justify-between items-start">
              <span className={`px-2 py-1 ${style.bg} ${style.text} text-caption-bold rounded uppercase`}>
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
                  className="inline-flex items-center gap-2 text-primary hover:underline text-body-sm mb-6"
                  href={urlStr}
                  target="_blank"
                  rel="noreferrer"
                  title={urlStr}
                >
                  <span className="material-symbols-outlined text-[16px]">public</span>
                  {t('visitLink') || 'Visit Link'}
                </a>
              )}
              {doc.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {doc.tags.map((tag) => (
                    <Badge key={tag.id} variant="secondary">
                      #{toTitleCase(tag.name)}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="mt-auto pt-4 bg-transparent border-t-0">
              <Button asChild variant="link" className="p-0 h-auto font-label-md">
                <Link href={`/documents/${doc.id}`} className="inline-flex items-center gap-2">
                  {t('readDocumentation')}
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        );
      }}
    />
  );
}
