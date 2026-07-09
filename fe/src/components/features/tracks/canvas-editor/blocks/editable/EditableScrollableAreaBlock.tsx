'use client';

import React from 'react';
import { Icon } from '@iconify/react';
import type { CanvasBlock } from '../../types';

interface EditableScrollableAreaBlockProps {
  block: CanvasBlock;
  onChangeMaxHeight: (newMaxHeight: number) => void;
  children?: React.ReactNode;
}

export function EditableScrollableAreaBlock({
  block,
  onChangeMaxHeight,
  children,
}: EditableScrollableAreaBlockProps) {
  const maxHeight = block.props.maxHeight || 420;

  return (
    <div className="flex flex-col gap-2 rounded-2xl border-2 border-dashed border-primary/40 bg-surface-variant/10 p-4">
      {/* Scrollable Area Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary">
          <Icon icon="lucide:maximize-2" className="h-4 w-4" />
          <span>Vùng Cuộn Lớn (Scrollable Area Container)</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
          <span>Chiều cao cuộn tối đa:</span>
          <select
            value={maxHeight}
            onChange={(e) => onChangeMaxHeight(Number(e.target.value))}
            className="rounded-lg border border-outline-variant bg-surface px-2 py-1 font-semibold text-on-surface focus:outline-none"
          >
            <option value={320}>320px (Nhỏ)</option>
            <option value={420}>420px (Tiêu chuẩn)</option>
            <option value={560}>560px (Lớn)</option>
            <option value={720}>720px (Rất lớn)</option>
          </select>
        </div>
      </div>

      {/* Editor Content Area inside overflow-auto box */}
      <div
        style={{ maxHeight: `${maxHeight}px` }}
        className="w-full overflow-auto rounded-xl border border-outline-variant bg-surface p-4 shadow-inner"
      >
        {children || (
          <div className="flex flex-col items-center justify-center py-8 text-center text-on-surface-variant/60">
            <Icon icon="lucide:move" className="mb-2 h-6 w-6 opacity-50" />
            <p className="text-sm font-medium">Đặt bảng biểu lớn hoặc nội dung rộng vào vùng này</p>
            <p className="text-xs opacity-75">Nội dung vượt quá kích thước sẽ tự động cuộn 2 chiều mà không vỡ layout trang</p>
          </div>
        )}
      </div>
    </div>
  );
}
