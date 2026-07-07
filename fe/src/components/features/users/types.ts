import type { UserDto, UserRole } from '@/mocks/users';

export type { UserDto, UserRole };

export interface UserFilterState {
  search: string;
  role: string;
  cohort: string;
}

export interface UserPaginationState {
  page: number;
  limit: number;
  total: number;
}
