'use client';

import { useState, useEffect, useCallback } from 'react';
import { cohortControllerFindAll } from '@/services/api-client';
import type { CohortSummaryDto } from '@/services/api-client';

export interface CohortMetaDto {
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

export interface UseCohortsParams {
  page?: number;
  limit?: number;
  q?: string;
}

export interface UseCohortsResult {
  cohorts: CohortSummaryDto[];
  meta: CohortMetaDto | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCohorts({ page = 1, limit = 10, q }: UseCohortsParams = {}): UseCohortsResult {
  const [cohorts, setCohorts] = useState<CohortSummaryDto[]>([]);
  const [meta, setMeta] = useState<CohortMetaDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCohorts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await cohortControllerFindAll({
        query: {
          page,
          limit,
        },
        throwOnError: true,
      });
      const data = res.data as { data?: CohortSummaryDto[]; meta?: CohortMetaDto } | undefined;
      let items = data?.data || [];
      if (q && q.trim() !== '') {
        const queryLower = q.toLowerCase().trim();
        items = items.filter(
          (c) =>
            (c.name && c.name.toLowerCase().includes(queryLower)) ||
            (c.id && c.id.toLowerCase().includes(queryLower))
        );
      }
      setCohorts(items);
      setMeta(data?.meta || null);
    } catch (err: any) {
      setError(err?.message || null);
    } finally {
      setLoading(false);
    }
  }, [page, limit, q]);

  useEffect(() => {
    fetchCohorts();
  }, [fetchCohorts]);

  return { cohorts, meta, loading, error, refetch: fetchCohorts };
}
