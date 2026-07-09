'use client';

import React from 'react';
import { Icon } from '@iconify/react';
import type { CanvasBlock } from '../../types';
import { cn } from '@/lib/utils';

const CALLOUT_CONFIGS: Record<
  string,
  { label: string; icon: string; border: string; bg: string; text: string }
> = {
  info: {
    label: 'Thông tin',
    icon: 'lucide:info',
    border: 'border-blue-500',
    bg: 'bg-blue-500/10 dark:bg-blue-500/5',
    text: 'text-blue-700 dark:text-blue-300',
  },
  objective: {
    label: 'Mục tiêu',
    icon: 'lucide:flag',
    border: 'border-emerald-500',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/5',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  prerequisites: {
    label: 'Yêu cầu trước',
    icon: 'lucide:check-circle-2',
    border: 'border-purple-500',
    bg: 'bg-purple-500/10 dark:bg-purple-500/5',
    text: 'text-purple-700 dark:text-purple-300',
  },
  exercise: {
    label: 'Thực hành',
    icon: 'lucide:code-2',
    border: 'border-amber-500',
    bg: 'bg-amber-500/10 dark:bg-amber-500/5',
    text: 'text-amber-700 dark:text-amber-300',
  },
  challenge: {
    label: 'Thử thách',
    icon: 'lucide:flame',
    border: 'border-red-500',
    bg: 'bg-red-500/10 dark:bg-red-500/5',
    text: 'text-red-700 dark:text-red-300',
  },
  summary: {
    label: 'Tóm tắt',
    icon: 'lucide:bookmark',
    border: 'border-indigo-500',
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/5',
    text: 'text-indigo-700 dark:text-indigo-300',
  },
};

export function LearnerCalloutBlock({ block }: { block: CanvasBlock }) {
  const variant = (block.props.variant || 'info') as keyof typeof CALLOUT_CONFIGS;
  const config = CALLOUT_CONFIGS[variant] || CALLOUT_CONFIGS.info;

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-2xl border-l-4 p-4 transition-all shadow-sm',
        config.border,
        config.bg
      )}
    >
      <div className={cn('flex items-center gap-2 font-semibold', config.text)}>
        <Icon icon={config.icon} className="h-5 w-5" />
        <span className="text-sm font-bold uppercase tracking-wider">{config.label}</span>
      </div>
      <div className="text-sm leading-relaxed text-on-surface whitespace-pre-wrap">
        {block.content}
      </div>
    </div>
  );
}
