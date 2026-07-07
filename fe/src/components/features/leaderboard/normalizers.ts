import type { LeaderboardEntryDto, LeaderboardResponseDto } from '@/services/api-client';
import type {
  LeaderboardCurrentUserSummary,
  LeaderboardData,
  LeaderboardMilestone,
  LeaderboardRow,
} from './types';

function normalizeName(value: unknown) {
  if (typeof value !== 'string') return 'Unknown learner';

  const trimmed = value.trim();
  return trimmed || 'Unknown learner';
}

function normalizeNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'NA'
  );
}

function getSeed(value: string) {
  return value.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function getTeamLabel(entry: LeaderboardEntryDto, userId: string, name: string) {
  const teamFromEntry = 'team' in entry && typeof entry.team === 'string' ? entry.team.trim() : '';
  if (teamFromEntry) return teamFromEntry;

  const labels = [
    'Frontend Eng.',
    'Backend Eng.',
    'Fullstack Eng.',
    'Platform Eng.',
    'Mobile Eng.',
    'Data Eng.',
  ] as const;

  return labels[getSeed(`${userId}:${name}`) % labels.length];
}

function getBadges(row: Pick<LeaderboardRow, 'rank' | 'streakDays' | 'level' | 'xp'>) {
  const badges: LeaderboardRow['badges'] = [];

  if (row.rank <= 3) {
    badges.push({ id: 'podium', icon: 'social_leaderboard', value: row.rank, tone: 'amber' as const });
  }

  if (row.streakDays >= 5) {
    badges.push({
      id: 'streak',
      icon: 'local_fire_department',
      value: row.streakDays,
      tone: 'violet' as const,
    });
  }

  if (row.level >= 5) {
    badges.push({ id: 'level', icon: 'bolt', value: row.level, tone: 'blue' as const });
  }

  if (row.xp >= 10000) {
    badges.push({ id: 'xp', icon: 'verified', value: row.xp, tone: 'green' as const });
  }

  return badges.slice(0, 3);
}

function normalizeEntry(
  entry: LeaderboardEntryDto,
  index: number,
  currentUserId: string | null,
): LeaderboardRow | null {
  const userId = typeof entry.userId === 'string' ? entry.userId.trim() : '';

  if (!userId) return null;

  const name = normalizeName(entry.name);
  const rank = normalizeNumber(entry.rank, index + 1);

  return {
    userId,
    name,
    level: normalizeNumber(entry.level),
    xp: normalizeNumber(entry.xp),
    streakDays: normalizeNumber(entry.streakDays),
    rank: rank > 0 ? rank : index + 1,
    isCurrentUser: currentUserId === userId,
    initials: getInitials(name),
    teamLabel: getTeamLabel(entry, userId, name),
    badges: [],
  };
}

function compareRows(a: LeaderboardRow, b: LeaderboardRow) {
  if (a.rank !== b.rank) return a.rank - b.rank;
  if (a.level !== b.level) return b.level - a.level;
  if (a.xp !== b.xp) return b.xp - a.xp;
  if (a.streakDays !== b.streakDays) return b.streakDays - a.streakDays;
  return a.name.localeCompare(b.name);
}

function enrichRows(rows: LeaderboardRow[]) {
  return rows.map((row) => ({
    ...row,
    badges: getBadges(row),
  }));
}

function buildCurrentUserSummary(rows: LeaderboardRow[]): LeaderboardCurrentUserSummary | null {
  const currentRow = rows.find((row) => row.isCurrentUser) ?? rows[0];

  if (!currentRow) return null;

  const previousRow = rows.find((row) => row.rank === currentRow.rank - 1) ?? null;
  const leadOrGap = previousRow
    ? Math.max(previousRow.xp - currentRow.xp, 0)
    : Math.max(currentRow.xp - (rows[1]?.xp ?? 0), 0);
  const progressRatio = previousRow
    ? clamp(currentRow.xp / Math.max(previousRow.xp, 1), 0.08, 1)
    : 1;
  const weeklyGoalTarget = 500;
  const weeklyGoalRatio = clamp(0.3 + currentRow.streakDays / 20 + currentRow.level / 40, 0.3, 1);
  const weeklyGoalCurrent = Math.min(
    weeklyGoalTarget,
    Math.round((weeklyGoalTarget * weeklyGoalRatio) / 10) * 10,
  );

  return {
    name: currentRow.name,
    teamLabel: currentRow.teamLabel,
    rank: currentRow.rank,
    totalXp: currentRow.xp,
    progressTargetRank: previousRow?.rank ?? null,
    progressDeltaXp: leadOrGap,
    progressRatio,
    weeklyGoalCurrentXp: weeklyGoalCurrent,
    weeklyGoalTargetXp: weeklyGoalTarget,
    weeklyGoalRatio,
  };
}

function buildMilestones(rows: LeaderboardRow[]): LeaderboardMilestone[] {
  const totalXp = rows.reduce((sum, row) => sum + row.xp, 0);
  const nextMilestone = Math.max(10000, Math.ceil(totalXp / 5000) * 5000);
  const milestoneProgress = clamp(totalXp / nextMilestone, 0.08, 1);
  const topStreak = rows.reduce<LeaderboardRow | null>((best, row) => {
    if (!best || row.streakDays > best.streakDays) return row;
    return best;
  }, null);
  const activeEngineersTarget = Math.max(100, Math.ceil(rows.length / 100) * 100 || 100);

  return [
    {
      id: 'community-xp',
      icon: 'trophy',
      currentValue: totalXp,
      targetValue: nextMilestone,
      progressRatio: milestoneProgress,
      tone: 'violet',
    },
    {
      id: 'active-engineers',
      icon: 'group',
      currentValue: rows.length,
      targetValue: activeEngineersTarget,
      progressRatio: clamp(rows.length / activeEngineersTarget, 0.08, 1),
      tone: 'green',
    },
    {
      id: 'streak',
      icon: 'local_fire_department',
      actorName: topStreak?.name,
      streakDays: topStreak?.streakDays ?? 0,
      tone: 'blue',
    },
  ];
}

export function normalizeLeaderboardResponse(
  response: LeaderboardResponseDto | undefined,
  currentUserId: string | null,
): LeaderboardData {
  const rows = Array.isArray(response?.data)
    ? response.data
        .map((entry, index) => normalizeEntry(entry, index, currentUserId))
        .filter((entry): entry is LeaderboardRow => entry !== null)
        .sort(compareRows)
    : [];

  const enrichedRows = enrichRows(rows);

  return {
    rows: enrichedRows,
    topRows: enrichedRows.slice(0, 3),
    remainingRows: enrichedRows.slice(3),
    currentUserSummary: buildCurrentUserSummary(enrichedRows),
    milestones: buildMilestones(enrichedRows),
    nextCursor: typeof response?.nextCursor === 'string' ? response.nextCursor : null,
  };
}
