'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  cohortControllerFindAll,
  cohortControllerGetOverview,
  submissionsControllerFindAll,
  cohortControllerGetTrackCompletion,
} from '@/services/api-client';
import type {
  CohortDashboardStatsDto,
  SubmissionFeedItemDto,
  ExerciseDetailDto,
  UserProfileDto,
} from '@/services/api-client';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/providers/AuthProvider';
import { FallbackUiSimple } from '@/components/ui/fallback';
import Skeleton from '@/components/ui/loading/Skeleton';
import StatsCard from './StatsCard';
import SubmissionFeed from './SubmissionFeed';
import CohortVelocityChart from './CohortVelocityChart';
import QuickLinksCard from './QuickLinksCard';
import CohortSelector from './CohortSelector';
import { ProgressBar } from '@/components/ui/HPBar';

function extractExerciseName(exercise: ExerciseDetailDto | undefined): string {
  return exercise?.title ?? '';
}

function mapStatus(apiStatus: string): 'pending_review' | 'changes_requested' | 'approved' {
  switch (apiStatus) {
    case 'submitted': return 'pending_review';
    case 'changes': return 'changes_requested';
    case 'approved': return 'approved';
    default: return 'pending_review';
  }
}

interface AdminDashboardPageProps {
  cohorts?: { id: string; name: string }[];
  selectedCohortId?: string | null;
  initialStats?: CohortDashboardStatsDto | null;
  initialSubmissions?: SubmissionFeedItemDto[];
  initialTrackCompletion?: { label: string; value: number }[];
}

export default function AdminDashboardPage({
  cohorts: serverCohorts,
  selectedCohortId: serverCohortId,
  initialStats: serverStats,
  initialSubmissions: serverSubmissions = [],
  initialTrackCompletion: serverTrackCompletion = [],
}: AdminDashboardPageProps) {
  const isServerRendered = !!serverCohorts;
  const t = useTranslations('AdminDashboardPage');
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const cohortIdFromUrl = searchParams.get('cohortId');

  // Client-mode state (only used when isServerRendered === false)
  const [clientCohortList, setClientCohortList] = useState<{ id: string; name: string }[]>([]);
  const [clientSelectedCohortId, setClientSelectedCohortId] = useState<string | null>(cohortIdFromUrl);
  const [clientStats, setClientStats] = useState<CohortDashboardStatsDto | null>(null);
  const [clientSubmissions, setClientSubmissions] = useState<SubmissionFeedItemDto[]>([]);
  const [clientTrackCompletion, setClientTrackCompletion] = useState<{ label: string; value: number }[]>([]);
  const [clientLoading, setClientLoading] = useState(true);
  const [clientError, setClientError] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Derived values — use server props in server mode, client state otherwise
  const cohortList = isServerRendered ? serverCohorts! : clientCohortList;
  const selectedCohortId = isServerRendered ? (serverCohortId ?? null) : clientSelectedCohortId;
  const stats = isServerRendered ? (serverStats ?? null) : clientStats;
  const submissions = isServerRendered ? serverSubmissions : clientSubmissions;
  const trackCompletion = isServerRendered ? serverTrackCompletion : clientTrackCompletion;
  const loading = isServerRendered ? false : clientLoading;
  const error = isServerRendered ? false : clientError;

  function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return t('timeAgoMin', { count: mins });
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return t('timeAgoHour', { count: hrs });
    const days = Math.floor(hrs / 24);
    return t('timeAgoDay', { count: days });
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  // Client-mode: sync URL back to state (browser back/forward)
  useEffect(() => {
    if (isServerRendered) return;
    if (cohortIdFromUrl && cohortIdFromUrl !== clientSelectedCohortId) {
      setClientSelectedCohortId(cohortIdFromUrl);
    }
  }, [isServerRendered, cohortIdFromUrl]);

  // Client-mode: fetch cohorts list then determine default
  useEffect(() => {
    if (isServerRendered) return;
    if (!mounted || authLoading) return;
    let cancelled = false;

    cohortControllerFindAll({ throwOnError: true })
      .then((res) => {
        if (cancelled) return;
        const list = (res.data?.data ?? []).map((c) => ({
          id: c.id ?? '',
          name: c.name ?? '',
        }));
        setClientCohortList(list);

        if (!cohortIdFromUrl) {
          const defaultId = (user as UserProfileDto)?.cohortId && list.some((c) => c.id === (user as UserProfileDto).cohortId)
            ? (user as UserProfileDto).cohortId ?? null
            : list[0]?.id ?? null;
          if (defaultId) {
            setClientSelectedCohortId(defaultId);
            const params = new URLSearchParams(searchParams.toString());
            params.set('cohortId', defaultId);
            router.replace(pathname + '?' + params.toString());
          }
        }
      })
      .catch(() => {
        if (!cancelled) setClientError(true);
      });

    return () => { cancelled = true; };
  }, [isServerRendered, mounted, authLoading, cohortIdFromUrl, (user as UserProfileDto)?.cohortId]);

  // Client-mode: fetch dashboard data when cohort changes
  useEffect(() => {
    if (isServerRendered) return;
    const cid = clientSelectedCohortId;
    if (!cid) return;
    setClientLoading(true);
    setClientError(false);
    let cancelled = false;

    async function fetchData() {
      try {
        const [overviewRes, submissionsRes, trackRes] = await Promise.all([
          cohortControllerGetOverview({ path: { id: cid! }, throwOnError: true }),
          submissionsControllerFindAll({ query: { cohortId: cid! }, throwOnError: true }),
          cohortControllerGetTrackCompletion({ path: { id: cid! }, throwOnError: true }),
        ]);
        if (cancelled) return;
        setClientStats(overviewRes.data as CohortDashboardStatsDto);
        setClientSubmissions(submissionsRes.data?.data ?? []);
        setClientTrackCompletion(
          (trackRes.data?.data ?? []).map((t) => ({
            label: t.title ?? '',
            value: t.completionPct ?? 0,
          }))
        );
      } catch {
        if (!cancelled) setClientError(true);
      } finally {
        if (!cancelled) setClientLoading(false);
      }
    }
    fetchData();

    return () => { cancelled = true; };
  }, [isServerRendered, clientSelectedCohortId]);

  // Update URL when user changes cohort (Rule 2)
  const handleCohortChange = useCallback((id: string) => {
    if (!isServerRendered) {
      setClientSelectedCohortId(id);
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set('cohortId', id);
    router.push(pathname + '?' + params.toString());
  }, [isServerRendered, router, pathname, searchParams]);

  if (authLoading || !mounted) return null;
  if (error && !cohortList.length) {
    return <FallbackUiSimple mainContentLabel={t('loadError')} />;
  }
  if (!selectedCohortId) {
    return <FallbackUiSimple mainContentLabel={t('noCohort')} />;
  }

  const statCards = [
    {
      label: t('activeLearners'),
      value: String(stats?.activeLearners ?? 0),
      sub: t('thisWeek', { count: stats?.newThisWeek ?? 0 }),
      icon: 'group',
      accent: 'text-blue-500',
      children: <ProgressBar value={75} className="mt-2" />,
    },
    {
      label: t('avgCompletion'),
      value: `${stats?.avgCompletion ?? 0}%`,
      sub: t('vsLastWeek', { pct: stats?.avgCompletionDelta ?? 0 }),
      icon: 'query_stats',
      accent: 'text-emerald-500',
      children: <ProgressBar value={stats?.avgCompletion ?? 0} barClassName="bg-emerald-500" className="mt-2" />,
    },
    {
      label: t('pendingReviews'),
      value: String(stats?.pendingReview ?? 0),
      sub: t('oldest', { time: stats?.oldestPendingAgo ?? '0h' }),
      icon: 'reviews',
      accent: 'text-amber-500',
      children: (
        <div className="flex gap-1 mt-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${i <= (stats?.pendingReview ?? 0) ? 'bg-amber-500' : 'bg-surface-container'}`}
            />
          ))}
        </div>
      ),
    },
    {
      label: t('rampSpeed'),
      value: String(stats?.avgRampDays ?? 0),
      sub: t('target', { days: stats?.targetRampDays ?? 0 }),
      icon: 'speed',
      accent: 'text-on-surface-variant',
      children: (
        <p className="text-[10px] text-emerald-500 font-bold uppercase mt-2">
          {(stats?.targetRampDays ?? 0) - (stats?.avgRampDays ?? 0) > 0
            ? t('aheadOfSchedule', { days: (stats?.targetRampDays ?? 0) - (stats?.avgRampDays ?? 0) })
            : t('behindSchedule')}
        </p>
      ),
    },
  ];

  const feedItems = submissions.map((s) => ({
    id: s.id ?? '',
    user: {
      id: s.user?.id ?? '',
      name: s.user?.name ?? '',
      avatarHue: s.user?.avatarHue,
    },
    exercise: extractExerciseName(s.exercise as ExerciseDetailDto | undefined),
    prUrl: s.prUrl ?? '#',
    status: mapStatus(s.status ?? ''),
    timeAgo: s.submittedAt ? timeAgo(s.submittedAt) : '',
  }));

  const statusCounts = {
    pending: submissions.filter((s) => s.status === 'submitted').length,
    changes: submissions.filter((s) => s.status === 'changes').length,
    approved: submissions.filter((s) => s.status === 'approved').length,
  };

  const oldestSubmission = submissions
    .filter((s) => s.submittedAt)
    .sort((a, b) => new Date(a.submittedAt!).getTime() - new Date(b.submittedAt!).getTime())[0];

  return (
    <div className="max-w-container-max mx-auto flex flex-col gap-lg p-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-headline-lg-mobile md:text-headline-lg text-primary font-bold">
            {t('title')}
          </h2>
          <div className="mt-2">
            <CohortSelector
              cohorts={cohortList}
              selectedId={selectedCohortId}
              onChange={handleCohortChange}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
        {loading
          ? [1, 2, 3, 4].map((i) => (
              <Skeleton key={i} height={128} />
            ))
          : statCards.map((s) => (
              <StatsCard key={s.label} {...s} />
            ))
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        <div className="lg:col-span-2">
          {loading ? (
            <Skeleton height={600} />
          ) : (
            <SubmissionFeed
              items={feedItems}
              totalCount={submissions.length}
              statusCounts={statusCounts}
              oldestAgo={oldestSubmission?.submittedAt ? timeAgo(oldestSubmission.submittedAt).replace(' ago', '') : '0h'}
              onFilter={() => {}}
              onViewAll={() => {}}
            />
          )}
        </div>
        <div className="gap-lg flex flex-col">
          {loading ? (
            <>
              <Skeleton height={192} />
              <Skeleton height={128} />
              <Skeleton height={96} />
            </>
          ) : (
            <>
              {trackCompletion.length > 0 && <CohortVelocityChart data={trackCompletion} />}
              <QuickLinksCard
                title={t('curriculumManagement')}
                icon="edit_note"
                links={[
                  { label: t('trackEditor'), href: '/admin/tracks' },
                  { label: t('lessonPlanner'), href: '/admin/tracks', icon: 'chevron_right' },
                ]}
              />
              <QuickLinksCard
                title={t('documentationPortal')}
                icon="menu_book"
                links={[
                  { label: t('manageDocs'), href: '/admin/docs', icon: 'open_in_new' },
                ]}
              />
            </>
          )}
        </div>
      </div>

      <div className="h-8" />
    </div>
  );
}
