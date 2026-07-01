'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { DocumentTag } from './types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/default/select';
import { StarIcon } from 'lucide-react';
import { Button } from '@/components/ui/default/button';
import { toTitleCase } from '@/lib/utils';
import { SearchInput } from '@/components/ui/forms/SearchInput';

interface DocumentsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedKind: string;
  onKindChange: (value: string) => void;
  selectedTag: string;
  onTagChange: (value: string) => void;
  bookmarkedOnly: boolean;
  onBookmarkedToggle: () => void;
  tags: DocumentTag[];
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
    <div className="bg-card p-6 rounded-xl border border-border shadow-sm mb-6">
      <div className="flex flex-col gap-6">
        <div className="relative">
          <SearchInput
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={onSearchChange}
            delay={500}
          />
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm text-muted-foreground uppercase font-bold tracking-tight">
            {t('filters')}
          </span>

          {/* Kind Filter */}
          <Select value={selectedKind || "all"} onValueChange={(val) => onKindChange(val === "all" ? "" : val)}>
            <SelectTrigger className="w-[160px] rounded-full h-10">
              <SelectValue placeholder={t('allKinds')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allKinds')}</SelectItem>
              <SelectItem value="Guide">{t('guide')}</SelectItem>
              <SelectItem value="Reference">{t('reference')}</SelectItem>
              <SelectItem value="Runbook">{t('runbook')}</SelectItem>
              <SelectItem value="Tutorial">{t('tutorial')}</SelectItem>
              <SelectItem value="Link">{t('link')}</SelectItem>
            </SelectContent>
          </Select>

          {/* Tag Filter */}
          <Select value={selectedTag || "all"} onValueChange={(val) => onTagChange(val === "all" ? "" : val)}>
            <SelectTrigger className="w-[160px] rounded-full h-10">
              <SelectValue placeholder={t('allTags')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allTags')}</SelectItem>
              {tags.map((tag) => (
                <SelectItem key={tag.id} value={tag.id}>
                  #{toTitleCase(tag.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Bookmarked Toggle */}
          <Button
            variant={bookmarkedOnly ? "default" : "outline"}
            onClick={onBookmarkedToggle}
            className="rounded-full h-10 px-6 gap-2"
          >
            <StarIcon className={`w-4 h-4 ${bookmarkedOnly ? "fill-primary-foreground" : ""}`} />
            {t('bookmarkedOnly')}
          </Button>
        </div>
      </div>
    </div>
  );
}
