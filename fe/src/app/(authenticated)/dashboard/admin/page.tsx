import { serverFetch } from '@/services/server-fetch';
import {
  cohortControllerFindAll,
  cohortControllerGetOverview,
  submissionsControllerFindAll,
  cohortControllerGetTrackCompletion,
} from '@/services/client';
import type {
  CohortListResponseDto,
  CohortDashboardStatsDto,
  SubmissionListResponseDto,
  CohortTrackCompletionResponseDto,
} from '@/services/client';
import AdminDashboardPage from '@/components/features/dashboard/admin/AdminDashboardPage';

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const result = await serverFetch(async (client) => {
    const params = await searchParams;
    const cohortIdFromUrl = params.cohortId as string | undefined;

    const cohortRes = await cohortControllerFindAll({ client, throwOnError: true });
    const cohorts = ((cohortRes.data as CohortListResponseDto)?.data ?? []).map((c) => ({
      id: c.id ?? '',
      name: c.name ?? '',
    }));

    const selectedCohortId = cohortIdFromUrl || cohorts[0]?.id || null;

    if (!selectedCohortId) {
      return { cohorts, selectedCohortId: null, data: null };
    }

    const [overviewRes, submissionsRes, trackRes] = await Promise.all([
      cohortControllerGetOverview({ client, path: { id: selectedCohortId }, throwOnError: true }),
      submissionsControllerFindAll({ client, query: { cohortId: selectedCohortId }, throwOnError: true }),
      cohortControllerGetTrackCompletion({ client, path: { id: selectedCohortId }, throwOnError: true }),
    ]);

    return {
      cohorts,
      selectedCohortId,
      data: {
        initialStats: overviewRes.data as CohortDashboardStatsDto,
        initialSubmissions: (submissionsRes.data as SubmissionListResponseDto)?.data ?? [],
        initialTrackCompletion: ((trackRes.data as CohortTrackCompletionResponseDto)?.data ?? []).map((t) => ({
          label: t.title ?? '',
          value: t.completionPct ?? 0,
        })),
      },
    };
  });

  if (!result.success) {
    return <AdminDashboardPage />;
  }

  if (!result.data.selectedCohortId || !result.data.data) {
    return <AdminDashboardPage cohorts={result.data.cohorts} selectedCohortId={null} />;
  }

  return (
    <AdminDashboardPage
      cohorts={result.data.cohorts}
      selectedCohortId={result.data.selectedCohortId}
      {...result.data.data}
    />
  );
}
