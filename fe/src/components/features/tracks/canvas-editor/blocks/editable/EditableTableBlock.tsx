'use client';

import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import type { CanvasBlock } from '../../types';

interface EditableTableBlockProps {
  block: CanvasBlock;
  onChangeHeaders: (newHeaders: string[]) => void;
  onChangeRows: (newRows: string[][]) => void;
  onChangeColWidths?: (widths: number[]) => void;
}

export function EditableTableBlock({
  block,
  onChangeHeaders,
  onChangeRows,
  onChangeColWidths,
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
    <div className="flex flex-col gap-3">
      {/* Table Action Bar */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
          Chỉnh sửa Bảng dữ liệu ({headers.length} cột x {rows.length} hàng)
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={addColumn}
            className="flex items-center gap-1 rounded-lg border border-outline-variant px-2.5 py-1 text-xs font-semibold text-on-surface hover:bg-surface-variant"
          >
            <Icon icon="lucide:plus" className="h-3.5 w-3.5" /> Thêm Cột
          </button>
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-1 rounded-lg border border-outline-variant px-2.5 py-1 text-xs font-semibold text-on-surface hover:bg-surface-variant"
          >
            <Icon icon="lucide:plus" className="h-3.5 w-3.5" /> Thêm Hàng
          </button>
        </div>
      </div>

      {/* Responsive Table Editor */}
      <div className="overflow-x-auto rounded-2xl border border-outline-variant bg-surface">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-variant/30">
              {headers.map((h, cIdx) => (
                <th
                  key={cIdx}
                  style={{ width: `${colWidths[cIdx] || 180}px`, minWidth: '120px' }}
                  className="relative p-3 font-semibold text-on-surface"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={h}
                      onChange={(e) => handleHeaderChange(cIdx, e.target.value)}
                      className="w-full rounded bg-transparent px-1.5 py-1 font-semibold text-on-surface focus:bg-surface focus:outline-none"
                    />
                    {headers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeColumn(cIdx)}
                        title="Xóa cột này"
                        className="rounded p-1 text-error hover:bg-error/10"
                      >
                        <Icon icon="lucide:x" className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Column Resizer Handle (Editor only interactive width resizing) */}
                  <div
                    onMouseDown={(e) => handleColumnResizeDrag(cIdx, e)}
                    title="Kéo để chỉnh độ rộng cột"
                    className="absolute right-0 top-0 h-full w-2 cursor-col-resize hover:bg-primary/40 transition-colors"
                  />
                </th>
              ))}
              <th className="w-10 p-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => (
              <tr key={rIdx} className="border-b border-outline-variant/50 last:border-0 hover:bg-surface-variant/10">
                {headers.map((_, cIdx) => (
                  <td key={cIdx} className="p-2">
                    <input
                      type="text"
                      value={row[cIdx] || ''}
                      onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                      placeholder="Nhập ô..."
                      className="w-full rounded-lg bg-transparent px-2 py-1.5 text-sm text-on-surface focus:bg-surface-variant/30 focus:outline-none"
                    />
                  </td>
                ))}
                <td className="p-2 text-center">
                  {rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(rIdx)}
                      title="Xóa hàng này"
                      className="rounded p-1 text-error hover:bg-error/10"
                    >
                      <Icon icon="lucide:trash-2" className="h-3.5 w-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
