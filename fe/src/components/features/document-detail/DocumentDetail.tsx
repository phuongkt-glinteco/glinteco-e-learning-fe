'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import type { DocumentResponseDto } from '@/services/api-client';
import { MarkdownRenderer } from '@/lib/md-renderer';
import { BookmarkButton } from '../documents/BookmarkButton';
import { DocumentDetailSidebar } from './DocumentDetailSidebar';
import { getDocumentContent, getDocumentUrl } from './content-helper';
import type { GuideContent, TutorialContent, RunbookContent, ReferenceContent, LinkContent } from './types';

interface DocumentDetailProps {
  document: DocumentResponseDto;
}

function extractToc(markdown: string): Array<{ id: string; label: string; level: number }> {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  const items: Array<{ id: string; label: string; level: number }> = [];
  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length as 1 | 2 | 3;
    const label = match[2].trim();
    const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    items.push({ id, label, level });
  }
  return items;
}

export default function DocumentDetail({ document }: DocumentDetailProps) {
  console.log('DocumentDetail render', document);
  const t = useTranslations('DocumentDetail');
  const url = getDocumentUrl(document);

  const content = useMemo(() => getDocumentContent(document), [document]);

  const pageContent = useMemo(() => {
    switch (document.kind) {
      case 'Guide':
        return <ReadingContent content={content as GuideContent} />;
      case 'Tutorial':
        return <TutorialContentBlock content={content as TutorialContent} />;
      case 'Runbook':
        return <RunbookContentBlock content={content as RunbookContent} />;
      case 'Reference':
        return <ReferenceContentBlock content={content as ReferenceContent} />;
      case 'Link':
        return <LinkContentBlock content={content as LinkContent} url={url} />;
      default:
        return <ReadingContent content={content as GuideContent} />;
    }
  }, [document.kind, content, url]);

  const toc = useMemo(() => {
    if (document.kind === 'Guide') {
      const guideContent = content as GuideContent;
      return extractToc(guideContent.body);
    }
    if (document.kind === 'Reference') {
      const refContent = content as ReferenceContent;
      return refContent.sections.map((s) => ({
        id: s.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        label: s.heading,
        level: 2 as const,
      }));
    }
    return [];
  }, [document.kind, content]);

  return (
    <main className="min-h-screen">
      <div className="max-w-[1280px] mx-auto px-gutter py-xl">
        <div className="flex flex-col lg:flex-row gap-gutter">
          <div className="flex-1 lg:w-2/3">
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col gap-4">
                <Link
                  href="/documents"
                  className="flex items-center gap-2 text-primary font-label-md hover:translate-x-[-4px] transition-transform duration-200"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  {t('backToDocuments')}
                </Link>
              </div>
              <BookmarkButton
                documentId={document.id}
                initialState={document.isBookmarked}
                onToggle={() => {}}
              />
            </div>

            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-6">
              {document.title}
            </h1>

            {pageContent}

            <div className="mt-16 pt-8 border-t border-outline-variant flex items-center justify-between">
              <div className="flex items-center gap-4">
                <p className="text-label-md text-on-surface-variant">
                  {t('wasThisHelpful')}
                </p>
                <div className="flex gap-2">
                  <button className="px-4 py-2 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-all">
                    {t('yes')}
                  </button>
                  <button className="px-4 py-2 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-all">
                    {t('no')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <DocumentDetailSidebar toc={toc} tags={document.tags} />
        </div>
      </div>
    </main>
  );
}

function ReadingContent({ content }: { content: GuideContent }) {
  if (!content.body) {
    return <p className="text-on-surface-variant italic">No content.</p>;
  }
  return (
    <article className="prose max-w-none">
      <MarkdownRenderer content={content.body} />
    </article>
  );
}

function TutorialContentBlock({ content }: { content: TutorialContent }) {
  const t = useTranslations('DocumentDetail');
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const progress = content.steps.length > 0
    ? Math.round((completedSteps.size / content.steps.length) * 100)
    : 0;

  return (
    <div className="space-y-lg">
      {content.explanation && (
        <p className="text-body-lg text-on-surface-variant mb-8">
          {content.explanation}
        </p>
      )}

      {content.steps.length > 0 && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-md text-on-surface">{t('progress')}</span>
            <span className="font-bold text-primary">{progress}%</span>
          </div>
          <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
            <div className="bg-primary h-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-on-surface-variant mt-2">
            {completedSteps.size}/{content.steps.length} {t('stepsCompleted')}
          </p>
        </div>
      )}

      <div className="space-y-md">
        {content.steps.map((step, index) => {
          const isCompleted = completedSteps.has(index);
          return (
            <div
              key={index}
              id={`step-${index + 1}`}
              className={`bg-surface-container-lowest border border-outline-variant rounded-xl p-lg transition-all ${
                isCompleted ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start gap-md">
                <button
                  onClick={() => toggleStep(index)}
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-primary text-on-primary'
                      : 'bg-primary/10 text-primary hover:bg-primary/20'
                  }`}
                >
                  {isCompleted ? (
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  ) : (
                    <span className="text-label-md">{index + 1}</span>
                  )}
                </button>
                <div className="flex-1">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-sm">
                    {step.title || `${t('step')} ${index + 1}`}
                  </h3>
                  {step.body && (
                    <div className="text-body-md text-on-surface-variant">
                      <MarkdownRenderer content={step.body} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RunbookContentBlock({ content }: { content: RunbookContent }) {
  return (
    <div className="space-y-lg">
      {content.background && (
        <p className="text-body-lg text-on-surface-variant mb-8">
          {content.background}
        </p>
      )}

      {content.phases.map((phase, pIndex) => (
        <section
          key={pIndex}
          id={`phase-${phase.name.toLowerCase().replace(/\s+/g, '-')}`}
          className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg"
        >
          <h2 className="font-headline-md text-headline-md text-on-surface mb-md flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-error-container text-error flex items-center justify-center text-label-md">
              {pIndex + 1}
            </span>
            {phase.name}
          </h2>
          <div className="space-y-md ml-11">
            {phase.steps.map((step, sIndex) => (
              <div key={sIndex} className="border-l-2 border-outline-variant pl-4">
                <h3 className="font-label-md text-on-surface mb-1">
                  {step.title || `Step ${sIndex + 1}`}
                </h3>
                {step.body && (
                  <div className="text-body-md text-on-surface-variant">
                    <MarkdownRenderer content={step.body} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ReferenceContentBlock({ content }: { content: ReferenceContent }) {
  return (
    <div className="space-y-lg">
      {content.sections.map((section, index) => {
        const id = section.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return (
          <section
            key={index}
            id={id}
            className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg scroll-mt-20"
          >
            <h2 className="font-headline-md text-headline-md text-on-surface mb-md border-b border-outline-variant pb-2">
              {section.heading}
            </h2>
            {section.body ? (
              <div className="text-body-md text-on-surface-variant">
                <MarkdownRenderer content={section.body} />
              </div>
            ) : (
              <p className="text-on-surface-variant italic">No content.</p>
            )}
          </section>
        );
      })}
    </div>
  );
}

function LinkContentBlock({ content, url }: { content: LinkContent; url: string | null }) {
  const t = useTranslations('DocumentDetail');

  return (
    <div className="space-y-lg">
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl relative overflow-hidden">
        <div className="flex flex-col items-center text-center space-y-lg relative">
          {content.description && (
            <p className="text-body-lg text-on-surface-variant max-w-2xl">
              {content.description}
            </p>
          )}
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-sm px-md py-sm bg-primary text-on-primary rounded-lg font-label-md hover:bg-primary/90 transition-all shadow-lg"
            >
              <span className="material-symbols-outlined">open_in_new</span>
              {t('openResource')}
            </a>
          )}
          {content.overview && (
            <div className="text-body-md text-on-surface-variant text-left max-w-2xl mt-4">
              <MarkdownRenderer content={content.overview} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
