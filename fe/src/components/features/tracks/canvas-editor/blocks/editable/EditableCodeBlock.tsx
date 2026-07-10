'use client';

import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import type { CanvasBlock } from '../../types';

import { cn } from '@/lib/utils';

interface EditableCodeBlockProps {
  block: CanvasBlock;
  onChangeContent: (newContent: string) => void;
  onChangeLanguage: (newLang: string) => void;
  onChangeFilename: (newFilename: string) => void;
  onChangeHeight?: (newHeight: number) => void;
  onChangePreset?: (preset: 'logic' | 'terminal' | 'config') => void;
  onInsertParagraphAfter?: () => void;
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
  onChangePreset,
  onInsertParagraphAfter,
}: EditableCodeBlockProps) {
  const [height, setHeight] = useState<number>(block.props.height || 220);

  const language = block.props.language || 'typescript';
  const filename = block.props.filename || '';
  const preset: 'logic' | 'terminal' | 'config' =
    block.props.preset ||
    (language === 'bash' ? 'terminal' : ['json', 'sql', 'markdown'].includes(language) ? 'config' : 'logic');

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onInsertParagraphAfter?.();
    }
  };

  const presetStyles = {
    logic: {
      container: 'bg-[#0F172A] border-outline-variant/80',
      header: 'bg-white/5 border-white/10 text-slate-200',
      textColor: 'text-emerald-400',
      placeholder: '// Nhập mã nguồn code (Ctrl+Enter thoát)...',
    },
    terminal: {
      container: 'bg-[#0A0A0E] border-slate-700',
      header: 'bg-[#14141B] border-slate-800 text-slate-300',
      textColor: 'text-slate-200',
      placeholder: '$ Nhập lệnh terminal (Ctrl+Enter thoát)...',
    },
    config: {
      container: 'bg-[#111827] border-indigo-500/30',
      header: 'bg-indigo-950/40 border-indigo-500/20 text-indigo-200',
      textColor: 'text-amber-300',
      placeholder: '# Nhập cấu trúc dữ liệu / config (Ctrl+Enter thoát)...',
    },
  }[preset];

  return (
    <div className={cn('overflow-hidden rounded-2xl border shadow-lg', presetStyles.container)}>
      {/* Code / Terminal / Config Header Bar */}
      <div className={cn('flex items-center justify-between border-b px-4 py-2.5', presetStyles.header)}>
        <div className="flex items-center gap-3">
          {preset === 'logic' && (
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            </div>
          )}
          {preset === 'terminal' && (
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-xs font-bold">
              <Icon icon="lucide:terminal" className="h-4 w-4" />
              <span>CONSOLE</span>
            </div>
          )}
          {preset === 'config' && (
            <div className="flex items-center gap-1.5 text-amber-400 font-mono text-xs font-bold">
              <Icon icon="lucide:file-code" className="h-4 w-4" />
              <span>CONFIG / DOC</span>
            </div>
          )}

          {/* Filename input */}
          <input
            type="text"
            value={filename}
            onChange={(e) => onChangeFilename(e.target.value)}
            placeholder="Tên file (tùy chọn)..."
            className="w-44 rounded-lg bg-transparent px-2 py-0.5 text-xs placeholder:text-slate-500 focus:bg-white/10 focus:outline-none"
          />
        </div>

        {/* Style Preset Selector + Language Selector */}
        <div className="flex items-center gap-2">
          {onChangePreset && (
            <select
              value={preset}
              onChange={(e) => onChangePreset(e.target.value as 'logic' | 'terminal' | 'config')}
              title="Khung hiển thị code"
              className="rounded-lg bg-white/10 px-2 py-1 text-[11px] font-medium text-slate-200 focus:outline-none"
            >
              <option value="logic" className="bg-slate-900 text-slate-200">
                Code Logic
              </option>
              <option value="terminal" className="bg-slate-900 text-slate-200">
                Terminal CLI
              </option>
              <option value="config" className="bg-slate-900 text-slate-200">
                Data / Config
              </option>
            </select>
          )}

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
          onKeyDown={handleKeyDown}
          placeholder={presetStyles.placeholder}
          className={cn(
            'w-full resize-none font-mono text-xs md:text-sm leading-relaxed bg-transparent p-4 placeholder:text-slate-600 focus:outline-none',
            presetStyles.textColor
          )}
          spellCheck={false}
        />

        {/* Resizer Handle */}
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
