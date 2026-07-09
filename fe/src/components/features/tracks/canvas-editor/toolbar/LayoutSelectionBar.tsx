'use client';

import React from 'react';
import { Icon } from '@iconify/react';
import type { ContainerLayoutMode } from '../types';

interface LayoutSelectionBarProps {
  selectedIds: string[];
  selectedBlockIsContainer?: boolean;
  onWrap: (layoutMode: ContainerLayoutMode) => void;
  onUnwrap?: () => void;
  onClearSelection: () => void;
}

export function LayoutSelectionBar({
  selectedIds,
  selectedBlockIsContainer,
  onWrap,
  onUnwrap,
  onClearSelection,
}: LayoutSelectionBarProps) {
  if (selectedIds.length === 0) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 rounded-2xl border border-outline-variant/80 bg-surface/95 px-3 py-2 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="flex items-center gap-1.5 pr-2 border-r border-outline-variant/60">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-black text-on-primary">
          {selectedIds.length}
        </span>
        <span className="text-xs font-bold text-on-surface">Đã chọn</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onWrap('flex-row')}
          className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-on-surface hover:bg-surface-variant transition-all"
          title="Bọc các block theo chiều ngang (HBox)"
        >
          <Icon icon="lucide:columns" className="h-3.5 w-3.5 text-primary" />
          <span>Bọc ngang</span>
        </button>

        <button
          type="button"
          onClick={() => onWrap('flex-col')}
          className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-on-surface hover:bg-surface-variant transition-all"
          title="Bọc các block theo chiều dọc (VBox)"
        >
          <Icon icon="lucide:rows" className="h-3.5 w-3.5 text-primary" />
          <span>Bọc dọc</span>
        </button>

        <button
          type="button"
          onClick={() => onWrap('grid-2')}
          className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-on-surface hover:bg-surface-variant transition-all"
          title="Bọc vào lưới 2 cột"
        >
          <Icon icon="lucide:columns-2" className="h-3.5 w-3.5 text-primary" />
          <span>Lưới 2</span>
        </button>

        <button
          type="button"
          onClick={() => onWrap('grid-3')}
          className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-on-surface hover:bg-surface-variant transition-all"
          title="Bọc vào lưới 3 cột"
        >
          <Icon icon="lucide:columns-3" className="h-3.5 w-3.5 text-primary" />
          <span>Lưới 3</span>
        </button>

        {selectedIds.length === 1 && selectedBlockIsContainer && onUnwrap && (
          <>
            <span className="mx-1 h-4 w-[1px] bg-outline-variant/60" />
            <button
              type="button"
              onClick={onUnwrap}
              className="flex items-center gap-1.5 rounded-xl bg-error/10 px-2.5 py-1.5 text-xs font-bold text-error hover:bg-error/20 transition-all"
              title="Rã nhóm khối này (đưa các block con ra ngoài)"
            >
              <Icon icon="lucide:ungroup" className="h-3.5 w-3.5" />
              <span>Rã nhóm</span>
            </button>
          </>
        )}
      </div>

      <span className="mx-1 h-4 w-[1px] bg-outline-variant/60" />

      <button
        type="button"
        onClick={onClearSelection}
        className="rounded-xl p-1 text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-all"
        title="Bỏ chọn"
      >
        <Icon icon="lucide:x" className="h-4 w-4" />
      </button>
    </div>
  );
}
