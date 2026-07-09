'use client';

import React from 'react';
import type { CanvasBlock } from '../../types';
import { cn } from '@/lib/utils';

interface LearnerContainerBlockProps {
  block: CanvasBlock;
  childrenNode?: React.ReactNode;
}

export function LearnerContainerBlock({
  block,
  childrenNode,
}: LearnerContainerBlockProps) {
  const semanticTag = block.props.semanticTag || 'section';
  const layoutMode = block.props.layoutMode || 'flex-col';
  const gap = block.props.gap || 'md';
  const padding = block.props.padding || 'none';
  const maxHeight = block.props.maxHeight;
  const borderStyle = block.props.borderStyle || 'none';

  const gapClass = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  }[gap] || 'gap-4';

  const paddingClass = {
    none: 'p-0',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  }[padding] || 'p-0';

  const layoutClass = {
    'flex-col': 'flex flex-col',
    'flex-row': 'flex flex-row flex-wrap items-start',
    'grid-2': 'grid grid-cols-1 md:grid-cols-2',
    'grid-3': 'grid grid-cols-1 md:grid-cols-3',
  }[layoutMode] || 'flex flex-col';

  const borderClass = {
    none: '',
    subtle: 'border border-outline-variant/60 rounded-2xl',
    card: 'border border-outline-variant bg-surface-variant/20 rounded-2xl shadow-sm',
  }[borderStyle] || '';

  const Tag = (['section', 'article', 'header', 'main', 'aside', 'div'].includes(semanticTag)
    ? semanticTag
    : 'div') as React.ElementType;

  return (
    <Tag className={cn('w-full', borderClass, paddingClass)}>
      <div
        style={{
          maxHeight: maxHeight && maxHeight > 0 ? `${maxHeight}px` : undefined,
        }}
        className={cn(
          layoutClass,
          gapClass,
          'w-full',
          maxHeight && maxHeight > 0 && 'overflow-y-auto pr-1'
        )}
      >
        {childrenNode}
      </div>
    </Tag>
  );
}
