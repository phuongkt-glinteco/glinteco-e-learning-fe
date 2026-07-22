'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';
import { Badge } from '@/components/ui/default/badge';
import { Input } from '@/components/ui/default/input';
import type { CohortUserTrackProgressDto } from '@/services/api-client';

interface CohortUserProgressTimelineProps {
  tracks: CohortUserTrackProgressDto[];
}

export function CohortUserProgressTimeline({ tracks }: CohortUserProgressTimelineProps) {
  const t = useTranslations('CohortDetailPage');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  const filteredTracks = useMemo(() => {
    if (!tracks) return [];
    return tracks.filter((track) => {
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        if (!track.title.toLowerCase().includes(q)) return false;
      }
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
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/60">
        <Icon icon="lucide:layers" className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-base text-on-surface">
          {t('trackListHeading', { count: tracks.length })}
        </h3>
      </div>

      {/* Summary KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-surface border border-outline-variant flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">{t('trackSummaryTotal')}</div>
            <div className="text-xl font-black text-on-surface mt-0.5">{summaryStats.total}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant">
            <Icon icon="lucide:layers" className="w-5 h-5" />
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">{t('trackSummaryCompleted')}</div>
            <div className="text-xl font-black text-emerald-800 dark:text-emerald-200 mt-0.5">{summaryStats.completed}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Icon icon="lucide:check-circle-2" className="w-5 h-5" />
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[11px] font-bold text-primary uppercase tracking-wider">{t('trackSummaryInProgress')}</div>
            <div className="text-xl font-black text-primary mt-0.5">{summaryStats.inProgress}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
            <Icon icon="lucide:play-circle" className="w-5 h-5" />
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-surface border border-outline-variant flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">{t('trackSummaryNotStarted')}</div>
            <div className="text-xl font-black text-on-surface-variant mt-0.5">{summaryStats.notStarted}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant">
            <Icon icon="lucide:unlock" className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-surface rounded-2xl border border-outline-variant p-4 shadow-sm space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Icon icon="lucide:search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchTrackPlaceholder')}
              className="pl-9 pr-9 text-xs h-10 bg-surface-container/40 border-outline-variant rounded-xl focus:bg-surface transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors">
                <Icon icon="lucide:x" className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
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
                  className={`inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl text-xs font-bold transition-all ${isActive ? item.activeStyle : 'bg-surface-container/50 hover:bg-surface-container text-on-surface-variant hover:text-on-surface border border-outline-variant/60'}`}
                >
                  <Icon icon={item.icon} className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${isActive ? 'bg-white/20' : 'bg-surface text-on-surface-variant'}`}>{item.count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Track Cards */}
      {filteredTracks.length === 0 ? (
        <div className="p-10 text-center bg-surface rounded-xl border border-outline-variant text-xs text-on-surface-variant">
          {t('filterTrackEmpty')}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTracks.map((track) => {
            const isCompleted = track.status === 'completed';
            const isInProgress = track.status === 'in_progress';

            return (
              <div
                key={track.trackId}
                className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="font-bold text-base text-on-surface truncate">{track.title}</h4>
                      {isCompleted ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-bold gap-1 shrink-0">
                          <Icon icon="lucide:check-circle-2" className="w-3.5 h-3.5" />
                          <span>{t('trackStatusCompleted')}</span>
                        </Badge>
                      ) : isInProgress ? (
                        <Badge variant="default" className="bg-primary text-primary-foreground text-xs font-bold gap-1 shrink-0">
                          <Icon icon="lucide:play-circle" className="w-3.5 h-3.5" />
                          <span>{t('trackStatusInProgress')}</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-surface-container text-on-surface-variant border-outline-variant text-xs font-semibold gap-1 shrink-0">
                          <Icon icon="lucide:unlock" className="w-3.5 h-3.5" />
                          <span>{t('trackStatusNotStartedNote')}</span>
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-on-surface-variant">
                      {t('progressCountLabel', { completed: track.completedLessons ?? 0, total: track.totalLessons ?? 0 })}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right min-w-[80px]">
                      <div className="text-lg font-black text-primary">{Math.round(track.progressPct)}%</div>
                      <div className="w-24 bg-surface-container-highest rounded-full h-2 overflow-hidden mt-1">
                        <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${Math.min(100, Math.max(0, track.progressPct))}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
