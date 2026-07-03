'use client';

import { useTranslations } from 'next-intl';
import { MarkdownRenderer } from '@/lib/md-renderer';
import { CollapsibleBlock } from './GuideView';
import type { ReferenceContent } from './types';

export function ReferenceContentBlock({ content }: { content: ReferenceContent }) {
  const t = useTranslations('DocumentDetail');

  const properties = content.properties || [];
  const examples = content.examples;
  const notes = content.notes;
  const sections = content.sections || [];

  if (
    !content.description &&
    !content.category &&
    !content.version &&
    properties.length === 0 &&
    !examples &&
    !notes &&
    sections.length === 0
  ) {
    return <p className="text-on-surface-variant italic py-20 text-center">No content available.</p>;
  }

  return (
    <div className="space-y-6">
      {/* Meta Stats Row: Category & Version */}
      {(content.category || content.version) && (
        <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant/70">
          {content.category && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/50">
              <span className="material-symbols-outlined text-primary text-[20px]">category</span>
              <span className="text-sm font-semibold text-on-surface">
                {t('category')}: <span className="text-primary font-bold">{content.category}</span>
              </span>
            </div>
          )}
          {content.version && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/50">
              <span className="material-symbols-outlined text-tertiary text-[20px]">new_releases</span>
              <span className="text-sm font-semibold text-on-surface">
                {t('version')}: <span className="text-tertiary font-code font-bold">{content.version}</span>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Description Block (if present inside content) */}
      {content.description && (
        <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant text-body-lg text-on-surface-variant leading-relaxed shadow-sm">
          <MarkdownRenderer content={content.description} />
        </div>
      )}

      {/* API / Configuration Properties Table */}
      {properties.length > 0 && (
        <CollapsibleBlock
          id="reference-properties"
          title={t('properties')}
          icon="tune"
          iconColorClass="text-primary font-bold"
          borderClass="border-outline-variant border-l-4 border-l-primary"
          bgClass="bg-surface-container-lowest"
          t={t}
        >
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  <th className="py-3 px-4 bg-surface-container-low/50 rounded-tl-lg">Property Name</th>
                  <th className="py-3 px-4 bg-surface-container-low/50">Type / Format</th>
                  <th className="py-3 px-4 bg-surface-container-low/50">Default Value</th>
                  <th className="py-3 px-4 bg-surface-container-low/50 rounded-tr-lg">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60 text-sm">
                {properties.map((prop, idx) => (
                  <tr key={idx} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="py-3.5 px-4 font-code font-bold text-primary whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span>{prop.name}</span>
                        {prop.required ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-error/10 text-error border border-error/20 uppercase">
                            Req
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-surface-container-high text-on-surface-variant uppercase">
                            Opt
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {prop.type ? (
                        <span className="px-2 py-1 rounded bg-primary/10 text-primary font-code text-xs font-semibold">
                          {prop.type}
                        </span>
                      ) : (
                        <span className="text-on-surface-variant/50 italic">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-code text-xs text-on-surface-variant whitespace-nowrap">
                      {prop.defaultValue ? (
                        <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface">
                          {prop.defaultValue}
                        </span>
                      ) : (
                        <span className="text-on-surface-variant/50 italic">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-on-surface text-body-sm leading-relaxed">
                      {prop.description || <span className="text-on-surface-variant/50 italic">No description provided.</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CollapsibleBlock>
      )}

      {/* Code Examples */}
      {examples && (
        <CollapsibleBlock
          id="reference-examples"
          title={t('examples')}
          icon="code"
          iconColorClass="text-tertiary font-bold"
          borderClass="border-tertiary/40 border-l-4 border-l-tertiary"
          bgClass="bg-tertiary-container/10"
          t={t}
        >
          <div className="prose max-w-none text-on-surface pt-2 font-code">
            <MarkdownRenderer content={examples} />
          </div>
        </CollapsibleBlock>
      )}

      {/* Notes & Callouts */}
      {notes && (
        <CollapsibleBlock
          id="reference-notes"
          title={t('notes')}
          icon="info"
          iconColorClass="text-warning font-bold"
          borderClass="border-warning/40 border-l-4 border-l-warning"
          bgClass="bg-warning-container/10"
          t={t}
        >
          <div className="prose max-w-none text-on-surface pt-1">
            <MarkdownRenderer content={notes} />
          </div>
        </CollapsibleBlock>
      )}

      {/* Legacy Fallback Sections */}
      {sections.length > 0 && (
        <div className="space-y-6 pt-2">
          {sections.map((section, index) => {
            const id = section.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return (
              <section key={index} id={id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg scroll-mt-28 shadow-sm">
                <h2 className="font-headline-md text-xl font-bold text-on-surface mb-4 border-b border-outline-variant/60 pb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">label</span>
                  <span>{section.heading}</span>
                </h2>
                {section.body ? (
                  <div className="text-body-md text-on-surface-variant prose max-w-none">
                    <MarkdownRenderer content={section.body} />
                  </div>
                ) : (
                  <p className="text-on-surface-variant italic">No content.</p>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
