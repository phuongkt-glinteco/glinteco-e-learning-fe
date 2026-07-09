'use client';

import React, { useRef, useEffect } from 'react';
import type { CanvasBlock, CanvasBlockType, CanvasBlockProps } from '../../types';
import { cn } from '@/lib/utils';

export interface EditableRichTextBlockProps {
  block: CanvasBlock;
  onChangeContent?: (newContent: string) => void;
  onChangeProps?: (newProps: CanvasBlockProps) => void;
  onChangeContentAndProps?: (content: string, newProps: CanvasBlockProps) => void;
  onInsertParagraphAfter?: (customProps?: CanvasBlockProps) => void;
  onDeleteAndFocusPrevious?: () => void;
  onChangeBlockType?: (newType: CanvasBlockType, newProps?: CanvasBlockProps) => void;
  onFocusPrevious?: () => void;
  onFocusNext?: () => void;
  [key: string]: unknown;
}

export const EditableRichTextBlock: React.FC<EditableRichTextBlockProps> = ({
  block,
  onChangeContent,
  onChangeProps,
  onChangeContentAndProps,
  onInsertParagraphAfter,
  onDeleteAndFocusPrevious,
  onChangeBlockType,
  onFocusPrevious,
  onFocusNext,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const listType = block.props.listType;
  const indentLevel = block.props.indentLevel || 0;
  const listStart = block.props.listStart || 1;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [block.content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;

    // Auto-detect Bullet list (e.g. typing "- ", "* ", "+ ")
    const bulletMatch = val.match(/^([-*+])\s([\s\S]*)$/);
    if (bulletMatch && !listType) {
      const newProps = {
        ...block.props,
        listType: 'bullet' as const,
        indentLevel: indentLevel,
      };
      if (onChangeContentAndProps) {
        onChangeContentAndProps(bulletMatch[2], newProps);
      } else {
        onChangeProps?.(newProps);
        onChangeContent?.(bulletMatch[2]);
      }
      return;
    }

    // Auto-detect Ordered list (e.g. typing "1. ", "a. ")
    const orderedMatch = val.match(/^(\d+)[.)]\s([\s\S]*)$/);
    if (orderedMatch && !listType) {
      const num = parseInt(orderedMatch[1], 10) || 1;
      const newProps = {
        ...block.props,
        listType: 'ordered' as const,
        listStart: num,
        indentLevel: indentLevel,
      };
      if (onChangeContentAndProps) {
        onChangeContentAndProps(orderedMatch[2], newProps);
      } else {
        onChangeProps?.(newProps);
        onChangeContent?.(orderedMatch[2]);
      }
      return;
    }

    onChangeContent?.(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if ((e.key === 'b' || e.key === 'B') && onChangeBlockType) {
        e.preventDefault();
        onChangeBlockType('heading', { level: 1 });
        return;
      }
      if (e.key === 'Enter' && onInsertParagraphAfter) {
        e.preventDefault();
        onInsertParagraphAfter({ indentLevel });
        return;
      }
    }

    // Handle Tab and Shift+Tab for indentation & lists
    if (e.key === 'Tab') {
      const selStart = textareaRef.current?.selectionStart || 0;
      const selEnd = textareaRef.current?.selectionEnd || 0;

      if (listType || (selStart === 0 && selEnd === 0)) {
        e.preventDefault();
        if (e.shiftKey) {
          if (indentLevel > 0) {
            onChangeProps?.({ ...block.props, indentLevel: indentLevel - 1 });
          } else if (listType) {
            onChangeProps?.({ ...block.props, listType: undefined, indentLevel: 0 });
          }
        } else {
          onChangeProps?.({ ...block.props, indentLevel: Math.min(3, indentLevel + 1) });
        }
        return;
      }

      e.preventDefault();
      const currentVal = block.content || '';
      const newVal = currentVal.slice(0, selStart) + '\t' + currentVal.slice(selEnd);
      onChangeContent?.(newVal);
      setTimeout(() => {
        textareaRef.current?.setSelectionRange(selStart + 1, selStart + 1);
      }, 0);
      return;
    }

    // Handle regular Enter key (without Shift)
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
      // Case 1: Currently in a List -> Enter tạo item danh sách mới hoặc thoát danh sách nếu rỗng
      if (listType) {
        e.preventDefault();
        const currentVal = (block.content || '').trim();
        if (!currentVal) {
          // Empty item -> exit list or reduce indent
          if (indentLevel > 0) {
            onChangeProps?.({ ...block.props, indentLevel: indentLevel - 1 });
          } else {
            onChangeProps?.({ ...block.props, listType: undefined, indentLevel: 0 });
          }
          return;
        }

        const nextProps: CanvasBlockProps = {
          listType,
          indentLevel,
        };
        if (listType === 'ordered') {
          nextProps.listStart = listStart + 1;
        }
        onInsertParagraphAfter?.(nextProps);
        return;
      }

      // Case 2: Regular Paragraph -> Cho phép xuống nhiều dòng trong 1 paragraph
      return;
    }

    // Handle Backspace on empty block
    if (e.key === 'Backspace' && (!block.content || block.content === '')) {
      e.preventDefault();
      if (listType || indentLevel > 0) {
        if (indentLevel > 0) {
          onChangeProps?.({ ...block.props, indentLevel: indentLevel - 1 });
        } else {
          onChangeProps?.({ ...block.props, listType: undefined, indentLevel: 0 });
        }
        return;
      }
      onDeleteAndFocusPrevious?.();
      return;
    }

    const val = block.content || '';
    const selStart = textareaRef.current?.selectionStart || 0;

    // Khi ở dòng đầu mà bấm mũi tên lên thì nhảy lên block trên
    if (e.key === 'ArrowUp') {
      const firstNewline = val.indexOf('\n');
      const isOnFirstLine = firstNewline === -1 || selStart <= firstNewline;
      if (isOnFirstLine && onFocusPrevious) {
        e.preventDefault();
        onFocusPrevious();
      }
    }

    // Khi ở dòng cuối mà bấm mũi tên xuống thì nhảy xuống block dưới
    if (e.key === 'ArrowDown') {
      const lastNewline = val.lastIndexOf('\n');
      const isOnLastLine = lastNewline === -1 || selStart > lastNewline;
      if (isOnLastLine && onFocusNext) {
        e.preventDefault();
        onFocusNext();
      }
    }
  };

  const renderListIndicator = () => {
    if (!listType) return null;

    if (listType === 'bullet') {
      let symbol = '•';
      if (indentLevel === 1) symbol = '◦';
      if (indentLevel >= 2) symbol = '▪';

      return (
        <span className="w-6 shrink-0 select-none text-center font-bold text-primary mr-2 text-base leading-relaxed">
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
        <span className="w-6 shrink-0 select-none text-right font-bold text-secondary mr-2 text-sm leading-relaxed">
          {label}
        </span>
      );
    }

    return null;
  };

  return (
    <div
      data-block-id={block.id}
      style={{ paddingLeft: `${indentLevel * 24}px` }}
      className="group relative flex items-start w-full transition-all"
    >
      {renderListIndicator()}
      <textarea
        ref={textareaRef}
        rows={1}
        value={block.content || ''}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={
          listType === 'bullet'
            ? 'Nhập mục danh sách (Enter xuống dòng, Tab/Shift+Tab đổi cấp)...'
            : listType === 'ordered'
              ? 'Nhập mục số thứ tự (Enter xuống dòng, Tab/Shift+Tab đổi cấp)...'
              : 'Gõ nội dung ("- " tạo Bullet, "1. " tạo Số, Ctrl+B đổi Heading)...'
        }
        className={cn(
          'w-full resize-none overflow-hidden bg-transparent leading-relaxed text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none text-sm font-medium transition-all m-0 p-0'
        )}
      />
    </div>
  );
}
