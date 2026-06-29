'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { documentsControllerFindRecent } from '@/services/api-client';
import type { DocumentResponseDto } from '@/services/api-client';
import Skeleton from '@/components/ui/loading/Skeleton';
import SectionHead from '@/components/ui/head/SectionHead';

function DocCard({ title, tags, kind }: Pick<DocumentResponseDto, 'title' | 'tags' | 'kind'>) {
  const tagLabels = (tags ?? []).map((tag) => (
    typeof tag === 'string' ? tag : tag.name ?? tag.id ?? ''
  )).filter(Boolean);

  return (
    <div className="group flex flex-col gap-4 p-lg rounded-xl bg-white border border-outline-variant hover:border-primary hover:bg-primary-container/5 transition-all cursor-pointer h-full shadow-sm">
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 bg-surface-container rounded flex items-center justify-center group-hover:bg-primary-container/10 transition-colors">
          <span className="material-symbols-outlined text-primary text-[28px]">description</span>
        </div>
        <span className="material-symbols-outlined text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
          open_in_new
        </span>
      </div>
      <div>
        <h4 className="font-headline-sm text-headline-sm mb-2 group-hover:text-primary transition-colors">{title ?? 'Untitled document'}</h4>
        <div className="flex flex-wrap gap-2">
          {tagLabels.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-surface-container text-on-surface-variant text-[11px] font-bold uppercase rounded border border-outline-variant"
            >
              {tag}
            </span>
          ))}
          {kind && (
            <span className="px-2 py-0.5 bg-primary-container/20 text-primary text-[11px] font-bold uppercase rounded border border-primary-container/30">
              {kind}
            </span>
          )}
        </div>
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

  if (loading) return <Skeleton height={256} />;

  return (
    <section>
      <SectionHead title={t('recentDocuments')} />
      {error ? (
        <div className="bg-white border border-error-container rounded-xl p-lg shadow-sm min-h-[180px] flex items-center justify-center">
          <p className="text-body-md text-error text-center">
            {t('noRecentDocuments')}
          </p>
        </div>
      ) : docs.length === 0 ? (
        <div className="bg-white border border-outline-variant rounded-xl p-lg shadow-sm min-h-[180px] flex items-center justify-center">
          <p className="text-body-md text-on-surface-variant text-center">
            {t('noRecentDocuments')}
          </p>
        </div>
      ) : (
        <div className={docs.length === 1 ? '' : 'grid grid-cols-1 md:grid-cols-2 gap-lg'}>
          {docs.map((doc) => (
            <DocCard
              key={doc.id ?? doc.title}
              title={doc.title}
              tags={doc.tags}
              kind={doc.kind}
            />
          ))}
        </div>
      )}
    </section>
  );
}
