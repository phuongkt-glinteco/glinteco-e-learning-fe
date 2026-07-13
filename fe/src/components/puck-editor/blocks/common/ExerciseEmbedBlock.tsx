import React from "react";
import Link from "next/link";
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
} from "lucide-react";
import { LessonBlockProps } from "../../types";
import { ExerciseSelectorField, type ExerciseData } from "../../fields";

const typeConfig: Record<string, { icon: React.ElementType; borderClass: string; badgeClass: string }> = {
  pr: {
    icon: Code,
    borderClass: "border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/20",
    badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200",
  },
  minigame_quiz: {
    icon: ListChecks,
    borderClass: "border-purple-200 bg-purple-50 dark:border-purple-700 dark:bg-purple-950/20",
    badgeClass: "bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-200",
  },
  minigame_fill: {
    icon: FileText,
    borderClass: "border-emerald-200 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/20",
    badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-200",
  },
};

type ExerciseEmbedBlockProps = LessonBlockProps["ExerciseEmbedBlock"];

export const ExerciseEmbedBlock: ComponentConfig<ExerciseEmbedBlockProps> = {
  fields: {
    title: {
      type: "text",
      label: "Tiêu đề bài tập",
    },
    type: {
      type: "select",
      label: "Loại bài tập",
      options: [
        { label: "Lập trình (PR)", value: "pr" },
        { label: "Trắc nghiệm (Quiz)", value: "minigame_quiz" },
        { label: "Điền khuyết (Fill-in-the-blank)", value: "minigame_fill" },
      ],
    },
    xp: {
      type: "number",
      label: "Điểm thưởng (XP)",
    },
    exerciseData: {
      type: "custom",
      label: "Bài tập hệ thống",
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
    type: "pr",
    xp: 20,
    exerciseData: null,
  },
  render: ({ exerciseData, title, type, xp, instruction }: ExerciseEmbedBlockProps) => {
    const t = useTranslations("PuckEditor.Common.exerciseEmbed");
    const data = (exerciseData || {}) as ExerciseData;
    const isDraft = data.status === "draft";
    const effectiveType = type || data.type;
    const cfg = effectiveType ? typeConfig[effectiveType] : null;
    const typeLabel = effectiveType === "pr"
      ? t("typePr")
      : effectiveType === "minigame_quiz"
        ? t("typeQuiz")
        : effectiveType === "minigame_fill"
          ? t("typeFill")
          : "";
    const Icon = isDraft ? AlertTriangle : (cfg?.icon || HelpCircle);
    const borderClass = !data?.exerciseId
      ? "border-dashed border-border"
      : isDraft
        ? "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/20"
        : cfg?.borderClass || "border-primary/20 bg-primary/5";

    const displayTitle = title || data?.title || t("defaultTitle");
    const displayDesc = instruction || data?.previewData?.brief || "";
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
        {/* Header row */}
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
              {effectiveType === "minigame_quiz" && data.previewData?.questionCount && (
                <span>{t("questionCount", { count: data.previewData.questionCount })}</span>
              )}
              {effectiveType === "minigame_fill" && data.previewData?.blankCount && (
                <span>{t("blankCount", { count: data.previewData.blankCount })}</span>
              )}
            </div>
          </div>
        </div>

        {effectiveType === "minigame_quiz" && (
          <div className="space-y-2 rounded-lg border border-outline-variant/60 bg-surface/70 p-3">
            <p className="text-label-sm font-semibold text-foreground">
              {t("quizQuestionLabel")}
            </p>
            <p className="text-body-sm text-on-surface-variant">
              {data.previewData?.question || t("quizQuestionFallback")}
            </p>
            <div className="space-y-1.5 pt-1">
              {quizAnswers.length > 0 ? (
                quizAnswers.map((answer, index) => {
                  const isCorrect = Boolean(answer.correct);
                  return (
                    <div
                      key={`${answer.text}-${index}`}
                      className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-body-xs ${
                        isCorrect
                          ? "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/20"
                          : "border-outline-variant/60 bg-surface"
                      }`}
                    >
                      {isCorrect ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <span className="truncate">{answer.text}</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-body-xs text-muted-foreground">{t("quizAnswerFallback")}</p>
              )}
            </div>
          </div>
        )}

        {effectiveType === "minigame_fill" && (
          <div className="space-y-2 rounded-lg border border-outline-variant/60 bg-surface/70 p-3">
            <p className="text-label-sm font-semibold text-foreground">
              {t("fillTemplateLabel")}
            </p>
            <pre className="overflow-x-auto rounded-md bg-surface-container-low px-3 py-2 text-[11px] text-on-surface-variant whitespace-pre-wrap">
              {fillPreview}
            </pre>
          </div>
        )}

        {effectiveType === "pr" && data.previewData?.repoUrl && (
          <div className="rounded-lg border border-outline-variant/60 bg-surface/70 px-3 py-2 text-body-xs text-on-surface-variant">
            {t("repoLabel")}: {data.previewData.repoUrl}
          </div>
        )}

        {!isDraft && (
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

        {isDraft && data.type === "pr" && (
          <p className="text-body-xs text-amber-700 dark:text-amber-300">
            {t("completeDraftHint")}
          </p>
        )}
      </div>
    );
  },
};
