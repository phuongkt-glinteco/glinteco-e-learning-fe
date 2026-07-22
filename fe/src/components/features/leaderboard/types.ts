export type LeaderboardScope = 'cohort' | 'global';
export type LeaderboardPeriod = 'weekly' | 'monthly' | 'all-time';

export type LeaderboardBadgeTone = 'blue' | 'violet' | 'green' | 'amber' | 'slate';

export interface LeaderboardRow {
  userId: string;
  name: string;
  level: number;
  xp: number;
  streakDays: number;
  rank: number;
  isCurrentUser: boolean;
  initials: string;
  teamLabel: string;
  badges: Array<{
    id: 'podium' | 'streak' | 'level' | 'xp';
    icon: string;
    value?: number;
    tone: LeaderboardBadgeTone;
  }>;
}

export interface LeaderboardCurrentUserSummary {
  name: string;
  teamLabel: string;
  rank: number;
  totalXp: number;
  progressTargetRank: number | null;
  progressDeltaXp: number;
  progressRatio: number;
  weeklyGoalCurrentXp: number;
  weeklyGoalTargetXp: number;
  weeklyGoalRatio: number;
}

export interface LeaderboardMilestone {
  id: 'community-xp' | 'active-engineers' | 'streak';
  icon: string;
  currentValue?: number;
  targetValue?: number;
  actorName?: string;
  streakDays?: number;
  progressRatio?: number;
  tone: 'violet' | 'green' | 'blue';
}

export interface LeaderboardData {
  rows: LeaderboardRow[];
  topRows: LeaderboardRow[];
  remainingRows: LeaderboardRow[];
  currentUserSummary: LeaderboardCurrentUserSummary | null;
  milestones: LeaderboardMilestone[];
  nextCursor: string | null;
}
