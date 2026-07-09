'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { DocumentResponseDto } from '@/services/api-client';
import { MarkdownRenderer } from '@/lib/md-renderer';
import { BookmarkButton } from '../documents/BookmarkButton';
import type { GuideContent, ResourceRefLike } from './types';

interface CollapsibleBlockProps {
  id: string;
  title: string;
  icon: string;
  iconColorClass?: string;
  borderClass?: string;
  bgClass?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  t: (key: string) => string;
}

export function CollapsibleBlock({
  id,
  title,
  icon,
  iconColorClass = 'text-primary',
  borderClass = 'border-outline-variant',
  bgClass = 'bg-surface-container-lowest',
  children,
  defaultOpen = true,
  t,
}: CollapsibleBlockProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section
      id={id}
      className={`rounded-xl border ${borderClass} ${bgClass} p-lg shadow-sm transition-all duration-200 scroll-mt-28`}
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between border-b border-outline-variant/60 pb-3 mb-4 cursor-pointer select-none group"
      >
        <h3 className="font-title-md text-title-md text-on-surface flex items-center gap-2.5 group-hover:text-primary transition-colors">
          <span className={`material-symbols-outlined text-[22px] ${iconColorClass}`}>{icon}</span>
          <span className="font-bold tracking-tight">{title}</span>
        </h3>
        <div className="flex items-center gap-1.5 text-xs font-medium text-on-surface-variant/70 group-hover:text-on-surface transition-colors">
          <span className="hidden sm:inline">{isOpen ? t('showLess') : t('showMore')}</span>
          <span className={`material-symbols-outlined text-[20px] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </div>
      </div>

      {isOpen && <div className="pt-1 animate-fadeIn">{children}</div>}
    </section>
  );
}

export function ReadingHeader({ document }: { document: DocumentResponseDto }) {
  const content = (document.content || {}) as GuideContent;
  return (
    <div className="space-y-4 mb-8 mt-4">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">{document.title}</h1>
        <BookmarkButton documentId={document.id} initialState={document.isBookmarked} onToggle={() => {}} />
      </div>
      {content.description && (
        <p className="text-lg text-on-surface-variant leading-relaxed">{content.description}</p>
      )}
    </div>
  );
}

export function ReadingContent({ content }: { content: GuideContent }) {
  const t = useTranslations('DocumentDetail');

  const prerequisites = content.prerequisites || [];
  const relatedDocs = content.relatedDocs || [];
  const stepsContent = content.steps || content.body || '';

  function getResourceMeta(resource: ResourceRefLike) {
    if (typeof resource === 'string') {
      return {
        id: resource.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)?.[0] || '',
        label: resource,
      };
    }

    return {
      id: resource.id || '',
      label: resource.title || resource.name || resource.id,
    };
  }

  if (!content.objective && !stepsContent && !content.expectedResult && prerequisites.length === 0) {
    return <p className="text-on-surface-variant italic py-20 text-center">No content available.</p>;
  }

  return (
    <div className="space-y-6">
      {/* Objective Block */}
      {content.objective && (
        <CollapsibleBlock
          id="guide-objective"
          title={t('objective')}
          icon="menu_book"
          iconColorClass="text-primary font-bold"
          borderClass="border-primary/40 border-l-4 border-l-primary"
          bgClass="bg-primary-container/10"
          t={t}
        >
          <div className="prose max-w-none text-on-surface text-body-lg leading-relaxed">
            <MarkdownRenderer content={content.objective} />
          </div>
        </CollapsibleBlock>
      )}

      {/* Prerequisites Block */}
      {prerequisites.length > 0 && (
        <section id="guide-prerequisites" className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm scroll-mt-28">
          <h3 className="font-title-md text-title-md text-on-surface border-b border-outline-variant/60 pb-3 mb-4 flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-[22px]">checklist</span>
            <span className="font-bold tracking-tight">{t('prerequisites')}</span>
          </h3>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {prerequisites.map((req, idx) => {
              const { id, label } = getResourceMeta(req);
              const href = id ? `/documents/${id}` : `/documents?search=${encodeURIComponent(label)}`;

              return (
                <li key={idx}>
                  <a
                    href={href}
                    className="flex items-center justify-between p-3.5 rounded-lg bg-surface-container-low border border-outline-variant/70 text-primary font-semibold hover:bg-surface-container hover:border-primary hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="material-symbols-outlined text-[20px] text-primary group-hover:scale-110 transition-transform">article</span>
                      <span className="truncate text-sm">{label}</span>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover:text-primary transition-colors">arrow_forward</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Procedure Steps */}
      {stepsContent && (
        <CollapsibleBlock
          id="guide-steps"
          title={t('steps')}
          icon="format_list_numbered"
          iconColorClass="text-primary font-bold"
          borderClass="border-outline-variant border-l-4 border-l-primary"
          bgClass="bg-surface-container-lowest"
          t={t}
        >
          <div className="prose max-w-none text-on-surface-variant pt-2">
            <MarkdownRenderer content={stepsContent} />
          </div>
        </CollapsibleBlock>
      )}

      {/* Expected Result Block */}
      {content.expectedResult && (
        <CollapsibleBlock
          id="guide-expected-result"
          title={t('expectedResult')}
          icon="task_alt"
          iconColorClass="text-success font-bold"
          borderClass="border-success/40 border-l-4 border-l-success"
          bgClass="bg-success-container/10"
          t={t}
        >
          <div className="prose max-w-none text-on-surface text-body-md leading-relaxed">
            <MarkdownRenderer content={content.expectedResult} />
          </div>
        </CollapsibleBlock>
      )}

      {/* Related Documents Block */}
      {relatedDocs.length > 0 && (
        <section id="guide-related-docs" className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm scroll-mt-28">
          <h3 className="font-title-md text-title-md text-on-surface border-b border-outline-variant/60 pb-3 mb-4 flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-[22px]">library_books</span>
            <span className="font-bold tracking-tight">{t('relatedDocs')}</span>
          </h3>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relatedDocs.map((doc, idx) => {
              const id = doc.id || '';
              const label = doc.title || doc.name || doc.id || 'Related Document';
              const href = id ? `/documents/${id}` : `/documents?search=${encodeURIComponent(label)}`;

              return (
                <li key={idx}>
                  <a
                    href={href}
                    className="flex items-center justify-between p-3.5 rounded-lg bg-surface-container-low border border-outline-variant/70 text-primary font-semibold hover:bg-surface-container hover:border-primary hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="material-symbols-outlined text-[20px] text-primary group-hover:scale-110 transition-transform">menu_book</span>
                      <span className="truncate text-sm">{label}</span>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover:text-primary transition-colors">arrow_forward</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
