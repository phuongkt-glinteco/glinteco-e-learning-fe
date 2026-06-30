'use client';

import { useTranslations } from 'next-intl';
import type { DocumentResponseDto } from '@/services/api-client';
import { MarkdownRenderer } from '@/lib/md-renderer';
import type { LinkContent } from './types';

export function LinkLayout({
  document,
  content,
  url,
}: {
  document: DocumentResponseDto;
  content: LinkContent;
  url: string | null;
}) {
  const t = useTranslations('DocumentDetail');
  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-[800px] mx-auto px-gutter pb-3xl space-y-xl">
        <section className="relative bg-surface-container-lowest border border-outline-variant rounded-xl p-xl shadow-sm overflow-hidden">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="flex flex-col items-center text-center space-y-lg relative">
            <div className="space-y-sm">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">{document.title}</h1>
              {content.description && (
                <p className="text-on-surface-variant max-w-[600px] font-body-md">{content.description}</p>
              )}
            </div>
            {document.tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-sm pt-sm">
                {document.tags.map((tag) => (
                  <span key={tag.id} className="px-md py-xs bg-primary/10 text-primary text-label-sm rounded-full border border-primary/20">#{tag.name}</span>
                ))}
              </div>
            )}
            {url && (
              <div className="pt-lg w-full max-w-[280px]">
                <a href={url} target="_blank" rel="noopener noreferrer" className="w-full bg-primary text-on-primary py-md px-xl rounded-lg font-label-md flex items-center justify-center gap-sm hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>open_in_new</span>
                  {t('openResource')}
                </a>
              </div>
            )}
          </div>
        </section>
        {content.overview && (
          <div className="bg-surface-container-low border border-outline-variant rounded-xl p-lg">
            <h3 className="text-primary font-headline-sm text-headline-sm flex items-center gap-sm mb-md">
              <span className="material-symbols-outlined text-primary">info</span>
              Quick Overview
            </h3>
            <div className="text-body-md text-on-surface-variant">
              <MarkdownRenderer content={content.overview} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
