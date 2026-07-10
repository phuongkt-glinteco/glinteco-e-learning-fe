'use client';

import React from 'react';
import { Icon } from '@iconify/react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/default/popover';
import { DraggableToolbarItem } from './DraggableToolbarItem';
import { FeatureFooterPortal } from '@/components/layout/FeatureFooterContext';
import { cn } from '@/lib/utils';
import type {
  CanvasBlockType,
  CanvasBlockProps,
  CanvasEditorMode,
  ViewportSize,
  ContainerLayoutMode,
} from '../types';

interface CanvasBottomToolbarProps {
  mode: CanvasEditorMode;
  previewViewport: ViewportSize;
  onChangeMode: (mode: CanvasEditorMode) => void;
  onChangeViewport: (viewport: ViewportSize) => void;
  onAddBlock: (type: CanvasBlockType, props?: CanvasBlockProps, content?: string) => void;
  selectedIds?: string[];
  selectedBlockIsContainer?: boolean;
  onWrapSelected?: (layoutMode: ContainerLayoutMode) => void;
  onUnwrapSelected?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  saving?: boolean;
  canSave?: boolean;
}

export function CanvasBottomToolbar({
  mode,
  previewViewport,
  onChangeMode,
  onChangeViewport,
  onAddBlock,
  selectedIds,
  selectedBlockIsContainer,
  onWrapSelected,
  onUnwrapSelected,
  onSave,
  onCancel,
  saving = false,
  canSave = true,
}: CanvasBottomToolbarProps) {
  const isEdit = mode === 'edit';

  return (
    <FeatureFooterPortal>
      <div className="flex w-full items-center justify-between gap-3 border-t border-outline-variant bg-surface/95 px-6 py-3 backdrop-blur-xl shadow-lg">
        {/* LEFT: Mode Switcher (Edit / Preview) & Viewport Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl bg-surface-variant/40 p-1">
            <button
              type="button"
              onClick={() => onChangeMode('edit')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                isEdit
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon icon="lucide:pen-tool" className="h-3.5 w-3.5" />
              <span>Soạn thảo</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeMode('preview')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                !isEdit
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon icon="lucide:eye" className="h-3.5 w-3.5" />
              <span>Xem trước</span>
            </button>
          </div>

          {!isEdit && (
            <div className="flex items-center gap-1 rounded-xl bg-surface-variant/30 p-1">
              <button
                type="button"
                onClick={() => onChangeViewport('desktop')}
                title="Máy tính (Desktop 100%)"
                className={`rounded-lg p-1.5 transition-all ${
                  previewViewport === 'desktop'
                    ? 'bg-surface text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Icon icon="lucide:monitor" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onChangeViewport('tablet')}
                title="Máy tính bảng (Tablet 768px)"
                className={`rounded-lg p-1.5 transition-all ${
                  previewViewport === 'tablet'
                    ? 'bg-surface text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Icon icon="lucide:tablet" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onChangeViewport('mobile')}
                title="Điện thoại (Mobile 375px)"
                className={`rounded-lg p-1.5 transition-all ${
                  previewViewport === 'mobile'
                    ? 'bg-surface text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Icon icon="lucide:smartphone" className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* CENTER: Categorical Popovers (Chỉ hiện khi ở chế độ Soạn thảo) */}
        {isEdit ? (
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {/* 0. Popover: Bố cục (Layout Wrapper) */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    'flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all shadow-sm',
                    selectedIds && selectedIds.length > 0
                      ? 'border-2 border-primary bg-primary/15 text-primary'
                      : 'border border-outline-variant bg-surface text-on-surface hover:border-primary/50'
                  )}
                >
                  <Icon icon="lucide:layout-template" className="h-4 w-4 text-primary" />
                  <span>
                    Bố cục {selectedIds && selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
                  </span>
                  <Icon icon="lucide:chevron-up" className="h-3 w-3 opacity-70" />
                </button>
              </PopoverTrigger>
              <PopoverContent side="top" align="center" className="w-72 p-3 shadow-2xl rounded-2xl">
                {selectedIds && selectedIds.length > 0 ? (
                  <div className="flex flex-col gap-1.5">
                    <div className="px-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                      Bọc {selectedIds.length} block đã chọn vào bố cục:
                    </div>
                    <button
                      type="button"
                      onClick={() => onWrapSelected?.('flex-row')}
                      className="flex items-center gap-2 rounded-xl border border-outline-variant/60 bg-surface px-3 py-2 text-xs font-semibold text-on-surface hover:border-primary hover:bg-primary/5 transition-all"
                    >
                      <Icon icon="lucide:columns" className="h-4 w-4 text-primary" />
                      <span>Bọc ngang (HBox / Row)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onWrapSelected?.('flex-col')}
                      className="flex items-center gap-2 rounded-xl border border-outline-variant/60 bg-surface px-3 py-2 text-xs font-semibold text-on-surface hover:border-primary hover:bg-primary/5 transition-all"
                    >
                      <Icon icon="lucide:rows" className="h-4 w-4 text-primary" />
                      <span>Bọc dọc (VBox / Column)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onWrapSelected?.('grid-2')}
                      className="flex items-center gap-2 rounded-xl border border-outline-variant/60 bg-surface px-3 py-2 text-xs font-semibold text-on-surface hover:border-primary hover:bg-primary/5 transition-all"
                    >
                      <Icon icon="lucide:columns-2" className="h-4 w-4 text-primary" />
                      <span>Bọc lưới 2 cột (Grid 2)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onWrapSelected?.('grid-3')}
                      className="flex items-center gap-2 rounded-xl border border-outline-variant/60 bg-surface px-3 py-2 text-xs font-semibold text-on-surface hover:border-primary hover:bg-primary/5 transition-all"
                    >
                      <Icon icon="lucide:columns-3" className="h-4 w-4 text-primary" />
                      <span>Bọc lưới 3 cột (Grid 3)</span>
                    </button>

                    {selectedBlockIsContainer && onUnwrapSelected && (
                      <button
                        type="button"
                        onClick={() => onUnwrapSelected()}
                        className="mt-1 flex items-center gap-2 rounded-xl border border-error/40 bg-error/10 px-3 py-2 text-xs font-bold text-error hover:bg-error/20 transition-all"
                      >
                        <Icon icon="lucide:ungroup" className="h-4 w-4" />
                        <span>Rã nhóm (Unwrap khối này)</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <div className="px-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                      Tạo khung bố cục mới:
                    </div>
                    <button
                      type="button"
                      onClick={() => onAddBlock('container', { layoutMode: 'flex-row', semanticTag: 'div' })}
                      className="flex items-center gap-2 rounded-xl border border-outline-variant/60 bg-surface px-3 py-2 text-xs font-semibold text-on-surface hover:border-primary hover:bg-primary/5 transition-all"
                    >
                      <Icon icon="lucide:columns" className="h-4 w-4 text-primary" />
                      <span>Bố cục ngang (HBox)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onAddBlock('container', { layoutMode: 'flex-col', semanticTag: 'div' })}
                      className="flex items-center gap-2 rounded-xl border border-outline-variant/60 bg-surface px-3 py-2 text-xs font-semibold text-on-surface hover:border-primary hover:bg-primary/5 transition-all"
                    >
                      <Icon icon="lucide:rows" className="h-4 w-4 text-primary" />
                      <span>Bố cục dọc (VBox)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onAddBlock('container', { layoutMode: 'grid-2', semanticTag: 'div' })}
                      className="flex items-center gap-2 rounded-xl border border-outline-variant/60 bg-surface px-3 py-2 text-xs font-semibold text-on-surface hover:border-primary hover:bg-primary/5 transition-all"
                    >
                      <Icon icon="lucide:columns-2" className="h-4 w-4 text-primary" />
                      <span>Lưới 2 cột (Grid 2)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onAddBlock('container', { layoutMode: 'grid-3', semanticTag: 'div' })}
                      className="flex items-center gap-2 rounded-xl border border-outline-variant/60 bg-surface px-3 py-2 text-xs font-semibold text-on-surface hover:border-primary hover:bg-primary/5 transition-all"
                    >
                      <Icon icon="lucide:columns-3" className="h-4 w-4 text-primary" />
                      <span>Lưới 3 cột (Grid 3)</span>
                    </button>
                    <div className="mt-1 border-t border-outline-variant/40 pt-1.5 text-[10px] text-on-surface-variant text-center">
                      Mẹo: Tick chọn các block rồi mở menu này để Bọc nhóm.
                    </div>
                  </div>
                )}
              </PopoverContent>
            </Popover>

            {/* 1. Popover: Văn bản & Tiêu đề */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-xl border border-outline-variant bg-surface px-3 py-1.5 text-xs font-bold text-on-surface hover:border-primary/50 hover:bg-surface-variant/30 transition-all"
                >
                  <Icon icon="lucide:type" className="h-4 w-4 text-primary" />
                  <span>Văn bản & Tiêu đề</span>
                  <Icon icon="lucide:chevron-up" className="h-3 w-3 text-on-surface-variant" />
                </button>
              </PopoverTrigger>
              <PopoverContent side="top" align="center" className="w-64 p-2 shadow-2xl rounded-2xl">
                <div className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Kéo thả hoặc nhấn để tạo
                </div>
                <div className="flex flex-col gap-1">
                  <DraggableToolbarItem
                    id="toolbar_paragraph"
                    type="paragraph"
                    props={{}}
                    content=""
                    label="Đoạn văn thường (Paragraph)"
                    icon="lucide:align-left"
                    onSelectClick={() => onAddBlock('paragraph', {}, '')}
                  />
                  <div className="my-1 border-t border-outline-variant/50" />
                  <DraggableToolbarItem
                    id="toolbar_h1"
                    type="heading"
                    props={{ level: 1 }}
                    content="Tiêu đề chính H1"
                    label="Heading 1 (Tiêu đề lớn)"
                    icon="lucide:heading-1"
                    onSelectClick={() => onAddBlock('heading', { level: 1 }, 'Tiêu đề chính H1')}
                  />
                  <DraggableToolbarItem
                    id="toolbar_h2"
                    type="heading"
                    props={{ level: 2 }}
                    content="Tiêu đề mục H2"
                    label="Heading 2 (Tiêu đề mục)"
                    icon="lucide:heading-2"
                    onSelectClick={() => onAddBlock('heading', { level: 2 }, 'Tiêu đề mục H2')}
                  />
                  <DraggableToolbarItem
                    id="toolbar_h3"
                    type="heading"
                    props={{ level: 3 }}
                    content="Tiêu đề tiểu mục H3"
                    label="Heading 3 (Tiểu mục nhỏ)"
                    icon="lucide:heading-3"
                    onSelectClick={() => onAddBlock('heading', { level: 3 }, 'Tiêu đề tiểu mục H3')}
                  />
                </div>
              </PopoverContent>
            </Popover>

            {/* 2. Popover: Ghi chú (Callouts) */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-xl border border-outline-variant bg-surface px-3 py-1.5 text-xs font-bold text-on-surface hover:border-primary/50 hover:bg-surface-variant/30 transition-all"
                >
                  <Icon icon="lucide:alert-circle" className="h-4 w-4 text-amber-500" />
                  <span>Ghi chú</span>
                  <Icon icon="lucide:chevron-up" className="h-3 w-3 text-on-surface-variant" />
                </button>
              </PopoverTrigger>
              <PopoverContent side="top" align="center" className="w-72 p-2 shadow-2xl rounded-2xl">
                <div className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Các mẫu hộp Ghi chú (Callouts)
                </div>
                <div className="flex flex-col gap-1">
                  <DraggableToolbarItem
                    id="toolbar_callout_info"
                    type="callout"
                    props={{ variant: 'info' }}
                    content="Lưu ý quan trọng cần nhớ trong bài học này."
                    label="Hộp Thông tin (Info)"
                    icon="lucide:info"
                    onSelectClick={() =>
                      onAddBlock(
                        'callout',
                        { variant: 'info' },
                        'Lưu ý quan trọng cần nhớ trong bài học này.'
                      )
                    }
                  />
                  <DraggableToolbarItem
                    id="toolbar_callout_objective"
                    type="callout"
                    props={{ variant: 'objective' }}
                    content="Học viên nắm được nguyên lý và cách triển khai."
                    label="Mục tiêu bài học (Objective)"
                    icon="lucide:target"
                    onSelectClick={() =>
                      onAddBlock(
                        'callout',
                        { variant: 'objective' },
                        'Học viên nắm được nguyên lý và cách triển khai.'
                      )
                    }
                  />
                  <DraggableToolbarItem
                    id="toolbar_callout_challenge"
                    type="callout"
                    props={{ variant: 'challenge' }}
                    content="Tự mở rộng bài toán thêm tính năng xác thực."
                    label="Thử thách nâng cao (Challenge)"
                    icon="lucide:zap"
                    onSelectClick={() =>
                      onAddBlock(
                        'callout',
                        { variant: 'challenge' },
                        'Tự mở rộng bài toán thêm tính năng xác thực.'
                      )
                    }
                  />
                </div>
              </PopoverContent>
            </Popover>

            {/* 3. Popover: Kỹ thuật (Code / Terminal) */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-xl border border-outline-variant bg-surface px-3 py-1.5 text-xs font-bold text-on-surface hover:border-primary/50 hover:bg-surface-variant/30 transition-all"
                >
                  <Icon icon="lucide:code-2" className="h-4 w-4 text-emerald-500" />
                  <span>Kỹ thuật</span>
                  <Icon icon="lucide:chevron-up" className="h-3 w-3 text-on-surface-variant" />
                </button>
              </PopoverTrigger>
              <PopoverContent side="top" align="center" className="w-72 p-2 shadow-2xl rounded-2xl">
                <div className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Khối Code & Dòng lệnh
                </div>
                <div className="flex flex-col gap-1">
                  <DraggableToolbarItem
                    id="toolbar_code_ts"
                    type="code"
                    props={{ language: 'typescript', height: 260 }}
                    content="function example(): void {\n  console.log('Hello Glinteco!');\n}"
                    label="Khối Code TypeScript/JS"
                    icon="lucide:file-code"
                    onSelectClick={() =>
                      onAddBlock(
                        'code',
                        { language: 'typescript', height: 260 },
                        "function example(): void {\n  console.log('Hello Glinteco!');\n}"
                      )
                    }
                  />
                  <DraggableToolbarItem
                    id="toolbar_code_bash"
                    type="code"
                    props={{ language: 'bash', height: 160 }}
                    content="npm install @glinteco/sdk\nnpm run dev"
                    label="Lệnh Terminal (Bash/CLI)"
                    icon="lucide:terminal"
                    onSelectClick={() =>
                      onAddBlock(
                        'code',
                        { language: 'bash', height: 160 },
                        'npm install @glinteco/sdk\nnpm run dev'
                      )
                    }
                  />
                  <DraggableToolbarItem
                    id="toolbar_table"
                    type="table"
                    props={{
                      headers: ['Khái niệm', 'Mô tả chi tiết', 'Ví dụ'],
                      rows: [
                        ['State', 'Lưu trữ trạng thái nội bộ', 'useState()'],
                        ['Props', 'Dữ liệu truyền từ component cha', '<Card title="..." />'],
                      ],
                    }}
                    label="Bảng dữ liệu (Table)"
                    icon="lucide:table"
                    onSelectClick={() =>
                      onAddBlock('table', {
                        headers: ['Khái niệm', 'Mô tả chi tiết', 'Ví dụ'],
                        rows: [
                          ['State', 'Lưu trữ trạng thái nội bộ', 'useState()'],
                          ['Props', 'Dữ liệu truyền từ component cha', '<Card title="..." />'],
                        ],
                      })
                    }
                  />
                </div>
              </PopoverContent>
            </Popover>

            {/* 4. Popover duy nhất cho Bố cục (Layouts & Embeds) */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-xl border border-outline-variant bg-surface px-3 py-1.5 text-xs font-bold text-on-surface hover:border-primary/50 hover:bg-surface-variant/30 transition-all"
                >
                  <Icon icon="lucide:layout-grid" className="h-4 w-4 text-blue-500" />
                  <span>Liên kết</span>
                  <Icon icon="lucide:chevron-up" className="h-3 w-3 text-on-surface-variant" />
                </button>
              </PopoverTrigger>
              <PopoverContent side="top" align="center" className="w-72 p-2 shadow-2xl rounded-2xl">
                <div className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Liên kết
                </div>
                <div className="flex flex-col gap-1">
                  
                  <DraggableToolbarItem
                    id="toolbar_embed_doc"
                    type="doc-embed"
                    props={{}}
                    label="Nhúng Tài liệu (Document Card)"
                    icon="lucide:file-text"
                    onSelectClick={() => onAddBlock('doc-embed', {})}
                  />
                  <DraggableToolbarItem
                    id="toolbar_embed_exercise"
                    type="exercise-embed"
                    props={{}}
                    label="Nhúng Bài tập (Exercise Card)"
                    icon="lucide:dumbbell"
                    onSelectClick={() => onAddBlock('exercise-embed', {})}
                  />
                  <DraggableToolbarItem
                    id="toolbar_embed_inline_link"
                    type="link"
                    props={{ altText: 'Liên kết tài liệu', url: 'https://' }}
                    label="Liên kết Inline (Inline Text Link)"
                    icon="lucide:external-link"
                    onSelectClick={() => onAddBlock('link', { altText: 'Liên kết tài liệu', url: 'https://' })}
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>
        ) : (
          <div className="text-xs font-medium text-on-surface-variant">
            Đang xem trước giao diện hiển thị cho Học viên
          </div>
        )}

        {/* RIGHT: Cancel & Save Action Buttons */}
        <div className="flex items-center gap-2.5">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-outline-variant px-4 py-2 text-xs font-bold text-secondary hover:bg-surface-variant transition-colors"
            >
              Hủy
            </button>
          )}

          {onSave && (
            <button
              type="button"
              onClick={onSave}
              disabled={!canSave || saving}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-on-primary shadow-lg hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Icon icon="lucide:save" className="h-4 w-4" />
              <span>{saving ? 'Đang lưu...' : 'Lưu bài học'}</span>
            </button>
          )}
        </div>
      </div>
    </FeatureFooterPortal>
  );
}
