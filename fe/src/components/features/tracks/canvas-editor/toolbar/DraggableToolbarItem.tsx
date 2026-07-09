'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import type { CanvasBlockType, CanvasBlockProps } from '../types';

export interface ToolbarTemplatePayload {
  isToolbarTemplate: true;
  type: CanvasBlockType;
  label: string;
  props: CanvasBlockProps;
  content: string;
}

interface DraggableToolbarItemProps {
  id: string;
  type: CanvasBlockType;
  label: string;
  icon: string;
  description?: string;
  props?: CanvasBlockProps;
  content?: string;
  onSelectClick: () => void;
}

export function DraggableToolbarItem({
  id,
  type,
  label,
  icon,
  description,
  props = {},
  content = '',
  onSelectClick,
}: DraggableToolbarItemProps) {
  const payload: ToolbarTemplatePayload = {
    isToolbarTemplate: true,
    type,
    label,
    props,
    content,
  };

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `toolbar_drag_${id}`,
    data: payload,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'group flex items-center justify-between gap-2 rounded-xl border border-transparent p-2.5 transition-all hover:border-outline-variant hover:bg-surface-variant/30',
        isDragging && 'opacity-40 scale-95'
      )}
    >
      <button
        type="button"
        onClick={onSelectClick}
        className="flex flex-1 items-center gap-3 text-left focus:outline-none"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon icon={icon} className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-on-surface">{label}</span>
          {description && (
            <span className="text-xs text-on-surface-variant/70">{description}</span>
          )}
        </div>
      </button>

      {/* Drag Handle to Drag & Clone onto Canvas */}
      <div
        {...listeners}
        {...attributes}
        title="Kéo thả vào khung Canvas để tạo"
        className="cursor-grab rounded-lg p-1.5 text-on-surface-variant/60 hover:bg-surface-variant hover:text-on-surface active:cursor-grabbing"
      >
        <Icon icon="lucide:grip-vertical" className="h-4 w-4" />
      </div>
    </div>
  );
}
