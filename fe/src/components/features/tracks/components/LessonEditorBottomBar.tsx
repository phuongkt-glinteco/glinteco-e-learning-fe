'use client';

import React, { useState } from 'react';

interface LessonEditorBottomBarProps {
  onSave: () => void;
  saving?: boolean;
  canSave?: boolean;
  onPreviewToggle?: () => void;
  isPreview?: boolean;
  onReset?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onCancel?: () => void;
}

export function LessonEditorBottomBar({
  onSave,
  saving = false,
  canSave = true,
  onPreviewToggle,
  isPreview = false,
  onReset,
  onUndo,
  onRedo,
  onCancel,
}: LessonEditorBottomBarProps) {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  if (collapsed) {
    return (
      <div className="w-full bg-surface border-t border-outline-variant px-6 py-2 flex items-center justify-end shadow-sm">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="px-3 py-1.5 rounded-lg border border-outline-variant bg-surface-container-low hover:bg-surface-variant text-secondary hover:text-on-surface transition-colors flex items-center gap-1.5 text-label-sm cursor-pointer"
          title="Mở rộng thanh công cụ"
        >
          <span className="material-symbols-outlined text-[18px]">expand_less</span>
          <span>Mở rộng thanh công cụ</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-surface border-t border-outline-variant px-6 py-3 flex items-center justify-between flex-wrap gap-4 shadow-sm transition-all">
      {/* Cụm Trở lại (Cancel) + Undo / Redo (Prevdo) / Reset */}
      <div className="flex items-center gap-2 flex-wrap">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg border border-outline-variant bg-surface-container-low hover:bg-surface-variant text-secondary hover:text-on-surface transition-colors flex items-center gap-1.5 text-label-sm cursor-pointer"
            title="Hủy và quay lại danh sách bài học"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Hủy (Cancel)</span>
          </button>
        )}
        {onUndo && (
          <button
            type="button"
            onClick={onUndo}
            className="px-3 py-1.5 rounded-lg border border-outline-variant bg-surface-container-low hover:bg-surface-variant text-secondary hover:text-on-surface transition-colors flex items-center gap-1.5 text-label-sm cursor-pointer"
            title="Hoàn tác (Undo)"
          >
            <span className="material-symbols-outlined text-[18px]">undo</span>
            <span className="hidden sm:inline">Undo</span>
          </button>
        )}
        {onRedo && (
          <button
            type="button"
            onClick={onRedo}
            className="px-3 py-1.5 rounded-lg border border-outline-variant bg-surface-container-low hover:bg-surface-variant text-secondary hover:text-on-surface transition-colors flex items-center gap-1.5 text-label-sm cursor-pointer"
            title="Làm lại (Redo / Prevdo)"
          >
            <span className="material-symbols-outlined text-[18px]">redo</span>
            <span className="hidden sm:inline">Redo</span>
          </button>
        )}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="px-3 py-1.5 rounded-lg border border-outline-variant bg-surface-container-low hover:bg-surface-variant text-secondary hover:text-on-surface transition-colors flex items-center gap-1.5 text-label-sm cursor-pointer"
            title="Khôi phục gốc (Reset)"
          >
            <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>

      {/* Cụm Preview & Save + Nút thu gọn */}
      <div className="flex items-center gap-3 flex-wrap">
        {onPreviewToggle && (
          <button
            type="button"
            onClick={onPreviewToggle}
            className={`px-4 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 text-label-sm font-medium cursor-pointer ${
              isPreview
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-outline-variant bg-surface-container-low hover:bg-surface-variant text-secondary hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isPreview ? 'edit' : 'visibility'}
            </span>
            <span>{isPreview ? 'Quay lại soạn thảo' : 'Preview'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={onSave}
          disabled={!canSave || saving}
          className="px-6 py-1.5 bg-primary text-on-primary rounded-lg text-label-sm font-medium hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
        >
          {saving && (
            <span className="material-symbols-outlined text-[18px] animate-spin">
              progress_activity
            </span>
          )}
          <span>{saving ? 'Đang lưu...' : 'Lưu bài học (Save)'}</span>
        </button>

        <button
          type="button"
          onClick={() => setCollapsed(true)}
          className="p-1.5 rounded-lg border border-outline-variant bg-surface-container-low hover:bg-surface-variant text-secondary hover:text-on-surface transition-colors flex items-center justify-center cursor-pointer"
          title="Thu gọn thanh công cụ"
        >
          <span className="material-symbols-outlined text-[18px]">expand_more</span>
        </button>
      </div>
    </div>
  );
}
