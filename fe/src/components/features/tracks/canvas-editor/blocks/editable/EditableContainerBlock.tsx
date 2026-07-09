'use client';

import React from 'react';
import { Icon } from '@iconify/react';
import type { CanvasBlock } from '../../types';
import { cn } from '@/lib/utils';

interface EditableContainerBlockProps {
  block: CanvasBlock;
  childrenNode?: React.ReactNode;
  onAddChildBlock?: (type?: string) => void;
}

export function EditableContainerBlock({
  block,
  childrenNode,
  onAddChildBlock,
}: EditableContainerBlockProps) {
  const semanticTag = block.props.semanticTag || 'section';
  const layoutMode = block.props.layoutMode || 'flex-col';
  const gap = block.props.gap || 'md';
  const padding = block.props.padding || 'md';
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
  }[padding] || 'p-4';

  const layoutClass = {
    'flex-col': 'flex flex-col',
    'flex-row': 'flex flex-row flex-wrap items-start',
    'grid-2': 'grid grid-cols-1 md:grid-cols-2',
    'grid-3': 'grid grid-cols-1 md:grid-cols-3',
  }[layoutMode] || 'flex flex-col';

  const borderClass = {
    none: 'border border-dashed border-outline-variant/30',
    subtle: 'border border-outline-variant/60 rounded-2xl',
    card: 'border border-outline-variant bg-surface-variant/20 rounded-2xl shadow-sm',
  }[borderStyle] || '';

  const Tag = (['section', 'article', 'header', 'main', 'aside', 'div'].includes(semanticTag)
    ? semanticTag
    : 'div') as React.ElementType;

  return (
    <Tag
      data-block-id={block.id}
      className={cn(
        'group/container relative w-full transition-all duration-150',
        borderClass,
        paddingClass
      )}
    >
      {/* Small Badge indicating Container Tag & Layout */}
      <div className="absolute -top-2.5 left-3 z-10 hidden group-hover/container:inline-flex items-center gap-1 rounded-md border border-outline-variant/80 bg-surface px-2 py-0.5 text-[10px] font-bold text-on-surface-variant shadow-sm">
        <Icon icon="lucide:layout-template" className="w-3 h-3 text-primary" />
        <span>&lt;{semanticTag}&gt;</span>
        <span className="text-on-surface-variant/50">|</span>
        <span className="uppercase">{layoutMode}</span>
      </div>

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
        {childrenNode || (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onAddChildBlock?.('paragraph');
            }}
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant/60 py-6 text-center hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <Icon icon="lucide:plus" className="w-5 h-5 text-primary mb-1" />
            <span className="text-xs font-medium text-on-surface-variant">
              Container trống &mdash; Nhấn để thêm block vào trong &lt;{semanticTag}&gt;
            </span>
          </div>
        )}
      </div>

      {/* Button at bottom of container to insert child block */}
      {onAddChildBlock && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddChildBlock('paragraph');
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-outline-variant/60 bg-surface/80 px-2.5 py-1 text-[11px] font-semibold text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
          >
            <Icon icon="lucide:plus" className="w-3.5 h-3.5" />
            <span>Thêm vào trong {semanticTag}</span>
          </button>
        </div>
      )}
    </Tag>
  );
}
