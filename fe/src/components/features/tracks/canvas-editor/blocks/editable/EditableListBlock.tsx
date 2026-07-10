'use client';

import React, { useRef, useEffect } from 'react';
import type { CanvasBlock, CanvasBlockProps, ListBlockItem } from '../../types';
import { cn } from '@/lib/utils';

function generateId(): string {
  return 'item_' + Math.random().toString(36).substring(2, 11);
}

export interface EditableListBlockProps {
  block: CanvasBlock;
  onChangeProps?: (newProps: CanvasBlockProps) => void;
  onInsertParagraphAfter?: (customProps?: CanvasBlockProps) => void;
  onDeleteAndFocusPrevious?: () => void;
  onFocusPrevious?: () => void;
  onFocusNext?: () => void;
}

export const EditableListBlock: React.FC<EditableListBlockProps> = ({
  block,
  onChangeProps,
  onInsertParagraphAfter,
  onDeleteAndFocusPrevious,
  onFocusPrevious,
  onFocusNext,
}) => {
  const ordered = Boolean(block.props.ordered);
  const items: ListBlockItem[] =
    block.props.items && block.props.items.length > 0
      ? block.props.items
      : [{ id: generateId(), content: '', level: 0 }];

  const itemRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

  // Adjust height for all item textareas
  useEffect(() => {
    itemRefs.current.forEach((el) => {
      if (el) {
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
      }
    });
  }, [items]);

  const updateItems = (nextItems: ListBlockItem[], focusIdx?: number, cursorPos?: number) => {
    onChangeProps?.({
      ...block.props,
      items: nextItems,
    });

    if (typeof focusIdx === 'number') {
      setTimeout(() => {
        const targetEl = itemRefs.current[focusIdx];
        if (targetEl) {
          targetEl.focus();
          if (typeof cursorPos === 'number') {
            targetEl.setSelectionRange(cursorPos, cursorPos);
          } else {
            const len = targetEl.value.length;
            targetEl.setSelectionRange(len, len);
          }
        }
      }, 0);
    }
  };

  const handleItemChange = (idx: number, newContent: string) => {
    const nextItems = items.map((it, i) => (i === idx ? { ...it, content: newContent } : it));
    onChangeProps?.({
      ...block.props,
      items: nextItems,
    });
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const el = itemRefs.current[idx];
    if (!el) return;

    const selStart = el.selectionStart || 0;
    const selEnd = el.selectionEnd || 0;
    const isAtStart = selStart === 0 && selEnd === 0;

    // 1. Ctrl + Enter (or Cmd + Enter): thoát khỏi list block và tạo 1 paragraph mới bên dưới
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onInsertParagraphAfter?.();
      return;
    }

    // 2. Shift + Enter: xuống dòng trong list item đó
    if (e.shiftKey && e.key === 'Enter') {
      // Do default textarea newline insertion or insert manually
      e.preventDefault();
      const currentVal = items[idx].content || '';
      const newVal = currentVal.slice(0, selStart) + '\n' + currentVal.slice(selEnd);
      const nextItems = items.map((it, i) => (i === idx ? { ...it, content: newVal } : it));
      updateItems(nextItems, idx, selStart + 1);
      return;
    }

    // 3. Enter ở 1 list item -> tạo 1 list item mới ngay bên dưới
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      const currentVal = items[idx].content || '';
      const beforeCursor = currentVal.slice(0, selStart);
      const afterCursor = currentVal.slice(selEnd);

      const newItem: ListBlockItem = {
        id: generateId(),
        content: afterCursor,
        level: items[idx].level,
      };

      const nextItems = [
        ...items.slice(0, idx),
        { ...items[idx], content: beforeCursor },
        newItem,
        ...items.slice(idx + 1),
      ];

      updateItems(nextItems, idx + 1, 0);
      return;
    }

    // 4. Tab / Shift+Tab: nâng bậc / hạ bậc
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        // Hạ bậc (outdent)
        if (items[idx].level > 0) {
          const nextItems = items.map((it, i) =>
            i === idx ? { ...it, level: Math.max(0, it.level - 1) } : it
          );
          updateItems(nextItems, idx, selStart);
        }
      } else {
        // Nâng bậc (indent) - tối đa sâu hơn item liền trước 1 cấp
        const maxAllowedLevel = idx > 0 ? items[idx - 1].level + 1 : 0;
        if (items[idx].level < maxAllowedLevel && items[idx].level < 5) {
          const nextItems = items.map((it, i) =>
            i === idx ? { ...it, level: it.level + 1 } : it
          );
          updateItems(nextItems, idx, selStart);
        }
      }
      return;
    }

    // 5. Backspace ở đầu list item
    if (e.key === 'Backspace' && isAtStart) {
      e.preventDefault();

      // Nếu đang thụt lề (level > 0) -> hạ bậc
      if (items[idx].level > 0) {
        const nextItems = items.map((it, i) =>
          i === idx ? { ...it, level: it.level - 1 } : it
        );
        updateItems(nextItems, idx, 0);
        return;
      }

      // Nếu level === 0:
      if (items[idx].content === '') {
        // Nếu chỉ còn 1 item duy nhất trong list -> xóa list block hoặc chuyển về paragraph
        if (items.length <= 1) {
          onDeleteAndFocusPrevious?.();
          return;
        }
        // Xóa item rỗng hiện tại, focus về item trước
        const targetIdx = Math.max(0, idx - 1);
        const nextItems = items.filter((_, i) => i !== idx);
        updateItems(nextItems, targetIdx);
        return;
      }

      // Nếu content không rỗng và không phải item đầu tiên -> gộp vào item trước đó
      if (idx > 0) {
        const prevContentLen = items[idx - 1].content.length;
        const mergedContent = items[idx - 1].content + items[idx].content;
        const nextItems = [
          ...items.slice(0, idx - 1),
          { ...items[idx - 1], content: mergedContent },
          ...items.slice(idx + 1),
        ];
        updateItems(nextItems, idx - 1, prevContentLen);
        return;
      }
    }

    // Arrow navigation at start/end
    if (e.key === 'ArrowUp') {
      const val = items[idx].content || '';
      const firstNewline = val.indexOf('\n');
      const isOnFirstLine = firstNewline === -1 || selStart <= firstNewline;
      if (isOnFirstLine) {
        if (idx > 0) {
          e.preventDefault();
          const prevEl = itemRefs.current[idx - 1];
          prevEl?.focus();
        } else if (onFocusPrevious) {
          e.preventDefault();
          onFocusPrevious();
        }
      }
    }

    if (e.key === 'ArrowDown') {
      const val = items[idx].content || '';
      const lastNewline = val.lastIndexOf('\n');
      const isOnLastLine = lastNewline === -1 || selStart > lastNewline;
      if (isOnLastLine) {
        if (idx < items.length - 1) {
          e.preventDefault();
          const nextEl = itemRefs.current[idx + 1];
          nextEl?.focus();
        } else if (onFocusNext) {
          e.preventDefault();
          onFocusNext();
        }
      }
    }
  };

  // Tính số thứ tự cho ordered list theo level hiện tại
  const getOrderedPrefix = (idx: number, level: number): string => {
    let count = 1;
    for (let i = idx - 1; i >= 0; i--) {
      if (items[i].level < level) break;
      if (items[i].level === level) count++;
    }
    if (level === 0) return `${count}.`;
    if (level === 1) {
      const char = String.fromCharCode(97 + ((count - 1) % 26));
      return `${char}.`;
    }
    if (level === 2) {
      return `${count})`;
    }
    return `(${count})`;
  };

  const getBulletSymbol = (level: number): string => {
    if (level === 0) return '•';
    if (level === 1) return '◦';
    return '▪';
  };

  return (
    <div data-block-id={block.id} className="w-full flex flex-col gap-1 py-1">
      {items.map((item, idx) => (
        <div
          key={item.id}
          style={{ paddingLeft: `${item.level * 24}px` }}
          className="group relative flex items-start w-full transition-all"
        >
          <span
            className={cn(
              'w-6 shrink-0 select-none font-bold mr-2 leading-relaxed',
              ordered
                ? 'text-right text-xs text-secondary pt-0.5'
                : 'text-center text-base text-primary'
            )}
          >
            {ordered ? getOrderedPrefix(idx, item.level) : getBulletSymbol(item.level)}
          </span>

          <textarea
            ref={(el) => {
              itemRefs.current[idx] = el;
            }}
            rows={1}
            value={item.content || ''}
            onChange={(e) => handleItemChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            placeholder="Nhập nội dung danh sách (Enter tạo mục mới, Tab nâng bậc, Ctrl+Enter thoát)..."
            className="w-full resize-none overflow-hidden bg-transparent leading-relaxed text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none text-sm font-medium transition-all m-0 p-0"
          />
        </div>
      ))}
    </div>
  );
};
