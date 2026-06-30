'use client';

import { useState, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { MarkdownRenderer } from '@/lib/md-renderer';

type ToolbarAction =
  | 'h1' | 'h2' | 'h3'
  | 'bold' | 'italic'
  | 'list' | 'olist'
  | 'quote' | 'code'
  | 'link' | 'image'
  | 'table'
  | 'info' | 'objective' | 'challenge'
  | 'tabs' | 'details';

const SNIPPETS: Record<ToolbarAction, string> = {
  h1: '# ',
  h2: '## ',
  h3: '### ',
  bold: '****',
  italic: '**',
  list: '- ',
  olist: '1. ',
  quote: '> ',
  code: '```\n\n```',
  link: '[](url)',
  image: '![](url)',
  table: '| Header | Header |\n|--------|--------|\n| Cell | Cell |\n',
  info: ':::info\n\n:::',
  objective: ':::objective\n- \n:::',
  challenge: ':::challenge\n\n:::',
  tabs: ':::tabs\n\n@tab Title\n\n:::',
  details: ':::details Title\n\n:::',
};

const CURSOR_OFFSET: Record<ToolbarAction, number> = {
  h1: 2,
  h2: 3,
  h3: 4,
  bold: 2,
  italic: 1,
  list: 2,
  olist: 3,
  quote: 2,
  code: 4,
  link: 1,
  image: 2,
  table: 16,
  info: 11,
  objective: 16,
  challenge: 15,
  tabs: 20,
  details: 18,
};

interface DocumentReadingEditorProps {
  body: string;
  onChange: (body: string) => void;
}

export function DocumentReadingEditor({ body, onChange }: DocumentReadingEditorProps) {
  const t = useTranslations('DocumentEdit');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  const insertMarkdown = useCallback((action: ToolbarAction) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = body.substring(start, end);
    const snippet = SNIPPETS[action];
    const offset = CURSOR_OFFSET[action];

    let inserted: string;
    let cursorPos: number;

    if (selected) {
      if (action === 'bold') {
        inserted = `**${selected}**`;
        cursorPos = start + inserted.length;
      } else if (action === 'italic') {
        inserted = `*${selected}*`;
        cursorPos = start + inserted.length;
      } else if (action === 'link') {
        inserted = `[${selected}](url)`;
        cursorPos = start + inserted.length;
      } else if (action === 'image') {
        inserted = `![${selected}](url)`;
        cursorPos = start + inserted.length;
      } else {
        const before = body.substring(0, start);
        const newLine = before.endsWith('\n') || before === '' ? '' : '\n';
        inserted = `${newLine}${snippet}${selected}`;
        cursorPos = start + inserted.length;
      }
    } else {
      inserted = snippet;
      cursorPos = start + offset;
    }

    const newBody = body.substring(0, start) + inserted + body.substring(end);
    onChange(newBody);

    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(cursorPos, cursorPos);
    });
  }, [body, onChange]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const indent = '  ';
      const newBody = body.substring(0, start) + indent + body.substring(end);
      onChange(newBody);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + indent.length;
      });
    }
  }

  const toolbarButtons: { action: ToolbarAction; icon: string; labelKey: string }[] = [
    { action: 'h1', icon: 'format_h1', labelKey: 'heading1' },
    { action: 'h2', icon: 'format_h2', labelKey: 'heading2' },
    { action: 'h3', icon: 'format_h3', labelKey: 'heading3' },
    { action: 'bold', icon: 'format_bold', labelKey: 'bold' },
    { action: 'italic', icon: 'format_italic', labelKey: 'italic' },
    { action: 'list', icon: 'format_list_bulleted', labelKey: 'bulletList' },
    { action: 'olist', icon: 'format_list_numbered', labelKey: 'numberedList' },
    { action: 'quote', icon: 'format_quote', labelKey: 'quote' },
    { action: 'code', icon: 'code', labelKey: 'codeBlock' },
    { action: 'link', icon: 'link', labelKey: 'link' },
    { action: 'image', icon: 'image', labelKey: 'image' },
    { action: 'table', icon: 'table', labelKey: 'table' },
    { action: 'info', icon: 'info', labelKey: 'calloutInfo' },
    { action: 'objective', icon: 'flag', labelKey: 'calloutObjective' },
    { action: 'challenge', icon: 'warning', labelKey: 'calloutChallenge' },
    { action: 'tabs', icon: 'tab', labelKey: 'tabs' },
    { action: 'details', icon: 'menu_open', labelKey: 'details' },
  ];

  return (
    <div className="bg-white border border-outline-variant rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex items-center gap-0.5 px-3 py-2 bg-surface border-b border-outline-variant flex-wrap">
        {toolbarButtons.map((btn, i) => (
          <span key={btn.action}>
            {[3, 5, 9, 11].includes(i) && (
              <div className="w-px h-6 bg-outline-variant mx-1.5 inline-block align-middle" />
            )}
            <button
              type="button"
              onClick={() => insertMarkdown(btn.action)}
              title={t(btn.labelKey)}
              className="p-1.5 hover:bg-surface-container-high rounded transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px] text-secondary block">
                {btn.icon}
              </span>
            </button>
          </span>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <span className="font-label-sm text-on-surface-variant">
            {body.split(/\s+/).filter(Boolean).length} words
          </span>
          <div className="flex bg-surface-container rounded-lg p-1">
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className={`px-3 py-1 rounded-md font-label-sm transition-colors ${
                !showPreview ? 'bg-white shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className={`px-3 py-1 rounded-md font-label-sm transition-colors ${
                showPreview ? 'bg-white shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Preview
            </button>
          </div>
        </div>
      </div>

      {/* Editor / Preview */}
      <div className="flex-1 flex">
        <div className={`flex-1 ${showPreview ? 'hidden md:flex' : 'flex'} flex-col`}>
          <textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full min-h-[600px] p-8 font-code text-body-md text-on-surface focus:ring-0 border-none resize-none flex-1"
            spellCheck={false}
            placeholder="Write your content in Markdown..."
          />
        </div>
        {showPreview && (
          <div className="flex-1 border-l border-outline-variant overflow-y-auto p-8 bg-surface-container-lowest">
            {body.trim() ? (
              <article className="max-w-[720px] mx-auto">
                <MarkdownRenderer content={body} />
              </article>
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <p className="text-body-sm text-secondary italic">Nothing to preview</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
