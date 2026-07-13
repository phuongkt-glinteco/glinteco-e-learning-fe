import React from "react";
import { ComponentConfig } from "@puckeditor/core";
import { HelpCircle, ArrowRight } from "lucide-react";
import { LessonBlockProps } from "../../types";
import { ExercisePickerField } from "../../fields";

export const ExerciseEmbedBlock: ComponentConfig<
  LessonBlockProps["ExerciseEmbedBlock"]
> = {
  fields: {
    title: {
      type: "text",
      label: "Tiêu đề bài tập",
    },
    exerciseId: {
      type: "custom",
      label: "Chọn bài tập từ hệ thống",
      render: ({ value, onChange, readOnly }) => {
        const arr = value ? [{ id: value, title: `Bài tập ID: ${value}` }] : [];
        return (
          <ExercisePickerField
            value={arr}
            onChange={(items) => onChange(items[0]?.id || "")}
            readOnly={readOnly}
          />
        );
      },
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
            <HelpCircle className="w-5 h-5" />
            <span>{title || "Bài tập đính kèm"}</span>
          </div>
          {description && (
            <p className="text-body-sm text-muted-foreground">
              {description}
            </p>
          )}
          {exerciseId && (
            <span className="inline-block text-xs text-muted-foreground bg-surface px-2 py-0.5 rounded border border-border">
              ID: {exerciseId}
            </span>
          )}
        </div>
        <button
          type="button"
          className="shrink-0 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer"
        >
          <span>Làm bài tập</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  },
};
