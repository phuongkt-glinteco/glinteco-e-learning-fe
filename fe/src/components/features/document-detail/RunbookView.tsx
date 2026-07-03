'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MarkdownRenderer } from '@/lib/md-renderer';
import type { RunbookContent } from './types';

interface CollapsibleBlockProps {
  id: string;
  title: string;
  icon: string;
  iconColorClass?: string;
  borderClass?: string;
  bgClass?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  t: any;
}

function CollapsibleBlock({
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

export function RunbookContentBlock({ content, documentTitle }: { content: RunbookContent; documentTitle: string }) {
  const t = useTranslations('DocumentDetail');

  const prerequisites = content.prerequisites || [];
  const procedure = content.procedure || content.phases?.map(p => `### ${p.name}\n` + p.steps.map((s, idx) => `#### Step ${idx + 1}: ${s.title}\n${s.body}`).join('\n\n')).join('\n\n') || '';

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-xl bg-error-container p-lg border border-error/30 shadow-md">
        <div className="absolute top-0 right-0 p-lg opacity-10 pointer-events-none">
          <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: '"FILL" 1' }}>emergency</span>
        </div>
        <div className="relative z-10 flex flex-col gap-md">
          <div className="flex items-center gap-sm">
            <span className="bg-error text-on-error px-3 py-1 rounded-full text-label-sm font-label-sm flex items-center gap-xs shadow-sm">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: '"FILL" 1' }}>emergency</span>
              {t('runbook').toUpperCase()}
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-error-container font-extrabold tracking-tight">
            {documentTitle || t('runbook')}
          </h1>
          <p className="font-body-lg text-body-lg text-on-error-container max-w-3xl leading-relaxed opacity-90">
            {content.description || content.trigger || t('standardOperatingProcedure')}
          </p>
        </div>
      </section>

      {/* Trigger Block — Separate card with vibrant alert styling */}
      {content.trigger && (
        <CollapsibleBlock
          id="runbook-trigger"
          title={t('trigger')}
          icon="bolt"
          iconColorClass="text-error font-bold"
          borderClass="border-error/40 border-l-4 border-l-error"
          bgClass="bg-error-container/10"
          t={t}
        >
          <div className="prose max-w-none text-on-surface text-body-lg leading-relaxed">
            <MarkdownRenderer content={content.trigger} />
          </div>
        </CollapsibleBlock>
      )}

      {/* Impact Block — Separate card with vibrant warning styling */}
      {content.impact && (
        <CollapsibleBlock
          id="runbook-impact"
          title={t('impact')}
          icon="warning"
          iconColorClass="text-warning font-bold"
          borderClass="border-warning/40 border-l-4 border-l-warning"
          bgClass="bg-warning-container/10"
          t={t}
        >
          <div className="prose max-w-none text-on-surface text-body-lg leading-relaxed">
            <MarkdownRenderer content={content.impact} />
          </div>
        </CollapsibleBlock>
      )}

      {/* Prerequisites Block — Rendered as document navigation links */}
      {prerequisites.length > 0 && (
        <section id="runbook-prerequisites" className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm scroll-mt-28">
          <h3 className="font-title-md text-title-md text-on-surface border-b border-outline-variant/60 pb-3 mb-4 flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-[22px]">checklist</span>
            <span className="font-bold tracking-tight">{t('prerequisites')}</span>
          </h3>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {prerequisites.map((req, idx) => {
              const id = typeof req === 'object' ? req.id : (req.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)?.[0] || '');
              const label = typeof req === 'object' ? (req.title || req.name || req.id) : req;
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

      {/* Operating Procedure */}
      {procedure && (
        <CollapsibleBlock
          id="runbook-procedure"
          title={t('procedure')}
          icon="integration_instructions"
          iconColorClass="text-primary font-bold"
          borderClass="border-outline-variant border-l-4 border-l-primary"
          bgClass="bg-surface-container-lowest"
          t={t}
        >
          <div className="prose max-w-none text-on-surface-variant pt-2">
            <MarkdownRenderer content={procedure} />
          </div>
        </CollapsibleBlock>
      )}

      {/* Verification: Validation */}
      {content.validation && (
        <CollapsibleBlock
          id="runbook-validation"
          title={t('validation')}
          icon="check_circle"
          iconColorClass="text-success font-bold"
          borderClass="border-success/40 border-l-4 border-l-success"
          bgClass="bg-success-container/10"
          t={t}
        >
          <div className="prose max-w-none text-on-surface text-body-md leading-relaxed">
            <MarkdownRenderer content={content.validation} />
          </div>
        </CollapsibleBlock>
      )}

      {/* Recovery: Rollback */}
      {content.rollback && (
        <CollapsibleBlock
          id="runbook-rollback"
          title={t('rollback')}
          icon="history"
          iconColorClass="text-warning font-bold"
          borderClass="border-warning/40 border-l-4 border-l-warning"
          bgClass="bg-warning-container/10"
          t={t}
        >
          <div className="prose max-w-none text-on-surface text-body-md leading-relaxed">
            <MarkdownRenderer content={content.rollback} />
          </div>
        </CollapsibleBlock>
      )}

      {/* Escalation Protocol */}
      {content.escalation && (
        <CollapsibleBlock
          id="runbook-escalation"
          title={t('escalation')}
          icon="notifications_active"
          iconColorClass="text-error font-bold"
          borderClass="border-error/40 border-l-4 border-l-error"
          bgClass="bg-error-container/10"
          t={t}
        >
          <div className="prose max-w-none text-on-surface text-body-md leading-relaxed">
            <MarkdownRenderer content={content.escalation} />
          </div>
        </CollapsibleBlock>
      )}
    </div>
  );
}
