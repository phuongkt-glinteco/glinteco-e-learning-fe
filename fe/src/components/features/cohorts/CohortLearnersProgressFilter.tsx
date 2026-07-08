'use client';

import { useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';
import { Input } from '@/components/ui/default/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/default/select';

interface CohortLearnersProgressFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  paceFilter: string;
  onPaceFilterChange: (value: string) => void;
  trackFilter: string;
  onTrackFilterChange: (value: string) => void;
  availableTracks: { id: string; title: string }[];
}

export function CohortLearnersProgressFilter({
  searchQuery,
  onSearchChange,
  paceFilter,
  onPaceFilterChange,
  trackFilter,
  onTrackFilterChange,
  availableTracks = [],
}: CohortLearnersProgressFilterProps) {
  const t = useTranslations('CohortDetailPage');

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-4 bg-surface rounded-2xl border border-outline-variant shadow-sm">
      {/* Search Bar */}
      <div className="relative flex-1 min-w-[240px]">
        <Icon
          icon="lucide:search"
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/70 pointer-events-none"
        />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('searchLearnerPlaceholder')}
          className="pl-10 pr-9 h-10 text-xs bg-surface-container/30 border-outline-variant rounded-xl focus:bg-surface transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <Icon icon="lucide:x" className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Select Filters */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
        {/* Pace Status Filter */}
        <Select value={paceFilter} onValueChange={onPaceFilterChange}>
          <SelectTrigger className="w-full sm:w-[180px] h-10 text-xs font-semibold bg-surface border-outline-variant">
            <SelectValue placeholder={t('filterPaceAll')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs font-medium">
              {t('filterPaceAll')}
            </SelectItem>
            <SelectItem value="ahead" className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {t('filterPaceAhead')}
            </SelectItem>
            <SelectItem value="on_track" className="text-xs font-medium text-primary">
              {t('filterPaceOnTrack')}
            </SelectItem>
            <SelectItem value="behind" className="text-xs font-medium text-amber-600 dark:text-amber-400">
              {t('filterPaceBehind')}
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Track Filter */}
        {availableTracks.length > 0 && (
          <Select value={trackFilter} onValueChange={onTrackFilterChange}>
            <SelectTrigger className="w-full sm:w-[200px] h-10 text-xs font-semibold bg-surface border-outline-variant">
              <SelectValue placeholder={t('filterTrackAll')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs font-medium">
                {t('filterTrackAll')}
              </SelectItem>
              {availableTracks.map((track) => (
                <SelectItem key={track.id} value={track.id} className="text-xs font-medium">
                  {track.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}
