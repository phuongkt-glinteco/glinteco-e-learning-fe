'use client';

import React from 'react';
import type { CanvasBlock } from '../../types';

export function LearnerScrollableAreaBlock({
  block,
  children,
}: {
  block: CanvasBlock;
  children?: React.ReactNode;
}) {
  const maxHeight = block.props.maxHeight || 420;

  return (
    <div
      style={{ maxHeight: `${maxHeight}px` }}
      className="w-full overflow-auto rounded-2xl border border-outline-variant bg-surface p-4 shadow-sm"
    >
      {children}
    </div>
  );
}
