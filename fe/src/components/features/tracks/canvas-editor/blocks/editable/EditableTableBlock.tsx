'use client';

import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import type { CanvasBlock } from '../../types';
import { cn } from '@/lib/utils';

interface EditableTableBlockProps {
  block: CanvasBlock;
  onChangeHeaders: (newHeaders: string[]) => void;
  onChangeRows: (newRows: string[][]) => void;
  onChangeColWidths?: (widths: number[]) => void;
  isSelected?: boolean;
  onInsertParagraphAfter?: () => void;
}

export function EditableTableBlock({
  block,
  onChangeHeaders,
  onChangeRows,
  onChangeColWidths,
  isSelected = false,
  onInsertParagraphAfter,
}: EditableTableBlockProps) {
  const headers: string[] = block.props.headers || ['Cột 1', 'Cột 2'];
  const rows: string[][] = block.props.rows || [['Dữ liệu 1', 'Dữ liệu 2']];
  const [colWidths, setColWidths] = useState<number[]>(
    block.props.colWidths || headers.map(() => 180)
  );

  const handleHeaderChange = (index: number, value: string) => {
    const next = [...headers];
    next[index] = value;
    onChangeHeaders(next);
  };

  const handleCellChange = (rIndex: number, cIndex: number, value: string) => {
    const nextRows = rows.map((r, ri) =>
      ri === rIndex ? r.map((c, ci) => (ci === cIndex ? value : c)) : r
    );
    onChangeRows(nextRows);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onInsertParagraphAfter?.();
    }
  };

  const addColumn = () => {
    const nextHeaders = [...headers, `Cột ${headers.length + 1}`];
    const nextRows = rows.map((r) => [...r, '']);
    const nextWidths = [...colWidths, 180];
    setColWidths(nextWidths);
    onChangeHeaders(nextHeaders);
    onChangeRows(nextRows);
    onChangeColWidths?.(nextWidths);
  };

  const removeColumn = (cIndex: number) => {
    if (headers.length <= 1) return;
    const nextHeaders = headers.filter((_, i) => i !== cIndex);
    const nextRows = rows.map((r) => r.filter((_, i) => i !== cIndex));
    const nextWidths = colWidths.filter((_, i) => i !== cIndex);
    setColWidths(nextWidths);
    onChangeHeaders(nextHeaders);
    onChangeRows(nextRows);
    onChangeColWidths?.(nextWidths);
  };

  const addRow = () => {
    const newRow = headers.map(() => '');
    onChangeRows([...rows, newRow]);
  };

  const removeRow = (rIndex: number) => {
    if (rows.length <= 1) return;
    onChangeRows(rows.filter((_, i) => i !== rIndex));
  };

  const handleColumnResizeDrag = (cIndex: number, e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = colWidths[cIndex] || 180;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const nextWidth = Math.max(100, Math.min(600, startWidth + deltaX));
      const nextWidths = [...colWidths];
      nextWidths[cIndex] = nextWidth;
      setColWidths(nextWidths);
      onChangeColWidths?.(nextWidths);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div className="flex flex-col gap-2 relative group/table">
      {/* Table Action Bar - CHỈ HIỆN KHI ĐƯỢC CHỌN (isSelected) */}
      {isSelected && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
            Chỉnh sửa Bảng ({headers.length} cột x {rows.length} hàng)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={addColumn}
              className="flex items-center gap-1 rounded-lg border border-outline-variant px-2 py-0.5 text-xs font-semibold text-on-surface hover:bg-surface-variant"
            >
              <Icon icon="lucide:plus" className="h-3.5 w-3.5 text-primary" /> Thêm Cột
            </button>
            <button
              type="button"
              onClick={addRow}
              className="flex items-center gap-1 rounded-lg border border-outline-variant px-2 py-0.5 text-xs font-semibold text-on-surface hover:bg-surface-variant"
            >
              <Icon icon="lucide:plus" className="h-3.5 w-3.5 text-primary" /> Thêm Hàng
            </button>
          </div>
        </div>
      )}

      {/* Responsive Table Editor */}
      <div
        className={cn(
          'overflow-x-auto rounded-2xl border transition-all',
          isSelected
            ? 'border-primary/40 bg-surface shadow-sm'
            : 'border-outline-variant/60 bg-surface hover:border-outline-variant'
        )}
      >
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-variant/30">
              {headers.map((h, cIdx) => (
                <th
                  key={cIdx}
                  style={{ width: `${colWidths[cIdx] || 180}px`, minWidth: '120px' }}
                  className="relative p-2.5 font-semibold text-on-surface group/th"
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <input
                      type="text"
                      value={h}
                      onChange={(e) => handleHeaderChange(cIdx, e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-full rounded bg-transparent px-1.5 py-1 font-semibold text-on-surface focus:bg-surface focus:outline-none"
                    />
                    {isSelected && headers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeColumn(cIdx)}
                        title="Xóa cột này"
                        className="rounded p-1 text-error/60 opacity-0 group-hover/th:opacity-100 hover:bg-error/10 hover:text-error transition-opacity"
                      >
                        <Icon icon="lucide:x" className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Column Resizer Handle dọc theo toàn bộ cạnh phải cột */}
                  {isSelected && (
                    <div
                      onMouseDown={(e) => handleColumnResizeDrag(cIdx, e)}
                      title="Kéo dọc ranh giới để chỉnh độ rộng cột"
                      className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-primary/60 active:bg-primary transition-colors"
                    />
                  )}
                </th>
              ))}
              {isSelected && (
                <th className="w-8 p-1 text-center">
                  <button
                    type="button"
                    onClick={addColumn}
                    title="Thêm cột mới vào phải"
                    className="rounded p-1 text-primary hover:bg-primary/10"
                  >
                    <Icon icon="lucide:plus" className="h-4 w-4" />
                  </button>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => (
              <tr
                key={rIdx}
                className="border-b border-outline-variant/40 last:border-0 hover:bg-surface-variant/10 group/tr"
              >
                {headers.map((_, cIdx) => (
                  <td
                    key={cIdx}
                    style={{ width: `${colWidths[cIdx] || 180}px` }}
                    className="relative p-2"
                  >
                    <input
                      type="text"
                      value={row[cIdx] || ''}
                      onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Nhập ô..."
                      className="w-full rounded-lg bg-transparent px-2 py-1.5 text-sm text-on-surface focus:bg-surface-variant/30 focus:outline-none"
                    />
                    {/* Resizer Handle dọc trên toàn bộ hàng */}
                    {isSelected && (
                      <div
                        onMouseDown={(e) => handleColumnResizeDrag(cIdx, e)}
                        className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-primary/60 active:bg-primary transition-colors"
                      />
                    )}
                  </td>
                ))}
                {isSelected && (
                  <td className="p-1 text-center">
                    {rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRow(rIdx)}
                        title="Xóa hàng này"
                        className="rounded p-1 text-error/60 opacity-0 group-hover/tr:opacity-100 hover:bg-error/10 hover:text-error transition-opacity"
                      >
                        <Icon icon="lucide:trash-2" className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Nút thêm hàng nhanh giáp ranh đáy bảng khi bảng được chọn */}
      {isSelected && (
        <button
          type="button"
          onClick={addRow}
          className="mx-auto -mt-1 flex items-center gap-1 rounded-b-xl border border-t-0 border-outline-variant bg-surface/90 px-3 py-1 text-xs font-semibold text-on-surface-variant hover:border-primary hover:text-primary shadow-xs transition-colors"
        >
          <Icon icon="lucide:plus" className="h-3.5 w-3.5" /> Thêm hàng
        </button>
      )}
    </div>
  );
}
