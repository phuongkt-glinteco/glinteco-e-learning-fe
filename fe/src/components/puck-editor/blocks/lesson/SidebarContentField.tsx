"use client";

import React from "react";
import { useParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { BookOpen, FileText, AlertTriangle, Hash, RefreshCw } from "lucide-react";
import { deriveLessonSidebarState, useSafePuck } from "../../helper";
import { useLessonDraftStore } from "../../../../stores/lessonDraftStore";

export const SidebarContentField: React.FC = () => {
  const t = useTranslations("PuckEditor.Common.sidebar");
  const puck = useSafePuck();
  const params = useParams<{ id?: string; lessonId?: string; index?: string }>();
  const pathname = usePathname();

  const draftKey = React.useMemo(() => {
    const trackId = params?.id || "track";
    const lessonId = params?.lessonId;
    const editIndex = params?.index;
    const isNew = pathname?.endsWith("/lessons/new");
    return `${trackId}-${lessonId || editIndex || (isNew ? "new" : "new")}`;
  }, [params, pathname]);

  const draft = useLessonDraftStore((state) => state.drafts[draftKey]);

  const derivedState = React.useMemo(() => {
    let content: Array<{ type?: string; props?: Record<string, unknown> }> = [];
    if (draft?.body) {
      try {
        const parsed = JSON.parse(draft.body);
        if (parsed && typeof parsed === "object" && Array.isArray(parsed.content)) {
          content = parsed.content;
        }
      } catch {
        // Fallback nếu JSON không hợp lệ
      }
    }
    if (content.length === 0) {
      content = (puck?.appState?.data?.content || []) as Array<{
        type?: string;
        props?: Record<string, unknown>;
      }>;
    }
    return deriveLessonSidebarState(content, {
      defaultExerciseTitle: t("defaultExerciseTitle"),
      defaultDocTitle: t("defaultDocTitle"),
    }, (puck?.appState?.data?.root?.props || {}) as Record<string, unknown>);
  }, [draft?.body, puck?.appState?.data?.content, puck?.appState?.data?.root?.props, t]);

  const handleCompleteDraft = React.useCallback(
    (exercise: { id?: string; blockIndex?: number }) => {
      if (!exercise.id || typeof exercise.blockIndex !== "number" || !puck) {
        return;
      }
      puck.dispatch({
        type: "setUi",
        ui: { itemSelector: { index: exercise.blockIndex } },
        recordHistory: false,
      });
      window.dispatchEvent(
        new CustomEvent("lesson-exercise-draft-complete", {
          detail: { exerciseId: exercise.id, blockIndex: exercise.blockIndex },
        })
      );
    },
    [puck]
  );

  const handleSyncHeadings = React.useCallback(() => {
    if (!puck?.appState?.data) return;
    const content = (puck.appState.data.content || []) as Array<{
      type?: string;
      props?: Record<string, unknown>;
    }>;
    const { headings } = deriveLessonSidebarState(content, {
      defaultExerciseTitle: t("defaultExerciseTitle"),
      defaultDocTitle: t("defaultDocTitle"),
    });
    puck.dispatch({
      type: "setData",
      data: {
        ...puck.appState.data,
        root: {
          ...(puck.appState.data.root || {}),
          props: {
            ...((puck.appState.data.root?.props || {}) as Record<string, unknown>),
            headings,
          },
        },
      } as any,
    });
  }, [puck, t]);

  return (
    <div className="space-y-4 pt-2">
      {/* Headings Section (SSOT Table of Contents) */}
      <div className="space-y-2 border-b border-outline-variant/60 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-label-sm font-semibold text-foreground">
            <Hash className="w-4 h-4 text-primary" />
            <span>Mục lục ({derivedState.headings.length})</span>
          </div>
          {puck && (
            <button
              type="button"
              onClick={handleSyncHeadings}
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
              title="Đồng bộ mục lục từ nội dung canvas vào root props"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Đồng bộ</span>
            </button>
          )}
        </div>
        {derivedState.headings.length > 0 ? (
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {derivedState.headings.map((h, i) => (
              <div
                key={h.id || i}
                className="flex items-center gap-2 p-1.5 rounded-lg text-xs border bg-surface-container-low border-outline-variant/60"
                style={{ paddingLeft: `${Math.max(1, h.level - 1) * 12 + 6}px` }}
              >
                <span className="shrink-0 text-[10px] font-bold text-muted-foreground bg-surface px-1.5 py-0.5 rounded border">
                  H{h.level}
                </span>
                <span className="truncate flex-1 font-medium">{h.text}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-label-xs text-muted-foreground italic">Chưa có mục lục. Nhấn Đồng bộ nếu vừa thêm Heading.</p>
        )}
      </div>

      {/* Exercises Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-label-sm font-semibold text-foreground">
          <FileText className="w-4 h-4 text-primary" />
          <span>{t("exerciseCount", { count: derivedState.exercises.length })}</span>
        </div>
        {derivedState.exercises.length > 0 ? (
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {derivedState.exercises.map((ex, i) => (
              <div
                key={ex.id || i}
                className={`flex items-center gap-2 p-2 rounded-lg text-xs border ${
                  ex.status === "draft"
                    ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-700"
                    : "bg-surface-container-low border-outline-variant/60"
                }`}
              >
                {ex.status === "draft" ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                )}
                <span className="truncate flex-1 font-medium">
                  {ex.title || t("exFallback", { index: i + 1 })}
                </span>
                {ex.status === "draft" && (
                  <button
                    type="button"
                    onClick={() => handleCompleteDraft(ex)}
                    className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-600 text-white hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    {t("completeDraftBtn")}
                  </button>
                )}
                {ex.type && (
                  <span className="shrink-0 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                    {ex.type === "pr"
                      ? t("exerciseTypePr")
                      : ex.type === "minigame_quiz"
                        ? t("exerciseTypeQuiz")
                        : t("exerciseTypeFill")}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-label-xs text-muted-foreground italic">{t("noExercises")}</p>
        )}
      </div>

      {/* Documents Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-label-sm font-semibold text-foreground">
          <BookOpen className="w-4 h-4 text-primary" />
          <span>{t("documentCount", { count: derivedState.documents.length })}</span>
        </div>
        {derivedState.documents.length > 0 ? (
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {derivedState.documents.map((doc, i) => (
              <div
                key={doc.id || i}
                className="flex items-center gap-2 p-2 rounded-lg text-xs border bg-surface-container-low border-outline-variant/60"
              >
                <BookOpen className="w-3.5 h-3.5 text-secondary shrink-0" />
                <span className="truncate flex-1">{doc.title || t("docFallback", { index: i + 1 })}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-label-xs text-muted-foreground italic">{t("noDocuments")}</p>
        )}
      </div>
    </div>
  );
};