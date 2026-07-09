'use client';

import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import type { CanvasBlock } from '../../types';

interface EditableCodeBlockProps {
  block: CanvasBlock;
  onChangeContent: (newContent: string) => void;
  onChangeLanguage: (newLang: string) => void;
  onChangeFilename: (newFilename: string) => void;
  onChangeHeight?: (newHeight: number) => void;
}

const SUPPORTED_LANGUAGES = [
  'typescript',
  'javascript',
  'python',
  'json',
  'html',
  'css',
  'bash',
  'sql',
  'markdown',
];

export function EditableCodeBlock({
  block,
  onChangeContent,
  onChangeLanguage,
  onChangeFilename,
  onChangeHeight,
}: EditableCodeBlockProps) {
  const [height, setHeight] = useState<number>(block.props.height || 220);

  const language = block.props.language || 'typescript';
  const filename = block.props.filename || '';

  const handleResizeDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = height;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const nextHeight = Math.max(120, Math.min(800, startHeight + deltaY));
      setHeight(nextHeight);
      onChangeHeight?.(nextHeight);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-outline-variant/80 bg-[#0F172A] shadow-lg">
      {/* Terminal / Code Header Bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-2.5">
        <div className="flex items-center gap-3">
          {/* Mac window dots */}
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          </div>

          {/* Filename input */}
          <input
            type="text"
            value={filename}
            onChange={(e) => onChangeFilename(e.target.value)}
            placeholder="Tên file (tùy chọn, VD: index.ts)..."
            className="w-48 rounded-lg bg-transparent px-2 py-0.5 text-xs text-slate-200 placeholder:text-slate-500 focus:bg-white/10 focus:outline-none"
          />
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-2">
          <Icon icon="lucide:code" className="h-4 w-4 text-slate-400" />
          <select
            value={language}
            onChange={(e) => onChangeLanguage(e.target.value)}
            className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-200 focus:outline-none"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang} value={lang} className="bg-slate-900 text-slate-200">
                {lang.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Editable Code Editor Area */}
      <div className="relative w-full">
        <textarea
          style={{ height: `${height}px` }}
          value={block.content || ''}
          onChange={(e) => onChangeContent(e.target.value)}
          placeholder="// Nhập mã nguồn code tại đây..."
          className="w-full resize-none font-mono text-xs md:text-sm leading-relaxed text-emerald-400 bg-transparent p-4 placeholder:text-slate-600 focus:outline-none"
          spellCheck={false}
        />

        {/* Resizer Handle (Editor only interactive height resizing) */}
        <div
          onMouseDown={handleResizeDrag}
          title="Kéo để chỉnh độ cao khung code"
          className="flex h-4 w-full cursor-ns-resize items-center justify-center bg-white/[0.03] text-slate-500 hover:bg-white/10 hover:text-slate-300 transition-colors"
        >
          <div className="h-1 w-10 rounded-full bg-slate-600" />
        </div>
      </div>
    </div>
  );
}
