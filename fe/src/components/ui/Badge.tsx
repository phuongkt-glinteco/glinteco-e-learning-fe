'use client';

import { Icon } from '@iconify/react';
import { Badge } from '@/components/ui/default/badge';

type BadgeVariant = keyof typeof statusMap;

const statusMap = {
  completed:   ['bg-green-50 text-green-700 border-green-200 hover:bg-green-100', 'lucide:check-circle', 'Completed'] as const,
  in_progress: ['bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100', 'lucide:clock', 'In Progress'] as const,
  locked:      ['bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200', 'lucide:lock', 'Locked'] as const,
  approved:    ['bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100', 'lucide:check-square', 'Approved'] as const,
  submitted:   ['bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100', 'lucide:upload-cloud', 'Submitted'] as const,
  pending:     ['bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200', 'lucide:more-horizontal', 'Pending'] as const,
  changes:     ['bg-red-50 text-red-700 border-red-200 hover:bg-red-100', 'lucide:refresh-cw', 'Changes Req.'] as const,
};

interface StatusBadgeProps {
  status: BadgeVariant;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const [cls, icon, text] = statusMap[status] ?? statusMap.pending;

  return (
    <Badge variant="outline" className={`gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>
      <Icon icon={icon} className="w-3.5 h-3.5" />
      {text}
    </Badge>
  );
}

const tagColorMap: Record<string, string> = {
  Frontend: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
  NestJS: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
  Architecture: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
  Testing: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200',
  DevOps: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
  Database: 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100',
};

interface TagProps {
  name: string;
}

export function Tag({ name }: TagProps) {
  const cls = tagColorMap[name] ?? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100';

  return (
    <Badge variant="outline" className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
      {name}
    </Badge>
  );
}

interface TimeBadgeProps {
  time: string;
}

export function TimeBadge({ time }: TimeBadgeProps) {
  return (
    <Badge variant="outline" className="gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100">
      <Icon icon="lucide:clock" className="w-3.5 h-3.5 text-slate-400" />
      {time}
    </Badge>
  );
}

interface DraftBadgeProps {
  text?: string;
}

export function DraftBadge({ text = 'Draft' }: DraftBadgeProps) {
  return (
    <Badge variant="secondary" className="gap-1.5 bg-amber-50 text-amber-700 px-3 py-1 rounded-full hover:bg-amber-100">
      <Icon icon="lucide:eye" className="text-[16px]" />
      <span className="label-sm">{text}</span>
    </Badge>
  );
}

interface CountBadgeProps {
  count: number;
  label?: string;
}

export function CountBadge({ count, label }: CountBadgeProps) {
  return (
    <Badge variant="secondary" className="px-2.5 py-0.5 rounded-full bg-surface-variant text-on-surface-variant hover:bg-surface-variant/80 label-sm">
      {count}{label ? ` ${label}` : ''}
    </Badge>
  );
}
