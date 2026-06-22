type TFunction = (key: string) => string;

const UNIT_MAP = {
  m: { minutes: 1 },
  h: { minutes: 60 },
  d: { minutes: 1440 },
  w: { minutes: 10080 },
  M: { minutes: 43200 },
} as const;

export type TimeUnit = keyof typeof UNIT_MAP;

export function parseTimeToMinutes(time: string): number {
  const trimmed = time.trim().toLowerCase();
  const match = trimmed.match(/^(\d+(?:\.\d+)?)\s*(m|h|d|w|M|min|mins?|hours?|days?|weeks?|months?)$/);
  if (!match) return 0;

  const value = parseFloat(match[1]);
  const raw = match[2];

  if (raw === 'M' || raw.startsWith('month')) return Math.round(value * 43200);
  if (raw === 'w' || raw.startsWith('week')) return Math.round(value * 10080);
  if (raw === 'd' || raw.startsWith('day')) return Math.round(value * 1440);
  if (raw === 'h' || raw.startsWith('hour')) return Math.round(value * 60);
  return Math.round(value);
}

export function sumEstimatedTimes(times: string[]): string {
  const totalMinutes = times.reduce((sum, t) => sum + parseTimeToMinutes(t), 0);
  if (totalMinutes <= 0) return '0m';
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

export function formatMinutes(totalMinutes: number, t: TFunction): string {
  if (totalMinutes <= 0) return `0${t('h')} 00${t('m')}`;

  const months = Math.floor(totalMinutes / 43200);
  const afterMonths = totalMinutes % 43200;
  const weeks = Math.floor(afterMonths / 10080);
  const afterWeeks = afterMonths % 10080;
  const days = Math.floor(afterWeeks / 1440);
  const afterDays = afterWeeks % 1440;
  const hours = Math.floor(afterDays / 60);
  const minutes = afterDays % 60;

  const parts: string[] = [];
  if (months > 0) parts.push(`${months}${t('M')}`);
  if (weeks > 0) parts.push(`${weeks}${t('w')}`);
  if (days > 0) parts.push(`${days}${t('d')}`);
  if (hours > 0) parts.push(`${hours}${t('h')}`);
  if (minutes > 0) parts.push(`${String(minutes).padStart(2, '0')}${t('m')}`);

  return parts.join(' ') || `0${t('h')} 00${t('m')}`;
}

export function formatEstimatedTime(raw: string, t: TFunction): string {
  const trimmed = raw.trim();
  const match = trimmed.match(/^(\d+(?:\.\d+)?)\s*(m|h|d|w|M)$/);
  if (!match) return trimmed;

  const value = parseFloat(match[1]);
  const unit = match[2] as TimeUnit;
  const info = UNIT_MAP[unit];
  if (!info) return trimmed;

  const totalMin = Math.round(value * info.minutes);

  if (unit === 'M') {
    const intVal = Math.floor(value);
    const remainder = Math.round((value - intVal) * 30);
    if (intVal > 0 && remainder > 0) return `${intVal}${t('M')} ${remainder}${t('d')}`;
    if (intVal > 0) return `${intVal}${t('M')}`;
    return `${remainder}${t('d')}`;
  }

  if (unit === 'w') {
    const intVal = Math.floor(value);
    const remainder = Math.round((value - intVal) * 7);
    if (intVal > 0 && remainder > 0) return `${intVal}${t('w')} ${remainder}${t('d')}`;
    if (intVal > 0) return `${intVal}${t('w')}`;
    return `${remainder}${t('d')}`;
  }

  if (unit === 'd') {
    if (value === 1) return `1 ${t('day')}`;
    return `${value} ${t('days')}`;
  }

  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0 && m > 0) return `${h}${t('h')} ${m}${t('m')}`;
  if (h > 0) return `${h}${t('h')}`;
  return `${m}${t('min')}`;
}

export function buildTimeString(value: number, unit: TimeUnit): string {
  const numStr = Number.isInteger(value) ? String(value) : value.toFixed(1);
  return `${numStr}${unit}`;
}
