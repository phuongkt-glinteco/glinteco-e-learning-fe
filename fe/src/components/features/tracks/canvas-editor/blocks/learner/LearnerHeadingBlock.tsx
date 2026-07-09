'use client';

import React from 'react';
import type { CanvasBlock } from '../../types';
import { cn } from '@/lib/utils';

export function LearnerHeadingBlock({ block }: { block: CanvasBlock }) {
  const level = (block.props.level || 1) as 1 | 2 | 3;
  const slug = (block.content || '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-') || block.id;

  return (
    <div
      id={slug}
      className={cn(
        'scroll-mt-24 transition-all w-full',
        level === 1 && 'pt-1.5 pb-0.5',
        level === 2 && 'pt-1 pb-0.5',
        level === 3 && 'pt-0.5 pb-0.5'
      )}
    >
      {level === 1 && (
        <h1
          style={{ color: block.props.textColor }}
          className="text-2xl sm:text-3xl font-black leading-tight tracking-tight text-on-surface"
        >
          {block.content}
        </h1>
      )}
      {level === 2 && (
        <h2
          style={{ color: block.props.textColor }}
          className="text-xl sm:text-2xl font-extrabold leading-snug tracking-tight text-on-surface"
        >
          {block.content}
        </h2>
      )}
      {level === 3 && (
        <h3
          style={{ color: block.props.textColor }}
          className="text-base sm:text-lg font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400"
        >
          {block.content}
        </h3>
      )}
    </div>
  );
}
