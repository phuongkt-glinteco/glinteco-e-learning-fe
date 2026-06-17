'use client';

import { Icon } from '@iconify/react';

type BadgeVariant = keyof typeof statusMap;

const statusMap = {
  completed:   ['bg-green-50 text-green-700 border-green-200', 'lucide:check-circle', 'Completed'] as const,
  in_progress: ['bg-amber-50 text-amber-700 border-amber-200', 'lucide:clock', 'In Progress'] as const,
  locked:      ['bg-slate-100 text-slate-500 border-slate-200', 'lucide:lock', 'Locked'] as const,
  approved:    ['bg-emerald-50 text-emerald-700 border-emerald-200', 'lucide:check-square', 'Approved'] as const,
  submitted:   ['bg-blue-50 text-blue-700 border-blue-200', 'lucide:upload-cloud', 'Submitted'] as const,
  pending:     ['bg-slate-100 text-slate-500 border-slate-200', 'lucide:more-horizontal', 'Pending'] as const,
  changes:     ['bg-red-50 text-red-700 border-red-200', 'lucide:refresh-cw', 'Changes Req.'] as const,
};

interface StatusBadgeProps {
  status: BadgeVariant;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const [cls, icon, text] = statusMap[status] ?? statusMap.pending;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      <Icon icon={icon} className="w-3.5 h-3.5" />
      {text}
    </span>
  );
}

const tagColorMap: Record<string, string> = {
  Frontend: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  NestJS: 'bg-rose-50 text-rose-700 border-rose-200',
  Architecture: 'bg-amber-50 text-amber-700 border-amber-200',
  Testing: 'bg-slate-100 text-slate-700 border-slate-200',
  DevOps: 'bg-red-50 text-red-700 border-red-200',
  Database: 'bg-teal-50 text-teal-700 border-teal-200',
};

interface TagProps {
  name: string;
}

export function Tag({ name }: TagProps) {
  const cls = tagColorMap[name] ?? 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${cls}`}>
      {name}
    </span>
  );
}

interface TimeBadgeProps {
  time: string;
}

export function TimeBadge({ time }: TimeBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
      <Icon icon="lucide:clock" className="w-3.5 h-3.5 text-slate-400" />
      {time}
    </span>
  );
}
