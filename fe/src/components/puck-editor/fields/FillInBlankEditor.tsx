"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Undo2, Redo2, Eye, Code2, Pointer, MousePointer2 } from "lucide-react";

interface Blank {
  id: string;
  start: number;
  end: number;
  answer: string;
}

interface HistoryEntry {
  blanks: Blank[];
}

export const FillInBlankEditor: React.FC<{
  value: string;
  onChange: (val: string) => void;
  blanks: Blank[];
  onBlanksChange: (blanks: Blank[]) => void;
}> = ({ value, onChange, blanks, onBlanksChange }) => {
  const t = useTranslations("PuckEditor.fillInBlankEditor");
  const [showPreview, setShowPreview] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([{ blanks: [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  useEffect(() => {
    onBlanksChange(blanks);
  }, []);

  const pushHistory = useCallback((newBlanks: Blank[]) => {
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      const next = [...trimmed, { blanks: newBlanks }];
      setHistoryIndex(next.length - 1);
      return next;
    });
  }, [historyIndex]);

  const createBlankFromSelection = useCallback(() => {
    const ta = textRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    if (start === end) return;

    const overlap = blanks.some(
      (b) => (start >= b.start && start < b.end) || (end > b.start && end <= b.end)
    );
    if (overlap) return;

    const newBlank: Blank = {
      id: `blank-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      start,
      end,
      answer: value.slice(start, end),
    };

    const next = [...blanks, newBlank].sort((a, b) => a.start - b.start);
    onBlanksChange(next);
    pushHistory(next);
  }, [blanks, value, onBlanksChange, pushHistory]);

  const handleMouseUp = useCallback(() => {
    if (!selectMode) return;
    const ta = textRef.current;
    if (!ta) return;
    if (ta.selectionStart !== ta.selectionEnd) {
      createBlankFromSelection();
      ta.selectionStart = ta.selectionEnd;
    }
  }, [selectMode, createBlankFromSelection]);

  const handleRemoveBlank = useCallback((id: string) => {
    const next = blanks.filter((b) => b.id !== id);
    onBlanksChange(next);
    pushHistory(next);
  }, [blanks, onBlanksChange, pushHistory]);

  const handleUndo = useCallback(() => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    onBlanksChange(history[newIndex].blanks);
  }, [historyIndex, history, onBlanksChange]);

  const handlePrevdo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    onBlanksChange(history[newIndex].blanks);
  }, [historyIndex, history, onBlanksChange]);

  const renderPreviewText = useCallback(() => {
    if (blanks.length === 0) return value;

    const parts: React.ReactNode[] = [];
    let lastIdx = 0;

    for (const blank of blanks) {
      if (blank.start > lastIdx) {
        parts.push(<span key={`text-${lastIdx}`}>{value.slice(lastIdx, blank.start)}</span>);
      }
      parts.push(
        <span
          key={blank.id}
          className="inline-block border border-amber-500 bg-amber-50 dark:bg-amber-950/30 mx-0.5 px-1 rounded text-amber-700 dark:text-amber-300 font-bold"
          title={blank.answer}
        >
          {blank.answer}
        </span>
      );
      lastIdx = blank.end;
    }
    if (lastIdx < value.length) {
      parts.push(<span key={`text-end`}>{value.slice(lastIdx)}</span>);
    }

    return parts;
  }, [value, blanks]);

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => setSelectMode(!selectMode)}
          className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded border transition-colors cursor-pointer ${
            selectMode
              ? "bg-amber-100 border-amber-500 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
              : "border-border hover:bg-surface-container-low"
          }`}
          title={t("selectModeTitle")}
        >
          {selectMode ? (
            <Pointer className="h-3 w-3" />
          ) : (
            <MousePointer2 className="h-3 w-3" />
          )}
          {selectMode ? t("selectingMode") : t("selectBlankBtn")}
        </button>

        <div className="w-px h-4 bg-border mx-1" />

        <button
          type="button"
          onClick={handleUndo}
          disabled={historyIndex <= 0}
          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-border hover:bg-surface-container-low transition-colors disabled:opacity-40 cursor-pointer"
          title={t("undoTitle")}
        >
          <Undo2 className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={handlePrevdo}
          disabled={historyIndex >= history.length - 1}
          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-border hover:bg-surface-container-low transition-colors disabled:opacity-40 cursor-pointer"
          title={t("redoTitle")}
        >
          <Redo2 className="h-3 w-3" />
        </button>

        <div className="w-px h-4 bg-border mx-1" />

        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded border transition-colors cursor-pointer ${
            showPreview
              ? "bg-primary/10 border-primary text-primary"
              : "border-border hover:bg-surface-container-low"
          }`}
        >
          {showPreview ? <Code2 className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          {showPreview ? t("codeModeBtn") : t("previewModeBtn")}
        </button>

        <span className="text-[10px] text-muted-foreground ml-auto">
          {t("blankCountLabel", { count: blanks.length })}
        </span>
      </div>

      {/* Editor / Preview split */}
      <div className={showPreview ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : "space-y-3"}>
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">{t("sourceCodeLabel")}</label>
          <textarea
            ref={textRef}
            value={value}
            onMouseUp={handleMouseUp}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full h-40 text-xs p-2 rounded-md border font-mono resize-y outline-none transition-colors ${
              selectMode
                ? "border-amber-400 bg-amber-50/50 dark:bg-amber-950/10 cursor-crosshair"
                : "border-border bg-surface-container-lowest cursor-text focus:border-primary"
            }`}
            placeholder={t("sourceCodePlaceholder")}
          />
          {selectMode && (
            <p className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Pointer className="h-3 w-3" />
              {t("selectModeHint")}
            </p>
          )}
        </div>

        {showPreview && (
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">{t("previewLabel")}</label>
            <div className="w-full h-40 p-2 rounded-md border border-border bg-surface-container-lowest text-xs font-mono overflow-y-auto whitespace-pre-wrap break-all">
              {value ? renderPreviewText() : <span className="text-muted-foreground italic">{t("noContent")}</span>}
            </div>
          </div>
        )}
      </div>

      {!showPreview && (
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">{t("previewBorderedLabel")}</label>
          <div className="w-full min-h-[60px] p-2 rounded-md border border-border bg-surface-container-lowest text-xs font-mono whitespace-pre-wrap break-all">
            {value ? renderPreviewText() : <span className="text-muted-foreground italic">{t("noContent")}</span>}
          </div>
        </div>
      )}

      {/* Blank list */}
      {blanks.length > 0 && (
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">{t("blankListLabel")}</label>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {blanks.map((blank, i) => (
              <div key={blank.id} className="flex items-center gap-2 text-xs px-2 py-1 rounded bg-surface-container-low border border-border">
                <span className="text-muted-foreground shrink-0">#{i + 1}</span>
                <span className="text-muted-foreground shrink-0">[{blank.start}-{blank.end}]</span>
                <span className="truncate flex-1 font-mono">{blank.answer}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveBlank(blank.id)}
                  className="text-destructive hover:opacity-80 cursor-pointer shrink-0 text-[11px]"
                >
                  {t("deleteBtn")}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
