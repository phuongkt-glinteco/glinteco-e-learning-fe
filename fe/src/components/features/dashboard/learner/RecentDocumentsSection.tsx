'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { documentsControllerFindRecent } from '@/services/api-client';
import type { DocumentResponseDto } from '@/services/api-client';
import { Skeleton } from '@/components/ui/default/skeleton';
import { Button } from '@/components/ui/default/button';
import { Badge } from '@/components/ui/default/badge';
import SectionHead from '@/components/ui/head/SectionHead';

function DocListItem({ id, title, tags, kind }: Pick<DocumentResponseDto, 'id' | 'title' | 'tags' | 'kind'>) {
  const tagLabels = (tags ?? []).map((tag) => (
    typeof tag === 'string' ? tag : tag.name ?? tag.id ?? ''
  )).filter(Boolean);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-y-1 mb-4 last:mb-0 group hover:border-primary/50 hover:bg-primary/5 transition-colors shadow-sm bg-white">
      <div className="flex items-start sm:items-center gap-4 min-w-0">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex shrink-0 items-center justify-center text-primary mt-1 sm:mt-0">
          <span className="material-symbols-outlined text-[20px]">description</span>
        </div>
        <div className="flex flex-col gap-1.5 min-w-0">
          <h4 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
            {title ?? 'Untitled document'}
          </h4>
          <div className="flex flex-wrap gap-2">
            {kind && (
              <Badge variant="default" className="bg-primary-container/20 text-primary border border-primary-container/30 uppercase text-[10px] hover:bg-primary-container/30">
                {kind}
              </Badge>
            )}
            {tagLabels.map((tag) => (
              <Badge key={tag} variant="outline" className="text-on-surface-variant bg-surface-container uppercase text-[10px] border-outline-variant">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      <div className="shrink-0 mt-2 sm:mt-0 self-start sm:self-center">
        <Link href={`/documents/${id}?from=dashboard`}>
          <Button variant="outline" size="sm" className="flex items-center gap-2 group-hover:border-primary group-hover:text-primary transition-colors h-8">
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function RecentDocumentsSection() {
  const t = useTranslations('LearnerDashboard');
  const [docs, setDocs] = useState<DocumentResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    documentsControllerFindRecent({ throwOnError: true })
      .then((res) => {
        if (cancelled) return;
        const list = res.data?.data ?? [];
        setDocs(list);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <section>
        <SectionHead title={t('recentDocuments')} />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-[72px] w-full rounded-xl" />
          <Skeleton className="h-[72px] w-full rounded-xl" />
          <Skeleton className="h-[72px] w-full rounded-xl" />
        </div>
      </section>
    );
  }

  return (
    <section>
      <SectionHead title={t('recentDocuments')} />
      <div className="flex flex-col py-4 border-2 border-outline-variant rounded-xl bg-white shadow-sm">
        {error ? (
          <div className="min-h-[120px] flex items-center justify-center border border-dashed border-error-container rounded-xl bg-white shadow-sm">
            <p className="text-sm text-error text-center">{t('noRecentDocuments')}</p>
          </div>
        ) : docs.length === 0 ? (
          <div className="min-h-[120px] flex items-center justify-center border border-dashed border-outline-variant rounded-xl bg-white shadow-sm">
            <p className="text-sm text-on-surface-variant text-center">{t('noRecentDocuments')}</p>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="px-5 pb-3 mb-2 flex items-center justify-between border-b border-outline-variant/50">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px] text-primary">history</span>
                <span className="text-xs font-bold uppercase tracking-wider">{t('recentlyAccessed')}</span>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-2 py-0.5 text-[10px] font-bold uppercase">
                {t('documentCount', { count: docs.length })}
              </Badge>
            </div>
            {docs.map((doc) => (
              <DocListItem
                key={doc.id ?? doc.title}
                id={doc.id}
                title={doc.title}
                tags={doc.tags}
                kind={doc.kind}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
