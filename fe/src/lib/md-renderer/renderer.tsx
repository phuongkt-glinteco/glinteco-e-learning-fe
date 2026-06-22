'use client';

import { useState, useCallback } from 'react';
import type { Block, Inline, ListItem, CalloutVariant } from './types';
import { parseInline } from './parser';

/* ───────── Inline Renderer ───────── */

function InlineRender({ nodes }: { nodes: Inline[] }) {
  return (
    <>
      {nodes.map((node, i) => {
        switch (node.type) {
          case 'text':
            return <span key={i}>{node.value}</span>;
          case 'bold':
            return <strong key={i}><InlineRender nodes={node.children} /></strong>;
          case 'italic':
            return <em key={i}><InlineRender nodes={node.children} /></em>;
          case 'underline':
            return (
              <span key={i} className="underline decoration-1 underline-offset-4">
                <InlineRender nodes={node.children} />
              </span>
            );
          case 'code':
            return (
              <code key={i} className="bg-surface-container-high px-1.5 py-0.5 rounded code-font text-sm">
                {node.value}
              </code>
            );
          case 'link':
            if (node.external) {
              return (
                <a
                  key={i}
                  href={node.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary hover:text-primary inline-flex items-center gap-1.5 group transition-colors"
                >
                  <InlineRender nodes={node.children} />
                  <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">open_in_new</span>
                </a>
              );
            }
            return (
              <a
                key={i}
                href={node.href}
                className="text-primary font-medium hover:underline inline-flex items-center gap-1.5"
              >
                <InlineRender nodes={node.children} />
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </a>
            );
          case 'image':
            return (
              <span key={i} className="block my-4">
                <img src={node.src} alt={node.alt} className="max-w-full h-auto rounded-lg border border-outline-variant" />
              </span>
            );
          default:
            return null;
        }
      })}
    </>
  );
}

/* ───────── Syntax Highlight Helpers ───────── */

const HIGHLIGHT_PATTERNS: { regex: RegExp; className: string }[] = [
  { regex: /(\/\*[\s\S]*?\*\/|\/\/.*$)/, className: 'text-[#6a9955]' },
  { regex: /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/, className: 'text-[#ce9178]' },
  { regex: /\b(import|export|from|return|const|let|var|function|class|extends|type|interface|enum|if|else|for|while|do|switch|case|break|continue|new|throw|try|catch|finally|async|await|yield|typeof|instanceof|void|delete|in|of|this|super)\b/, className: 'text-[#569cd6]' },
  { regex: /\b(string|number|boolean|void|null|undefined|any|never|unknown|object|Record|Partial|Required|Pick|Omit|Exclude|Extract)\b/, className: 'text-[#4ec9b0]' },
  { regex: /\b(true|false|null|undefined|NaN|Infinity)\b/, className: 'text-[#569cd6]' },
  { regex: /\b(\d+(?:\.\d+)?)\b/, className: 'text-[#b5cea8]' },
  { regex: /(#[\da-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\))/, className: 'text-[#ce9178]' },
];

function HighlightedLine({ line }: { line: string }) {
  const tokens: ({ text: string; className?: string })[] = [];
  let remaining = line;
  let cursor = 0;

  const allMatches: { start: number; end: number; className: string; text: string }[] = [];

  for (const p of HIGHLIGHT_PATTERNS) {
    const regex = new RegExp(p.regex.source, 'g');
    let match: RegExpExecArray | null;
    while ((match = regex.exec(remaining)) !== null) {
      allMatches.push({ start: match.index, end: match.index + match[0].length, className: p.className, text: match[0] });
    }
  }

  allMatches.sort((a, b) => a.start - b.start);

  for (const m of allMatches) {
    if (m.start < cursor) continue;
    if (m.start > cursor) {
      tokens.push({ text: remaining.slice(cursor, m.start) });
    }
    tokens.push({ text: m.text, className: m.className });
    cursor = m.end;
  }
  if (cursor < remaining.length) {
    tokens.push({ text: remaining.slice(cursor) });
  }

  return (
    <span>
      {tokens.map((t, i) =>
        t.className ? <span key={i} className={t.className}>{t.text}</span> : <span key={i}>{t.text}</span>
      )}
    </span>
  );
}

/* ───────── Code Copy Button ───────── */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-sm text-secondary hover:text-primary transition-colors cursor-pointer"
      title="Copy"
    >
      <span className="material-symbols-outlined text-[18px]">{copied ? 'check' : 'content_copy'}</span>
    </button>
  );
}

/* ───────── Block Renderers ───────── */

function HeadingBlock({ level, children }: { level: 1 | 2 | 3; children: Inline[] }) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3';
  const style =
    level === 1
      ? 'font-h1 text-h1 text-primary mb-2'
      : level === 2
        ? 'font-h2 text-h2 text-primary border-b border-outline-variant pb-2 mb-4'
        : 'font-h3 text-h3 mb-3';

  return (
    <Tag className={style}>
      <InlineRender nodes={children} />
    </Tag>
  );
}

function ParagraphBlock({ children }: { children: Inline[] }) {
  return (
    <p className="text-body-base leading-relaxed my-4">
      <InlineRender nodes={children} />
    </p>
  );
}

function ListBlock({ ordered, items }: { ordered: boolean; items: ListItem[] }) {
  if (ordered) {
    return (
      <ol className="space-y-2 list-decimal list-inside text-body-base my-4">
        {items.map((item, i) => (
          <li key={i} className="pl-2">
            <InlineRender nodes={item.children} />
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ul className="space-y-2 list-none my-4">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          {item.checked !== null ? (
            <span
              className={`mt-1 w-4 h-4 rounded border-2 flex-shrink-0 ${item.checked ? 'bg-primary border-primary' : 'border-outline-variant'}`}
            >
              {item.checked && (
                <span className="material-symbols-outlined text-[14px] text-on-primary block">check</span>
              )}
            </span>
          ) : (
            <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 flex-shrink-0" />
          )}
          <span>
            <InlineRender nodes={item.children} />
          </span>
        </li>
      ))}
    </ul>
  );
}

function TableBlock({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="border border-outline-variant rounded-lg overflow-hidden my-6 overflow-x-auto">
      <table className="w-full text-left border-collapse">
        {headers.length > 0 && (
          <thead className="bg-surface-container-low border-b border-outline-variant">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-6 py-3 font-label-md text-label-md text-primary">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-outline-variant">
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-6 py-4 font-body-sm text-body-sm">
                  <InlineRender nodes={parseInline(cell)} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BlockquoteBlock({ children }: { children: Inline[] }) {
  return (
    <blockquote className="border-l-4 border-primary pl-8 py-4 italic text-on-surface-variant font-h3 text-h3 leading-relaxed my-6">
      <InlineRender nodes={children} />
    </blockquote>
  );
}

function CodeBlock({ language, code, filename }: { language: string; code: string; filename?: string }) {
  const lines = code.split('\n');

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm my-6">
      {filename && (
        <div className="flex items-center gap-2 bg-surface-container-high px-4 py-2 text-primary font-label-sm text-label-sm border-b border-outline-variant">
          <span className="material-symbols-outlined text-[18px]">description</span>
          {filename}
        </div>
      )}
      {!filename && language && (
        <div className="flex items-center justify-between bg-surface-container-low px-4 py-2 border-b border-outline-variant">
          <span className="font-label-sm text-label-sm text-secondary uppercase">{language}</span>
          <CopyButton text={code} />
        </div>
      )}
      <div className="p-6 code-font text-sm leading-relaxed overflow-x-auto bg-[#1c1b1d] text-[#c8c6c8]">
        <pre className="m-0">
          {lines.map((line, i) => (
            <div key={i} className="min-h-[1.4em]">
              <HighlightedLine line={line} />
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}

function TerminalBlock({ code }: { code: string }) {
  const lines = code.split('\n');

  return (
    <div className="bg-primary-container text-on-primary-container rounded-xl overflow-hidden shadow-lg my-6">
      <div className="flex items-center justify-between px-4 py-2 bg-primary-container">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-on-primary-container/70">terminal</span>
          <span className="font-label-sm text-label-sm text-on-primary-container/70">Terminal</span>
        </div>
        <CopyButton text={code} />
      </div>
      <div className="p-6 code-font text-sm text-[#c8c6c8]">
        {lines.map((line, i) => (
          <p key={i} className="mb-0.5">
            <span className="text-success">$</span> {line}
          </p>
        ))}
      </div>
    </div>
  );
}

function FolderTreeBlock({ content }: { content: string }) {
  const lines = content.split('\n');

  return (
    <div className="p-6 bg-surface-container-low border border-outline-variant rounded-xl font-body-sm text-body-sm space-y-2 my-6">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} />;
        const indent = line.search(/\S/);
        const isFolder = trimmed.endsWith('/');

        return (
          <div key={i} className="flex items-center gap-2" style={{ paddingLeft: `${indent * 16}px` }}>
            <span className="material-symbols-outlined text-secondary shrink-0" style={{ fontSize: isFolder ? '20px' : '18px' }}>
              {isFolder ? (trimmed.match(/^[^/]+\/$/) ? 'folder_open' : 'folder') : 'description'}
            </span>
            <span className={isFolder ? 'text-primary font-medium' : ''}>
              {trimmed.replace(/\/$/, '')}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const CALLOUT_STYLES: Record<CalloutVariant, { container: string; icon: string; header: string }> = {
  info: {
    container: 'p-4 bg-[#f3f3f4] border-l-4 border-primary rounded-r-lg flex gap-4',
    icon: 'info',
    header: 'Info',
  },
  objective: {
    container: 'p-4 bg-primary text-on-primary rounded-lg flex gap-4',
    icon: 'flag',
    header: 'Objective',
  },
  prerequisites: {
    container: 'p-4 bg-surface-container-low border-l-4 border-secondary rounded-r-lg flex gap-4',
    icon: 'playlist_add_check',
    header: 'Prerequisites',
  },
  exercise: {
    container: 'p-4 border border-outline-variant rounded-lg flex gap-4 bg-surface-container-low',
    icon: 'exercise',
    header: 'Exercise',
  },
  challenge: {
    container: 'p-4 bg-white border border-error border-dashed rounded-lg flex gap-4',
    icon: 'warning',
    header: 'Challenge',
  },
  summary: {
    container: 'p-8 bg-surface-container-high rounded-2xl border border-outline-variant text-center space-y-4',
    icon: 'verified',
    header: 'Summary',
  },
};

function CalloutBlock({ variant, children, listItems }: { variant: CalloutVariant; children: Inline[]; listItems?: ListItem[] }) {
  const style = CALLOUT_STYLES[variant];
  const hasList = listItems && listItems.length > 0;

  const textClass = variant === 'objective'
    ? 'text-body-sm opacity-90 text-on-primary'
    : 'text-body-sm text-on-surface-variant';

  const containerClass = style.container
    + ' my-6 items-start'
    + (hasList && variant === 'summary' ? ' text-left' : '');

  return (
    <div className={containerClass}>
      {hasList && variant === 'summary' ? (
        <>
          <span className="material-symbols-outlined text-4xl text-primary shrink-0">{style.icon}</span>
          {style.header && (
            <h2 className="font-h2 text-h2 text-primary">{style.header}</h2>
          )}
          <ul className="space-y-1 list-none text-left max-w-lg">
            {listItems!.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span className={textClass}><InlineRender nodes={item.children} /></span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <span
            className={`material-symbols-outlined shrink-0 mt-0.5 ${variant !== 'objective' && variant !== 'challenge' ? 'text-primary' : ''} ${variant === 'challenge' ? 'text-error' : ''}`}
          >
            {style.icon}
          </span>
          <div className="min-w-0 flex-1">
            {variant !== 'summary' && (
              <p
                className={`font-label-md text-label-md ${
                  variant === 'objective' ? 'uppercase tracking-wide' : ''
                } ${variant === 'objective' ? 'text-on-primary' : variant === 'challenge' ? 'text-error' : 'text-primary'}`}
              >
                {variant === 'challenge' ? (
                  <span className="text-error">{style.header}</span>
                ) : (
                  style.header
                )}
              </p>
            )}
            {children.length > 0 && (
              <p className={textClass}>
                <InlineRender nodes={children} />
              </p>
            )}
            {hasList && (
              <ul className="space-y-1 list-none mt-2">
                {listItems!.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-current rounded-full mt-2 flex-shrink-0 opacity-70" />
                    <span className={textClass}><InlineRender nodes={item.children} /></span>
                  </li>
                ))}
              </ul>
            )}
            {children.length === 0 && !hasList && (
              <span />
            )}
          </div>
        </>
      )}
    </div>
  );
}

function TabsBlock({ tabs }: { tabs: { label: string; content: string }[] }) {
  const [active, setActive] = useState(0);

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm my-6">
      <div className="flex items-center justify-between bg-surface-container-low px-4 py-2 border-b border-outline-variant">
        <div className="flex gap-4">
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`font-label-sm text-label-sm pb-1 transition-colors cursor-pointer ${
                i === active ? 'text-primary border-b-2 border-primary' : 'text-secondary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {tabs.map((tab, i) => (
        <div key={i} className={i === active ? 'p-6 code-font text-sm leading-relaxed overflow-x-auto bg-[#1c1b1d] text-[#c8c6c8]' : 'hidden'}>
          <pre className="m-0 whitespace-pre-wrap">{tab.content}</pre>
        </div>
      ))}
    </div>
  );
}

function DetailsBlock({ summary, children }: { summary: string; children: Inline[] }) {
  return (
    <details className="group bg-white border border-outline-variant rounded-xl overflow-hidden my-6">
      <summary className="flex items-center justify-between p-4 cursor-pointer list-none bg-surface-container-low transition-colors group-open:bg-white group-open:border-b border-outline-variant">
        <span className="font-label-md text-label-md text-primary">{summary}</span>
        <span className="material-symbols-outlined transition-transform group-open:rotate-180 text-secondary">expand_more</span>
      </summary>
      <div className="p-6 text-body-sm text-on-surface-variant">
        <InlineRender nodes={children} />
      </div>
    </details>
  );
}

function ImageBlock({ alt, src }: { alt: string; src: string }) {
  return (
    <figure className="border border-outline-variant rounded-xl overflow-hidden bg-white my-6">
      <div className="aspect-video w-full bg-surface-variant overflow-hidden">
        <img className="w-full h-full object-cover" src={src} alt={alt} />
      </div>
      {alt && (
        <figcaption className="px-6 py-4 bg-surface-container-low text-on-surface-variant font-body-sm text-body-sm italic border-t border-outline-variant">
          {alt}
        </figcaption>
      )}
    </figure>
  );
}

/* ───────── Main Renderer ───────── */

import { parseMarkdown } from './parser';

export function MarkdownRenderer({ content }: { content: string }) {
  const blocks = parseMarkdown(content);

  return (
    <div>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'heading':
            return <HeadingBlock key={i} level={block.level} children={block.children} />;
          case 'paragraph':
            return <ParagraphBlock key={i} children={block.children} />;
          case 'list':
            return <ListBlock key={i} ordered={block.ordered} items={block.items} />;
          case 'table':
            return <TableBlock key={i} headers={block.headers} rows={block.rows} />;
          case 'blockquote':
            return <BlockquoteBlock key={i} children={block.children} />;
          case 'code':
            return <CodeBlock key={i} language={block.language} code={block.code} filename={block.filename} />;
          case 'terminal':
            return <TerminalBlock key={i} code={block.code} />;
          case 'folderTree':
            return <FolderTreeBlock key={i} content={block.content} />;
          case 'image':
            return <ImageBlock key={i} alt={block.alt} src={block.src} />;
          case 'hr':
            return <hr key={i} className="border-outline-variant my-8" />;
          case 'callout':
            return <CalloutBlock key={i} variant={block.variant} children={block.children} listItems={block.listItems} />;
          case 'tabs':
            return <TabsBlock key={i} tabs={block.tabs} />;
          case 'details':
            return <DetailsBlock key={i} summary={block.summary} children={block.children} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
