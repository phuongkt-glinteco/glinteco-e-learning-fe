import React from "react";
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
              <div key={ex.exerciseId || idx} className="flex items-center justify-between rounded-lg border border-outline-variant/60 bg-surface p-3">
                <span className="font-medium text-body-sm">{ex.title}</span>
                <span className="text-label-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {ex.type}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
};
