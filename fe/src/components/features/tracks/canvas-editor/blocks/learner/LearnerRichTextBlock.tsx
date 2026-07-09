'use client';

import React from 'react';
import type { CanvasBlock } from '../../types';

export function LearnerRichTextBlock({ block }: { block: CanvasBlock }) {
  const listType = block.props.listType;
  const indentLevel = block.props.indentLevel || 0;
  const listStart = block.props.listStart || 1;

  const renderListIndicator = () => {
    if (!listType) return null;

    if (listType === 'bullet') {
      let symbol = '•';
      if (indentLevel === 1) symbol = '◦';
      else if (indentLevel === 2) symbol = '▪';
      else if (indentLevel >= 3) symbol = '–';

      return (
        <span className="w-5 shrink-0 select-none text-right font-bold text-primary mr-2 text-sm md:text-base leading-relaxed">
          {symbol}
        </span>
      );
    }

    if (listType === 'ordered') {
      let label = `${listStart}.`;
      if (indentLevel === 1) {
        const char = String.fromCharCode(97 + ((listStart - 1) % 26));
        label = `${char}.`;
      } else if (indentLevel === 2) {
        label = 'i.';
      } else if (indentLevel >= 3) {
        label = `(${listStart})`;
      }

      return (
        <span className="w-6 shrink-0 select-none text-right font-bold text-secondary mr-2 text-sm md:text-base leading-relaxed">
          {label}
        </span>
      );
    }

    return null;
  };

  return (
    <div
      style={{
        color: block.props.textColor,
        paddingLeft: `${indentLevel * 24}px`,
      }}
      className="flex items-start text-sm md:text-base leading-relaxed text-on-surface whitespace-pre-wrap"
    >
      {renderListIndicator()}
      <div className="flex-1">{block.content}</div>
    </div>
  );
}
