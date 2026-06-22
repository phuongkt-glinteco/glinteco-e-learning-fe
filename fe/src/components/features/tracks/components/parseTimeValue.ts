import type { TimeUnit } from '@/lib/time-utils';

export function parseTimeValue(
  raw: string
): { value: number; unit: TimeUnit } | null {
  const match = raw.trim().match(/^(\d+(?:\.\d+)?)\s*(m|h|d|w|M)$/);
  if (!match) return null;
  return { value: parseFloat(match[1]), unit: match[2] as TimeUnit };
}
