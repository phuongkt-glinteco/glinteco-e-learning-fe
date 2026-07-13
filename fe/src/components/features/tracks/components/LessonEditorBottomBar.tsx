'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  Undo2,
  Redo2,
  RotateCcw,
  Eye,
  Edit3,
  Loader2,
  Monitor,
  Tablet,
  Smartphone,
} from 'lucide-react';

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';

interface LessonEditorBottomBarProps {
  onSave: () => void;
  saving?: boolean;
  canSave?: boolean;
  onPreviewToggle?: () => void;
  isPreview?: boolean;
  viewport?: ViewportMode;
  onViewportChange?: (vp: ViewportMode) => void;
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
  viewport = 'desktop',
  onViewportChange,
  onReset,
  onUndo,
  onRedo,
  onCancel,
}: LessonEditorBottomBarProps) {
  const t = useTranslations('PuckEditor.Common.LearnerView');
  const [collapsed, setCollapsed] = useState<boolean>(false);

  if (collapsed) {
    return (
      <div className="fixed bottom-5 right-5 z-50">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="px-4 py-2.5 rounded-full border border-border bg-surface shadow-lg hover:bg-surface-container text-foreground transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer"
          title="Mở rộng thanh công cụ soạn thảo"
        >
          <ChevronUp className="w-4 h-4 text-primary" />
          <span>Mở rộng thanh công cụ</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-surface border-t border-border px-6 py-3 flex items-center justify-between flex-wrap gap-4 shadow-sm transition-all">
      {/* Cụm Trở lại (Cancel) + Undo / Redo / Reset */}
      <div className="flex items-center gap-2 flex-wrap">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg border border-border bg-surface-container-low hover:bg-surface-variant text-secondary hover:text-foreground transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            title="Hủy và quay lại danh sách bài học"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Hủy (Cancel)</span>
          </button>
        )}
        {onUndo && (
          <button
            type="button"
            onClick={onUndo}
            className="px-3 py-1.5 rounded-lg border border-border bg-surface-container-low hover:bg-surface-variant text-secondary hover:text-foreground transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            title="Hoàn tác (Undo)"
          >
            <Undo2 className="w-4 h-4" />
            <span className="hidden sm:inline">Undo</span>
          </button>
        )}
        {onRedo && (
          <button
            type="button"
            onClick={onRedo}
            className="px-3 py-1.5 rounded-lg border border-border bg-surface-container-low hover:bg-surface-variant text-secondary hover:text-foreground transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            title="Làm lại (Redo)"
          >
            <Redo2 className="w-4 h-4" />
            <span className="hidden sm:inline">Redo</span>
          </button>
        )}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="px-3 py-1.5 rounded-lg border border-border bg-surface-container-low hover:bg-surface-variant text-secondary hover:text-foreground transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            title="Khôi phục gốc (Reset)"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>

      {/* Cụm Viewport Simulation + Preview & Save + Nút thu gọn */}
      <div className="flex items-center gap-3 flex-wrap">
        {isPreview && onViewportChange && (
          <div className="flex items-center gap-1 bg-surface-container-low border border-border rounded-lg p-1">
            <button
              type="button"
              onClick={() => onViewportChange('desktop')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewport === 'desktop'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-secondary hover:text-foreground'
              }`}
              title={t('viewportDesktop')}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t('viewportDesktop')}</span>
            </button>
            <button
              type="button"
              onClick={() => onViewportChange('tablet')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewport === 'tablet'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-secondary hover:text-foreground'
              }`}
              title={t('viewportTablet')}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t('viewportTablet')}</span>
            </button>
            <button
              type="button"
              onClick={() => onViewportChange('mobile')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewport === 'mobile'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-secondary hover:text-foreground'
              }`}
              title={t('viewportMobile')}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t('viewportMobile')}</span>
            </button>
          </div>
        )}

        {onPreviewToggle && (
          <button
            type="button"
            onClick={onPreviewToggle}
            className={`px-4 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer ${
              isPreview
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-surface-container-low hover:bg-surface-variant text-secondary hover:text-foreground'
            }`}
          >
            {isPreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{isPreview ? 'Quay lại soạn thảo' : 'Preview'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={onSave}
          disabled={!canSave || saving}
          className="px-6 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{saving ? 'Đang lưu...' : 'Lưu bài học (Save)'}</span>
        </button>

        <button
          type="button"
          onClick={() => setCollapsed(true)}
          className="p-1.5 rounded-lg border border-border bg-surface-container-low hover:bg-surface-variant text-secondary hover:text-foreground transition-colors flex items-center justify-center cursor-pointer"
          title="Thu gọn thanh công cụ"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

