"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Plus, Code, Loader2, ListChecks, FileText, Check, Trash2,
} from "lucide-react";
import { exercisesControllerCreate } from "@/services/api-client";
import type { ExerciseDetailDto } from "@/services/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/default/dialog";
import { Button } from "@/components/ui/default/button";
import { Input } from "@/components/ui/default/input";
import { Label } from "@/components/ui/default/label";
import { FillInBlankEditor } from "./FillInBlankEditor";
import { toast } from "sonner";
import { useSafePuck } from "../helper";

// ─── Types ──────────────────────────────────────────────────────────

export interface ExerciseData {
  exerciseId: string;
  title: string;
  status?: "draft" | "complete";
  type?: "PR_REVIEW" | "QUIZ" | "FILL_IN_BLANK";
  xp?: number;
  isMandatory?: boolean;
  previewData?: {
    brief?: string;
    repoUrl?: string;
    questionCount?: number;
    blankCount?: number;
    question?: string;
    answerType?: "single" | "multi";
    answers?: Array<{ text: string; correct: boolean }>;
    fillTemplate?: string;
  };
}

interface QuizAnswer {
  id: string;
  text: string;
  correct: boolean;
}

interface Blank {
  id: string;
  start: number;
  end: number;
  answer: string;
}

// ─── Helpers ────────────────────────────────────────────────────────

function useTrackId(): string {
  return useMemo(() => {
    if (typeof window === 'undefined') return '_';
    const m = window.location.pathname.match(/\/admin\/tracks\/([^/]+)/);
    return m ? m[1] : '_';
  }, []);
}

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

// ─── QuizEditor ─────────────────────────────────────────────────────

const QuizEditor: React.FC<{
  question: string;
  onQuestionChange: (v: string) => void;
  answerType: "single" | "multi";
  onAnswerTypeChange: (v: "single" | "multi") => void;
  answers: QuizAnswer[];
  onAnswersChange: (a: QuizAnswer[]) => void;
}> = ({ question, onQuestionChange, answerType, onAnswerTypeChange, answers, onAnswersChange }) => {
  const t = useTranslations("PuckEditor.Common.ExerciseSelector");

  const handleAddAnswer = useCallback(() => {
    onAnswersChange([...answers, { id: genId(), text: "", correct: false }]);
  }, [answers, onAnswersChange]);

  const handleRemoveAnswer = useCallback((id: string) => {
    onAnswersChange(answers.filter((a) => a.id !== id));
  }, [answers, onAnswersChange]);

  const handleTextChange = useCallback((id: string, text: string) => {
    onAnswersChange(answers.map((a) => a.id === id ? { ...a, text } : a));
  }, [answers, onAnswersChange]);

  const handleToggleCorrect = useCallback((id: string) => {
    if (answerType === "single") {
      onAnswersChange(answers.map((a) => ({ ...a, correct: a.id === id })));
    } else {
      onAnswersChange(answers.map((a) => a.id === id ? { ...a, correct: !a.correct } : a));
    }
  }, [answers, answerType, onAnswersChange]);

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-foreground">{t("quizQuestionRequired")}</Label>
        <textarea
          value={question}
          onChange={(e) => onQuestionChange(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-border bg-surface-container-lowest px-3 py-2 text-xs text-foreground outline-none resize-none focus:border-primary focus:ring-1 focus:ring-primary"
          placeholder={t("quizQuestionPlaceholder")}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-foreground">{t("quizAnswerTypeLabel")}</Label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              onAnswerTypeChange("single");
              onAnswersChange(answers.map((a) => ({ ...a, correct: false })));
            }}
            className={`flex-1 px-3 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
              answerType === "single"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-surface-container-low text-secondary hover:border-primary/50"
            }`}
          >
            {t("quizSingleAnswer")}
          </button>
          <button
            type="button"
            onClick={() => onAnswerTypeChange("multi")}
            className={`flex-1 px-3 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
              answerType === "multi"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-surface-container-low text-secondary hover:border-primary/50"
            }`}
          >
            {t("quizMultiAnswer")}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-foreground">{t("quizAnswersLabel")}</Label>
          <button
            type="button"
            onClick={handleAddAnswer}
            className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
          >
            <Plus className="h-3 w-3" />
            {t("addAnswerBtn")}
          </button>
        </div>
        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
          {answers.length === 0 && (
            <p className="text-[11px] text-muted-foreground italic py-2 text-center">
              {t("quizNoAnswers")}
            </p>
          )}
          {answers.map((ans, i) => (
            <div key={ans.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleToggleCorrect(ans.id)}
                className={`shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                  ans.correct
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-border bg-surface-container-lowest"
                }`}
                title={ans.correct ? t("answerCorrectTitle") : t("answerMarkCorrectTitle")}
              >
                {ans.correct && <Check className="h-3 w-3" />}
              </button>
              <span className="text-[10px] text-muted-foreground shrink-0 w-4">{i + 1}.</span>
              <Input
                value={ans.text}
                onChange={(e) => handleTextChange(ans.id, e.target.value)}
                placeholder={t("answerTextPlaceholder")}
                className="h-7 text-xs bg-surface-container-lowest border-border flex-1 min-w-0"
              />
              <button
                type="button"
                onClick={() => handleRemoveAnswer(ans.id)}
                className="shrink-0 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                title={t("deleteAnswerTitle")}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Type Picker Dialog ────────────────────────────────────────────

const TypePickerDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onSelect: (type: "PR_REVIEW" | "QUIZ" | "FILL_IN_BLANK") => void;
}> = ({ open, onClose, onSelect }) => {
  const t = useTranslations("PuckEditor.Common.ExerciseSelector");
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm bg-surface border-border">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-foreground">
            {t("selectTypeTitle")}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-3 py-4">
          <button
            type="button"
            onClick={() => onSelect("PR_REVIEW")}
            className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer text-left"
          >
            <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Code className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{t("typePrTitle")}</p>
              <p className="text-[11px] text-muted-foreground">{t("typePrDescription")}</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onSelect("QUIZ")}
            className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer text-left"
          >
            <div className="shrink-0 w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <ListChecks className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{t("typeQuizTitle")}</p>
              <p className="text-[11px] text-muted-foreground">{t("typeQuizDescription")}</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onSelect("FILL_IN_BLANK")}
            className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer text-left"
          >
            <div className="shrink-0 w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{t("typeFillTitle")}</p>
              <p className="text-[11px] text-muted-foreground">{t("typeFillDescription")}</p>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─── PR Create Modal (always draft) ────────────────────────────────

const PRCreateModal: React.FC<{
  open: boolean;
  onClose: () => void;
  trackId: string;
  onSaved: (data: ExerciseData) => void;
  mode?: "create" | "complete";
  initData?: Partial<ExerciseData> | null;
}> = ({ open, onClose, trackId, onSaved, mode = "create", initData }) => {
  const t = useTranslations("PuckEditor.Common.ExerciseSelector");
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (!open) return;
    setTitle(initData?.title || "");
    setBrief(initData?.previewData?.brief || "");
    setRepoUrl(initData?.previewData?.repoUrl || "");
  }, [open, initData]);

  const handleSave = async () => {
    if (!title.trim()) return;
    const isComplete = mode === "complete";
    setSaving(true);
    try {
      let exerciseId = initData?.exerciseId || `draft-pr-${Date.now()}`;
      if (isComplete) {
        const res = await exercisesControllerCreate({
          body: {
            title: title.trim(),
            trackId: trackId !== "_" ? trackId : "00000000-0000-0000-0000-000000000000",
            tag: "pr",
            difficulty: "Beginner",
            estimatedTime: "30 mins",
            xp: initData?.xp ?? 20,
            brief: brief.trim(),
            overview: "",
            objectives: [],
            steps: [],
            type: "PR_REVIEW",
          },
          throwOnError: true,
        });
        if (!(res.data as ExerciseDetailDto | undefined)?.id) {
          throw new Error("missing-exercise-id");
        }
        exerciseId = (res.data as ExerciseDetailDto).id as string;
      }

      onSaved({
        exerciseId,
        title: title.trim(),
        status: isComplete ? "complete" : "draft",
        type: "PR_REVIEW",
        xp: initData?.xp ?? 20,
        previewData: { brief: brief.trim(), repoUrl: repoUrl.trim() || undefined },
      });
     reset();
     onClose();
   } catch {
     toast.error(t("saveFailed"));
   } finally {
     setSaving(false);
   }
  };

  const reset = () => {
    setTitle("");
    setBrief("");
    setRepoUrl("");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg bg-surface border-border">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-foreground">
            {mode === "complete" ? t("completePrTitle") : t("createPrTitle")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              {t("titleLabel")} *
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("titlePlaceholder")}
              className="h-9 text-xs bg-surface-container-lowest border-border"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">{t("briefLabel")}</Label>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border bg-surface-container-lowest px-3 py-2 text-xs text-foreground outline-none resize-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder={t("briefPlaceholder")}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">{t("repoLabel")}</Label>
            <Input
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder={t("repoPlaceholder")}
              className="h-9 text-xs bg-surface-container-lowest border-border"
            />
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
            {mode === "complete"
              ? t("completeHint")
              : t("draftHint")}
          </p>
        </div>
        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>{t("cancelBtn")}</Button>
          <Button type="button" size="sm" onClick={handleSave} disabled={saving || !title.trim()}>
            {saving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            {mode === "complete" ? t("completeBtn") : t("saveDraftBtn")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Minigame Create Dialog (centered modal) ───────────────────────

type MinigameSubType = "quiz" | "fill";

const MinigameCreateDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  trackId: string;
  onSaved: (data: ExerciseData) => void;
  initData?: Partial<ExerciseData> | null;
}> = ({ open, onClose, trackId, onSaved, initData }) => {
  const t = useTranslations("PuckEditor.Common.ExerciseSelector");
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [subType, setSubType] = useState<MinigameSubType>("quiz");
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (!open) return;
    setTitle(initData?.title || "");
    setBrief(initData?.previewData?.brief || "");
    const initType: MinigameSubType =
      initData?.type === "FILL_IN_BLANK"
        ? "fill"
        : "quiz";
    setSubType(initType);
  }, [open, initData]);

  // Quiz state
  const [question, setQuestion] = useState("");
  const [answerType, setAnswerType] = useState<"single" | "multi">("single");
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);

  // Fill state
  const [fillCode, setFillCode] = useState("");
  const [blanks, setBlanks] = useState<Blank[]>([]);

  const isQuizComplete = title.trim() && question.trim() && answers.some((a) => a.text.trim() && a.correct);
  const isFillComplete = title.trim() && fillCode.trim() && blanks.length > 0;

  const reset = useCallback(() => {
    setTitle("");
    setBrief("");
    setSubType("quiz");
    setQuestion("");
    setAnswerType("single");
    setAnswers([]);
    setFillCode("");
    setBlanks([]);
  }, []);

  const handleSave = async () => {
    if (!title.trim()) return;

    const isComplete = subType === "quiz" ? isQuizComplete : isFillComplete;

    setSaving(true);
    try {
      const actualType = subType === "quiz" ? "QUIZ" : "FILL_IN_BLANK";
      const draftId = `draft-mg-${Date.now()}`;

      const previewData: ExerciseData["previewData"] = {
        brief: brief.trim() || undefined,
      };
      if (subType === "quiz") {
        previewData.questionCount = answers.filter((a) => a.text.trim()).length;
        previewData.question = question.trim() || undefined;
        previewData.answerType = answerType;
        previewData.answers = answers
          .filter((a) => a.text.trim())
          .map((a) => ({ text: a.text.trim(), correct: a.correct }));
      } else {
        previewData.blankCount = blanks.length;
        previewData.fillTemplate = fillCode;
      }

      let exerciseId = draftId;
      if (isComplete) {
        let questionsData: any[] = [];
        if (subType === "quiz") {
          questionsData = [{
             id: "1",
             prompt: question.trim(),
             options: answers.filter((a) => a.text.trim()).map(a => a.text.trim()),
             correctAnswer: answers.filter(a => a.correct && a.text.trim()).map(a => a.text.trim()).join(',')
          }];
        } else {
          questionsData = blanks.map((b, i) => ({
             id: b.id || String(i+1),
             prompt: fillCode,
             correctAnswer: b.answer
          }));
        }

        const res = await exercisesControllerCreate({
          body: {
            title: title.trim(),
            trackId: trackId !== "_" ? trackId : "00000000-0000-0000-0000-000000000000",
            tag: "minigame",
            difficulty: "Beginner",
            estimatedTime: "15 mins",
            xp: initData?.xp ?? 10,
            brief: brief.trim() || t("defaultBrief", { type: actualType }),
            overview: t("defaultOverview"),
            objectives: [t("defaultObjective")],
            steps: [t("defaultStep1"), t("defaultStep2"), t("defaultStep3")],
            type: actualType,
            questionsData,
          },
          throwOnError: true,
        });
        if (!(res.data as ExerciseDetailDto | undefined)?.id) {
          throw new Error("missing-exercise-id");
        }
        exerciseId = (res.data as ExerciseDetailDto).id as string;
      }

      onSaved({
        exerciseId,
        title: title.trim(),
        status: isComplete ? "complete" : "draft",
        type: actualType,
        xp: initData?.xp ?? 10,
        previewData,
      });
      reset();
      onClose();
    } catch {
      toast.error(t("saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose(); } }}>
      <DialogContent className="max-w-2xl bg-surface border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-foreground">
            {t("createMinigameTitle")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Title + Brief */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">{t("titleLabel")} *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("titlePlaceholder")}
                className="h-9 text-xs bg-surface-container-lowest border-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">{t("briefLabel")}</Label>
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-border bg-surface-container-lowest px-3 py-2 text-xs text-foreground outline-none resize-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder={t("briefPlaceholder")}
              />
            </div>
          </div>

          {/* Sub-type tabs */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">{t("minigameTypeLabel")}</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSubType("quiz")}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                  subType === "quiz"
                    ? "border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300"
                    : "border-border bg-surface-container-low text-secondary hover:border-primary/50"
                }`}
              >
                <ListChecks className="h-4 w-4" />
                {t("exerciseTypeQuiz")}
              </button>
              <button
                type="button"
                onClick={() => setSubType("fill")}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                  subType === "fill"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                    : "border-border bg-surface-container-low text-secondary hover:border-primary/50"
                }`}
              >
                <FileText className="h-4 w-4" />
                {t("exerciseTypeFill")}
              </button>
            </div>
          </div>

          {/* Content by sub-type */}
          {subType === "quiz" ? (
            <QuizEditor
              question={question}
              onQuestionChange={setQuestion}
              answerType={answerType}
              onAnswerTypeChange={setAnswerType}
              answers={answers}
              onAnswersChange={setAnswers}
            />
          ) : (
            <div className="space-y-1.5">
              <FillInBlankEditor
                value={fillCode}
                onChange={setFillCode}
                blanks={blanks}
                onBlanksChange={setBlanks}
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" size="sm" onClick={() => { reset(); onClose(); }}>
            {t("cancelBtn")}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={saving || !title.trim()}
          >
            {saving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            {subType === "quiz"
              ? (isQuizComplete ? t("saveCompleteBtn") : t("saveDraftBtn"))
              : (isFillComplete ? t("saveCompleteBtn") : t("saveDraftBtn"))
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

function useCurrentSelectedExerciseProps(): {
  title?: string;
  type?: "PR_REVIEW" | "QUIZ" | "FILL_IN_BLANK";
  xp?: number;
} {
  const puck = useSafePuck();
  return useMemo(() => {
    if (!puck?.appState) return {};
    const selector = puck.appState.ui.itemSelector;
    if (!selector || typeof selector.index !== "number") return {};
    let items: any[] = [];
    if (!selector.zone || selector.zone === "default-zone" || selector.zone === "") {
      items = puck.appState.data.content || [];
    } else {
      const zones = (puck.appState.data as any).zones || {};
      items = zones[selector.zone] || puck.appState.data.content || [];
    }
    const item =
      items[selector.index] ||
      items.find((b: any) => b.props?.id === (selector as any).id);
    if (!item || item.type !== "SingleExerciseBlock") return {};
    return (item.props || {}) as {
      title?: string;
      type?: "PR_REVIEW" | "QUIZ" | "FILL_IN_BLANK";
      xp?: number;
    };
  }, [puck?.appState]);
}

// ─── ExerciseSelectorField ─────────────────────────────────────────

export const ExerciseSelectorField: React.FC<{
  value?: ExerciseData | null;
  onChange: (val: ExerciseData | null) => void;
  readOnly?: boolean;
  initData?: Partial<ExerciseData>;
}> = ({ value, onChange, readOnly, initData }) => {
  const t = useTranslations("PuckEditor.Common.ExerciseSelector");
  const trackId = useTrackId();
  const selectedProps = useCurrentSelectedExerciseProps();

  const effectiveInitData: Partial<ExerciseData> = useMemo(() => {
    return {
      title: initData?.title || selectedProps.title,
      type: initData?.type || selectedProps.type,
      xp: initData?.xp ?? selectedProps.xp,
    };
  }, [initData, selectedProps]);

  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showPRModal, setShowPRModal] = useState(false);
  const [showMinigameDialog, setShowMinigameDialog] = useState(false);
  const [prModalMode, setPrModalMode] = useState<"create" | "complete">("create");

  const handleTypeSelect = (type: "PR_REVIEW" | "QUIZ" | "FILL_IN_BLANK") => {
    setShowTypePicker(false);
    if (type === "PR_REVIEW") {
      setPrModalMode("create");
      setShowPRModal(true);
    } else {
      setShowMinigameDialog(true);
    }
  };

  const handleSaved = (data: ExerciseData) => {
    onChange(data);
  };

  React.useEffect(() => {
    if (readOnly) return;
    const handler = (evt: Event) => {
      const customEvent = evt as CustomEvent<{ exerciseId?: string }>;
      if (!customEvent.detail?.exerciseId) return;
      if (!value?.exerciseId || customEvent.detail.exerciseId !== value.exerciseId) return;
      if (value.type === "PR_REVIEW") {
        setPrModalMode("complete");
        setShowPRModal(true);
      }
    };
    window.addEventListener("lesson-exercise-draft-complete", handler as EventListener);
    return () => {
      window.removeEventListener("lesson-exercise-draft-complete", handler as EventListener);
    };
  }, [value?.exerciseId, value?.type, readOnly]);

  if (!value?.exerciseId) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">{t("noExerciseAssigned")}</p>
        {!readOnly && (
          <button
            type="button"
            onClick={() => {
              if (effectiveInitData?.type === "QUIZ" || effectiveInitData?.type === "FILL_IN_BLANK") {
                setShowMinigameDialog(true);
              } else if (effectiveInitData?.type === "PR_REVIEW") {
                setPrModalMode("create");
                setShowPRModal(true);
              } else {
                setShowTypePicker(true);
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            {t("createExerciseBtn")}
          </button>
        )}

        <TypePickerDialog
          open={showTypePicker}
          onClose={() => setShowTypePicker(false)}
          onSelect={handleTypeSelect}
        />
        <PRCreateModal
          open={showPRModal}
          onClose={() => setShowPRModal(false)}
          trackId={trackId}
          onSaved={handleSaved}
          mode={prModalMode}
          initData={value || effectiveInitData}
        />
        <MinigameCreateDialog
          open={showMinigameDialog}
          onClose={() => setShowMinigameDialog(false)}
          trackId={trackId}
          onSaved={handleSaved}
          initData={value || effectiveInitData}
        />
      </div>
    );
  }

  const isDraft = value.status === "draft";

  return (
    <div className="space-y-2">
      <div className={`rounded-md border p-2.5 text-xs ${isDraft ? 'border-amber-200 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/20' : 'border-border bg-surface-container-lowest'}`}>
        <div className="flex items-center gap-1.5 mb-1">
          <span className={`font-medium truncate ${isDraft ? 'text-amber-800 dark:text-amber-200' : 'text-foreground'}`}>
            {value.title}
          </span>
          {isDraft && (
            <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200">
              {t("draftBadge")}
            </span>
          )}
          {value.type && !isDraft && (
            <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
              {t(
                value.type === "PR_REVIEW"
                  ? "exerciseTypePr"
                  : value.type === "QUIZ"
                  ? "exerciseTypeQuiz"
                  : "exerciseTypeFill"
              )}
            </span>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground">
          {t("exerciseIdLabel")}: {value.exerciseId.slice(0, 12)}...
        </p>
      </div>
      {!readOnly && isDraft && value.type === "PR_REVIEW" && (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="h-8 text-xs"
          onClick={() => {
            setPrModalMode("complete");
            setShowPRModal(true);
          }}
        >
          {t("completeDraftBtn")}
        </Button>
      )}
      <PRCreateModal
        open={showPRModal}
        onClose={() => setShowPRModal(false)}
        trackId={trackId}
        onSaved={handleSaved}
        mode={prModalMode}
        initData={value || effectiveInitData}
      />
      <MinigameCreateDialog
        open={showMinigameDialog}
        onClose={() => setShowMinigameDialog(false)}
        trackId={trackId}
        onSaved={handleSaved}
        initData={value || effectiveInitData}
      />
    </div>
  );
};
