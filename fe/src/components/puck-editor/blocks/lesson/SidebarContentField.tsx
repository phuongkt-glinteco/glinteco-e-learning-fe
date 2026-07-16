"use client";

import React from "react";
import { useParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  BookOpen,
  FileText,
  AlertTriangle,
  Hash,
  RefreshCw,
  Plus,
  Trash2,
  ShieldAlert,
} from "lucide-react";
import { deriveLessonSidebarState, useSafePuck } from "../../helper";
import { useLessonDraftStore } from "../../../../stores/lessonDraftStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/default/dialog";
import { Button } from "@/components/ui/default/button";
import {
  DocumentPickerField,
  ExercisePickerField,
  TypePickerDialog,
  FullPRCreateModal,
  MinigameCreateDialog,
  type DocumentItem,
  type ExerciseItem,
} from "../../fields";

export const SidebarContentField: React.FC = () => {
  const t = useTranslations("PuckEditor.Common.sidebar");
  const puck = useSafePuck();
  const params = useParams<{ id?: string; lessonId?: string; index?: string }>();
  const pathname = usePathname();

  const [deleteWarning, setDeleteWarning] = React.useState<{
    type: "doc" | "ex";
    id: string;
    title: string;
    inlineBlocks: Array<{ index: number; type: string; title?: string }>;
  } | null>(null);

  const [showTypePicker, setShowTypePicker] = React.useState(false);
  const [showPRModal, setShowPRModal] = React.useState(false);
  const [showMinigameDialog, setShowMinigameDialog] = React.useState(false);
  const [selectedMinigameType, setSelectedMinigameType] = React.useState<"QUIZ" | "FILL_IN_BLANK">("QUIZ");

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
    return deriveLessonSidebarState(
      content,
      {
        defaultExerciseTitle: t("defaultExerciseTitle"),
        defaultDocTitle: t("defaultDocTitle"),
      },
      (puck?.appState?.data?.root?.props || {}) as Record<string, unknown>
    );
  }, [draft?.body, puck?.appState?.data?.content, puck?.appState?.data?.root?.props, t]);

  const inlineUsageMap = React.useMemo(() => {
    const docMap = new Map<string, Array<{ index: number; type: string; title?: string }>>();
    const exMap = new Map<string, Array<{ index: number; type: string; title?: string }>>();
    const content = (puck?.appState?.data?.content || []) as Array<{
      type?: string;
      props?: Record<string, unknown>;
    }>;

    content.forEach((block, idx) => {
      if (block.type === "ReferenceDocumentBlock") {
        const docId = block.props?.documentId as string;
        if (docId) {
          const list = docMap.get(docId) || [];
          list.push({
            index: idx,
            type: "ReferenceDocumentBlock",
            title: (block.props?.altText as string) || (block.props?.title as string) || "ReferenceDocumentBlock",
          });
          docMap.set(docId, list);
        }
      } else if (block.type === "SingleExerciseBlock") {
        const contentObj = (block.props?.content as { exerciseId?: string; title?: string }) || {};
        const exId = contentObj.exerciseId || (block.props?.exerciseId as string);
        if (exId) {
          const list = exMap.get(exId) || [];
          list.push({
            index: idx,
            type: "SingleExerciseBlock",
            title: contentObj.title || (block.props?.title as string) || "SingleExerciseBlock",
          });
          exMap.set(exId, list);
        }
      } else if (block.type === "GroupExerciseBlock") {
        const exs =
          (block.props?.exerciseData as Array<{ exerciseId?: string; id?: string; title?: string }>) || [];
        exs.forEach((ex) => {
          const exId = ex.exerciseId || ex.id;
          if (exId) {
            const list = exMap.get(exId) || [];
            list.push({
              index: idx,
              type: "GroupExerciseBlock",
              title: (block.props?.title as string) || "GroupExerciseBlock",
            });
            exMap.set(exId, list);
          }
        });
      }
    });

    return { docMap, exMap };
  }, [puck?.appState?.data?.content]);

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

  const handleUpdateDocuments = React.useCallback(
    (newDocs: DocumentItem[]) => {
      if (!puck?.appState?.data) return;
      puck.dispatch({
        type: "setData",
        data: {
          ...puck.appState.data,
          root: {
            ...(puck.appState.data.root || {}),
            props: {
              ...((puck.appState.data.root?.props || {}) as Record<string, unknown>),
              documents: newDocs,
            },
          },
        } as any,
      });
    },
    [puck]
  );

  const handleAddExercise = React.useCallback(
    (newItem: ExerciseItem) => {
      if (!puck?.appState?.data || !newItem.id) return;
      const currentExs = derivedState.exercises;
      if (currentExs.some((e) => e.id === newItem.id || e.exerciseId === newItem.id)) return;
      const updated = [
        ...currentExs,
        {
          exerciseId: newItem.id,
          id: newItem.id,
          title: newItem.title || t("defaultExerciseTitle"),
          status: newItem.status || "draft",
          type: "QUIZ",
          isMandatory: true,
        },
      ];
      puck.dispatch({
        type: "setData",
        data: {
          ...puck.appState.data,
          root: {
            ...(puck.appState.data.root || {}),
            props: {
              ...((puck.appState.data.root?.props || {}) as Record<string, unknown>),
              exercises: updated,
            },
          },
        } as any,
      });
    },
    [puck, derivedState.exercises, t]
  );

  const handleTypeSelect = (type: "PR_REVIEW" | "QUIZ" | "FILL_IN_BLANK") => {
    setShowTypePicker(false);
    if (type === "PR_REVIEW") {
      setShowPRModal(true);
    } else {
      setSelectedMinigameType(type);
      setShowMinigameDialog(true);
    }
  };

  const handleAddExerciseFromModal = React.useCallback(
    (newItem: { exerciseId?: string; id?: string; title?: string; status?: "draft" | "complete"; type?: string }) => {
      const newId = newItem.exerciseId || newItem.id;
      if (!puck?.appState?.data || !newId) return;
      const currentExs = derivedState.exercises;
      if (currentExs.some((e) => e.id === newId || e.exerciseId === newId)) return;
      const updated = [
        ...currentExs,
        {
          exerciseId: newId,
          id: newId,
          title: newItem.title || t("defaultExerciseTitle"),
          status: newItem.status || "draft",
          type: newItem.type || "QUIZ",
          isMandatory: true,
        },
      ];
      puck.dispatch({
        type: "setData",
        data: {
          ...puck.appState.data,
          root: {
            ...(puck.appState.data.root || {}),
            props: {
              ...((puck.appState.data.root?.props || {}) as Record<string, unknown>),
              exercises: updated,
            },
          },
        } as any,
      });
      setShowPRModal(false);
      setShowMinigameDialog(false);
    },
    [puck, derivedState.exercises, t]
  );

  const handleConfirmDelete = React.useCallback(
    (target: { type: "doc" | "ex"; id: string; inlineBlocks?: Array<{ index: number; type: string }> }) => {
      if (!puck?.appState?.data) return;
      let nextContent = [
        ...((puck.appState.data.content || []) as Array<{
          type?: string;
          props?: Record<string, unknown>;
        }>),
      ];
      const targetId = target.id;

      if (target.inlineBlocks && target.inlineBlocks.length > 0) {
        const indicesToRemove: number[] = [];
        target.inlineBlocks.forEach((info) => {
          if (info.type === "ReferenceDocumentBlock" && target.type === "doc") {
            const block = nextContent[info.index];
            const docs = (block?.props?.documents as Array<{ id?: string }>) || [];
            if (docs.length <= 1) {
              indicesToRemove.push(info.index);
            } else {
              nextContent[info.index] = {
                ...block,
                props: {
                  ...block.props,
                  documents: docs.filter((d) => d.id !== targetId),
                },
              };
            }
          } else if (info.type === "SingleExerciseBlock" && target.type === "ex") {
            indicesToRemove.push(info.index);
          } else if (info.type === "GroupExerciseBlock" && target.type === "ex") {
            const block = nextContent[info.index];
            const exs =
              (block?.props?.exerciseData as Array<{ id?: string; exerciseId?: string }>) || [];
            if (exs.length <= 1) {
              indicesToRemove.push(info.index);
            } else {
              nextContent[info.index] = {
                ...block,
                props: {
                  ...block.props,
                  exerciseData: exs.filter((e) => e.id !== targetId && e.exerciseId !== targetId),
                },
              };
            }
          }
        });

        if (indicesToRemove.length > 0) {
          const removeSet = new Set(indicesToRemove);
          nextContent = nextContent.filter((_, idx) => !removeSet.has(idx));
        }
      }

      const currentRootProps = (puck.appState.data.root?.props || {}) as Record<string, unknown>;
      const nextRootProps = { ...currentRootProps };

      if (target.type === "doc") {
        const currentDocs = (derivedState.documents || []) as Array<{ id?: string }>;
        nextRootProps.documents = currentDocs.filter((d) => d.id !== targetId);
      } else {
        const currentExs = (derivedState.exercises || []) as Array<{ id?: string; exerciseId?: string }>;
        nextRootProps.exercises = currentExs.filter((e) => (e.id || e.exerciseId) !== targetId);
      }

      puck.dispatch({
        type: "setData",
        data: {
          ...puck.appState.data,
          content: nextContent,
          root: {
            ...(puck.appState.data.root || {}),
            props: nextRootProps,
          },
        } as any,
      });
      setDeleteWarning(null);
    },
    [puck, derivedState]
  );

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
          <p className="text-label-xs text-muted-foreground italic">
            Chưa có mục lục. Nhấn Đồng bộ nếu vừa thêm Heading.
          </p>
        )}
      </div>

      {/* Exercises Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-label-sm font-semibold text-foreground">
            <FileText className="w-4 h-4 text-primary" />
            <span>{t("exerciseCount", { count: derivedState.exercises.length })}</span>
          </div>
          {puck && (
            <button
              type="button"
              onClick={() => setShowTypePicker(true)}
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>{t("createBtn")}</span>
            </button>
          )}
        </div>
        {derivedState.exercises.length > 0 ? (
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {derivedState.exercises.map((ex, i) => {
              const exId = ex.id || ex.exerciseId || "";
              const inlineList = inlineUsageMap.exMap.get(exId);
              const isInline = inlineList && inlineList.length > 0;
              return (
                <div
                  key={`ex-${i}`}
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
                  {isInline ? (
                    <span className="shrink-0 text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800 font-medium">
                      {t("inlineBadge", { index: inlineList[0].index + 1 })}
                    </span>
                  ) : (
                    <span className="shrink-0 text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded border font-medium">
                      {t("freeBadge")}
                    </span>
                  )}
                  {ex.status === "draft" && (
                    <button
                      type="button"
                      onClick={() => handleCompleteDraft(ex)}
                      className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-600 text-white hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      {t("completeDraftBtn")}
                    </button>
                  )}
                  {puck && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!exId) return;
                        if (isInline) {
                          setDeleteWarning({
                            type: "ex",
                            id: exId,
                            title: ex.title || t("exTypeLabel"),
                            inlineBlocks: inlineList,
                          });
                        } else {
                          handleConfirmDelete({ type: "ex", id: exId });
                        }
                      }}
                      className="shrink-0 text-muted-foreground hover:text-destructive transition-colors p-0.5 cursor-pointer"
                      title={t("deleteItemTitle")}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-label-xs text-muted-foreground italic">{t("noExercises")}</p>
        )}
      </div>

      {/* Documents Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-label-sm font-semibold text-foreground">
            <BookOpen className="w-4 h-4 text-primary" />
            <span>{t("documentCount", { count: derivedState.documents.length })}</span>
          </div>
          {puck && (
            <DocumentPickerField
              value={derivedState.documents}
              onChange={handleUpdateDocuments}
              hideList
              renderTrigger={(openDialog) => (
                <button
                  type="button"
                  onClick={openDialog}
                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>{t("addBtn")}</span>
                </button>
              )}
            />
          )}
        </div>
        {derivedState.documents.length > 0 ? (
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {derivedState.documents.map((doc, i) => {
              const docId = doc.id || "";
              const inlineList = inlineUsageMap.docMap.get(docId);
              const isInline = inlineList && inlineList.length > 0;
              return (
                <div
                  key={`doc-${i}`}
                  className="flex items-center gap-2 p-2 rounded-lg text-xs border bg-surface-container-low border-outline-variant/60"
                >
                  <BookOpen className="w-3.5 h-3.5 text-secondary shrink-0" />
                  <span className="truncate flex-1 font-medium">
                    {doc.title || t("docFallback", { index: i + 1 })}
                  </span>
                  {isInline ? (
                    <span className="shrink-0 text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800 font-medium">
                      {t("inlineBadge", { index: inlineList[0].index + 1 })}
                    </span>
                  ) : (
                    <span className="shrink-0 text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded border font-medium">
                      {t("freeBadge")}
                    </span>
                  )}
                  {puck && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!docId) return;
                        if (isInline) {
                          setDeleteWarning({
                            type: "doc",
                            id: docId,
                            title: doc.title || t("docTypeLabel"),
                            inlineBlocks: inlineList,
                          });
                        } else {
                          handleConfirmDelete({ type: "doc", id: docId });
                        }
                      }}
                      className="shrink-0 text-muted-foreground hover:text-destructive transition-colors p-0.5 cursor-pointer"
                      title={t("deleteItemTitle")}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-label-xs text-muted-foreground italic">{t("noDocuments")}</p>
        )}
      </div>

      {/* Warning Dialog for Deleting Inline Item */}
      <Dialog open={Boolean(deleteWarning)} onOpenChange={(o) => !o && setDeleteWarning(null)}>
        <DialogContent className="max-w-md bg-surface border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-semibold text-destructive">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>{t("deleteWarningTitle")}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-xs text-foreground py-2">
            <p>
              {t("deleteWarningDesc", {
                type: deleteWarning?.type === "doc" ? t("docTypeLabel") : t("exTypeLabel"),
                title: deleteWarning?.title || "",
                count: deleteWarning?.inlineBlocks.length || 0,
              })}
            </p>
            <div className="p-2.5 rounded-md bg-destructive/10 border border-destructive/20 text-destructive-foreground space-y-1">
              <p className="font-medium">{t("deleteWarningNote")}</p>
              <ul className="list-disc list-inside text-[11px] space-y-0.5 opacity-90">
                <li>{t("deleteWarningRule1")}</li>
                <li>{t("deleteWarningRule2")}</li>
              </ul>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteWarning(null)}
            >
              {t("cancelBtn")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => deleteWarning && handleConfirmDelete(deleteWarning)}
            >
              {t("confirmDeleteBtn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TypePickerDialog
        open={showTypePicker}
        onClose={() => setShowTypePicker(false)}
        onSelect={handleTypeSelect}
      />
      <FullPRCreateModal
        open={showPRModal}
        onClose={() => setShowPRModal(false)}
        trackId={(params?.id as string) || "track"}
        onSaved={(data) => handleAddExerciseFromModal(data as any)}
        mode="create"
      />
      <MinigameCreateDialog
        open={showMinigameDialog}
        onClose={() => setShowMinigameDialog(false)}
        trackId={(params?.id as string) || "track"}
        onSaved={(data) => handleAddExerciseFromModal(data as any)}
        initData={{ type: selectedMinigameType }}
      />
    </div>
  );
};