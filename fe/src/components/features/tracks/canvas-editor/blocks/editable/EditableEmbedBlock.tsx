'use client';

import React from 'react';
import { Icon } from '@iconify/react';
import type { CanvasBlock } from '../../types';

interface EditableEmbedBlockProps {
  block: CanvasBlock;
  onChangeDisplayMode: (mode: 'embedded' | 'link-card') => void;
  onChangeReferenceId: (newId: string) => void;
}

export function EditableEmbedBlock({
  block,
  onChangeDisplayMode,
  onChangeReferenceId,
}: EditableEmbedBlockProps) {
  const isDoc = block.type === 'doc-embed';
  const refId = block.props.refId || '';
  const displayMode = block.props.embedDisplayMode || 'link-card';

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-outline-variant bg-surface-variant/20 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-primary">
          <Icon
            icon={isDoc ? 'lucide:file-text' : 'lucide:dumbbell'}
            className="h-5 w-5"
          />
          <span>
            {isDoc ? 'Nhúng Tài liệu tham khảo (Document)' : 'Nhúng Bài tập (Exercise)'}
          </span>
        </div>

        {/* Display mode selector */}
        <div className="flex items-center gap-1 rounded-lg bg-surface p-1 border border-outline-variant">
          <button
            type="button"
            onClick={() => onChangeDisplayMode('link-card')}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
              displayMode === 'link-card'
                ? 'bg-primary text-on-primary'
                : 'text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            Thẻ liên kết (Link Card)
          </button>
          <button
            type="button"
            onClick={() => onChangeDisplayMode('embedded')}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
              displayMode === 'embedded'
                ? 'bg-primary text-on-primary'
                : 'text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            Nhúng trực tiếp (Embed Box)
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-on-surface-variant">ID tham chiếu:</span>
        <input
          type="text"
          value={refId}
          onChange={(e) => onChangeReferenceId(e.target.value)}
          placeholder={isDoc ? 'Nhập ID Tài liệu (VD: doc_123)...' : 'Nhập ID Bài tập (VD: ex_123)...'}
          className="flex-1 rounded-xl border border-outline-variant bg-surface px-3 py-1.5 text-xs text-on-surface focus:border-primary focus:outline-none"
        />
      </div>
    </div>
  );
}
