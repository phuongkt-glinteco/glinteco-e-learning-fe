'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/default/button';
import { Badge } from '@/components/ui/default/badge';
import { Avatar, AvatarFallback } from '@/components/ui/default/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/default/table';
import Skeleton from '@/components/ui/loading/Skeleton';
import { CohortProgressSummaryBanner } from './CohortProgressSummaryBanner';
import { CohortLearnersProgressFilter } from './CohortLearnersProgressFilter';
import { UserProgressDetailModal } from './UserProgressDetailModal';
import {
  cohortControllerGetUsersProgress,
  type CohortUserProgressItemDto,
  type UserProfileDto,
} from '@/services/api-client';

export type CohortLearnerItem = Partial<UserProfileDto> & {
  id: string;
  name: string;
  email: string;
};

interface CohortLearnersTableProps {
  cohortId?: string;
  cohortName?: string;
  learners?: CohortLearnerItem[];
  isLoading?: boolean;
  error?: string | null;
  onReload?: () => void;
}

export function CohortLearnersTable({
  cohortId = 'cohort-1',
  cohortName,
  learners = [],
  isLoading: propLoading = false,
  error: propError = null,
  onReload,
}: CohortLearnersTableProps) {
  const t = useTranslations('CohortDetailPage');

  // Internal progress state
  const [progressLearners, setProgressLearners] = useState<CohortUserProgressItemDto[]>([]);
  const [isProgressLoading, setIsProgressLoading] = useState(true);
  const [progressError, setProgressError] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [paceFilter, setPaceFilter] = useState('all');
  const [trackFilter, setTrackFilter] = useState('all');

  // Selected Learner for Modal Detail
  const [selectedLearner, setSelectedLearner] = useState<CohortUserProgressItemDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Selected Cohort switcher state
  const [selectedCohortId, setSelectedCohortId] = useState(cohortId);

  const fetchProgressData = useCallback(async () => {
    setIsProgressLoading(true);
    setProgressError(null);
    try {
      const response = await cohortControllerGetUsersProgress({
        path: { id: selectedCohortId },
      });
      setProgressLearners(response.data?.data || []);
    } catch {
      setProgressError(t('errorLearnersTitle'));
    } finally {
      setIsProgressLoading(false);
    }
  }, [selectedCohortId, t]);

  useEffect(() => {
    fetchProgressData();
  }, [fetchProgressData]);

  // Extract available tracks across all learners
  const availableTracks = useMemo(() => {
    const trackMap = new Map<string, { id: string; title: string }>();
    progressLearners.forEach((learner) => {
      learner.tracks?.forEach((tr) => {
        if (!trackMap.has(tr.trackId)) {
          trackMap.set(tr.trackId, { id: tr.trackId, title: tr.title });
        }
      });
    });
    return Array.from(trackMap.values());
  }, [progressLearners]);

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    if (progressLearners.length === 0) {
      return { avgProgressPct: 0, aheadCount: 0, onTrackCount: 0, behindCount: 0 };
    }

    const totalProgress = progressLearners.reduce((acc, u) => acc + (u.overallProgressPct || 0), 0);
    const avgProgressPct = totalProgress / progressLearners.length;
    const aheadCount = progressLearners.filter((u) => u.paceStatus === 'ahead').length;
    const onTrackCount = progressLearners.filter((u) => u.paceStatus === 'on_track').length;
    const behindCount = progressLearners.filter((u) => u.paceStatus === 'behind').length;

    return { avgProgressPct, aheadCount, onTrackCount, behindCount };
  }, [progressLearners]);

  // Filtered Learners
  const filteredLearners = useMemo(() => {
    return progressLearners.filter((learner) => {
      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = learner.name.toLowerCase().includes(q);
        const matchesEmail = learner.email.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail) return false;
      }

      // Pace Filter
      if (paceFilter !== 'all' && learner.paceStatus !== paceFilter) {
        return false;
      }

      // Track Filter
      if (trackFilter !== 'all') {
        const hasTrack = learner.tracks?.some((tr) => tr.trackId === trackFilter);
        if (!hasTrack) return false;
      }

      return true;
    });
  }, [progressLearners, searchQuery, paceFilter, trackFilter]);

  const handleOpenDetailModal = (learner: CohortUserProgressItemDto) => {
    setSelectedLearner(learner);
    setIsModalOpen(true);
  };

  const mockCohortList = [
    { id: 'cohort-1', name: cohortName || 'Frontend Specialists Q3 2026' },
    { id: 'cohort-2', name: 'Backend Architects Q3 2026' },
    { id: 'cohort-3', name: 'Fullstack Bootcamp Q2 2026' },
  ];

  if (propLoading || isProgressLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <div className="bg-surface rounded-xl border border-outline-variant overflow-hidden shadow-sm p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4 py-3 border-b border-outline-variant/50 last:border-0">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
              <Skeleton className="h-6 w-32 rounded-lg" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (propError || progressError) {
    return (
      <div className="bg-surface rounded-xl border border-outline-variant p-8 flex flex-col items-center justify-center text-center shadow-sm min-h-[300px] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-red-500/80" />
        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-3">
          <Icon icon="lucide:alert-triangle" className="w-7 h-7" />
        </div>
        <h4 className="font-bold text-base text-on-surface mb-1">{t('errorLearnersTitle')}</h4>
        <p className="text-xs text-on-surface-variant max-w-sm mb-5">{propError || progressError}</p>
        <Button onClick={() => { onReload?.(); fetchProgressData(); }} variant="default" className="flex items-center gap-2 px-4 py-2 text-xs shadow-sm">
          <Icon icon="lucide:refresh-cw" className="w-3.5 h-3.5" />
          {t('errorLearnersAction')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 1. Progress Summary Banner with Select Cohort */}
      <CohortProgressSummaryBanner
        cohortId={selectedCohortId}
        cohortName={cohortName}
        cohortList={mockCohortList}
        onSelectCohort={(newId) => setSelectedCohortId(newId)}
        avgProgressPct={summaryMetrics.avgProgressPct}
        aheadCount={summaryMetrics.aheadCount}
        onTrackCount={summaryMetrics.onTrackCount}
        behindCount={summaryMetrics.behindCount}
      />

      {/* 2. Filter Toolbar */}
      <CohortLearnersProgressFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        paceFilter={paceFilter}
        onPaceFilterChange={setPaceFilter}
        trackFilter={trackFilter}
        onTrackFilterChange={setTrackFilter}
        availableTracks={availableTracks}
      />

      {/* 3. Learners Table */}
      {filteredLearners.length === 0 ? (
        <div className="bg-surface rounded-xl border border-outline-variant p-10 flex flex-col items-center justify-center text-center shadow-sm min-h-[260px]">
          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
            <Icon icon="lucide:users" className="w-7 h-7" />
          </div>
          <h4 className="font-bold text-base text-on-surface mb-1">{t('learnerEmptyTitle')}</h4>
          <p className="text-xs text-on-surface-variant max-w-sm">{t('learnerEmptyDesc')}</p>
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-outline-variant overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-surface-container/50 hover:bg-surface-container/50">
                  <TableHead className="font-bold text-on-surface-variant uppercase tracking-wider text-xs py-3.5 pl-6">
                    {t('learnerColLearner')}
                  </TableHead>
                  <TableHead className="font-bold text-on-surface-variant uppercase tracking-wider text-xs py-3.5">
                    {t('learnerColProgress')}
                  </TableHead>
                  <TableHead className="font-bold text-on-surface-variant uppercase tracking-wider text-xs py-3.5">
                    {t('learnerColPace')}
                  </TableHead>
                  <TableHead className="font-bold text-on-surface-variant uppercase tracking-wider text-xs py-3.5">
                    {t('learnerColLevel')}
                  </TableHead>
                  <TableHead className="font-bold text-on-surface-variant uppercase tracking-wider text-xs py-3.5 pr-6 text-right">
                    {t('learnerColAction')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-outline-variant text-sm text-on-surface">
                {filteredLearners.map((learner) => {
                  const hue = learner.avatarHue ?? 210;
                  const initial = (learner.name || 'U').charAt(0).toUpperCase();
                  const isAhead = learner.paceStatus === 'ahead';
                  const isBehind = learner.paceStatus === 'behind';

                  return (
                    <TableRow key={learner.userId} className="hover:bg-surface-container-highest/30 transition-colors group">
                      {/* Learner Info */}
                      <TableCell className="py-4 pl-6 font-medium">
                        <Link
                          href={`/admin/progress/${learner.userId}?cohortId=${selectedCohortId}`}
                          className="flex items-center gap-3.5 group-hover:text-primary transition-colors"
                        >
                          <Avatar size="lg" className="ring-1 ring-outline-variant">
                            <AvatarFallback
                              className="text-white font-bold text-sm"
                              style={{ backgroundColor: `hsl(${hue}, 65%, 50%)` }}
                            >
                              {initial}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-bold text-on-surface text-sm group-hover:text-primary transition-colors">
                              {learner.name}
                            </div>
                            <div className="text-xs text-on-surface-variant font-normal">
                              {learner.email}
                            </div>
                          </div>
                        </Link>
                      </TableCell>

                      {/* Overall Progress Meter */}
                      <TableCell className="py-4 min-w-[180px]">
                        <div className="space-y-1.5 max-w-[200px]">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-on-surface">
                              {Math.round(learner.overallProgressPct)}%
                            </span>
                            <span className="text-on-surface-variant text-[11px]">
                              {t('lessonsCountShort', { completed: learner.completedLessonsCount, total: learner.totalLessonsCount })}
                            </span>
                          </div>
                          <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all duration-500"
                              style={{ width: `${Math.min(100, Math.max(0, learner.overallProgressPct))}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>

                      {/* Pace Badge */}
                      <TableCell className="py-4 whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={`text-xs font-bold gap-1.5 py-1 px-2.5 ${
                            isAhead
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                              : isBehind
                              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                              : 'bg-primary/10 text-primary border-primary/20'
                          }`}
                        >
                          <Icon
                            icon={
                              isAhead
                                ? 'lucide:trending-up'
                                : isBehind
                                ? 'lucide:alert-circle'
                                : 'lucide:check-circle-2'
                            }
                            className="w-3.5 h-3.5"
                          />
                          <span>
                            {isAhead
                              ? t('paceAheadDays', { days: Math.abs(learner.paceDeltaDays) })
                              : isBehind
                              ? t('paceBehindDays', { days: Math.abs(learner.paceDeltaDays) })
                              : t('paceOnTrackLabel')}
                          </span>
                        </Badge>
                      </TableCell>

                      {/* Level & Streak */}
                      <TableCell className="py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">
                            Lv. {learner.level}
                          </span>
                          <Badge
                            variant="outline"
                            className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 gap-1 text-xs font-semibold"
                          >
                            <Icon icon="lucide:flame" className="w-3.5 h-3.5 fill-amber-500" />
                            <span>{learner.streakDays}d</span>
                          </Badge>
                        </div>
                      </TableCell>

                      {/* Action Button */}
                      <TableCell className="py-4 pr-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/progress/${learner.userId}?cohortId=${selectedCohortId}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs font-semibold gap-1.5 border-outline-variant hover:border-primary hover:text-primary transition-colors"
                            >
                              <Icon icon="lucide:gauge" className="w-3.5 h-3.5" />
                              <span>{t('viewProgressAction')}</span>
                            </Button>
                          </Link>

                          <Link
                            href={`/profile?id=${learner.userId}`}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-outline-variant hover:border-primary hover:text-primary text-on-surface-variant transition-colors"
                            title={t('learnerViewProfile')}
                          >
                            <Icon icon="lucide:external-link" className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
