'use client';

import { useCallback, useEffect, useState } from 'react';
import { leaderboardControllerGetLeaderboard } from '@/services/api-client';
import { useAuth } from '@/providers/AuthProvider';
import type { LeaderboardData, LeaderboardPeriod, LeaderboardScope } from '../types';
import { normalizeLeaderboardResponse } from '../normalizers';
import { LeaderboardView } from '../components/LeaderboardView';

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return 'Failed to load leaderboard data.';
}

export default function LeaderboardContainer() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<LeaderboardPeriod>('weekly');
  const [leaderboard, setLeaderboard] = useState<LeaderboardData>({
    rows: [],
    topRows: [],
    remainingRows: [],
    currentUserSummary: null,
    milestones: [],
    nextCursor: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scope: LeaderboardScope = period === 'all-time' ? 'global' : 'cohort';

  const loadLeaderboard = useCallback(
    async (
      nextScope: LeaderboardScope,
      isActive: () => boolean = () => true,
    ) => {
      setLoading(true);
      setError(null);

      try {
        const response = await leaderboardControllerGetLeaderboard({
          query: {
            scope: nextScope,
            limit: 20,
            ...(nextScope === 'cohort' && user?.cohortId ? { cohortId: user.cohortId } : {}),
          },
          throwOnError: true,
        });

        if (!isActive()) return;

        const normalized = normalizeLeaderboardResponse(response.data, user?.id ?? null);
        setLeaderboard(normalized);
      } catch (loadError: unknown) {
        if (!isActive()) return;

        setLeaderboard({
          rows: [],
          topRows: [],
          remainingRows: [],
          currentUserSummary: null,
          milestones: [],
          nextCursor: null,
        });
        setError(getErrorMessage(loadError));
      } finally {
        if (isActive()) setLoading(false);
      }
    },
    [user?.cohortId, user?.id],
  );

  useEffect(() => {
    let active = true;

    loadLeaderboard(scope, () => active);

    return () => {
      active = false;
    };
  }, [loadLeaderboard, scope]);

  return (
    <LeaderboardView
      period={period}
      scope={scope}
      onPeriodChange={setPeriod}
      leaderboard={leaderboard}
      loading={loading}
      error={error}
      onRetry={() => loadLeaderboard(scope)}
    />
  );
}
