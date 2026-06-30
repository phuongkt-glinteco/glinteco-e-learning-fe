'use client';

import { useMemo } from 'react';
import type { DocumentResponseDto } from '@/services/api-client';
import { getDocumentContent, getDocumentUrl } from './content-helper';
import { extractTocFromBlocks } from './extract-toc';
import { DocumentDetailSidebar } from './DocumentDetailSidebar';
import { LinkLayout } from './LinkLayout';
import { ReadingHeader, ReadingContent } from './GuideView';
import { TutorialContentBlock } from './TutorialView';
import { RunbookContentBlock } from './RunbookView';
import { ReferenceContentBlock } from './ReferenceView';
import type { GuideContent, TutorialContent, RunbookContent, ReferenceContent, LinkContent } from './types';

interface DocumentDetailProps {
  document: DocumentResponseDto;
}

export default function DocumentDetail({ document }: DocumentDetailProps) {
  const url = getDocumentUrl(document);
  const content = useMemo(() => getDocumentContent(document), [document]);

  const toc = useMemo(() => {
    if (document.kind === 'Guide') {
      return extractTocFromBlocks((content as GuideContent).body);
    }
    if (document.kind === 'Reference') {
      return (content as ReferenceContent).sections.map((s) => ({
        id: s.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        label: s.heading,
        level: 2 as const,
      }));
    }
    return [];
  }, [document.kind, content]);

  if (document.kind === 'Link') {
    return <LinkLayout document={document} content={content as LinkContent} url={url} />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-gutter">
      <div className="space-y-lg min-w-0">
        {document.kind === 'Guide' && <ReadingHeader document={document} />}
        {document.kind === 'Guide' && <ReadingContent content={content as GuideContent} />}
        {document.kind === 'Tutorial' && <TutorialContentBlock content={content as TutorialContent} />}
        {document.kind === 'Runbook' && <RunbookContentBlock content={content as RunbookContent} documentTitle={document.title} />}
        {document.kind === 'Reference' && <ReferenceContentBlock content={content as ReferenceContent} />}
      </div>
      <DocumentDetailSidebar
        kind={document.kind}
        toc={toc}
        tags={document.tags}
        runbookContent={document.kind === 'Runbook' ? (content as RunbookContent) : undefined}
        tutorialContent={document.kind === 'Tutorial' ? (content as TutorialContent) : undefined}
      />
    </div>
  );
}
