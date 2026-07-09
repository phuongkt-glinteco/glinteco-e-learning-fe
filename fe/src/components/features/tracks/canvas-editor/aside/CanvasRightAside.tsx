'use client';

import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import type {
  CanvasBlock,
  CanvasBlockProps,
  SpacingVariant,
} from '../types';

interface CanvasRightAsideProps {
  blocks: CanvasBlock[];
  selectedBlockId: string | null;
  selectedBlockIds?: string[];
  onSelectBlock: (id: string | null) => void;
  onChangeBlockProps: (blockId: string, newProps: CanvasBlockProps) => void;
  onDeleteBlock: (blockId: string) => void;
  onDuplicateBlock: (blockId: string) => void;
  documentSpacing?: SpacingVariant;
  onChangeDocumentSpacing?: (spacing: SpacingVariant) => void;
  onBatchUpdateProps?: (blockIds: string[], newPropsPartial: Partial<CanvasBlockProps>) => void;
  onBatchDeleteBlocks?: (blockIds: string[]) => void;
}

export function CanvasRightAside({
  blocks,
  selectedBlockId,
  selectedBlockIds = [],
  onSelectBlock,
  onChangeBlockProps,
  onDeleteBlock,
  onDuplicateBlock,
  documentSpacing = 'normal',
  onChangeDocumentSpacing,
  onBatchUpdateProps,
  onBatchDeleteBlocks,
}: CanvasRightAsideProps) {
  const [activeTab, setActiveTab] = useState<'inspector' | 'outline'>('inspector');

  const findBlockRecursive = (list: CanvasBlock[], id: string | null): CanvasBlock | null => {
    if (!id) return null;
    for (const b of list) {
      if (b.id === id) return b;
      if (b.children && b.children.length > 0) {
        const found = findBlockRecursive(b.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedBlock = findBlockRecursive(blocks, selectedBlockId);
  const isMultiSelect = selectedBlockIds.length >= 2;

  const updateProp = (key: keyof CanvasBlockProps, val: unknown) => {
    if (!selectedBlock) return;
    onChangeBlockProps(selectedBlock.id, {
      ...selectedBlock.props,
      [key]: val,
    });
  };

  const handleBatchProp = (key: keyof CanvasBlockProps, val: unknown) => {
    if (onBatchUpdateProps && selectedBlockIds.length > 0) {
      onBatchUpdateProps(selectedBlockIds, { [key]: val });
    }
  };

  const renderOutlineTree = (list: CanvasBlock[], depth = 0): React.ReactNode => {
    return list.map((block, idx) => {
      const isSelected = selectedBlockId === block.id || selectedBlockIds.includes(block.id);
      const hasChildren = block.children && block.children.length > 0;
      return (
        <div key={block.id} className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => onSelectBlock(block.id)}
            style={{ paddingLeft: `${depth * 14 + 12}px` }}
            className={`flex items-center justify-between rounded-xl pr-3 py-2 text-left text-xs transition-all ${
              isSelected
                ? 'bg-primary/10 font-bold text-primary border border-primary/30'
                : 'hover:bg-surface-variant/40 text-on-surface-variant'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <span className="font-mono text-[10px] opacity-60">#{idx + 1}</span>
              {block.type === 'container' && (
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                  &lt;{block.props.semanticTag || 'section'}&gt;
                </span>
              )}
              <span className="truncate">
                {block.content ||
                  (block.type === 'container'
                    ? `Wrapper (${(block.children || []).length} con)`
                    : `[${block.type}]`)}
              </span>
            </div>
            <span className="text-[10px] uppercase opacity-50 shrink-0">{block.type}</span>
          </button>
          {hasChildren && (
            <div className="flex flex-col gap-1 border-l border-outline-variant/40 ml-4 pl-1">
              {renderOutlineTree(block.children!, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-l border-outline-variant bg-surface">
      {/* Aside Header Tabs */}
      <div className="flex border-b border-outline-variant bg-surface-variant/20 p-1.5">
        <button
          type="button"
          onClick={() => setActiveTab('inspector')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all ${
            activeTab === 'inspector'
              ? 'bg-surface text-primary shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Icon icon="lucide:sliders" className="h-4 w-4" />
          <span>
            Thuộc Tính ({isMultiSelect ? `${selectedBlockIds.length}` : selectedBlock ? '1' : '0'})
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('outline')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all ${
            activeTab === 'outline'
              ? 'bg-surface text-primary shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Icon icon="lucide:list-tree" className="h-4 w-4" />
          <span>Cấu Trúc ({blocks.length})</span>
        </button>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'inspector' && (
          <div className="flex flex-col gap-5">
            {/* 1. Global Document Spacing */}
            <div className="rounded-2xl border border-outline-variant bg-surface-variant/20 p-3.5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface">Khoảng cách toàn bài học</span>
                <Icon icon="lucide:align-justify" className="h-4 w-4 text-primary" />
              </div>
              <p className="mb-2.5 text-[11px] text-on-surface-variant">
                Độ giãn cách mặc định giữa các block:
              </p>
              <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-surface p-1 border border-outline-variant">
                {(['compact', 'normal', 'relaxed'] as const).map((sp) => (
                  <button
                    key={sp}
                    type="button"
                    onClick={() => onChangeDocumentSpacing?.(sp)}
                    className={`rounded-lg py-1.5 text-[11px] font-bold capitalize transition-all ${
                      documentSpacing === sp
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {sp === 'compact' ? 'Chặt' : sp === 'normal' ? 'Chuẩn' : 'Thoáng'}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Multi-Select Inspector */}
            {isMultiSelect ? (
              <div className="flex flex-col gap-4 rounded-2xl border-2 border-primary/40 bg-primary/5 p-4">
                <div className="flex items-center justify-between border-b border-primary/20 pb-2.5">
                  <span className="text-xs font-extrabold text-primary">
                    Đã chọn {selectedBlockIds.length} blocks
                  </span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                    Thao tác đồng loạt
                  </span>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-on-surface">
                    Áp dụng giãn cách cho {selectedBlockIds.length} block:
                  </label>
                  <div className="grid grid-cols-3 gap-1 rounded-xl bg-surface p-1">
                    {(['compact', 'normal', 'relaxed'] as const).map((sp) => (
                      <button
                        key={sp}
                        type="button"
                        onClick={() => handleBatchProp('spacing', sp)}
                        className="rounded-lg py-1.5 text-xs font-semibold capitalize text-on-surface-variant hover:bg-surface-variant/40 hover:text-on-surface"
                      >
                        {sp === 'compact' ? 'Chặt' : sp === 'normal' ? 'Chuẩn' : 'Thoáng'}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onBatchDeleteBlocks?.(selectedBlockIds)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-error py-2.5 text-xs font-bold text-on-error shadow-sm hover:bg-error/90 transition-all"
                >
                  <Icon icon="lucide:trash-2" className="h-4 w-4" />
                  <span>Xóa đồng loạt {selectedBlockIds.length} blocks</span>
                </button>
              </div>
            ) : !selectedBlock ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-on-surface-variant">
                <Icon icon="lucide:mouse-pointer-click" className="mb-2 h-8 w-8 opacity-40" />
                <p className="text-xs font-medium">Chọn một block để xem hoặc điều chỉnh thuộc tính</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 border-t border-outline-variant pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-primary">
                    Chi tiết Block ({selectedBlock.type})
                  </span>
                </div>

                {/* Container / Wrapper Inspector */}
                {selectedBlock.type === 'container' && (
                  <div className="flex flex-col gap-4 rounded-2xl border border-primary/30 bg-primary/[0.04] p-3.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                      <Icon icon="lucide:layout-template" className="w-4 h-4" />
                      <span>Cấu hình Wrapper / Container</span>
                    </div>

                    {/* Thẻ HTML Ngữ Nghĩa */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-on-surface">
                        Thẻ Ngữ Nghĩa HTML5
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(['section', 'article', 'header', 'main', 'aside', 'div'] as const).map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => updateProp('semanticTag', tag)}
                            className={`rounded-lg py-1.5 text-[11px] font-mono font-bold transition-all ${
                              (selectedBlock.props.semanticTag || 'section') === tag
                                ? 'bg-primary text-on-primary shadow-sm'
                                : 'bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-variant'
                            }`}
                          >
                            &lt;{tag}&gt;
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Bố cục sắp xếp con bên trong */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-on-surface">
                        Bố cục con bên trong (Layout)
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(
                          [
                            { id: 'flex-col', label: 'Dọc (Column)' },
                            { id: 'flex-row', label: 'Ngang (Row)' },
                            { id: 'grid-2', label: 'Lưới 2 Cột' },
                            { id: 'grid-3', label: 'Lưới 3 Cột' },
                          ] as const
                        ).map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => updateProp('layoutMode', m.id)}
                            className={`rounded-xl border px-2.5 py-2 text-xs font-semibold transition-all ${
                              (selectedBlock.props.layoutMode || 'flex-col') === m.id
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-outline-variant bg-surface text-on-surface-variant hover:border-outline'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Khoảng cách giữa các phần tử con (Gap) */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-on-surface">
                        Khoảng cách giữa các khối con (Gap)
                      </label>
                      <div className="grid grid-cols-4 gap-1">
                        {(['none', 'sm', 'md', 'lg'] as const).map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => updateProp('gap', g)}
                            className={`rounded-lg py-1.5 text-[11px] font-bold uppercase transition-all ${
                              (selectedBlock.props.gap || 'md') === g
                                ? 'bg-primary text-on-primary shadow-sm'
                                : 'bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-variant'
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Khoảng đệm Wrapper (Padding) */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-on-surface">
                        Khoảng đệm trong Wrapper (Padding)
                      </label>
                      <div className="grid grid-cols-4 gap-1">
                        {(['none', 'sm', 'md', 'lg'] as const).map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => updateProp('padding', p)}
                            className={`rounded-lg py-1.5 text-[11px] font-bold uppercase transition-all ${
                              (selectedBlock.props.padding || 'md') === p
                                ? 'bg-primary text-on-primary shadow-sm'
                                : 'bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-variant'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Khung viền trang trí */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-on-surface">
                        Kiểu viền hiển thị cho người đọc
                      </label>
                      <div className="grid grid-cols-3 gap-1">
                        {(
                          [
                            { id: 'none', label: 'Không viền' },
                            { id: 'subtle', label: 'Viền mảnh' },
                            { id: 'card', label: 'Dạng Card' },
                          ] as const
                        ).map((bs) => (
                          <button
                            key={bs.id}
                            type="button"
                            onClick={() => updateProp('borderStyle', bs.id)}
                            className={`rounded-lg py-1.5 text-xs font-semibold transition-all ${
                              (selectedBlock.props.borderStyle || 'none') === bs.id
                                ? 'bg-primary text-on-primary shadow-sm'
                                : 'bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-variant'
                            }`}
                          >
                            {bs.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Chiều cao cuộn tối đa (khi là Scrollable Area) */}
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-on-surface">
                        Chiều cao cuộn tối đa (px - để trống nếu không cuộn)
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={50}
                        value={selectedBlock.props.maxHeight || ''}
                        onChange={(e) =>
                          updateProp(
                            'maxHeight',
                            e.target.value ? parseInt(e.target.value, 10) : undefined
                          )
                        }
                        placeholder="VD: 300 (Tạo vùng cuộn Scrollable Area)"
                        className="w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-xs text-on-surface focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Spacing riêng cho block */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-on-surface">
                    Khoảng cách riêng của block (Spacing)
                  </label>
                  <div className="grid grid-cols-3 gap-1 rounded-xl bg-surface-variant/30 p-1">
                    {(['compact', 'normal', 'relaxed'] as const).map((sp) => (
                      <button
                        key={sp}
                        type="button"
                        onClick={() => updateProp('spacing', sp)}
                        className={`rounded-lg py-1.5 text-xs font-semibold capitalize transition-all ${
                          selectedBlock.props.spacing === sp
                            ? 'bg-surface text-primary shadow-sm'
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {sp === 'compact' ? 'Chặt' : sp === 'normal' ? 'Chuẩn' : 'Thoáng'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Truncate threshold */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-on-surface">
                    Giới hạn chiều cao & Xem thêm (Truncate px)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={20}
                    value={selectedBlock.props.truncateHeight || ''}
                    onChange={(e) =>
                      updateProp(
                        'truncateHeight',
                        e.target.value ? parseInt(e.target.value, 10) : undefined
                      )
                    }
                    placeholder="VD: 200 (Độ cao tối đa trước khi thu gọn)"
                    className="w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-xs text-on-surface focus:border-primary focus:outline-none"
                  />
                </div>

                {/* Ẩn ở chế độ preview */}
                <div className="flex items-center justify-between rounded-xl bg-surface-variant/20 p-3">
                  <span className="text-xs font-semibold text-on-surface">
                    Ẩn khi xem trước (Draft block)
                  </span>
                  <input
                    type="checkbox"
                    checked={!!selectedBlock.props.hiddenOnPreview}
                    onChange={(e) => updateProp('hiddenOnPreview', e.target.checked)}
                    className="h-4 w-4 rounded border-outline-variant accent-primary cursor-pointer"
                  />
                </div>

                {/* Block actions */}
                <div className="mt-2 flex gap-2 border-t border-outline-variant pt-4">
                  <button
                    type="button"
                    onClick={() => onDuplicateBlock(selectedBlock.id)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-outline-variant py-2 text-xs font-bold text-on-surface hover:bg-surface-variant transition-colors"
                  >
                    <Icon icon="lucide:copy" className="h-3.5 w-3.5" />
                    <span>Nhân bản</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteBlock(selectedBlock.id)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-error/10 py-2 text-xs font-bold text-error hover:bg-error hover:text-on-error transition-all"
                  >
                    <Icon icon="lucide:trash-2" className="h-3.5 w-3.5" />
                    <span>Xóa block</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: OUTLINE TREE VIEW */}
        {activeTab === 'outline' && (
          <div className="flex flex-col gap-2">
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-secondary">
              Mục lục & Cấu trúc tài liệu
            </div>
            {blocks.length === 0 ? (
              <p className="text-xs text-on-surface-variant italic">Chưa có block nào</p>
            ) : (
              <div className="flex flex-col gap-1.5">{renderOutlineTree(blocks, 0)}</div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
