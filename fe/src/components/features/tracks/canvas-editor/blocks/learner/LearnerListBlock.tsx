'use client';

import React from 'react';
import type { CanvasBlock, ListBlockItem } from '../../types';
import { cn } from '@/lib/utils';

export interface LearnerListBlockProps {
  block: CanvasBlock;
}

export const LearnerListBlock: React.FC<LearnerListBlockProps> = ({ block }) => {
  const ordered = Boolean(block.props.ordered);
  const items: ListBlockItem[] =
    block.props.items && block.props.items.length > 0
      ? block.props.items
      : [];

  if (items.length === 0) return null;

  // Calculate prefix for ordered list
  const getOrderedPrefix = (idx: number, level: number): string => {
    let count = 1;
    for (let i = idx - 1; i >= 0; i--) {
      if (items[i].level < level) break;
      if (items[i].level === level) count++;
    }
    if (level === 0) return `${count}.`;
    if (level === 1) {
      const char = String.fromCharCode(97 + ((count - 1) % 26));
      return `${char}.`;
    }
    if (level === 2) return `${count})`;
    return `(${count})`;
  };

  const getBulletSymbol = (level: number): string => {
    if (level === 0) return '•';
    if (level === 1) return '◦';
    return '▪';
  };

  return (
    <div data-block-id={block.id} className="w-full flex flex-col gap-1.5 py-1">
      {items.map((item, idx) => (
        <div
          key={item.id}
          style={{ paddingLeft: `${item.level * 24}px` }}
          className="flex items-start w-full"
        >
          <span
            className={cn(
              'w-6 shrink-0 select-none font-bold mr-2 leading-relaxed',
              ordered
                ? 'text-right text-xs text-secondary pt-0.5'
                : 'text-center text-base text-primary'
            )}
          >
            {ordered ? getOrderedPrefix(idx, item.level) : getBulletSymbol(item.level)}
          </span>
          <div className="flex-1 text-sm leading-relaxed text-on-surface whitespace-pre-line font-normal">
            {item.content}
          </div>
        </div>
      ))}
    </div>
  );
};
