'use client';

import React, { useState, useRef, type ReactNode } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { focusBlockById } from './utils/focusUtils';

import type {
  CanvasBlock,
  CanvasBlockType,
  CanvasBlockProps,
  CanvasEditorMode,
  ViewportSize,
  SpacingVariant,
  ContainerLayoutMode,
} from './types';
import { SortableBlockWrapper } from './SortableBlockWrapper';
import { BlockRenderer } from './BlockRenderer';
import { CanvasBottomToolbar } from './toolbar/CanvasBottomToolbar';
import type { ToolbarTemplatePayload } from './toolbar/DraggableToolbarItem';

function generateId(): string {
  return 'block_' + Math.random().toString(36).substring(2, 11);
}

interface LessonCanvasEditorProps {
  initialBlocks: CanvasBlock[];
  onChangeBlocks?: (blocks: CanvasBlock[]) => void;
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  selectedBlockIds?: string[];
  onSelectBlockIds?: (ids: string[]) => void;
  headerSlot?: ReactNode;
  onSave?: () => void;
  onCancel?: () => void;
  saving?: boolean;
  canSave?: boolean;
  documentSpacing?: SpacingVariant;
}

export function LessonCanvasEditor({
  initialBlocks,
  onChangeBlocks,
  selectedBlockId,
  onSelectBlock,
  selectedBlockIds: controlledIds,
  onSelectBlockIds,
  headerSlot,
  onSave,
  onCancel,
  saving,
  canSave,
  documentSpacing = 'normal',
}: LessonCanvasEditorProps) {
  const [blocks, setBlocks] = useState<CanvasBlock[]>(
    initialBlocks.length > 0
      ? initialBlocks
      : [
          {
            id: generateId(),
            type: 'heading',
            content: 'Chào mừng đến với bài học',
            props: { level: 1 },
          },
        ]
  );

  const [mode, setMode] = useState<CanvasEditorMode>('edit');
  const [previewViewport, setPreviewViewport] = useState<ViewportSize>('desktop');
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [activeToolbarTemplate, setActiveToolbarTemplate] =
    useState<ToolbarTemplatePayload | null>(null);
  const [internalSelectedIds, setInternalSelectedIds] = useState<string[]>([]);

  const selectedIds = controlledIds ?? internalSelectedIds;
  const setSelectedIds = (next: string[]) => {
    setInternalSelectedIds(next);
    onSelectBlockIds?.(next);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const blocksRef = useRef<CanvasBlock[]>(blocks);
  blocksRef.current = blocks;

  const updateBlocks = (next: CanvasBlock[]) => {
    blocksRef.current = next;
    setBlocks(next);
    onChangeBlocks?.(next);
  };

  // Chèn block mới ngay sau block đang được chọn (selectedBlockId), nếu không có selection thì thêm vào cuối
  // Thêm block con vào trong một Container
  const handleAddChildToContainer = (containerId: string, childType: CanvasBlockType) => {
    const newChild: CanvasBlock = {
      id: generateId(),
      type: childType,
      props: {},
      content: '',
    };

    const updateRecursive = (list: CanvasBlock[]): CanvasBlock[] => {
      return list.map((item) => {
        if (item.id === containerId) {
          return {
            ...item,
            children: [...(item.children || []), newChild],
          };
        }
        if (item.children && item.children.length > 0) {
          return {
            ...item,
            children: updateRecursive(item.children),
          };
        }
        return item;
      });
    };

    const next = updateRecursive(blocks);
    updateBlocks(next);
    onSelectBlock(newChild.id);
    setSelectedIds([newChild.id]);
  };

  // Cập nhật block con bên trong một Container
  const handleUpdateChildBlock = (
    containerId: string,
    childId: string,
    updatedChild: CanvasBlock
  ) => {
    const updateRecursive = (list: CanvasBlock[]): CanvasBlock[] => {
      return list.map((item) => {
        if (item.id === containerId) {
          return {
            ...item,
            children: (item.children || []).map((ch) =>
              ch.id === childId ? updatedChild : ch
            ),
          };
        }
        if (item.children && item.children.length > 0) {
          return {
            ...item,
            children: updateRecursive(item.children),
          };
        }
        return item;
      });
    };

    const next = updateRecursive(blocksRef.current);
    updateBlocks(next);
  };

  const handleDeleteChildBlock = (containerId: string, childId: string) => {
    const updateRecursive = (list: CanvasBlock[]): CanvasBlock[] => {
      return list.map((item) => {
        if (item.id === containerId) {
          return {
            ...item,
            children: (item.children || []).filter((ch) => ch.id !== childId),
          };
        }
        if (item.children && item.children.length > 0) {
          return { ...item, children: updateRecursive(item.children) };
        }
        return item;
      });
    };
    updateBlocks(updateRecursive(blocks));
    setSelectedIds(selectedIds.filter((id) => id !== childId));
  };

  const handleDuplicateChildBlock = (containerId: string, childId: string) => {
    const updateRecursive = (list: CanvasBlock[]): CanvasBlock[] => {
      return list.map((item) => {
        if (item.id === containerId) {
          const chs = item.children || [];
          const idx = chs.findIndex((ch) => ch.id === childId);
          if (idx === -1) return item;
          const target = chs[idx];
          const cloned: CanvasBlock = { ...target, id: generateId() };
          const newChildren = [...chs];
          newChildren.splice(idx + 1, 0, cloned);
          return { ...item, children: newChildren };
        }
        if (item.children && item.children.length > 0) {
          return { ...item, children: updateRecursive(item.children) };
        }
        return item;
      });
    };
    updateBlocks(updateRecursive(blocks));
  };

  const handleInsertChildParagraphAfter = (
    containerId: string,
    childId: string,
    customProps: CanvasBlockProps = {}
  ) => {
    const newChild: CanvasBlock = {
      id: generateId(),
      type: 'paragraph',
      props: customProps,
      content: '',
    };

    const updateRecursive = (list: CanvasBlock[]): CanvasBlock[] => {
      return list.map((item) => {
        if (item.id === containerId) {
          const chs = item.children || [];
          const idx = chs.findIndex((c) => c.id === childId);
          if (idx === -1) return item;
          const nextChs = [...chs];
          nextChs.splice(idx + 1, 0, newChild);
          return {
            ...item,
            children: nextChs,
          };
        }
        if (item.children && item.children.length > 0) {
          return {
            ...item,
            children: updateRecursive(item.children),
          };
        }
        return item;
      });
    };

    const next = updateRecursive(blocksRef.current);
    updateBlocks(next);
    onSelectBlock(newChild.id);
    setSelectedIds([newChild.id]);

    focusBlockById(newChild.id);
  };

  const handleMoveChildBlockUp = (containerId: string, childIdx: number) => {
    if (childIdx <= 0) return;
    const updateRecursive = (list: CanvasBlock[]): CanvasBlock[] => {
      return list.map((item) => {
        if (item.id === containerId) {
          const newChildren = [...(item.children || [])];
          const temp = newChildren[childIdx - 1];
          newChildren[childIdx - 1] = newChildren[childIdx];
          newChildren[childIdx] = temp;
          return { ...item, children: newChildren };
        }
        if (item.children && item.children.length > 0) {
          return { ...item, children: updateRecursive(item.children) };
        }
        return item;
      });
    };
    updateBlocks(updateRecursive(blocks));
  };

  const handleMoveChildBlockDown = (containerId: string, childIdx: number) => {
    const updateRecursive = (list: CanvasBlock[]): CanvasBlock[] => {
      return list.map((item) => {
        if (item.id === containerId) {
          const newChildren = [...(item.children || [])];
          if (childIdx >= newChildren.length - 1) return item;
          const temp = newChildren[childIdx + 1];
          newChildren[childIdx + 1] = newChildren[childIdx];
          newChildren[childIdx] = temp;
          return { ...item, children: newChildren };
        }
        if (item.children && item.children.length > 0) {
          return { ...item, children: updateRecursive(item.children) };
        }
        return item;
      });
    };
    updateBlocks(updateRecursive(blocks));
  };

  // Chèn block mới ngay sau block đang được chọn (selectedBlockId), nếu chọn container thì chèn vào trong container
  const handleAddBlock = (
    type: CanvasBlockType,
    props: CanvasBlockProps = {},
    content: string = ''
  ) => {
    const newBlock: CanvasBlock = {
      id: generateId(),
      type,
      props,
      content,
    };

    if (selectedBlockId) {
      const findBlock = (list: CanvasBlock[], id: string): CanvasBlock | undefined => {
        for (const item of list) {
          if (item.id === id) return item;
          if (item.children) {
            const found = findBlock(item.children, id);
            if (found) return found;
          }
        }
        return undefined;
      };

      const selBlock = findBlock(blocksRef.current, selectedBlockId);
      if (selBlock && selBlock.type === 'container') {
        handleAddChildToContainer(selBlock.id, type);
        return;
      }

      const insertAfterRecursive = (
        list: CanvasBlock[]
      ): { updated: CanvasBlock[]; inserted: boolean } => {
        const idx = list.findIndex((b) => b.id === selectedBlockId);
        if (idx !== -1) {
          const next = [
            ...list.slice(0, idx + 1),
            newBlock,
            ...list.slice(idx + 1),
          ];
          return { updated: next, inserted: true };
        }

        let inserted = false;
        const nextList = list.map((item) => {
          if (item.children && item.children.length > 0 && !inserted) {
            const res = insertAfterRecursive(item.children);
            if (res.inserted) {
              inserted = true;
              return { ...item, children: res.updated };
            }
          }
          return item;
        });

        return { updated: nextList, inserted };
      };

      const res = insertAfterRecursive(blocksRef.current);
      if (res.inserted) {
        updateBlocks(res.updated);
        onSelectBlock(newBlock.id);
        setSelectedIds([newBlock.id]);
        return;
      }
    }

    const next = [...blocksRef.current, newBlock];
    updateBlocks(next);
    onSelectBlock(newBlock.id);
    setSelectedIds([newBlock.id]);
  };

  // Tạo block text cố định vào cuối bài học
  const handleAddBlockAtEnd = (
    type: CanvasBlockType = 'paragraph',
    props: CanvasBlockProps = {},
    content: string = ''
  ) => {
    const newBlock: CanvasBlock = {
      id: generateId(),
      type,
      props,
      content,
    };
    const next = [...blocks, newBlock];
    updateBlocks(next);
    onSelectBlock(newBlock.id);
    setSelectedIds([newBlock.id]);
  };

  // Keyboard navigation: Enter on paragraph/heading/list inserts a new paragraph below
  const handleInsertParagraphAfter = (idx: number, customProps: CanvasBlockProps = {}) => {
    const currentBlocks = blocksRef.current;
    const newBlock: CanvasBlock = {
      id: generateId(),
      type: 'paragraph',
      props: customProps,
      content: '',
    };
    const next = [
      ...currentBlocks.slice(0, idx + 1),
      newBlock,
      ...currentBlocks.slice(idx + 1),
    ];
    updateBlocks(next);
    onSelectBlock(newBlock.id);
    setSelectedIds([newBlock.id]);

    focusBlockById(newBlock.id);
  };

  const handleInsertBlockAfter = (
    idx: number,
    type: CanvasBlockType,
    customProps: CanvasBlockProps = {}
  ) => {
    const currentBlocks = blocksRef.current;
    const newBlock: CanvasBlock = {
      id: generateId(),
      type,
      props: customProps,
      content: '',
    };
    const next = [
      ...currentBlocks.slice(0, idx + 1),
      newBlock,
      ...currentBlocks.slice(idx + 1),
    ];
    updateBlocks(next);
    onSelectBlock(newBlock.id);
    setSelectedIds([newBlock.id]);

    focusBlockById(newBlock.id);
  };

  // Keyboard navigation: Backspace on empty block deletes it and focuses previous
  const handleDeleteAndFocusPrevious = (idx: number) => {
    const currentBlocks = blocksRef.current;
    if (currentBlocks.length <= 1) return;
    const targetId = currentBlocks[idx].id;
    const prevIdx = Math.max(0, idx - 1);
    const prevBlockId = currentBlocks[prevIdx].id;
    const next = currentBlocks.filter((b) => b.id !== targetId);
    updateBlocks(next);
    onSelectBlock(prevBlockId);
    setSelectedIds([prevBlockId]);

    focusBlockById(prevBlockId);
  };

  const handleFocusPreviousBlock = (idx: number) => {
    const currentBlocks = blocksRef.current;
    if (idx <= 0) {
      const descEl = document.querySelector<HTMLElement>('[data-header-input="description"]') ||
        document.querySelector<HTMLElement>('[data-header-input="title"]');
      descEl?.focus();
      return;
    }
    const targetId = currentBlocks[idx - 1].id;
    onSelectBlock(targetId);
    setSelectedIds([targetId]);

    focusBlockById(targetId);
  };

  const handleFocusNextBlock = (idx: number) => {
    const currentBlocks = blocksRef.current;
    if (idx >= currentBlocks.length - 1) return;
    const targetId = currentBlocks[idx + 1].id;
    onSelectBlock(targetId);
    setSelectedIds([targetId]);

    focusBlockById(targetId);
  };

  // Convert block type & ensure newly rendered input/textarea regains focus
  const handleChangeBlockType = (
    blockId: string,
    newType: CanvasBlockType,
    newProps: CanvasBlockProps = {}
  ) => {
    const updateRecursive = (list: CanvasBlock[]): CanvasBlock[] => {
      return list.map((item) => {
        if (item.id === blockId) {
          return { ...item, type: newType, props: { ...item.props, ...newProps } };
        }
        if (item.children && item.children.length > 0) {
          return { ...item, children: updateRecursive(item.children) };
        }
        return item;
      });
    };

    updateBlocks(updateRecursive(blocksRef.current));
    onSelectBlock(blockId);
    setSelectedIds([blockId]);

    focusBlockById(blockId);
  };

  const lastSelectedIdRef = useRef<string | null>(null);

  const handleToggleMultiSelect = (blockId: string, e?: React.MouseEvent) => {
    if (e?.shiftKey && lastSelectedIdRef.current) {
      const currentBlocks = blocksRef.current;
      const startIdx = currentBlocks.findIndex((b) => b.id === lastSelectedIdRef.current);
      const endIdx = currentBlocks.findIndex((b) => b.id === blockId);

      if (startIdx !== -1 && endIdx !== -1) {
        const low = Math.min(startIdx, endIdx);
        const high = Math.max(startIdx, endIdx);
        const rangeIds = currentBlocks.slice(low, high + 1).map((b) => b.id);
        const next = Array.from(new Set([...selectedIds, ...rangeIds]));
        setSelectedIds(next);
        onSelectBlock(blockId);
        lastSelectedIdRef.current = blockId;
        return;
      }
    }

    if (selectedIds.includes(blockId)) {
      const next = selectedIds.filter((id) => id !== blockId);
      setSelectedIds(next);
      if (selectedBlockId === blockId) {
        onSelectBlock(next[0] || null);
      }
      lastSelectedIdRef.current = next[next.length - 1] || null;
    } else {
      const next = [...selectedIds, blockId];
      setSelectedIds(next);
      onSelectBlock(blockId);
      lastSelectedIdRef.current = blockId;
    }
  };

  const handleWrapSelectedBlocks = (layoutMode: ContainerLayoutMode) => {
    const targetIds =
      selectedIds.length > 0 ? selectedIds : selectedBlockId ? [selectedBlockId] : [];
    if (targetIds.length === 0) return;

    const wrapRecursive = (
      list: CanvasBlock[]
    ): { updatedList: CanvasBlock[]; wrappedId: string | null } => {
      const matchingIndices: number[] = [];
      list.forEach((b, idx) => {
        if (targetIds.includes(b.id)) matchingIndices.push(idx);
      });

      if (matchingIndices.length > 0) {
        const firstIdx = Math.min(...matchingIndices);
        const blocksToWrap = list.filter((b) => targetIds.includes(b.id));
        const remaining = list.filter((b) => !targetIds.includes(b.id));

        const wrapperBlock: CanvasBlock = {
          id: generateId(),
          type: 'container',
          props: {
            semanticTag: 'div',
            layoutMode,
            gap: 'md',
          },
          content: '',
          children: blocksToWrap,
        };

        const nextList = [
          ...remaining.slice(0, firstIdx),
          wrapperBlock,
          ...remaining.slice(firstIdx),
        ];
        return { updatedList: nextList, wrappedId: wrapperBlock.id };
      }

      let foundWrappedId: string | null = null;
      const updatedChildren = list.map((item) => {
        if (item.children && item.children.length > 0 && !foundWrappedId) {
          const res = wrapRecursive(item.children);
          if (res.wrappedId) {
            foundWrappedId = res.wrappedId;
            return { ...item, children: res.updatedList };
          }
        }
        return item;
      });

      return { updatedList: updatedChildren, wrappedId: foundWrappedId };
    };

    const result = wrapRecursive(blocksRef.current);
    if (result.wrappedId) {
      updateBlocks(result.updatedList);
      setSelectedIds([result.wrappedId]);
      onSelectBlock(result.wrappedId);
    }
  };

  const handleUnwrapBlock = (wrapperId: string) => {
    const unwrapRecursive = (
      list: CanvasBlock[]
    ): { updatedList: CanvasBlock[]; unpackedIds: string[] } => {
      const idx = list.findIndex((b) => b.id === wrapperId);
      if (idx !== -1) {
        const wrapper = list[idx];
        const childrenToUnpack = wrapper.children || [];
        const next = [
          ...list.slice(0, idx),
          ...childrenToUnpack,
          ...list.slice(idx + 1),
        ];
        return {
          updatedList: next,
          unpackedIds: childrenToUnpack.map((c) => c.id),
        };
      }

      let unpacked: string[] = [];
      const nextList = list.map((item) => {
        if (item.children && item.children.length > 0 && unpacked.length === 0) {
          const res = unwrapRecursive(item.children);
          if (res.unpackedIds.length > 0) {
            unpacked = res.unpackedIds;
            return { ...item, children: res.updatedList };
          }
        }
        return item;
      });

      return { updatedList: nextList, unpackedIds: unpacked };
    };

    const result = unwrapRecursive(blocksRef.current);
    if (result.unpackedIds.length > 0) {
      updateBlocks(result.updatedList);
      setSelectedIds(result.unpackedIds);
      if (result.unpackedIds[0]) {
        onSelectBlock(result.unpackedIds[0]);
      }
    }
  };

  const handleDuplicateBlock = (blockId: string) => {
    const targetIdx = blocks.findIndex((b) => b.id === blockId);
    if (targetIdx === -1) return;
    const target = blocks[targetIdx];
    const cloned: CanvasBlock = {
      ...target,
      id: generateId(),
      props: { ...target.props },
    };
    const next = [
      ...blocks.slice(0, targetIdx + 1),
      cloned,
      ...blocks.slice(targetIdx + 1),
    ];
    updateBlocks(next);
    onSelectBlock(cloned.id);
    setSelectedIds([cloned.id]);
  };

  const handleDeleteBlock = (blockId: string) => {
    const next = blocks.filter((b) => b.id !== blockId);
    updateBlocks(next);
    if (selectedBlockId === blockId) {
      onSelectBlock(null);
    }
    setSelectedIds(selectedIds.filter((id) => id !== blockId));
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    updateBlocks(arrayMove(blocks, index, index - 1));
  };

  const handleMoveDown = (index: number) => {
    if (index >= blocks.length - 1) return;
    updateBlocks(arrayMove(blocks, index, index + 1));
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const data = active.data.current as ToolbarTemplatePayload | undefined;

    if (data && data.isToolbarTemplate) {
      setActiveToolbarTemplate(data);
      setActiveDragId(null);
    } else {
      setActiveDragId(active.id.toString());
      setActiveToolbarTemplate(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (activeToolbarTemplate) {
      const newBlock: CanvasBlock = {
        id: generateId(),
        type: activeToolbarTemplate.type,
        props: activeToolbarTemplate.props,
        content: activeToolbarTemplate.content,
      };

      if (over && over.id) {
        const overIndex = blocks.findIndex((b) => b.id === over.id.toString());
        if (overIndex !== -1) {
          const next = [
            ...blocks.slice(0, overIndex + 1),
            newBlock,
            ...blocks.slice(overIndex + 1),
          ];
          updateBlocks(next);
          onSelectBlock(newBlock.id);
          setSelectedIds([newBlock.id]);
          setActiveToolbarTemplate(null);
          return;
        }
      }
      updateBlocks([...blocks, newBlock]);
      onSelectBlock(newBlock.id);
      setSelectedIds([newBlock.id]);
      setActiveToolbarTemplate(null);
      return;
    }

    setActiveDragId(null);
    if (!over || active.id === over.id) return;

    const oldIndex = blocks.findIndex((b) => b.id === active.id.toString());
    const newIndex = blocks.findIndex((b) => b.id === over.id.toString());

    if (oldIndex !== -1 && newIndex !== -1) {
      updateBlocks(arrayMove(blocks, oldIndex, newIndex));
    }
  };

  const handleBlockChangeContent = (blockId: string, newContent: string) => {
    const updateRecursive = (list: CanvasBlock[]): CanvasBlock[] => {
      return list.map((item) => {
        if (item.id === blockId) return { ...item, content: newContent };
        if (item.children && item.children.length > 0) {
          return { ...item, children: updateRecursive(item.children) };
        }
        return item;
      });
    };
    updateBlocks(updateRecursive(blocksRef.current));
  };

  const handleBlockChangeProps = (blockId: string, newProps: CanvasBlockProps) => {
    const updateRecursive = (list: CanvasBlock[]): CanvasBlock[] => {
      return list.map((item) => {
        if (item.id === blockId) return { ...item, props: newProps };
        if (item.children && item.children.length > 0) {
          return { ...item, children: updateRecursive(item.children) };
        }
        return item;
      });
    };
    updateBlocks(updateRecursive(blocksRef.current));
  };

  const handleBlockChangeContentAndProps = (
    blockId: string,
    newContent: string,
    newProps: CanvasBlockProps
  ) => {
    const updateRecursive = (list: CanvasBlock[]): CanvasBlock[] => {
      return list.map((item) => {
        if (item.id === blockId) return { ...item, content: newContent, props: newProps };
        if (item.children && item.children.length > 0) {
          return { ...item, children: updateRecursive(item.children) };
        }
        return item;
      });
    };
    updateBlocks(updateRecursive(blocksRef.current));
  };

  return (
    <div className="relative flex min-h-full w-full flex-col pb-12">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Canvas Workspace Viewport Container */}
        <div className="flex w-full flex-1 justify-center px-6 py-6">
          <div
            className={cn(
              'transition-all duration-300 flex flex-col',
              documentSpacing === 'compact' ? 'gap-3' : documentSpacing === 'relaxed' ? 'gap-8' : 'gap-5',
              mode === 'preview' &&
                previewViewport === 'tablet' &&
                'w-[768px] max-w-full rounded-3xl border border-outline-variant bg-surface p-6 shadow-xl',
              mode === 'preview' &&
                previewViewport === 'mobile' &&
                'w-[375px] max-w-full rounded-[36px] border-4 border-outline-variant bg-surface p-4 shadow-2xl',
              (mode === 'edit' || (mode === 'preview' && previewViewport === 'desktop')) &&
                'w-full max-w-4xl'
            )}
          >
            {/* Viewport Badge in Simulator */}
            {mode === 'preview' && previewViewport !== 'desktop' && (
              <div className="mb-1 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant/70">
                <Icon
                  icon={
                    previewViewport === 'tablet'
                      ? 'lucide:tablet'
                      : 'lucide:smartphone'
                  }
                  className="h-4 w-4"
                />
                <span>Mô phỏng kích thước {previewViewport.toUpperCase()}</span>
              </div>
            )}

            {/* HEADER SLOT (Tiêu đề, giải thích, estimates nằm ngay trên đầu trong khối Canvas) */}
            {headerSlot && (
              <div className="w-full">
                {headerSlot}
              </div>
            )}

            {/* Block List / Sortable Canvas Area */}
            {blocks.length === 0 ? (
              <div
                onClick={() => handleAddBlock('paragraph', {}, '')}
                className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-outline-variant py-16 text-center hover:border-primary/60 hover:bg-surface-variant/10 transition-all"
              >
                <Icon icon="lucide:plus-circle" className="mb-2 h-8 w-8 text-primary" />
                <h3 className="font-semibold text-on-surface">Bài học chưa có nội dung</h3>
                <p className="text-xs text-on-surface-variant">
                  Bấm vào đây hoặc chọn công cụ từ thanh bên dưới để bắt đầu soạn bài học
                </p>
              </div>
            ) : (
              <SortableContext
                items={blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                {blocks.map((block, idx) => {
                  if (mode === 'preview') {
                    return (
                      <div key={block.id} className="my-1">
                        <BlockRenderer block={block} mode="preview" />
                      </div>
                    );
                  }

                  const isSelected = selectedBlockId === block.id;
                  const isMultiSelected = selectedIds.includes(block.id);

                  return (
                    <SortableBlockWrapper
                      key={block.id}
                      block={block}
                      selected={isSelected}
                      multiSelected={isMultiSelected}
                      onSelect={() => {
                        onSelectBlock(block.id);
                        setSelectedIds([block.id]);
                      }}
                      onToggleMultiSelect={(e) => handleToggleMultiSelect(block.id, e)}
                      onDuplicate={() => handleDuplicateBlock(block.id)}
                      onDelete={() => handleDeleteBlock(block.id)}
                      onUnwrap={
                        block.type === 'container' ? () => handleUnwrapBlock(block.id) : undefined
                      }
                      onMoveUp={idx > 0 ? () => handleMoveUp(idx) : undefined}
                      onMoveDown={
                        idx < blocks.length - 1 ? () => handleMoveDown(idx) : undefined
                      }
                      onInsertParagraphAfter={() => handleInsertParagraphAfter(idx)}
                    >
                      <BlockRenderer
                        block={block}
                        mode="edit"
                        onChangeContent={(c) => handleBlockChangeContent(block.id, c)}
                        onChangeProps={(p) => handleBlockChangeProps(block.id, p)}
                        onChangeContentAndProps={(c, p) => handleBlockChangeContentAndProps(block.id, c, p)}
                        onInsertParagraphAfter={(customProps) => handleInsertParagraphAfter(idx, customProps)}
                        onInsertBlockAfter={(type, customProps) => handleInsertBlockAfter(idx, type, customProps)}
                        onDeleteAndFocusPrevious={() => handleDeleteAndFocusPrevious(idx)}
                        onChangeBlockType={(newType, newProps) =>
                          handleChangeBlockType(block.id, newType, newProps)
                        }
                        onAddChildToContainer={handleAddChildToContainer}
                        onUpdateChildBlock={handleUpdateChildBlock}
                        onDeleteChildBlock={handleDeleteChildBlock}
                        onDuplicateChildBlock={handleDuplicateChildBlock}
                        onInsertChildParagraphAfter={handleInsertChildParagraphAfter}
                        onMoveChildBlockUp={handleMoveChildBlockUp}
                        onMoveChildBlockDown={handleMoveChildBlockDown}
                        onSelectBlock={(id) => {
                          onSelectBlock(id);
                          setSelectedIds([id]);
                        }}
                        selectedBlockId={selectedBlockId}
                        selectedIds={selectedIds}
                        onToggleMultiSelect={handleToggleMultiSelect}
                        onFocusPrevious={() => handleFocusPreviousBlock(idx)}
                        onFocusNext={() => handleFocusNextBlock(idx)}
                      />
                    </SortableBlockWrapper>
                  );
                })}
              </SortableContext>
            )}

            {/* Mục cố định ở cuối chuyên dùng để bấm tạo block text mới */}
            {mode === 'edit' && blocks.length > 0 && (
              <button
                type="button"
                onClick={() => handleAddBlockAtEnd('paragraph', {}, '')}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-outline-variant/60 bg-surface/30 py-3.5 text-xs font-semibold text-on-surface-variant hover:border-primary hover:bg-primary/5 hover:text-primary transition-all shadow-sm"
              >
                <Icon icon="lucide:plus" className="h-4 w-4" />
                <span>+ Thêm đoạn văn bản vào cuối bài học (Click để tạo block mới ở cuối)</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Dragging Clone Overlay */}
        <DragOverlay>
          {activeToolbarTemplate && (
            <div className="w-96 rounded-2xl border-2 border-primary bg-surface/95 p-4 shadow-2xl backdrop-blur-md rotate-1">
              <div className="mb-2 flex items-center gap-2 text-xs font-bold text-primary">
                <Icon icon="lucide:plus-circle" className="h-4 w-4" />
                <span>Đang kéo thả tạo mới: {activeToolbarTemplate.label}</span>
              </div>
              <div className="opacity-90 pointer-events-none">
                <BlockRenderer
                  block={{
                    id: 'preview_drag',
                    type: activeToolbarTemplate.type,
                    props: activeToolbarTemplate.props,
                    content: activeToolbarTemplate.content,
                  }}
                  mode="preview"
                />
              </div>
            </div>
          )}

          {activeDragId && !activeToolbarTemplate && (
            <div className="w-full max-w-4xl rounded-2xl border-2 border-primary bg-surface/90 p-4 shadow-2xl backdrop-blur-md opacity-90">
              {(() => {
                const draggedBlock = blocks.find((b) => b.id === activeDragId);
                return draggedBlock ? (
                  <BlockRenderer block={draggedBlock} mode="edit" />
                ) : null;
              })()}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Unified Categorical Bottom Toolbar registered in FeatureFooterPortal */}
      <CanvasBottomToolbar
        mode={mode}
        previewViewport={previewViewport}
        onChangeMode={setMode}
        onChangeViewport={setPreviewViewport}
        onAddBlock={handleAddBlock}
        selectedIds={selectedIds}
        selectedBlockIsContainer={
          selectedIds.length === 1 &&
          blocks.find((b) => b.id === selectedIds[0])?.type === 'container'
        }
        onWrapSelected={handleWrapSelectedBlocks}
        onUnwrapSelected={
          selectedIds.length === 1 ? () => handleUnwrapBlock(selectedIds[0]) : undefined
        }
        onSave={onSave}
        onCancel={onCancel}
        saving={saving}
        canSave={canSave}
      />
    </div>
  );
}
