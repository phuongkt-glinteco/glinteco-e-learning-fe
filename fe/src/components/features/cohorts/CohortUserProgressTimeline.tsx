'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';
import { Badge } from '@/components/ui/default/badge';
import { Button } from '@/components/ui/default/button';
import { Input } from '@/components/ui/default/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/default/select';
import { CohortUserLessonBreakdown } from './CohortUserLessonBreakdown';
import type { CohortUserTrackProgressDto } from '@/mocks/cohort-users-progress';

interface CohortUserProgressTimelineProps {
  tracks: CohortUserTrackProgressDto[];
}

export function CohortUserProgressTimeline({ tracks }: CohortUserProgressTimelineProps) {
  const t = useTranslations('CohortDetailPage');

  // View Mode Switcher ('timeline' vs 'discrete')
  const [viewMode, setViewMode] = useState<'timeline' | 'discrete'>('timeline');

  // Timeline expanded state
  const [expandedTrackId, setExpandedTrackId] = useState<string | null>(tracks?.[0]?.trackId || null);

  // Discrete view filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [discreteExpandedTrackId, setDiscreteExpandedTrackId] = useState<string | null>(null);

  const toggleExpand = (trackId: string) => {
    setExpandedTrackId((prev) => (prev === trackId ? null : trackId));
  };

  const toggleDiscreteExpand = (trackId: string) => {
    setDiscreteExpandedTrackId((prev) => (prev === trackId ? null : trackId));
  };

  // Summary statistics across all tracks
  const summaryStats = useMemo(() => {
    if (!tracks || tracks.length === 0) {
      return { total: 0, completed: 0, inProgress: 0, notStarted: 0 };
    }
    const total = tracks.length;
    const completed = tracks.filter((tr) => tr.status === 'completed').length;
    const inProgress = tracks.filter((tr) => tr.status === 'in_progress').length;
    const notStarted = tracks.filter((tr) => tr.status === 'not_started').length;
    return { total, completed, inProgress, notStarted };
  }, [tracks]);

  // Filtered tracks for Discrete view
  const filteredDiscreteTracks = useMemo(() => {
    if (!tracks) return [];
    return tracks.filter((track) => {
      // Search by title
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        if (!track.title.toLowerCase().includes(q)) return false;
      }
      // Status filter
      if (statusFilter !== 'all' && track.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [tracks, searchQuery, statusFilter]);

  if (!tracks || tracks.length === 0) {
    return (
      <div className="p-8 text-center bg-surface-container/30 rounded-xl border border-outline-variant text-xs text-on-surface-variant">
        {t('trackEmptyDesc')}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 1. Header Toolbar with Segmented View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline-variant/60">
        <div className="flex items-center gap-2">
          <Icon icon="lucide:layers" className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-base text-on-surface">
            {t('trackListHeading', { count: tracks.length })}
          </h3>
        </div>

        {/* View Switcher Tabs */}
        <div className="inline-flex items-center bg-surface-container p-1 rounded-xl border border-outline-variant self-start sm:self-auto">
          <button
            onClick={() => setViewMode('timeline')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'timeline'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Icon icon="lucide:git-commit-vertical" className="w-3.5 h-3.5" />
            <span>{t('viewModeTimeline')}</span>
          </button>

          <button
            onClick={() => setViewMode('discrete')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'discrete'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Icon icon="lucide:layout-grid" className="w-3.5 h-3.5" />
            <span>{t('viewModeDiscrete')}</span>
          </button>
        </div>
      </div>

      {/* 2. MODE A: TIMELINE VIEW */}
      {viewMode === 'timeline' && (
        <div className="relative space-y-4 before:absolute before:left-5 before:top-6 before:bottom-6 before:w-0.5 before:bg-outline-variant/60 pt-2">
          {tracks.map((track, idx) => {
            const isExpanded = expandedTrackId === track.trackId;
            const isCompleted = track.status === 'completed';
            const isInProgress = track.status === 'in_progress';

            return (
              <div
                key={track.trackId}
                className={`relative pl-12 transition-all ${
                  isExpanded ? 'scale-[1.01]' : ''
                }`}
              >
                {/* Stepper Node Icon - No pulsing animation */}
                <div
                  className={`absolute left-1 top-4 w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-black shadow-sm z-10 transition-colors ${
                    isCompleted
                      ? 'bg-emerald-500 border-emerald-600 text-white'
                      : isInProgress
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'bg-surface border-outline-variant text-on-surface-variant'
                  }`}
                >
                  {isCompleted ? (
                    <Icon icon="lucide:check" className="w-4 h-4 stroke-[3]" />
                  ) : isInProgress ? (
                    <span>{idx + 1}</span>
                  ) : (
                    <Icon icon="lucide:unlock" className="w-3.5 h-3.5" />
                  )}
                </div>

                {/* Track Milestone Card */}
                <div
                  className={`rounded-2xl border transition-all ${
                    isExpanded
                      ? 'bg-surface border-primary/40 shadow-md'
                      : 'bg-surface hover:bg-surface-container/30 border-outline-variant shadow-sm'
                  }`}
                >
                  <div
                    onClick={() => toggleExpand(track.trackId)}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-base text-on-surface">
                          {track.title}
                        </h4>

                        {/* Track Status Badge */}
                        {isCompleted ? (
                          <Badge
                            variant="outline"
                            className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-bold gap-1"
                          >
                            <Icon icon="lucide:check-circle-2" className="w-3.5 h-3.5" />
                            <span>{t('trackStatusCompleted')}</span>
                          </Badge>
                        ) : isInProgress ? (
                          <Badge
                            variant="default"
                            className="bg-primary text-primary-foreground text-xs font-bold gap-1"
                          >
                            <Icon icon="lucide:play-circle" className="w-3.5 h-3.5" />
                            <span>{t('trackStatusInProgress')}</span>
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-surface-container text-on-surface-variant border-outline-variant text-xs font-semibold gap-1"
                          >
                            <Icon icon="lucide:unlock" className="w-3.5 h-3.5" />
                            <span>{t('trackStatusNotStartedNote')}</span>
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                        <span>
                          {t('completedCountLabel', { completed: track.completedLessonsCount, total: track.totalLessonsCount })}
                        </span>
                      </div>
                    </div>

                    {/* Progress Percentage & Expand Action */}
                    <div className="flex items-center gap-4 justify-between sm:justify-end shrink-0">
                      <div className="text-right">
                        <div className="text-lg font-black text-primary">
                          {Math.round(track.progressPct)}%
                        </div>
                        <div className="w-20 bg-surface-container-highest rounded-full h-1.5 overflow-hidden mt-1">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-300"
                            style={{ width: `${Math.min(100, Math.max(0, track.progressPct))}%` }}
                          />
                        </div>
                      </div>

                      <div
                        className={`w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant transition-transform ${
                          isExpanded ? 'rotate-180 bg-surface-container' : ''
                        }`}
                      >
                        <Icon icon="lucide:chevron-down" className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Collapsible Lesson Breakdown */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 border-t border-outline-variant/60">
                      <CohortUserLessonBreakdown lessons={track.lessons || []} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. MODE B: DISCRETE CARDS VIEW (WITH STATS, FILTER & SEARCH) */}
      {viewMode === 'discrete' && (
        <div className="space-y-5 pt-1">
          {/* Summary KPI Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-surface border border-outline-variant flex items-center justify-between shadow-sm">
              <div>
                <div className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  {t('trackSummaryTotal')}
                </div>
                <div className="text-xl font-black text-on-surface mt-0.5">
                  {summaryStats.total}
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant">
                <Icon icon="lucide:layers" className="w-5 h-5" />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between shadow-sm">
              <div>
                <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                  {t('trackSummaryCompleted')}
                </div>
                <div className="text-xl font-black text-emerald-800 dark:text-emerald-200 mt-0.5">
                  {summaryStats.completed}
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Icon icon="lucide:check-circle-2" className="w-5 h-5" />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between shadow-sm">
              <div>
                <div className="text-[11px] font-bold text-primary uppercase tracking-wider">
                  {t('trackSummaryInProgress')}
                </div>
                <div className="text-xl font-black text-primary mt-0.5">
                  {summaryStats.inProgress}
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                <Icon icon="lucide:play-circle" className="w-5 h-5" />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface border border-outline-variant flex items-center justify-between shadow-sm">
              <div>
                <div className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  {t('trackSummaryNotStarted')}
                </div>
                <div className="text-xl font-black text-on-surface-variant mt-0.5">
                  {summaryStats.notStarted}
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant">
                <Icon icon="lucide:unlock" className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Grouped Search & Filter Toolbar Card */}
          <div className="bg-surface rounded-2xl border border-outline-variant p-4 shadow-sm space-y-3.5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <Icon
                  icon="lucide:search"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none"
                />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchTrackPlaceholder')}
                  className="pl-9 pr-9 text-xs h-10 bg-surface-container/40 border-outline-variant rounded-xl focus:bg-surface transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    <Icon icon="lucide:x" className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter Chips / Segmented Pills (h-10 perfectly matched with search input) */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { value: 'all', label: t('filterStatusAll'), count: summaryStats.total, icon: 'lucide:layers', activeStyle: 'bg-primary text-primary-foreground shadow-sm' },
                  { value: 'completed', label: t('filterStatusCompleted'), count: summaryStats.completed, icon: 'lucide:check-circle-2', activeStyle: 'bg-emerald-500 text-white shadow-sm' },
                  { value: 'in_progress', label: t('filterStatusInProgress'), count: summaryStats.inProgress, icon: 'lucide:play-circle', activeStyle: 'bg-primary text-primary-foreground shadow-sm' },
                  { value: 'not_started', label: t('filterStatusNotStarted'), count: summaryStats.notStarted, icon: 'lucide:unlock', activeStyle: 'bg-surface-container-highest text-on-surface shadow-sm' },
                ].map((item) => {
                  const isActive = statusFilter === item.value;
                  return (
                    <button
                      key={item.value}
                      onClick={() => setStatusFilter(item.value)}
                      className={`inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? item.activeStyle
                          : 'bg-surface-container/50 hover:bg-surface-container text-on-surface-variant hover:text-on-surface border border-outline-variant/60'
                      }`}
                    >
                      <Icon icon={item.icon} className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                          isActive ? 'bg-white/20' : 'bg-surface text-on-surface-variant'
                        }`}
                      >
                        {item.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Filtered Tracks List / Grid */}
          {filteredDiscreteTracks.length === 0 ? (
            <div className="p-10 text-center bg-surface rounded-xl border border-outline-variant text-xs text-on-surface-variant">
              {t('filterTrackEmpty')}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredDiscreteTracks.map((track) => {
                const isExpanded = discreteExpandedTrackId === track.trackId;
                const isCompleted = track.status === 'completed';
                const isInProgress = track.status === 'in_progress';

                return (
                  <div
                    key={track.trackId}
                    className="rounded-2xl border border-outline-variant bg-surface overflow-hidden shadow-sm hover:border-primary/40 transition-colors"
                  >
                    <div
                      onClick={() => toggleDiscreteExpand(track.trackId)}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h4 className="font-bold text-base text-on-surface">
                            {track.title}
                          </h4>

                          {isCompleted ? (
                            <Badge
                              variant="outline"
                              className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-bold gap-1"
                            >
                              <Icon icon="lucide:check-circle-2" className="w-3.5 h-3.5" />
                              <span>{t('trackStatusCompleted')}</span>
                            </Badge>
                          ) : isInProgress ? (
                            <Badge
                              variant="default"
                              className="bg-primary text-primary-foreground text-xs font-bold gap-1"
                            >
                              <Icon icon="lucide:play-circle" className="w-3.5 h-3.5" />
                              <span>{t('trackStatusInProgress')}</span>
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-surface-container text-on-surface-variant border-outline-variant text-xs font-semibold gap-1"
                            >
                              <Icon icon="lucide:unlock" className="w-3.5 h-3.5" />
                              <span>{t('trackStatusNotStartedNote')}</span>
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                          <span>
                            {t('progressCountLabel', { completed: track.completedLessonsCount, total: track.totalLessonsCount })}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar & Expand Toggle */}
                      <div className="flex items-center gap-4 justify-between sm:justify-end shrink-0">
                        <div className="text-right">
                          <div className="text-lg font-black text-primary">
                            {Math.round(track.progressPct)}%
                          </div>
                          <div className="w-24 bg-surface-container-highest rounded-full h-2 overflow-hidden mt-1">
                            <div
                              className="h-full rounded-full bg-primary transition-all duration-300"
                              style={{ width: `${Math.min(100, Math.max(0, track.progressPct))}%` }}
                            />
                          </div>
                        </div>

                        <div
                          className={`w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant transition-transform ${
                            isExpanded ? 'rotate-180 bg-surface-container' : ''
                          }`}
                        >
                          <Icon icon="lucide:chevron-down" className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Collapsible Lesson List */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-3 border-t border-outline-variant/60 bg-surface-container/20">
                        <CohortUserLessonBreakdown lessons={track.lessons || []} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
