'use client';

import { useTranslations } from 'next-intl';

interface DocumentsPaginationProps {
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}

export function DocumentsPagination({ hasMore, loadingMore, onLoadMore }: DocumentsPaginationProps) {
  const t = useTranslations('DocumentsPage');

  if (!hasMore) return null;

  return (
    <div className="flex justify-center">
      <button
        onClick={onLoadMore}
        disabled={loadingMore}
        className="px-6 py-2 border border-primary text-primary rounded-lg font-label-md hover:bg-primary/5 transition-colors disabled:opacity-50"
      >
        {loadingMore ? t('loadingMore') : t('loadMore')}
      </button>
    </div>
  );
}
