'use client';

import { useCallback, useEffect, useState } from 'react';
import { leaderboardControllerGetLeaderboard } from '@/services/api-client';
import { useAuth } from '@/providers/AuthProvider';
import type { LeaderboardScope, LeaderboardRow } from '../types';
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
  const [scope, setScope] = useState<LeaderboardScope>('cohort');
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setRows(normalized.rows);
      } catch (loadError: unknown) {
        if (!isActive()) return;

        setRows([]);
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
      scope={scope}
      onScopeChange={setScope}
      rows={rows}
      loading={loading}
      error={error}
      onRetry={() => loadLeaderboard(scope)}
    />
  );
}
