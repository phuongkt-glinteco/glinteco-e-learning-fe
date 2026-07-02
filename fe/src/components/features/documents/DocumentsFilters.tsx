'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { DocumentTag } from './types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/default/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/default/collapsible';
import { Badge } from '@/components/ui/default/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/default/toggle-group';
import {
  StarIcon,
  TagIcon,
  CheckIcon,
  LayoutGridIcon,
  ListIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  XIcon,
  SearchIcon,
  CheckCircle2Icon,
} from 'lucide-react';
import { Button } from '@/components/ui/default/button';
import { toTitleCase } from '@/lib/utils';
import { SearchInput } from '@/components/ui/forms/SearchInput';

interface DocumentsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedKind: string;
  onKindChange: (value: string) => void;
  selectedTags: string[];
  onTagsChange: (value: string[]) => void;
  bookmarkedOnly: boolean;
  onBookmarkedToggle: () => void;
  tags: DocumentTag[];
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export function DocumentsFilters({
  search,
  onSearchChange,
  selectedKind,
  onKindChange,
  selectedTags = [],
  onTagsChange,
  bookmarkedOnly,
  onBookmarkedToggle,
  tags = [],
  viewMode,
  onViewModeChange,
}: DocumentsFiltersProps) {
  const t = useTranslations('DocumentsPage');
  const [isTagExpanded, setIsTagExpanded] = useState(false);
  const [tagSearchQuery, setTagSearchQuery] = useState('');

  const filteredTags = useMemo(() => {
    if (!tagSearchQuery.trim()) return tags;
    const query = tagSearchQuery.toLowerCase().trim();
    return tags.filter(
      (t) => t.name.toLowerCase().includes(query) || t.id.toLowerCase().includes(query)
    );
  }, [tags, tagSearchQuery]);

  const unselectedTags = useMemo(
    () => filteredTags.filter((t) => !selectedTags.includes(t.name) && !selectedTags.includes(t.id)),
    [filteredTags, selectedTags]
  );

  const selectedTagObjects = useMemo(
    () => tags.filter((t) => selectedTags.includes(t.name) || selectedTags.includes(t.id)),
    [tags, selectedTags]
  );

  return (
    <div className="bg-card/90 backdrop-blur-md p-6 rounded-2xl border border-border/80 shadow-xs mb-6 transition-all">
      <div className="flex flex-col gap-6">
        <div className="relative">
          <SearchInput
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={onSearchChange}
            delay={500}
          />
        </div>

        {/* Filter Bar & View Mode Toggle */}
        <Collapsible open={isTagExpanded} onOpenChange={setIsTagExpanded} className="w-full">
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-border/40">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-muted-foreground uppercase font-extrabold tracking-wider mr-1">
                {t('filters')}
              </span>

              {/* Kind Filter */}
              <Select value={selectedKind || "all"} onValueChange={(val) => onKindChange(val === "all" ? "" : val)}>
                <SelectTrigger className="w-[160px] rounded-full h-10 border-border hover:border-primary/50 transition-all font-medium text-sm">
                  <SelectValue placeholder={t('allKinds')} />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-lg border-border/80 backdrop-blur-md">
                  <SelectItem value="all">{t('allKinds')}</SelectItem>
                  <SelectItem value="Guide">{t('guide')}</SelectItem>
                  <SelectItem value="Reference">{t('reference')}</SelectItem>
                  <SelectItem value="Runbook">{t('runbook')}</SelectItem>
                  <SelectItem value="Tutorial">{t('tutorial')}</SelectItem>
                  <SelectItem value="Link">{t('link')}</SelectItem>
                </SelectContent>
              </Select>

              {/* Expandable Tag Selector Trigger Button */}
              <CollapsibleTrigger asChild>
                <Button
                  variant={isTagExpanded || selectedTags.length > 0 ? "default" : "outline"}
                  className={`h-10 rounded-full px-4 gap-2 text-sm font-medium transition-all shadow-2xs hover:shadow-sm ${
                    isTagExpanded || selectedTags.length > 0
                      ? "bg-primary text-primary-foreground"
                      : "border-dashed border-border hover:border-primary"
                  }`}
                >
                  <TagIcon className="w-4 h-4 shrink-0" />
                  <span>{t('filterByTags', { defaultValue: 'Filter by Tags' })}</span>
                  {selectedTags.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="rounded-full px-2 py-0.5 text-xs font-bold bg-background text-foreground shadow-2xs"
                    >
                      {selectedTags.length}
                    </Badge>
                  )}
                  {isTagExpanded ? (
                    <ChevronUpIcon className="w-4 h-4 ml-0.5" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4 ml-0.5" />
                  )}
                </Button>
              </CollapsibleTrigger>

              {/* Bookmarked Toggle */}
              <Button
                variant={bookmarkedOnly ? "default" : "outline"}
                onClick={onBookmarkedToggle}
                className="rounded-full h-10 px-5 gap-2 font-medium transition-all shadow-2xs hover:shadow-sm"
              >
                <StarIcon className={`w-4 h-4 ${bookmarkedOnly ? "fill-primary-foreground text-primary-foreground" : "text-amber-500"}`} />
                {t('bookmarkedOnly')}
              </Button>
            </div>

            {/* View Mode Toggle Button */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-semibold hidden sm:inline-block">
                {t('viewMode', { defaultValue: 'View:' })}
              </span>
              <ToggleGroup
                type="single"
                value={viewMode}
                onValueChange={(val) => {
                  if (val) onViewModeChange(val as 'grid' | 'list');
                }}
                className="bg-muted/80 p-1 rounded-full border border-border/60 shadow-2xs"
              >
                <ToggleGroupItem
                  value="grid"
                  aria-label="Grid view"
                  className="h-8 px-3.5 rounded-full data-[state=on]:bg-background data-[state=on]:text-primary data-[state=on]:shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <LayoutGridIcon className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">{t('gridView', { defaultValue: 'Grid' })}</span>
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="list"
                  aria-label="List view"
                  className="h-8 px-3.5 rounded-full data-[state=on]:bg-background data-[state=on]:text-primary data-[state=on]:shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ListIcon className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">{t('listView', { defaultValue: 'List' })}</span>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          {/* Collapsed view: Show selected tags as quick-remove chips */}
          {selectedTags.length > 0 && !isTagExpanded && (
            <div className="flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-border/40 animate-in fade-in-50">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mr-1 flex items-center gap-1">
                <TagIcon className="w-3.5 h-3.5 text-primary" />
                {t('selectedTagsLabel', { defaultValue: 'Selected:' })}
              </span>
              {selectedTags.map((tagVal) => {
                const tagObj = tags.find((t) => t.name === tagVal || t.id === tagVal);
                const displayName = tagObj?.name || tagVal;
                return (
                  <Badge
                    key={tagVal}
                    variant="secondary"
                    className="rounded-full px-3 py-1 text-xs font-semibold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5 shadow-2xs hover:bg-primary/20 transition-all cursor-pointer group"
                    onClick={() => onTagsChange(selectedTags.filter((val) => val !== tagVal && (tagObj ? val !== tagObj.name && val !== tagObj.id : true)))}
                    title={t('clickToRemove', { defaultValue: 'Click to remove tag' })}
                  >
                    <span>#{toTitleCase(displayName)}</span>
                    <XIcon className="w-3 h-3 text-primary/70 group-hover:text-primary transition-colors" />
                  </Badge>
                );
              })}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTagsChange([])}
                className="h-7 px-2.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors ml-1"
              >
                {t('clearAll', { defaultValue: 'Clear all' })}
              </Button>
            </div>
          )}

          {/* Expanded view: 2 Sections (Available vs Selected) with max-height & auto scroll */}
          <CollapsibleContent className="pt-4 border-t border-border/50 mt-4 animate-in slide-in-from-top-2 duration-200">
            <div className="bg-muted/30 border border-border/60 rounded-2xl p-5 shadow-inner space-y-5">
              {/* Search input and Close button inside panel */}
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="relative flex-1 min-w-[240px] max-w-md">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={t('searchTagsPlaceholder', { defaultValue: 'Search tags by name...' })}
                    value={tagSearchQuery}
                    onChange={(e) => setTagSearchQuery(e.target.value)}
                    className="w-full h-9 pl-9 pr-8 rounded-xl bg-background border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-2xs"
                  />
                  {tagSearchQuery && (
                    <button
                      onClick={() => setTagSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <XIcon className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsTagExpanded(false)}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground gap-1 h-8 px-3 rounded-lg"
                >
                  <span>{t('collapseTags', { defaultValue: 'Close' })}</span>
                  <ChevronUpIcon className="w-3.5 h-3.5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Section 1: Thẻ chưa chọn (Available / Unselected Tags) */}
                <div className="flex flex-col bg-background rounded-xl border border-border/70 shadow-2xs overflow-hidden">
                  <div className="px-4 py-2.5 bg-muted/60 border-b border-border/50 flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <TagIcon className="w-3.5 h-3.5 text-primary" />
                      {t('availableTags', { defaultValue: 'Available Tags' })}
                    </span>
                    <Badge variant="secondary" className="rounded-full px-2 py-0 text-[10px] font-extrabold bg-background border border-border">
                      {unselectedTags.length}
                    </Badge>
                  </div>
                  <div className="p-3 max-h-[220px] overflow-y-auto space-y-1 custom-scrollbar min-h-[120px]">
                    {unselectedTags.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {unselectedTags.map((tag) => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => onTagsChange([...selectedTags, tag.name])}
                            className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted/70 hover:bg-primary hover:text-primary-foreground border border-border/60 hover:border-primary transition-all text-left shadow-2xs hover:shadow-sm"
                          >
                            <PlusIcon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary-foreground transition-colors shrink-0" />
                            <span className="truncate max-w-[160px]">#{toTitleCase(tag.name)}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                        <span className="text-xs font-medium">
                          {tagSearchQuery
                            ? t('noMatchingTags', { defaultValue: 'No tags matching your search.' })
                            : t('noAvailableTags', { defaultValue: 'All tags have been selected.' })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 2: Thẻ đã chọn (Selected Tags) */}
                <div className="flex flex-col bg-background rounded-xl border border-primary/30 shadow-2xs overflow-hidden">
                  <div className="px-4 py-2.5 bg-primary/10 border-b border-primary/20 flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <CheckCircle2Icon className="w-3.5 h-3.5 text-primary" />
                      {t('selectedTags', { defaultValue: 'Selected Tags' })}
                    </span>
                    <div className="flex items-center gap-2">
                      {selectedTags.length > 0 && (
                        <button
                          type="button"
                          onClick={() => onTagsChange([])}
                          className="text-[11px] font-bold text-primary/80 hover:text-destructive underline transition-colors"
                        >
                          {t('clearAll', { defaultValue: 'Clear all' })}
                        </button>
                      )}
                      <Badge className="rounded-full px-2 py-0 text-[10px] font-extrabold bg-primary text-primary-foreground">
                        {selectedTags.length}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3 max-h-[220px] overflow-y-auto space-y-1 custom-scrollbar min-h-[120px]">
                    {selectedTagObjects.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedTagObjects.map((tag) => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => onTagsChange(selectedTags.filter((val) => val !== tag.name && val !== tag.id))}
                            className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/15 text-primary hover:bg-destructive hover:text-destructive-foreground border border-primary/30 hover:border-destructive transition-all text-left shadow-2xs hover:shadow-sm"
                          >
                            <CheckIcon className="w-3.5 h-3.5 text-primary group-hover:hidden transition-colors shrink-0" />
                            <XIcon className="w-3.5 h-3.5 hidden group-hover:inline-block text-destructive-foreground shrink-0 transition-all" />
                            <span className="truncate max-w-[160px]">#{toTitleCase(tag.name)}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                        <span className="text-xs font-medium">
                          {t('noSelectedTags', { defaultValue: 'No tags selected yet. Click from available tags to select.' })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}


