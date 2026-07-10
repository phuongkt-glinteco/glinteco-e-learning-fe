import React from "react";
import { ComponentConfig } from "@puckeditor/core";
import { LessonBlockProps } from "../../types";

export const ExerciseEmbedBlock: ComponentConfig<
  LessonBlockProps["ExerciseEmbedBlock"]
> = {
  fields: {
    title: {
      type: "text",
      label: "Tiêu đề bài tập (Exercise Title)",
    },
    exerciseId: {
      type: "text",
      label: "ID bài tập (hoặc mã bài tập)",
    },
    description: {
      type: "textarea",
      label: "Mô tả ngắn cho học viên",
    },
  },
  defaultProps: {
    title: "Bài tập thực hành",
    exerciseId: "",
    description: "Hoàn thành bài tập này để củng cố kiến thức đã học.",
  },
  render: ({ title, exerciseId, description }) => {
    return (
      <div className="my-6 border border-primary/20 bg-primary/5 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-semibold text-body-lg">
            <span className="material-symbols-outlined">quiz</span>
            <span>{title || "Bài tập đính kèm"}</span>
          </div>
          {description && (
            <p className="text-body-sm text-on-surface-variant">
              {description}
            </p>
          )}
          {exerciseId && (
            <span className="inline-block text-label-xs text-secondary bg-surface px-2 py-0.5 rounded border border-outline-variant">
              ID: {exerciseId}
            </span>
          )}
        </div>
        <button
          type="button"
          className="shrink-0 px-4 py-2 bg-primary text-on-primary rounded-lg text-label-md font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer"
        >
          <span>Làm bài tập</span>
          <span className="material-symbols-outlined text-[16px]">
            arrow_forward
          </span>
        </button>
      </div>
    );
  },
};
