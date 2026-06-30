'use client';

import { MarkdownRenderer } from '@/lib/md-renderer';
import type { ReferenceContent } from './types';

export function ReferenceContentBlock({ content }: { content: ReferenceContent }) {
  return (
    <div className="space-y-lg">
      {content.sections.map((section, index) => {
        const id = section.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return (
          <section key={index} id={id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg scroll-mt-20">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-md border-b border-outline-variant pb-2">{section.heading}</h2>
            {section.body ? (
              <div className="text-body-md text-on-surface-variant"><MarkdownRenderer content={section.body} /></div>
            ) : (
              <p className="text-on-surface-variant italic">No content.</p>
            )}
          </section>
        );
      })}
    </div>
  );
}
