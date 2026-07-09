'use client';

import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import type { CanvasBlock } from '../../types';

export function LearnerCodeBlock({ block }: { block: CanvasBlock }) {
  const [copied, setCopied] = useState(false);
  const language = block.props.language || 'typescript';
  const filename = block.props.filename || '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(block.content || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-outline-variant/80 bg-[#0F172A] shadow-lg">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          </div>
          {filename && (
            <span className="font-mono text-xs text-slate-300">{filename}</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {language}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-white/20 transition-colors"
          >
            <Icon
              icon={copied ? 'lucide:check' : 'lucide:copy'}
              className={copied ? 'h-3.5 w-3.5 text-emerald-400' : 'h-3.5 w-3.5'}
            />
            {copied ? 'Đã chép!' : 'Sao chép'}
          </button>
        </div>
      </div>

      {/* Code Readonly Area */}
      <pre className="overflow-x-auto p-4 font-mono text-xs md:text-sm leading-relaxed text-emerald-400">
        <code>{block.content || '// Không có mã code'}</code>
      </pre>
    </div>
  );
}
