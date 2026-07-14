import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { ComponentConfig } from "@puckeditor/core";
import { LessonBlockProps } from "../../types";
import { useLessonExercisesStore } from "../../../../stores/lessonExercisesStore";

type GroupExerciseBlockProps = LessonBlockProps["GroupExerciseBlock"];

export const GroupExerciseBlock: ComponentConfig<GroupExerciseBlockProps> = {
  fields: {
    title: { type: "text", label: "Tiêu đề nhóm bài tập" },
    description: { type: "textarea", label: "Mô tả ngắn" },
  },
  defaultProps: {
    title: "Bài tập thực hành",
    description: "Hoàn thành các bài tập sau để kết thúc bài học",
  },
  render: ({ title, description }) => {
    const t = useTranslations("PuckEditor.Common.groupExercise");
    const exercisesMap = useLessonExercisesStore((state) => state.exercises);
    const exercises = Object.values(exercisesMap);

    return (
      <div className="my-8 rounded-xl border border-border bg-surface-container-lowest p-6">
        <div className="mb-4">
          <h3 className="text-title-lg font-bold text-foreground">{title || "Bài tập thực hành"}</h3>
          {description && (
            <p className="mt-1 text-body-sm text-muted-foreground">{description}</p>
          )}
        </div>
        
        {exercises.length === 0 ? (
          <p className="text-body-sm text-muted-foreground italic">Không có bài tập nào được đăng ký trong bài học này.</p>
        ) : (
          <div className="space-y-3">
            {exercises.map((ex, idx) => (
              <div key={ex.exerciseId || idx} className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${ex.isMandatory ? 'border-primary/40 bg-primary/5' : 'border-outline-variant/60 bg-surface hover:bg-surface-container'}`}>
                <div className="flex flex-col gap-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    {ex.isMandatory && <span className="inline-block w-2 h-2 rounded-full bg-primary shrink-0" title="Bắt buộc" />}
                    <span className={`font-semibold text-body-sm truncate ${ex.isMandatory ? 'text-primary' : 'text-foreground'}`}>{ex.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-label-xs text-muted-foreground flex-wrap">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full shrink-0">
                      {ex.type === "PR_REVIEW" ? "Lập trình" : ex.type === "QUIZ" ? "Trắc nghiệm" : ex.type === "FILL_IN_BLANK" ? "Điền khuyết" : ex.type}
                    </span>
                    {ex.isMandatory && <span className="font-medium text-amber-600 dark:text-amber-400 shrink-0">Bắt buộc</span>}
                  </div>
                </div>
                {ex.exerciseId && !ex.exerciseId.startsWith("draft-") && (
                  <Link href={`/exercises/${ex.exerciseId}`} className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-label-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
                    <span>Làm bài</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
                {(!ex.exerciseId || ex.exerciseId.startsWith("draft-")) && (
                  <span className="shrink-0 inline-flex items-center text-[10px] font-semibold px-2 py-1 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                    Bản nháp
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
};
