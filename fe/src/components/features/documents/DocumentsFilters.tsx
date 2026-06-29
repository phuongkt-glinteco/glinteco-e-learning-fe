'use client';

import { useTranslations } from 'next-intl';
import type { TagResponseDto } from '@/services/api-client';

interface DocumentsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedKind: string;
  onKindChange: (value: string) => void;
  selectedTag: string;
  onTagChange: (value: string) => void;
  bookmarkedOnly: boolean;
  onBookmarkedToggle: () => void;
  tags: TagResponseDto[];
}

export function DocumentsFilters({
  search,
  onSearchChange,
  selectedKind,
  onKindChange,
  selectedTag,
  onTagChange,
  bookmarkedOnly,
  onBookmarkedToggle,
  tags,
}: DocumentsFiltersProps) {
  const t = useTranslations('DocumentsPage');

  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
      <div className="flex flex-col gap-6">
        {/* Search */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
            search
          </span>
          <input
            className="w-full pl-12 pr-4 py-4 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-body-base outline-none"
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-label-sm text-on-surface-variant uppercase font-bold tracking-tight">
            {t('filters')}
          </span>

          {/* Kind Filter */}
          <select
            className="px-4 py-2 bg-surface-container-low border border-outline-variant rounded-full text-label-md focus:outline-none focus:border-primary min-w-[130px] cursor-pointer"
            value={selectedKind}
            onChange={(e) => onKindChange(e.target.value)}
          >
            <option value="">{t('allKinds')}</option>
            <option value="Guide">{t('guide')}</option>
            <option value="Reference">{t('reference')}</option>
            <option value="Runbook">{t('runbook')}</option>
            <option value="Tutorial">{t('tutorial')}</option>
            <option value="Link">{t('link')}</option>
          </select>

          {/* Tag Filter */}
          <select
            className="px-4 py-2 bg-surface-container-low border border-outline-variant rounded-full text-label-md focus:outline-none focus:border-primary min-w-[130px] cursor-pointer"
            value={selectedTag}
            onChange={(e) => onTagChange(e.target.value)}
          >
            <option value="">{t('allTags')}</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>

          {/* Bookmarked Toggle */}
          <button
            onClick={onBookmarkedToggle}
            className={`flex items-center gap-2 px-4 py-2 border rounded-full text-label-md transition-colors ${
              bookmarkedOnly
                ? 'bg-primary/10 border-primary text-primary'
                : 'border-outline-variant hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">star</span>
            {t('bookmarkedOnly')}
          </button>
        </div>
      </div>
    </div>
  );
}