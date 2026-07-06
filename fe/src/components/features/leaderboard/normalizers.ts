import type { LeaderboardEntryDto, LeaderboardResponseDto } from '@/services/api-client';
import type { LeaderboardData, LeaderboardRow } from './types';

function normalizeName(value: unknown) {
  if (typeof value !== 'string') return 'Unknown learner';

  const trimmed = value.trim();
  return trimmed || 'Unknown learner';
}

function normalizeNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function normalizeEntry(
  entry: LeaderboardEntryDto,
  index: number,
  currentUserId: string | null,
): LeaderboardRow | null {
  const userId = typeof entry.userId === 'string' ? entry.userId.trim() : '';

  if (!userId) return null;

  const rank = normalizeNumber(entry.rank, index + 1);

  return {
    userId,
    name: normalizeName(entry.name),
    level: normalizeNumber(entry.level),
    xp: normalizeNumber(entry.xp),
    streakDays: normalizeNumber(entry.streakDays),
    rank: rank > 0 ? rank : index + 1,
    isCurrentUser: currentUserId === userId,
  };
}

function compareRows(a: LeaderboardRow, b: LeaderboardRow) {
  if (a.rank !== b.rank) return a.rank - b.rank;
  if (a.level !== b.level) return b.level - a.level;
  if (a.xp !== b.xp) return b.xp - a.xp;
  if (a.streakDays !== b.streakDays) return b.streakDays - a.streakDays;
  return a.name.localeCompare(b.name);
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

  return {
    rows,
    nextCursor: typeof response?.nextCursor === 'string' ? response.nextCursor : null,
  };
}
