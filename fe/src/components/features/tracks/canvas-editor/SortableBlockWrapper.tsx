'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Icon } from '@iconify/react';
import type { CanvasBlock } from './types';
import { cn } from '@/lib/utils';

interface SortableBlockWrapperProps {
  block: CanvasBlock;
  selected?: boolean;
  multiSelected?: boolean;
  onSelect?: () => void;
  onToggleMultiSelect?: (e?: React.MouseEvent) => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onInsertParagraphAfter?: () => void;
  onUnwrap?: () => void;
  children: React.ReactNode;
}

export function SortableBlockWrapper({
  block,
  selected = false,
  multiSelected = false,
  onSelect,
  onToggleMultiSelect,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onInsertParagraphAfter,
  onUnwrap,
  children,
}: SortableBlockWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.shiftKey || e.ctrlKey || e.metaKey) {
      onToggleMultiSelect?.();
    } else {
      onSelect?.();
    }
  };

  const isHighlighted = selected || multiSelected;

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-block-id={block.id}
      onClick={handleClick}
      className={cn(
        'group relative rounded-2xl transition-all duration-150',
        isDragging && 'z-50 opacity-60 shadow-2xl scale-[1.01] border-2 border-primary bg-primary/5 py-1.5 px-3',
        selected && !multiSelected
          ? 'border-2 border-primary/70 bg-primary/[0.03] shadow-sm py-1.5 px-3 my-1'
          : multiSelected
          ? 'border-2 border-primary bg-primary/[0.08] shadow-sm py-1.5 px-3 my-1'
          : 'border-0 bg-transparent p-0 my-0.5'
      )}
    >
      {/* Action Mini Toolbar (chỉ hiện ra khi chọn block) */}
      <div
        className={cn(
          'absolute -top-3.5 right-3 z-30 flex items-center gap-1 rounded-xl border border-outline-variant/80 bg-surface/95 px-1.5 py-0.5 shadow-md backdrop-blur-md transition-opacity duration-150',
          isHighlighted ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Multi-Select Checkbox Toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleMultiSelect?.(e);
          }}
          title={multiSelected ? 'Bỏ chọn block này' : 'Tick chọn nhiều block (hoặc Shift+Click)'}
          className={cn(
            'flex items-center justify-center rounded-lg p-1 transition-colors',
            multiSelected
              ? 'bg-primary text-on-primary'
              : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
          )}
        >
          <Icon
            icon={multiSelected ? 'lucide:check-square' : 'lucide:square'}
            className="h-3.5 w-3.5"
          />
        </button>

        <span className="h-3 w-[1px] bg-outline-variant/60" />

        {/* Drag Handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          title="Kéo thả di chuyển"
          className="cursor-grab rounded-lg p-1 text-on-surface-variant hover:bg-surface-variant hover:text-on-surface active:cursor-grabbing"
        >
          <Icon icon="lucide:grip-vertical" className="h-4 w-4" />
        </button>

        <span className="h-3 w-[1px] bg-outline-variant/60" />

        {/* Move Up */}
        {onMoveUp && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            title="Di chuyển lên"
            className="rounded-lg p-1 text-on-surface-variant hover:bg-surface-variant hover:text-on-surface"
          >
            <Icon icon="lucide:arrow-up" className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Move Down */}
        {onMoveDown && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            title="Di chuyển xuống"
            className="rounded-lg p-1 text-on-surface-variant hover:bg-surface-variant hover:text-on-surface"
          >
            <Icon icon="lucide:arrow-down" className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Unwrap */}
        {onUnwrap && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUnwrap();
            }}
            title="Rã nhóm (Unwrap khối)"
            className="rounded-lg p-1 text-primary hover:bg-primary/10"
          >
            <Icon icon="lucide:ungroup" className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Insert block below */}
        {onInsertParagraphAfter && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onInsertParagraphAfter();
            }}
            title="Thêm block bên dưới"
            className="rounded-lg p-1 text-on-surface-variant hover:bg-surface-variant hover:text-on-surface"
          >
            <Icon icon="lucide:plus" className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Duplicate */}
        {onDuplicate && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            title="Nhân bản block"
            className="rounded-lg p-1 text-on-surface-variant hover:bg-surface-variant hover:text-on-surface"
          >
            <Icon icon="lucide:copy" className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Delete */}
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Xóa block"
            className="rounded-lg p-1 text-error hover:bg-error/10"
          >
            <Icon icon="lucide:trash-2" className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Block Render Content */}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}
