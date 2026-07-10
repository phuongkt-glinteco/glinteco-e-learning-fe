'use client';

import React, { useRef, useEffect } from 'react';
import type { CanvasBlock, CanvasBlockType, CanvasBlockProps } from '../../types';
import { cn } from '@/lib/utils';

function generateItemId(): string {
  return 'item_' + Math.random().toString(36).substring(2, 11);
}

export interface EditableRichTextBlockProps {
  block: CanvasBlock;
  onChangeContent?: (newContent: string) => void;
  onChangeProps?: (newProps: CanvasBlockProps) => void;
  onChangeContentAndProps?: (content: string, newProps: CanvasBlockProps) => void;
  onInsertParagraphAfter?: (customProps?: CanvasBlockProps) => void;
  onInsertBlockAfter?: (type: CanvasBlockType, customProps?: CanvasBlockProps) => void;
  onDeleteAndFocusPrevious?: () => void;
  onChangeBlockType?: (newType: CanvasBlockType, newProps?: CanvasBlockProps) => void;
  onFocusPrevious?: () => void;
  onFocusNext?: () => void;
  [key: string]: unknown;
}

export const EditableRichTextBlock: React.FC<EditableRichTextBlockProps> = ({
  block,
  onChangeContent,
  onInsertParagraphAfter,
  onInsertBlockAfter,
  onDeleteAndFocusPrevious,
  onChangeBlockType,
  onFocusPrevious,
  onFocusNext,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [block.content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChangeContent?.(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Shortcuts Ctrl/Cmd + B -> Heading
    if (e.ctrlKey || e.metaKey) {
      if ((e.key === 'b' || e.key === 'B') && onChangeBlockType) {
        e.preventDefault();
        onChangeBlockType('heading', { level: 1 });
        return;
      }
      if (e.key === 'Enter' && onInsertParagraphAfter) {
        e.preventDefault();
        onInsertParagraphAfter();
        return;
      }
    }

    const el = textareaRef.current;
    if (!el) return;

    const val = block.content || '';
    const selStart = el.selectionStart || 0;

    // Handle special characters + space ('- ' or '* ' or '1. ') -> create List Block
    if (e.key === ' ') {
      const lastNewLine = val.lastIndexOf('\n', selStart - 1);
      const lineStart = lastNewLine === -1 ? 0 : lastNewLine + 1;
      const currentLineBeforeCursor = val.slice(lineStart, selStart);

      const isBulletTrigger = /^[-*+]$/.test(currentLineBeforeCursor.trim());
      const isOrderedTrigger = /^\d+[.)]$/.test(currentLineBeforeCursor.trim());

      if (isBulletTrigger || isOrderedTrigger) {
        e.preventDefault();
        const isOrdered = isOrderedTrigger;
        const listProps: CanvasBlockProps = {
          ordered: isOrdered,
          items: [{ id: generateItemId(), content: '', level: 0 }],
        };

        // Nếu paragraph chỉ có duy nhất ký tự trigger này -> đổi luôn block thành list block
        if (lineStart === 0 && selStart === val.length) {
          onChangeBlockType?.('list', listProps);
          return;
        }

        // Nếu paragraph có nội dung trước đó -> cắt bỏ ký tự trigger ra khỏi paragraph và tạo list block bên dưới
        const cleanContent = val.slice(0, lineStart).replace(/\n$/, '');
        onChangeContent?.(cleanContent);
        if (onInsertBlockAfter) {
          onInsertBlockAfter('list', listProps);
        } else if (onChangeBlockType) {
          onChangeBlockType('list', listProps);
        }
        return;
      }
    }

    // Handle regular Enter key -> default paragraph newline or new block if ctrl/shift
    if (e.key === 'Enter' && !e.shiftKey) {
      // Allow regular newline \n within paragraph
      return;
    }

    // Handle Backspace on empty paragraph -> delete block
    if (e.key === 'Backspace' && (!block.content || block.content === '')) {
      e.preventDefault();
      onDeleteAndFocusPrevious?.();
      return;
    }

    // Arrow keys navigation between blocks
    if (e.key === 'ArrowUp') {
      const firstNewline = val.indexOf('\n');
      const isOnFirstLine = firstNewline === -1 || selStart <= firstNewline;
      if (isOnFirstLine && onFocusPrevious) {
        e.preventDefault();
        onFocusPrevious();
      }
    }

    if (e.key === 'ArrowDown') {
      const lastNewline = val.lastIndexOf('\n');
      const isOnLastLine = lastNewline === -1 || selStart > lastNewline;
      if (isOnLastLine && onFocusNext) {
        e.preventDefault();
        onFocusNext();
      }
    }
  };

  return (
    <div data-block-id={block.id} className="group relative flex items-start w-full transition-all">
      <textarea
        ref={textareaRef}
        rows={1}
        value={block.content || ''}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder='Gõ nội dung đoạn văn ("- " hoặc "1. " tạo danh sách List Block)...'
        className={cn(
          'w-full resize-none overflow-hidden bg-transparent leading-relaxed text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none text-sm font-medium transition-all m-0 p-0'
        )}
      />
    </div>
  );
};
