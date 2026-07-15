import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ComponentConfig } from "@puckeditor/core";
import {
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  Code,
  ListChecks,
  FileText,
  Circle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { LessonBlockProps } from "../../types";
import { ExerciseSelectorField, type ExerciseData } from "../../fields";
import { parseFillInBlankTokens } from "../../fields/fillInBlankUtils";
import { useSafePuck } from "../../helper";
import { useLessonExercisesStore } from "../../../../stores/lessonExercisesStore";
import { exercisesControllerSubmitAuto } from "@/services/api-client";
import type { AutoGradeResultDto } from "@/services/client/types.gen";

const typeConfig: Record<string, { icon: React.ElementType; borderClass: string; badgeClass: string }> = {
  PR_REVIEW: {
    icon: Code,
    borderClass: "border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/20",
    badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200",
  },
  QUIZ: {
    icon: ListChecks,
    borderClass: "border-purple-200 bg-purple-50 dark:border-purple-700 dark:bg-purple-950/20",
    badgeClass: "bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-200",
  },
  FILL_IN_BLANK: {
    icon: FileText,
    borderClass: "border-emerald-200 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/20",
    badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-200",
  },
};

type SingleExerciseBlockProps = LessonBlockProps["SingleExerciseBlock"];

export const SingleExerciseBlock: ComponentConfig<SingleExerciseBlockProps> = {
  fields: {
    title: {
      type: "text",
      label: "Tiêu đề bài tập",
    },
    isMandatory: {
      type: "radio",
      label: "Bắt buộc",
      options: [
        { label: "Có", value: true },
        { label: "Không", value: false },
      ]
    },
    tag: {
      type: "text",
      label: "Tag (Vd: JavaScript)",
    },
    difficulty: {
      type: "select",
      label: "Độ khó",
      options: [
        { label: "Beginner", value: "Beginner" },
        { label: "Intermediate", value: "Intermediate" },
        { label: "Advanced", value: "Advanced" },
      ],
    },
    estimatedTime: {
      type: "text",
      label: "Thời gian ước tính (Vd: 10m)",
    },
    xp: {
      type: "number",
      label: "Điểm thưởng (XP)",
    },
    type: {
      type: "select",
      label: "Loại bài tập",
      options: [
        { label: "Lập trình (PR)", value: "PR_REVIEW" },
        { label: "Trắc nghiệm (Quiz)", value: "QUIZ" },
        { label: "Điền khuyết (Fill-in-the-blank)", value: "FILL_IN_BLANK" },
      ],
    },
    viewStyle: {
      type: "select",
      label: "Kiểu hiển thị",
      options: [
        { label: "Thẻ điều hướng (Navigation Card)", value: "navigation_card" },
        { label: "Làm trực tiếp trong bài (Inline)", value: "inline_interactive" },
      ],
    },
    content: {
      type: "custom",
      label: "Nội dung bài tập",
      render: ({ value, onChange, readOnly, data }: any) => (
        <ExerciseSelectorField
          value={value as ExerciseData | null}
          onChange={onChange}
          readOnly={readOnly}
          initData={{
            title: data?.title,
            type: data?.type,
            xp: data?.xp,
          }}
        />
      ),
    },
  },
  defaultProps: {
    title: "",
    isMandatory: true,
    tag: "",
    difficulty: "Beginner",
    estimatedTime: "10m",
    xp: 20,
    type: "PR_REVIEW",
    viewStyle: "navigation_card",
    content: null,
  },
  render: ({ content, title, type, xp, viewStyle, isMandatory, id }) => {
    const t = useTranslations("PuckEditor.Common.exerciseEmbed");
    const registerExercise = useLessonExercisesStore((state) => state.registerExercise);
    const pathname = usePathname();
    const puckObj = useSafePuck();
    const isPuckEditingCanvas = (puckObj?.appState as any)?.isEditing === true;
    const isAdminView = isPuckEditingCanvas || pathname?.includes('/admin') || pathname?.includes('/edit');

    const [selectedAnswers, setSelectedAnswers] = React.useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [submitResult, setSubmitResult] = React.useState<AutoGradeResultDto | null>(null);

    const handleSubmitQuiz = async () => {
      const data = (content || {}) as ExerciseData;
      if (!data.exerciseId) return;
      setIsSubmitting(true);
      try {
        const res = await exercisesControllerSubmitAuto({
          path: { id: data.exerciseId },
          body: {
            answers: [{ questionId: "1", answer: selectedAnswers["1"] || "" }],
          }
        });
        setSubmitResult(res.data as AutoGradeResultDto);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleSubmitFill = async () => {
       const data = (content || {}) as ExerciseData;
       if (!data.exerciseId) return;
       const template = data.previewData?.fillTemplate || "";
       const { tokens } = parseFillInBlankTokens(template);
       const answers: any[] = [];
       let missing = false;
       tokens.forEach((tToken) => {
         const id = tToken.id;
         const val = (selectedAnswers[id] || "").trim();
         if (!val) missing = true;
         answers.push({ questionId: id, answer: val });
       });
       if (missing || answers.length === 0) {
         setSubmitResult({
           passed: false,
           score: undefined,
           results: [],
           message: "Vui lòng điền đầy đủ tất cả các ô trống trước khi nộp bài."
         } as any);
         return;
       }
       setIsSubmitting(true);
       try {
         const res = await exercisesControllerSubmitAuto({
           path: { id: data.exerciseId },
           body: { answers }
         });
         setSubmitResult(res.data as AutoGradeResultDto);
       } catch (err) {
         console.error(err);
       } finally {
         setIsSubmitting(false);
       }
    };

    const renderFillInBlankInteractive = () => {
        const data = (content || {}) as ExerciseData;
        const template = data.previewData?.fillTemplate || "";
        const { parts } = parseFillInBlankTokens(template);
        return parts.map((part, i) => {
          const match = part.match(/^\[(\d+)_(\d+)\]$/);
          if (match) {
            const blankId = match[1].trim();
            const blank = data.previewData?.blanks?.find((b: any) => String(b.id) === blankId);
            const targetLen = match[2] ? Number(match[2]) : blank?.answer?.length;
            if (isAdminView) {
              return (
                <span
                  key={`${blankId}-${i}`}
                  className="inline-block font-bold underline decoration-2 decoration-primary text-primary mx-0.5 px-1 rounded bg-primary/10 dark:bg-primary/20"
                  title={`Blank #${blankId} (${targetLen || '?' } ký tự)`}
                >
                  {blank?.answer || `[${blankId}_${targetLen || '?'}]`}
                </span>
              );
            }
            const value = selectedAnswers[blankId] || "";
            return (
              <input
                key={`${blankId}-${i}`}
                type="text"
                maxLength={targetLen}
                placeholder="___"
                style={{ width: targetLen ? `${Math.max(4, targetLen + 2)}ch` : `${Math.max(4, value.length + 1)}ch` }}
                className="inline-block border border-outline-variant bg-surface-container-low dark:bg-surface-container rounded px-2 mx-1 py-0.5 text-[13px] text-center font-mono text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                value={value}
                onChange={(e) => setSelectedAnswers({...selectedAnswers, [blankId]: e.target.value})}
              />
            );
          }
          return <span key={i}>{part}</span>;
        });
    };

    useEffect(() => {
      if (content?.exerciseId && id) {
        // We inject isMandatory to the content data so GroupExerciseBlock can use it
        registerExercise(id, { ...content, isMandatory: Boolean(isMandatory) });
      }
    }, [content, id, isMandatory, registerExercise]);

    const data = (content || {}) as ExerciseData;
    const isDraft = data.status === "draft";
    const effectiveType = type || data.type;
    const cfg = effectiveType ? typeConfig[effectiveType] : null;
    const typeLabel = effectiveType === "PR_REVIEW"
      ? t("typePr")
      : effectiveType === "QUIZ"
        ? t("typeQuiz")
        : effectiveType === "FILL_IN_BLANK"
          ? t("typeFill")
          : "";
    const Icon = isDraft ? AlertTriangle : (cfg?.icon || HelpCircle);
    const borderClass = !data?.exerciseId
      ? "border-dashed border-border"
      : isDraft
        ? "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/20"
        : cfg?.borderClass || "border-primary/20 bg-primary/5";

    const displayTitle = title || data?.title || t("defaultTitle");
    const displayDesc = data?.previewData?.brief || "";
    const displayXp = xp ?? data?.xp ?? 20;
    const quizAnswers = Array.isArray(data.previewData?.answers)
      ? data.previewData.answers.slice(0, 4)
      : [];
    const fillTemplate = typeof data.previewData?.fillTemplate === "string"
      ? data.previewData.fillTemplate
      : "";
    const fillPreview = fillTemplate || t("fillPreviewFallback");

    if (!data?.exerciseId) {
      return (
        <div className="my-6 border-2 border-dashed border-border rounded-xl p-8 text-center">
          <HelpCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">
            {t("emptyTitle")}
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            {t("emptyDescription")}
          </p>
        </div>
      );
    }

    return (
      <div className={`my-6 border rounded-xl p-6 space-y-3 ${borderClass}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 font-semibold text-body-lg">
              <Icon className={`w-5 h-5 shrink-0 ${isDraft ? 'text-amber-600 dark:text-amber-400' : 'text-primary'}`} />
              <span className={`truncate ${isDraft ? 'text-amber-800 dark:text-amber-200' : 'text-foreground'}`}>
                {displayTitle}
              </span>
              {isDraft && (
                <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200">
                  <AlertTriangle className="w-3 h-3" />
                  {t("draftBadge")}
                </span>
              )}
              {cfg && !isDraft && (
                <span className={`shrink-0 inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.badgeClass}`}>
                  {typeLabel}
                </span>
              )}
              {displayXp !== undefined && (
                <span className="shrink-0 inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                  +{displayXp} XP
                </span>
              )}
            </div>

            {displayDesc && (
              <p className="text-body-sm text-muted-foreground line-clamp-2">
                {displayDesc}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-label-xs text-muted-foreground">
              {effectiveType === "QUIZ" && data.previewData?.questionCount && (
                <span>{t("questionCount", { count: data.previewData.questionCount })}</span>
              )}
              {effectiveType === "FILL_IN_BLANK" && data.previewData?.blankCount && (
                <span>{t("blankCount", { count: data.previewData.blankCount })}</span>
              )}
            </div>
          </div>
        </div>

        {effectiveType === "QUIZ" && viewStyle === "inline_interactive" && (
          <div className="space-y-3 rounded-lg border border-outline-variant/60 bg-surface/70 p-4">
            <p className="text-label-sm font-semibold text-foreground">
              {t("quizQuestionLabel")}
            </p>
            <p className="text-body-sm text-on-surface-variant">
              {data.previewData?.question || t("quizQuestionFallback")}
            </p>
            <div className="space-y-2 pt-1">
              {quizAnswers.length > 0 ? (
                quizAnswers.map((answer, index) => {
                  const isSelected = selectedAnswers["1"] === answer.text;
                  return (
                    <button
                      key={`${answer.text}-${index}`}
                      type="button"
                      onClick={() => setSelectedAnswers({ ...selectedAnswers, "1": answer.text })}
                      className={`flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-body-sm transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-outline-variant/60 bg-surface hover:bg-surface-container"
                      }`}
                    >
                      {isSelected ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="truncate">{answer.text}</span>
                    </button>
                  );
                })
              ) : (
                <p className="text-body-xs text-muted-foreground">{t("quizAnswerFallback")}</p>
              )}
            </div>
            <div className="pt-2 border-t border-outline-variant/60 flex items-center justify-between">
              <button
                type="button"
                disabled={!selectedAnswers["1"] || isSubmitting}
                onClick={handleSubmitQuiz}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-label-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitResult ? "Làm lại" : "Nộp bài"}
              </button>
              {submitResult && (
                <span className={`text-label-sm font-medium ${submitResult.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                   {submitResult.passed ? "Bạn đã trả lời đúng!" : "Bạn đã trả lời sai!"}
                   {submitResult.score !== undefined && ` (${submitResult.score}%)`}
                </span>
              )}
            </div>
          </div>
        )}

        {effectiveType === "FILL_IN_BLANK" && viewStyle === "inline_interactive" && (
          <div className="space-y-3 rounded-lg border border-outline-variant/60 bg-surface/70 p-4">
            <p className="text-label-sm font-semibold text-foreground">
              {t("fillTemplateLabel")}
            </p>
            <div className="rounded-md bg-surface-container-low px-4 py-3 text-[13px] text-on-surface-variant leading-relaxed overflow-x-auto font-mono">
              <pre className="whitespace-pre-wrap">{renderFillInBlankInteractive()}</pre>
            </div>
            <div className="pt-2 border-t border-outline-variant/60 flex items-center justify-between">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  if (submitResult) setSubmitResult(null);
                  else handleSubmitFill();
                }}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-label-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitResult ? "Làm lại" : "Nộp bài"}
              </button>
              {submitResult && (
                <span className={`text-label-sm font-medium ${(submitResult as any).message ? 'text-amber-600 dark:text-amber-400' : submitResult.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                   {(submitResult as any).message || (submitResult.passed ? "Bạn đã làm đúng!" : "Bạn đã làm sai!")}
                   {submitResult.score !== undefined && ` (${submitResult.score}%)`}
                </span>
              )}
            </div>
          </div>
        )}

        {effectiveType === "PR_REVIEW" && data.previewData?.repoUrl && (
          <div className="rounded-lg border border-outline-variant/60 bg-surface/70 px-3 py-2 text-body-xs text-on-surface-variant">
            {t("repoLabel")}: {data.previewData.repoUrl}
          </div>
        )}

        {!isDraft && viewStyle === "navigation_card" && (
          <div>
            <Link
              href={`/exercises/${data.exerciseId}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-body-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <span>{t("openExerciseBtn")}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {isDraft && data.type === "PR_REVIEW" && (
          <p className="text-body-xs text-amber-700 dark:text-amber-300">
            {t("completeDraftHint")}
          </p>
        )}
      </div>
    );
  },
};
