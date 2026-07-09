'use client';

import React from 'react';
import type { CanvasBlock } from '../../types';

export function LearnerTableBlock({ block }: { block: CanvasBlock }) {
  const headers: string[] = block.props.headers || ['Cột 1', 'Cột 2'];
  const rows: string[][] = block.props.rows || [['Dữ liệu 1', 'Dữ liệu 2']];

  return (
    <div className="overflow-x-auto rounded-2xl border border-outline-variant bg-surface shadow-sm">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-outline-variant bg-surface-variant/30">
            {headers.map((h, idx) => (
              <th
                key={idx}
                className="p-3.5 font-bold tracking-tight text-on-surface"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rIdx) => (
            <tr
              key={rIdx}
              className="border-b border-outline-variant/40 last:border-0 hover:bg-surface-variant/10 transition-colors"
            >
              {headers.map((_, cIdx) => (
                <td key={cIdx} className="p-3.5 text-on-surface/90">
                  {row[cIdx] || ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
