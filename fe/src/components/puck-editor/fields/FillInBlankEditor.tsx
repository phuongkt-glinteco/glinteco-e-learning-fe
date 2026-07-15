"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Undo2, Redo2, Eye, Code2, Pointer, MousePointer2, X } from "lucide-react";
import { parseFillInBlankTokens } from "./fillInBlankUtils";

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
  const t = useTranslations("PuckEditor.Lesson.fillInBlankEditor");
  const [showPreview, setShowPreview] = useState(false);
  const [selectMode, setSelectMode] = useState(true);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
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
    if (start === end || start < 0 || end > value.length) return;

    const selectedText = value.slice(start, end);
    if (selectedText.includes("[") || selectedText.includes("]")) return;

    let nextIdNum = 1;
    const existingNums = blanks.map((b) => Number(b.id)).filter((n) => !isNaN(n));
    if (existingNums.length > 0) {
      nextIdNum = Math.max(...existingNums) + 1;
    }
    const newId = String(nextIdNum);
    const length = selectedText.length;
    const token = `[${newId}_${length}]`;

    const newBlank: Blank = {
      id: newId,
      start,
      end: start + token.length,
      answer: selectedText,
    };

    const nextValue = value.slice(0, start) + token + value.slice(end);
    const nextBlanks = [...blanks, newBlank];
    onChange(nextValue);
    onBlanksChange(nextBlanks);
    pushHistory(nextBlanks);
  }, [blanks, value, onChange, onBlanksChange, pushHistory]);

  const handleTextMouseUp = useCallback(() => {
    if (!selectMode) return;
    const ta = textRef.current;
    if (!ta) return;
    if (ta.selectionStart !== ta.selectionEnd) {
      createBlankFromSelection();
      ta.selectionStart = ta.selectionEnd;
    }
  }, [selectMode, createBlankFromSelection]);

  const handleVisualBoxMouseUp = useCallback(() => {
    if (!selectMode) return;
    const sel = window.getSelection();
    const div = divRef.current;
    if (!sel || sel.isCollapsed || !div) return;

    const selectedText = sel.toString();
    if (!selectedText || selectedText.includes("[") || selectedText.includes("]")) return;

    const range = sel.getRangeAt(0);
    if (!div.contains(range.commonAncestorContainer)) return;

    const preRange = range.cloneRange();
    preRange.selectNodeContents(div);
    preRange.setEnd(range.startContainer, range.startOffset);
    const visibleOffsetBefore = preRange.toString().length;

    const { parts } = parseFillInBlankTokens(value);
    let currVisible = 0;
    let currValueOffset = 0;
    let startInValue = -1;

    for (const part of parts) {
      const match = part.match(/^\[(\d+)_(\d+)\]$/);
      if (match) {
        const rawKey = match[1].trim();
        const blank = blanks.find((b) => b.id === rawKey);
        const displayed = blank?.answer || part;
        if (startInValue === -1 && visibleOffsetBefore >= currVisible && visibleOffsetBefore <= currVisible + displayed.length) {
          return;
        }
        currVisible += displayed.length;
        currValueOffset += part.length;
      } else {
        if (startInValue === -1 && visibleOffsetBefore >= currVisible && visibleOffsetBefore <= currVisible + part.length) {
          const offsetWithinPart = visibleOffsetBefore - currVisible;
          startInValue = currValueOffset + offsetWithinPart;
          break;
        }
        currVisible += part.length;
        currValueOffset += part.length;
      }
    }

    if (startInValue === -1 || startInValue < 0 || startInValue + selectedText.length > value.length) return;

    const sliceInValue = value.slice(startInValue, startInValue + selectedText.length);
    if (sliceInValue !== selectedText) {
      return;
    }

    let nextIdNum = 1;
    const existingNums = blanks.map((b) => Number(b.id)).filter((n) => !isNaN(n));
    if (existingNums.length > 0) {
      nextIdNum = Math.max(...existingNums) + 1;
    }
    const newId = String(nextIdNum);
    const length = selectedText.length;
    const token = `[${newId}_${length}]`;

    const newBlank: Blank = {
      id: newId,
      start: startInValue,
      end: startInValue + token.length,
      answer: selectedText,
    };

    const nextValue = value.slice(0, startInValue) + token + value.slice(startInValue + selectedText.length);
    const nextBlanks = [...blanks, newBlank];
    onChange(nextValue);
    onBlanksChange(nextBlanks);
    pushHistory(nextBlanks);
    sel.removeAllRanges();
  }, [selectMode, value, blanks, onChange, onBlanksChange, pushHistory]);

  const handleRemoveBlank = useCallback((id: string) => {
    const blank = blanks.find((b) => b.id === id);
    if (blank) {
      const tokenRegex = new RegExp(`\\[${id}_\\d+\\]|\\[\\[${id}\\]\\]`, "g");
      onChange(value.replace(tokenRegex, blank.answer));
    }
    const next = blanks.filter((b) => b.id !== id);
    onBlanksChange(next);
    pushHistory(next);
  }, [blanks, value, onChange, onBlanksChange, pushHistory]);

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

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = textRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const spaces = "  ";
      const nextVal = value.slice(0, start) + spaces + value.slice(end);
      onChange(nextVal);
      setTimeout(() => {
        if (textRef.current) {
          textRef.current.selectionStart = textRef.current.selectionEnd = start + spaces.length;
        }
      }, 0);
    }
  }, [value, onChange]);

  const renderPreviewText = useCallback(() => {
    if (!value) return null;
    const { parts } = parseFillInBlankTokens(value);
    return parts.map((part, index) => {
      const match = part.match(/^\[(\d+)_(\d+)\]$/);
      if (!match) {
        return <span key={index}>{part}</span>;
      }
      const rawKey = match[1].trim();
      const lengthAttr = match[2] ? Number(match[2]) : undefined;
      const blank = blanks.find((b) => b.id === rawKey);
      return (
        <span
          key={`${rawKey}-${index}`}
          className="inline-block font-bold underline decoration-2 decoration-primary text-primary bg-primary/10 dark:bg-primary/20 mx-0.5 px-1 rounded"
          title={`Blank #${rawKey} (${lengthAttr || blank?.answer?.length || '?'} ký tự)`}
        >
          {blank?.answer || `[${rawKey}_${lengthAttr || '?'}]`}
        </span>
      );
    });
  }, [value, blanks]);

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => setSelectMode(!selectMode)}
          className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded border transition-colors cursor-pointer ${
            selectMode
              ? "bg-amber-100 border-amber-500 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-medium"
              : "border-border hover:bg-surface-container-low"
          }`}
          title={t("selectModeTitle")}
        >
          {selectMode ? (
            <Pointer className="h-3 w-3" />
          ) : (
            <MousePointer2 className="h-3 w-3" />
          )}
          {selectMode ? "Đang chọn ô điền khuyết (Bôi đen text)" : t("selectBlankBtn")}
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
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-medium text-muted-foreground">{t("sourceCodeLabel")}</label>
            {selectMode && (
              <span className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Pointer className="h-3 w-3" />
                Bôi đen từ khóa trực tiếp trên khung dưới để tạo blank
              </span>
            )}
          </div>
          {selectMode ? (
            <div
              ref={divRef}
              onMouseUp={handleVisualBoxMouseUp}
              className="w-full min-h-[160px] max-h-60 text-xs p-3 rounded-md border border-amber-400 bg-amber-50/20 dark:bg-amber-950/10 font-mono overflow-y-auto whitespace-pre-wrap break-all cursor-crosshair select-text leading-relaxed"
              title="Bôi đen từ khóa để biến thành ô điền khuyết"
            >
              {value ? renderPreviewText() : <span className="text-muted-foreground italic">{t("sourceCodePlaceholder")}</span>}
            </div>
          ) : (
            <textarea
              ref={textRef}
              value={value}
              onMouseUp={handleTextMouseUp}
              onKeyDown={handleKeyDown}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-40 text-xs p-3 rounded-md border border-border bg-surface-container-lowest font-mono resize-y outline-none transition-colors cursor-text focus:border-primary leading-relaxed"
              placeholder={t("sourceCodePlaceholder")}
            />
          )}
        </div>

        {showPreview && (
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">{t("previewLabel")}</label>
            <div className="w-full min-h-[100px] max-h-40 p-3 rounded-md border border-border bg-surface-container-lowest text-xs font-mono overflow-y-auto whitespace-pre-wrap break-all leading-relaxed">
              {value ? renderPreviewText() : <span className="text-muted-foreground italic">{t("noContent")}</span>}
            </div>
          </div>
        )}
      </div>

      {/* Blank list */}
      {blanks.length > 0 && (
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">{t("blankListLabel")}</label>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {blanks.map((blank, i) => (
              <div key={blank.id} className="flex items-center gap-2 text-xs px-2 py-1 rounded bg-surface-container-low border border-border">
                <span className="text-muted-foreground shrink-0">#{i + 1}</span>
                <span className="text-muted-foreground shrink-0">[{blank.start}-{blank.end}]</span>
                <span className="truncate flex-1 font-mono font-bold underline decoration-primary">{blank.answer}</span>
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
