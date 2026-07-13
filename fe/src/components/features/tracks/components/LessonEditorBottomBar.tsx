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
  Sparkles,
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
  onHandleAiGenerate?: () => void;
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
  onHandleAiGenerate,
  onReset,
  onUndo,
  onRedo,
  onCancel,
}: LessonEditorBottomBarProps) {
  const t = useTranslations('PuckEditor.Common.LearnerView');
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  if (collapsed) {
    return (
      <div className="fixed bottom-5 right-5 z-50">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="px-4 py-2.5 rounded-full border border-border bg-surface shadow-lg hover:bg-surface-container text-foreground transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer"
          title={t('expandToolbarTitle')}
        >
          <ChevronUp className="w-4 h-4 text-primary" />
          <span>{t('expandToolbarBtn')}</span>
        </button>
      </div>
    );
  }

  async function handleAiGenerate() {
    if (aiGenerating) return;
    try {
      setAiGenerating(true);
      await onHandleAiGenerate?.();
    } finally {
      setAiGenerating(false);
    }
  }

  return (
    <div className="sticky bottom-0 z-40 w-full bg-surface border-t border-border px-6 py-3 flex items-center justify-between flex-wrap gap-4 shadow-sm transition-all">
      {/* Cụm Trở lại (Cancel) + Undo / Redo / Reset */}
      <div className="flex items-center gap-2 flex-wrap">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg border border-border bg-surface-container-low hover:bg-surface-variant text-secondary hover:text-foreground transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            title={t('cancelTitle')}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('cancelBtn')}</span>
          </button>
        )}
        {onUndo && (
          <button
            type="button"
            onClick={onUndo}
            className="px-3 py-1.5 rounded-lg border border-border bg-surface-container-low hover:bg-surface-variant text-secondary hover:text-foreground transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            title={t('undoTitle')}
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
            title={t('redoTitle')}
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
            title={t('resetTitle')}
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>
      {!isPreview && (
          <button
            type="button"
            onClick={handleAiGenerate}
            disabled={aiGenerating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {aiGenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            {aiGenerating ? t('aiGenerating') : t('aiGenerateBtn')}
          </button>
      )}

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
            <span>{isPreview ? t('backToEditBtn') : t('previewBtn')}</span>
          </button>
        )}

        <button
          type="button"
          onClick={onSave}
          disabled={!canSave || saving}
          className="px-6 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{saving ? t('savingLesson') : t('saveLessonBtn')}</span>
        </button>

        <button
          type="button"
          onClick={() => setCollapsed(true)}
          className="p-1.5 rounded-lg border border-border bg-surface-container-low hover:bg-surface-variant text-secondary hover:text-foreground transition-colors flex items-center justify-center cursor-pointer"
          title={t('collapseToolbarTitle')}
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
