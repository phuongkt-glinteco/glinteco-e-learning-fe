'use client';

import React from 'react';
import { Icon } from '@iconify/react';
import type { CanvasBlock } from '../../types';

interface EditableLinkBlockProps {
  block: CanvasBlock;
  onChangeAltText: (altText: string) => void;
  onChangeUrl: (url: string) => void;
  onChangeLinkId: (linkId: string) => void;
}

export function EditableLinkBlock({
  block,
  onChangeAltText,
  onChangeUrl,
  onChangeLinkId,
}: EditableLinkBlockProps) {
  const altText = block.props.altText || block.content || '';
  const url = block.props.url || '';
  const linkId = block.props.linkId || '';

  return (
    <div className="inline-flex flex-wrap items-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-3 py-2 text-xs">
      <div className="flex items-center gap-1.5 font-bold text-primary">
        <Icon icon="lucide:link" className="h-4 w-4" />
        <span>Inline Link:</span>
      </div>

      <input
        type="text"
        value={altText}
        onChange={(e) => onChangeAltText(e.target.value)}
        placeholder="Văn bản hiển thị (Alt Text)..."
        className="w-44 rounded-lg border border-outline-variant bg-surface px-2.5 py-1 text-xs font-semibold text-on-surface focus:border-primary focus:outline-none"
      />

      <input
        type="text"
        value={url}
        onChange={(e) => onChangeUrl(e.target.value)}
        placeholder="URL / ID tham chiếu..."
        className="w-52 rounded-lg border border-outline-variant bg-surface px-2.5 py-1 text-xs text-on-surface focus:border-primary focus:outline-none"
      />

      <input
        type="text"
        value={linkId}
        onChange={(e) => onChangeLinkId(e.target.value)}
        placeholder="Anchor ID (tùy chọn)..."
        className="w-32 rounded-lg border border-outline-variant bg-surface px-2.5 py-1 text-xs font-mono text-secondary focus:border-primary focus:outline-none"
      />

      {altText && (
        <span className="ml-1 inline-flex items-center gap-1 rounded-md bg-surface px-2 py-0.5 font-medium text-primary underline">
          <span>{altText}</span>
          <Icon icon="lucide:external-link" className="h-3 w-3" />
        </span>
      )}
    </div>
  );
}
