'use client';

import React from 'react';
import type { CanvasBlock, CanvasEditorMode, CanvasBlockProps, CanvasBlockType } from './types';
import { SortableBlockWrapper } from './SortableBlockWrapper';

// Editable blocks
import { EditableHeadingBlock } from './blocks/editable/EditableHeadingBlock';
import { EditableRichTextBlock } from './blocks/editable/EditableRichTextBlock';
import { EditableListBlock } from './blocks/editable/EditableListBlock';
import { EditableCalloutBlock } from './blocks/editable/EditableCalloutBlock';
import { EditableCodeBlock } from './blocks/editable/EditableCodeBlock';
import { EditableTableBlock } from './blocks/editable/EditableTableBlock';
import { EditableEmbedBlock } from './blocks/editable/EditableEmbedBlock';
import { EditableLinkBlock } from './blocks/editable/EditableLinkBlock';
import { EditableContainerBlock } from './blocks/editable/EditableContainerBlock';

// Learner view blocks
import { LearnerHeadingBlock } from './blocks/learner/LearnerHeadingBlock';
import { LearnerRichTextBlock } from './blocks/learner/LearnerRichTextBlock';
import { LearnerListBlock } from './blocks/learner/LearnerListBlock';
import { LearnerCalloutBlock } from './blocks/learner/LearnerCalloutBlock';
import { LearnerCodeBlock } from './blocks/learner/LearnerCodeBlock';
import { LearnerTableBlock } from './blocks/learner/LearnerTableBlock';
import { LearnerLinkBlock } from './blocks/learner/LearnerLinkBlock';
import { LearnerContainerBlock } from './blocks/learner/LearnerContainerBlock';
import { TruncateWrapper } from './blocks/learner/TruncateWrapper';

interface BlockRendererProps {
  block: CanvasBlock;
  mode: CanvasEditorMode;
  onChangeContent?: (content: string) => void;
  onChangeProps?: (newProps: CanvasBlockProps) => void;
  onChangeContentAndProps?: (content: string, newProps: CanvasBlockProps) => void;
  onInsertParagraphAfter?: (customProps?: CanvasBlockProps) => void;
  onInsertBlockAfter?: (type: CanvasBlockType, customProps?: CanvasBlockProps) => void;
  onDeleteAndFocusPrevious?: () => void;
  onChangeBlockType?: (newType: CanvasBlockType, newProps?: CanvasBlockProps) => void;
  onChangeBlockTypeById?: (
    blockId: string,
    newType: CanvasBlockType,
    newProps?: CanvasBlockProps
  ) => void;
  onAddChildToContainer?: (containerId: string, childType: CanvasBlockType) => void;
  onUpdateChildBlock?: (containerId: string, childId: string, updatedChild: CanvasBlock) => void;
  onDeleteChildBlock?: (containerId: string, childId: string) => void;
  onDuplicateChildBlock?: (containerId: string, childId: string) => void;
  onInsertChildParagraphAfter?: (containerId: string, childId: string, customProps?: CanvasBlockProps) => void;
  onMoveChildBlockUp?: (containerId: string, childIdx: number) => void;
  onMoveChildBlockDown?: (containerId: string, childIdx: number) => void;
  onSelectBlock?: (id: string) => void;
  selectedBlockId?: string | null;
  selectedIds?: string[];
  onToggleMultiSelect?: (id: string, e?: React.MouseEvent) => void;
  onFocusPrevious?: () => void;
  onFocusNext?: () => void;
  depth?: number;
}

export function BlockRenderer({
  block,
  mode,
  onChangeContent,
  onChangeProps,
  onChangeContentAndProps,
  onInsertParagraphAfter,
  onInsertBlockAfter,
  onDeleteAndFocusPrevious,
  onChangeBlockType,
  onChangeBlockTypeById,
  onAddChildToContainer,
  onUpdateChildBlock,
  onDeleteChildBlock,
  onDuplicateChildBlock,
  onInsertChildParagraphAfter,
  onMoveChildBlockUp,
  onMoveChildBlockDown,
  onSelectBlock,
  selectedBlockId,
  selectedIds,
  onToggleMultiSelect,
  onFocusPrevious,
  onFocusNext,
  depth = 1,
}: BlockRendererProps) {
  const isEdit = mode === 'edit';

  const updateProp = (key: keyof CanvasBlockProps, val: unknown) => {
    onChangeProps?.({ ...block.props, [key]: val });
  };

  if (!isEdit && block.props.hiddenOnPreview) {
    return null;
  }

  const renderRecursiveChildren = () => {
    if (depth >= 5) {
      return (
        <div className="rounded-lg border border-error/50 bg-error/10 p-2 text-center text-xs font-semibold text-error">
          ⚠️ Đã đạt giới hạn độ sâu đệ quy tối đa (5 cấp). Không thể lồng layout sâu hơn.
        </div>
      );
    }

    const children = block.children || [];
    if (children.length === 0) return null;

    return (
      <>
        {children.map((child, idx) => {
          const isChildSelected = selectedBlockId === child.id;
          const isChildMultiSelected = selectedIds?.includes(child.id) || false;

          const childNode = (
            <BlockRenderer
              depth={depth + 1}
              block={child}
              mode={mode}
              onChangeContent={(c) => {
                onUpdateChildBlock?.(block.id, child.id, { ...child, content: c });
              }}
              onChangeProps={(p) => {
                onUpdateChildBlock?.(block.id, child.id, {
                  ...child,
                  props: { ...child.props, ...p },
                });
              }}
              onChangeContentAndProps={(c, p) => {
                onUpdateChildBlock?.(block.id, child.id, {
                  ...child,
                  content: c,
                  props: { ...child.props, ...p },
                });
              }}
              onChangeBlockType={(t, p) => {
                if (onChangeBlockTypeById) {
                  onChangeBlockTypeById(child.id, t, p);
                } else {
                  onUpdateChildBlock?.(block.id, child.id, {
                    ...child,
                    type: t,
                    props: { ...child.props, ...p },
                  });
                }
              }}
              onChangeBlockTypeById={onChangeBlockTypeById}
              selectedBlockId={selectedBlockId}
              selectedIds={selectedIds}
              onSelectBlock={onSelectBlock}
              onToggleMultiSelect={onToggleMultiSelect}
              onAddChildToContainer={onAddChildToContainer}
              onUpdateChildBlock={onUpdateChildBlock}
              onDeleteChildBlock={onDeleteChildBlock}
              onDuplicateChildBlock={onDuplicateChildBlock}
              onInsertChildParagraphAfter={onInsertChildParagraphAfter}
              onInsertParagraphAfter={(customProps) => {
                onInsertChildParagraphAfter?.(block.id, child.id, customProps);
              }}
              onDeleteAndFocusPrevious={() => {
                onDeleteChildBlock?.(block.id, child.id);
              }}
              onMoveChildBlockUp={onMoveChildBlockUp}
              onMoveChildBlockDown={onMoveChildBlockDown}
            />
          );

          if (!isEdit) {
            return (
              <div key={child.id} className="flex-1 min-w-[180px]">
                {childNode}
              </div>
            );
          }

          return (
            <div key={child.id} className="flex-1 min-w-[180px]">
              <SortableBlockWrapper
                block={child}
                selected={isChildSelected}
                multiSelected={isChildMultiSelected}
                onSelect={() => onSelectBlock?.(child.id)}
                onToggleMultiSelect={(e) => onToggleMultiSelect?.(child.id, e)}
                onDuplicate={() => onDuplicateChildBlock?.(block.id, child.id)}
                onDelete={() => onDeleteChildBlock?.(block.id, child.id)}
                onInsertParagraphAfter={() => onInsertChildParagraphAfter?.(block.id, child.id)}
                onMoveUp={idx > 0 ? () => onMoveChildBlockUp?.(block.id, idx) : undefined}
                onMoveDown={
                  idx < children.length - 1
                    ? () => onMoveChildBlockDown?.(block.id, idx)
                    : undefined
                }
              >
                {childNode}
              </SortableBlockWrapper>
            </div>
          );
        })}
      </>
    );
  };

  let contentNode: React.ReactNode = null;

  if (isEdit) {
    switch (block.type) {
      case 'container':
        contentNode = (
          <EditableContainerBlock
            block={block}
            childrenNode={renderRecursiveChildren()}
            onAddChildBlock={(type) =>
              onAddChildToContainer?.(block.id, (type || 'paragraph') as CanvasBlockType)
            }
            isSelected={selectedBlockId === block.id}
          />
        );
        break;
      case 'heading':
        contentNode = (
          <EditableHeadingBlock
            block={block}
            onChangeContent={(c) => onChangeContent?.(c)}
            onChangeLevel={(lvl) => updateProp('level', lvl)}
            onInsertParagraphAfter={onInsertParagraphAfter}
            onDeleteAndFocusPrevious={onDeleteAndFocusPrevious}
            onChangeBlockType={(t, p) =>
              onChangeBlockTypeById ? onChangeBlockTypeById(block.id, t, p) : onChangeBlockType?.(t, p)
            }
            onFocusPrevious={onFocusPrevious}
            onFocusNext={onFocusNext}
          />
        );
        break;
      case 'callout':
        contentNode = (
          <EditableCalloutBlock
            block={block}
            onChangeContent={(c) => onChangeContent?.(c)}
            onChangeVariant={(v) => updateProp('variant', v)}
            onInsertParagraphAfter={onInsertParagraphAfter}
          />
        );
        break;
      case 'code':
        contentNode = (
          <EditableCodeBlock
            block={block}
            onChangeContent={(c) => onChangeContent?.(c)}
            onChangeLanguage={(lang) => updateProp('language', lang)}
            onChangeFilename={(fn) => updateProp('filename', fn)}
            onChangeHeight={(h) => updateProp('height', h)}
            onChangePreset={(preset) => updateProp('preset', preset)}
            onInsertParagraphAfter={onInsertParagraphAfter}
          />
        );
        break;
      case 'table':
        contentNode = (
          <EditableTableBlock
            block={block}
            onChangeHeaders={(h) => updateProp('headers', h)}
            onChangeRows={(r) => updateProp('rows', r)}
            onChangeColWidths={(widths) => updateProp('colWidths', widths)}
            isSelected={selectedBlockId === block.id}
            onInsertParagraphAfter={onInsertParagraphAfter}
          />
        );
        break;
      case 'doc-embed':
      case 'exercise-embed':
        contentNode = (
          <EditableEmbedBlock
            block={block}
            onChangeDisplayMode={(m) => updateProp('embedDisplayMode', m)}
            onChangeReferenceId={(id) => updateProp('refId', id)}
          />
        );
        break;
      case 'link':
        contentNode = (
          <EditableLinkBlock
            block={block}
            onChangeUrl={(u) => updateProp('url', u)}
            onChangeAltText={(a) => updateProp('altText', a)}
            onChangeLinkId={(id) => updateProp('linkId', id)}
          />
        );
        break;
      case 'list':
        contentNode = (
          <EditableListBlock
            block={block}
            onChangeProps={onChangeProps}
            onInsertParagraphAfter={onInsertParagraphAfter}
            onDeleteAndFocusPrevious={onDeleteAndFocusPrevious}
            onFocusPrevious={onFocusPrevious}
            onFocusNext={onFocusNext}
          />
        );
        break;
      case 'paragraph':
      default:
        contentNode = (
          <EditableRichTextBlock
            block={block}
            onChangeContent={(c) => onChangeContent?.(c)}
            onChangeProps={onChangeProps}
            onChangeContentAndProps={onChangeContentAndProps}
            onInsertParagraphAfter={onInsertParagraphAfter}
            onInsertBlockAfter={onInsertBlockAfter}
            onDeleteAndFocusPrevious={onDeleteAndFocusPrevious}
            onChangeBlockType={(t, p) =>
              onChangeBlockTypeById ? onChangeBlockTypeById(block.id, t, p) : onChangeBlockType?.(t, p)
            }
            onFocusPrevious={onFocusPrevious}
            onFocusNext={onFocusNext}
          />
        );
        break;
    }
  } else {
    // Learner preview mode
    switch (block.type) {
      case 'container':
        contentNode = (
          <LearnerContainerBlock
            block={block}
            childrenNode={renderRecursiveChildren()}
          />
        );
        break;
      case 'heading':
        contentNode = <LearnerHeadingBlock block={block} />;
        break;
      case 'callout':
        contentNode = <LearnerCalloutBlock block={block} />;
        break;
      case 'code':
        contentNode = <LearnerCodeBlock block={block} />;
        break;
      case 'table':
        contentNode = <LearnerTableBlock block={block} />;
        break;
      case 'list':
        contentNode = <LearnerListBlock block={block} />;
        break;
      case 'link':
        contentNode = <LearnerLinkBlock block={block} />;
        break;
      case 'paragraph':
      default:
        contentNode = <LearnerRichTextBlock block={block} />;
        break;
    }
  }

  const truncateHeight = block.props.truncateHeight;
  if (truncateHeight && truncateHeight > 0) {
    return <TruncateWrapper truncateHeight={truncateHeight}>{contentNode}</TruncateWrapper>;
  }

  return <>{contentNode}</>;
}
