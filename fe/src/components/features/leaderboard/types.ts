export type LeaderboardScope = 'cohort' | 'global';

export interface LeaderboardRow {
  userId: string;
  name: string;
  level: number;
  xp: number;
  streakDays: number;
  rank: number;
  isCurrentUser: boolean;
}

export interface LeaderboardData {
  rows: LeaderboardRow[];
  nextCursor: string | null;
}
