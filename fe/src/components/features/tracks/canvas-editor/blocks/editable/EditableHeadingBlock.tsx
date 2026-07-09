'use client';

import React from 'react';
import type { CanvasBlock, CanvasBlockType, CanvasBlockProps } from '../../types';
import { cn } from '@/lib/utils';
import { focusBlockById } from '../../utils/focusUtils';

interface EditableHeadingBlockProps {
  block: CanvasBlock;
  onChangeContent: (newContent: string) => void;
  onChangeLevel: (newLevel: 1 | 2 | 3) => void;
  onInsertParagraphAfter?: () => void;
  onDeleteAndFocusPrevious?: () => void;
  onChangeBlockType?: (newType: CanvasBlockType, newProps?: CanvasBlockProps) => void;
  onFocusPrevious?: () => void;
  onFocusNext?: () => void;
}

export function EditableHeadingBlock({
  block,
  onChangeContent,
  onChangeLevel,
  onInsertParagraphAfter,
  onDeleteAndFocusPrevious,
  onChangeBlockType,
  onFocusPrevious,
  onFocusNext,
}: EditableHeadingBlockProps) {
  const level = (block.props.level || 1) as 1 | 2 | 3;
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        if (level === 1) {
          onChangeLevel(2);
          focusBlockById(block.id);
        } else if (level === 2) {
          onChangeLevel(3);
          focusBlockById(block.id);
        } else {
          onChangeBlockType?.('paragraph', {});
        }
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        onInsertParagraphAfter?.();
        return;
      }
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      onInsertParagraphAfter?.();
    } else if (e.key === 'Backspace' && (!block.content || block.content.trim() === '')) {
      e.preventDefault();
      onDeleteAndFocusPrevious?.();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      onFocusPrevious?.();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      onFocusNext?.();
    }
  };

  return (
    <div
      data-block-id={block.id}
      className={cn(
        'group relative flex flex-col w-full transition-all',
        level === 1 && 'pt-1.5 pb-0.5',
        level === 2 && 'pt-1 pb-0.5',
        level === 3 && 'pt-0.5 pb-0.5'
      )}
    >
      {/* Badge hiển thị cấp độ H1 / H2 / H3 để dễ phân biệt khi bấm Ctrl+B */}
      <div className="absolute -top-3 right-0 opacity-40 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex items-center gap-1.5 pointer-events-none select-none z-10">
        <span
          className={cn(
            'rounded-md px-1.5 py-0.5 font-mono text-[10px] font-black tracking-wider uppercase shadow-2xs',
            level === 1 && 'bg-primary text-on-primary',
            level === 2 && 'bg-primary/15 text-primary border border-primary/30',
            level === 3 && 'bg-amber-500/15 text-amber-600 border border-amber-500/30'
          )}
        >
          {level === 1 ? 'H1 • Tiêu đề chính' : level === 2 ? 'H2 • Mục lớn' : 'H3 • Tiểu mục'}
        </span>
      </div>

      <input
        ref={inputRef}
        type="text"
        value={block.content || ''}
        onChange={(e) => onChangeContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={`Nhập tiêu đề ${level === 1 ? 'H1 (Tiêu đề chính)' : level === 2 ? 'H2 (Mục lớn)' : 'H3 (Tiểu mục)'}... (Ctrl+B đổi cấp)`}
        className={cn(
          'w-full bg-transparent tracking-tight text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none transition-all',
          level === 1 && 'text-2xl sm:text-3xl font-black leading-tight',
          level === 2 && 'text-xl sm:text-2xl font-extrabold leading-snug',
          level === 3 && 'text-base sm:text-lg font-bold uppercase tracking-wide text-gray-600'
        )}
      />
    </div>
  );
}
