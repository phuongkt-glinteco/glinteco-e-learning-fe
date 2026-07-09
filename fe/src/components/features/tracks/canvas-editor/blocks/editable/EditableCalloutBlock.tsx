'use client';

import React from 'react';
import { Icon } from '@iconify/react';
import type { CanvasBlock } from '../../types';
import { cn } from '@/lib/utils';

interface EditableCalloutBlockProps {
  block: CanvasBlock;
  onChangeContent: (newContent: string) => void;
  onChangeVariant: (variant: string) => void;
}

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

export function EditableCalloutBlock({
  block,
  onChangeContent,
  onChangeVariant,
}: EditableCalloutBlockProps) {
  const variant = (block.props.variant || 'info') as keyof typeof CALLOUT_CONFIGS;
  const config = CALLOUT_CONFIGS[variant] || CALLOUT_CONFIGS.info;

  return (
    <div
      className={cn(
        'flex flex-col gap-2.5 rounded-2xl border-l-4 p-4 transition-all',
        config.border,
        config.bg
      )}
    >
      {/* Header bar with Variant Selector */}
      <div className="flex items-center justify-between">
        <div className={cn('flex items-center gap-2 font-semibold', config.text)}>
          <Icon icon={config.icon} className="h-5 w-5" />
          <select
            value={variant}
            onChange={(e) => onChangeVariant(e.target.value)}
            className="cursor-pointer rounded-lg bg-transparent py-0.5 pr-6 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {Object.entries(CALLOUT_CONFIGS).map(([key, item]) => (
              <option key={key} value={key} className="bg-surface text-on-surface">
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Editable Content */}
      <textarea
        rows={3}
        value={block.content || ''}
        onChange={(e) => onChangeContent(e.target.value)}
        placeholder="Nhập nội dung ghi chú / callout..."
        className="w-full resize-y rounded-xl bg-transparent text-sm leading-relaxed text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
      />
    </div>
  );
}
