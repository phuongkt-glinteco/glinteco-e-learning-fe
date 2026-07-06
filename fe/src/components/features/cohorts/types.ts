import type { CohortSummaryDto } from '@/services/api-client';

export interface CohortListFilterState {
  searchQuery: string;
  page: number;
  limit: number;
}

export type CohortTabType = 'tracks' | 'learners' | 'reviews';

export interface CohortTableProps {
  cohorts: CohortSummaryDto[];
  isLoading: boolean;
  onEdit: (cohort: CohortSummaryDto) => void;
  onDelete: (id: string) => void;
}


