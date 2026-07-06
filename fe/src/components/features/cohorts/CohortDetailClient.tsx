'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useBreadcrumbStore } from '@/stores/breadcrumbStore';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import {
  cohortControllerFindOne,
  cohortControllerGetOverview,
  cohortControllerGetTrackCompletion,
  cohortControllerExportReport,
  usersControllerFindAll,
  submissionsControllerFindAll,
  clientFetchAll,
} from '@/services/api-client';
import { Button } from '@/components/ui/default/button';
import { Card, CardContent } from '@/components/ui/default/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/default/tabs';
import Skeleton from '@/components/ui/loading/Skeleton';
import { EditCohortModal } from './EditCohortModal';
import { CohortOverviewCards } from './CohortOverviewCards';
import { CohortTrackProgressTable } from './CohortTrackProgressTable';
import { CohortLearnersTable, type CohortLearnerItem } from './CohortLearnersTable';
import { CohortSubmissionsTable } from './CohortSubmissionsTable';
import type {
  CohortDetailDto,
  CohortDashboardStatsDto,
  CohortTrackCompletionItemDto,
  SubmissionFeedItemDto,
} from '@/services/api-client';
import type { CohortTabType } from './types';

interface CohortDetailClientProps {
  cohortId: string;
}

export function CohortDetailClient({ cohortId }: CohortDetailClientProps) {
  const t = useTranslations('CohortDetailPage');
  const shellT = useTranslations('AppShell');
  const { setTree } = useBreadcrumbStore();

  const [activeTab, setActiveTab] = useState<CohortTabType>('tracks');
  const [isEditing, setIsEditing] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Widget 1: Cohort Main Detail
  const [cohort, setCohort] = useState<CohortDetailDto | null>(null);
  const [cohortLoading, setCohortLoading] = useState(true);
  const [cohortError, setCohortError] = useState<string | null>(null);

  // Widget 2: Overview Stats
  const [stats, setStats] = useState<CohortDashboardStatsDto | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Widget 3: Track Completion Progress
  const [tracksData, setTracksData] = useState<CohortTrackCompletionItemDto[]>([]);
  const [tracksLoading, setTracksLoading] = useState(true);
  const [tracksError, setTracksError] = useState<string | null>(null);

  // Widget 4: Learners List
  const [learnersData, setLearnersData] = useState<CohortLearnerItem[]>([]);
  const [learnersLoading, setLearnersLoading] = useState(false);
  const [learnersError, setLearnersError] = useState<string | null>(null);
  const [learnersLoaded, setLearnersLoaded] = useState(false);

  // Widget 5: Submissions List
  const [submissionsData, setSubmissionsData] = useState<SubmissionFeedItemDto[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionsError, setSubmissionsError] = useState<string | null>(null);
  const [submissionsLoaded, setSubmissionsLoaded] = useState(false);

  // Initial parallel load using clientFetchAll
  const fetchInitialData = useCallback(async () => {
    setCohortLoading(true);
    setStatsLoading(true);
    setTracksLoading(true);
    setCohortError(null);
    setStatsError(null);
    setTracksError(null);

    try {
      const [res1, res2, res3] = await clientFetchAll([
        () => cohortControllerFindOne({ path: { id: cohortId }, throwOnError: true }),
        () => cohortControllerGetOverview({ path: { id: cohortId }, throwOnError: true }),
        () => cohortControllerGetTrackCompletion({ path: { id: cohortId }, throwOnError: true }),
      ]);

      if (res1?.data) setCohort(res1.data);
      if (res2?.data) setStats(res2.data);
      if (res3?.data) {
        const tData = res3.data as any;
        setTracksData(Array.isArray(tData) ? tData : (tData?.data || []));
      }
    } catch {
      setCohortError(t('errorLoadTitle'));
      setStatsError(t('errorStatsTitle'));
      setTracksError(t('errorTracksTitle'));
    } finally {
      setCohortLoading(false);
      setStatsLoading(false);
      setTracksLoading(false);
    }
  }, [cohortId, t]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Update Breadcrumb
  useEffect(() => {
    const label = cohort ? `${cohort.id.slice(0, 8).toUpperCase()} - ${cohort.name}` : shellT('cohortManager');
    setTree([
      { label: shellT('cohortManager'), href: '/admin/cohorts' },
      { label, href: `/admin/cohorts/${cohortId}` },
    ]);
  }, [cohort, cohortId, setTree, shellT]);

  // Fetch Learners Widget
  const fetchLearners = useCallback(async () => {
    setLearnersLoading(true);
    setLearnersError(null);
    try {
      const res = await usersControllerFindAll({
        query: { cohortId },
        throwOnError: true,
      });
      const data = res.data as { data?: CohortLearnerItem[] } | CohortLearnerItem[] | undefined;
      const items = Array.isArray(data) ? data : (data?.data || []);
      setLearnersData(items);
      setLearnersLoaded(true);
    } catch {
      setLearnersError(t('errorLearnersTitle'));
    } finally {
      setLearnersLoading(false);
    }
  }, [cohortId, t]);

  // Fetch Submissions Widget
  const fetchSubmissions = useCallback(async () => {
    setSubmissionsLoading(true);
    setSubmissionsError(null);
    try {
      const res = await submissionsControllerFindAll({
        query: { cohortId },
        throwOnError: true,
      });
      const data = res.data as { data?: SubmissionFeedItemDto[] } | SubmissionFeedItemDto[] | undefined;
      const items = Array.isArray(data) ? data : (data?.data || []);
      setSubmissionsData(items);
      setSubmissionsLoaded(true);
    } catch {
      setSubmissionsError(t('errorSubmissionsTitle'));
    } finally {
      setSubmissionsLoading(false);
    }
  }, [cohortId, t]);

  // Load tab data on demand
  useEffect(() => {
    if (activeTab === 'learners' && !learnersLoaded && !learnersLoading) {
      fetchLearners();
    } else if (activeTab === 'reviews' && !submissionsLoaded && !submissionsLoading) {
      fetchSubmissions();
    }
  }, [activeTab, learnersLoaded, learnersLoading, fetchLearners, submissionsLoaded, submissionsLoading, fetchSubmissions]);

  // Handle Export Report
  async function handleExportReport() {
    setExporting(true);
    try {
      const res = await cohortControllerExportReport({
        path: { id: cohortId },
        parseAs: 'blob',
        throwOnError: true,
      });
      const url = window.URL.createObjectURL(new Blob([res.data as any]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `cohort-${cohortId}-report.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success(t('exportSuccess'));
    } catch {
      // error handled by interceptor
    } finally {
      setExporting(false);
    }
  }

  if (cohortLoading && !cohort) {
    return (
      <div className="space-y-6">
        <Card className="border-outline-variant shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-6 w-32 rounded-lg" />
              <Skeleton className="h-8 w-64" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24 rounded-lg" />
              <Skeleton className="h-9 w-32 rounded-lg" />
            </div>
          </div>
        </Card>
        <CohortOverviewCards isLoading={true} />
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="bg-surface rounded-xl border border-outline-variant p-6 h-64">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (cohortError && !cohort) {
    return (
      <Card className="border-outline-variant shadow-sm p-10 flex flex-col items-center justify-center text-center min-h-[400px] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-500/80" />
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-4">
          <Icon icon="lucide:alert-triangle" className="w-8 h-8" />
        </div>
        <h3 className="font-bold text-lg text-on-surface mb-1">{t('errorLoadTitle')}</h3>
        <p className="text-sm text-on-surface-variant max-w-md mb-6">{cohortError}</p>
        <Button onClick={fetchInitialData} variant="default" className="flex items-center gap-2 px-5 py-2.5 shadow-sm">
          <Icon icon="lucide:refresh-cw" className="w-4 h-4" />
          {t('errorLoadAction')}
        </Button>
      </Card>
    );
  }

  if (!cohort) return null;

  const startDateStr = cohort.createdAt
    ? new Date(cohort.createdAt).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : 'Not set';

  return (
    <div className="space-y-6">
      {/* Top Banner / Header Card */}
      <Card className="border-outline-variant shadow-sm p-6 relative overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">
                  {cohort.id.slice(0, 8).toUpperCase()}
                </span>
                
              </div>

              <h1 className="text-2xl font-black text-on-surface tracking-tight">{cohort.name}</h1>

              <div className="flex items-center gap-6 text-xs text-on-surface-variant pt-1">
                <div className="flex items-center gap-1.5">
                  <Icon icon="lucide:calendar" className="w-4 h-4 text-on-surface-variant/70" />
                  <span>{t('startDate', { date: startDateStr })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icon icon="lucide:target" className="w-4 h-4 text-on-surface-variant/70" />
                  <span>{t('targetRamp', { days: cohort.targetRampDays || 30 })}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 text-xs font-semibold h-10"
              >
                <Icon icon="lucide:edit-3" className="w-4 h-4" />
                <span>{t('editCohort')}</span>
              </Button>

              <Button
                variant="default"
                onClick={handleExportReport}
                disabled={exporting}
                className="flex items-center gap-2 text-xs font-bold shadow-sm h-10"
              >
                <Icon icon="lucide:download" className="w-4 h-4" />
                <span>{exporting ? t('exporting') : t('exportReport')}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Widget 2: Overview KPI Cards */}
      <CohortOverviewCards
        stats={stats}
        isLoading={statsLoading}
        error={statsError}
        onReload={() => {
          setStatsLoading(true);
          cohortControllerGetOverview({ path: { id: cohortId }, throwOnError: true })
            .then((res) => {
              setStats(res.data as CohortDashboardStatsDto);
              setStatsError(null);
            })
            .catch(() => setStatsError(t('errorStatsTitle')))
            .finally(() => setStatsLoading(false));
        }}
      />

      {/* Widget 3: Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as CohortTabType)}>
        <TabsList variant="line" className="w-full rounded-none bg-transparent h-auto p-0 border-b border-outline-variant">
          <TabsTrigger value="tracks" className="text-sm font-bold px-2 py-3">
            <Icon icon="lucide:book-open" className="w-4 h-4 mr-2" />
            {t('tabTracks')}
          </TabsTrigger>
          <TabsTrigger value="learners" className="text-sm font-bold px-2 py-3">
            <Icon icon="lucide:users" className="w-4 h-4 mr-2" />
            {t('tabLearners')}
          </TabsTrigger>
          <TabsTrigger value="reviews" className="text-sm font-bold px-2 py-3">
            <Icon icon="lucide:file-check" className="w-4 h-4 mr-2" />
            {t('tabSubmissions')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tracks" className="pt-4">
          <CohortTrackProgressTable
            items={tracksData}
            isLoading={tracksLoading}
            error={tracksError}
            onReload={() => {
              setTracksLoading(true);
              cohortControllerGetTrackCompletion({ path: { id: cohortId }, throwOnError: true })
                .then((res) => {
                  const tData = res.data as CohortTrackCompletionItemDto[] | { data: CohortTrackCompletionItemDto[] };
                  setTracksData(Array.isArray(tData) ? tData : (tData?.data || []));
                  setTracksError(null);
                })
                .catch(() => setTracksError(t('errorTracksTitle')))
                .finally(() => setTracksLoading(false));
            }}
          />
        </TabsContent>

        <TabsContent value="learners" className="pt-4">
          <CohortLearnersTable
            learners={learnersData}
            isLoading={learnersLoading}
            error={learnersError}
            onReload={fetchLearners}
          />
        </TabsContent>

        <TabsContent value="reviews" className="pt-4">
          <CohortSubmissionsTable
            submissions={submissionsData}
            isLoading={submissionsLoading}
            error={submissionsError}
            onReload={fetchSubmissions}
          />
        </TabsContent>
      </Tabs>

      {/* Edit Modal */}
      {isEditing && cohort && (
        <EditCohortModal
          cohort={cohort}
          onSuccess={(updated) => {
            setCohort(updated as any);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}
