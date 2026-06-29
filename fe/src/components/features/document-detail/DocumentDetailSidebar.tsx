'use client';

import { useTranslations } from 'next-intl';
import type { DocumentResponseDto } from '@/services/api-client';

interface TocItem {
  id: string;
  label: string;
  level: number;
}

interface DocumentDetailSidebarProps {
  toc: TocItem[];
  tags: DocumentResponseDto['tags'];
}

export function DocumentDetailSidebar({ toc, tags }: DocumentDetailSidebarProps) {
  const t = useTranslations('DocumentDetail');

  return (
    <aside className="lg:w-1/3 space-y-xl">
      {toc.length > 0 && (
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
          <h3 className="text-label-sm font-bold uppercase tracking-widest text-on-surface-variant mb-4">
            {t('onThisPage')}
          </h3>
          <nav className="space-y-3">
            {toc.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`block py-1 transition-colors ${
                  item.level === 1
                    ? 'text-primary font-bold border-l-2 border-primary pl-4'
                    : 'text-on-surface-variant hover:text-on-surface pl-4'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </section>
      )}

      {tags.length > 0 && (
        <section>
          <h3 className="text-label-sm font-bold uppercase tracking-widest text-on-surface-variant mb-4">
            {t('tags')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="px-3 py-1 bg-surface-container-high text-on-surface-variant rounded text-xs font-semibold hover:bg-primary-container hover:text-on-primary-container cursor-pointer transition-colors"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        </section>
      )}
    </aside>
  );
}
