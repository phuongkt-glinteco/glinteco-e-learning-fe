"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { BookOpen, FileText, AlertTriangle } from "lucide-react";
import { deriveLessonSidebarState, useSafePuck } from "../../helper";

export const SidebarContentField: React.FC = () => {
  const t = useTranslations("PuckEditor.Common.sidebar");
  const puck = useSafePuck();

  const derivedState = React.useMemo(() => {
    const content = (puck?.appState?.data?.content || []) as Array<{
      type?: string;
      props?: Record<string, unknown>;
    }>;
    return deriveLessonSidebarState(content, {
      defaultExerciseTitle: t("defaultExerciseTitle"),
      defaultDocTitle: t("defaultDocTitle"),
    });
  }, [puck?.appState?.data?.content, t]);

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

  return (
    <div className="space-y-4 pt-2">
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