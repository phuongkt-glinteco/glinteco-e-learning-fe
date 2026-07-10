import React from "react";
import { ComponentConfig } from "@puckeditor/core";
import { LessonBlockProps, CalloutVariant } from "../../types";

const CALLOUT_CONFIG: Record<
  CalloutVariant,
  { icon: string; defaultTitle: string; containerClass: string; iconClass: string }
> = {
  info: {
    icon: "ℹ️",
    defaultTitle: "Thông tin bổ sung",
    containerClass:
      "border-blue-500/30 bg-blue-50/70 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200",
    iconClass: "text-blue-600 dark:text-blue-400",
  },
  challenge: {
    icon: "⚡",
    defaultTitle: "Thử thách suy ngẫm",
    containerClass:
      "border-purple-500/30 bg-purple-50/70 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200",
    iconClass: "text-purple-600 dark:text-purple-400",
  },
  importance: {
    icon: "⚠️",
    defaultTitle: "Lưu ý quan trọng",
    containerClass:
      "border-amber-500/30 bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200",
    iconClass: "text-amber-600 dark:text-amber-400",
  },
  objective: {
    icon: "🎯",
    defaultTitle: "Mục tiêu cần đạt",
    containerClass:
      "border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200",
    iconClass: "text-emerald-600 dark:text-emerald-400",
  },
};

export const CalloutBlock: ComponentConfig<LessonBlockProps["CalloutBlock"]> = {
  fields: {
    variant: {
      type: "select",
      label: "Loại ghi chú",
      options: [
        { label: "Thông tin (Info)", value: "info" },
        { label: "Thử thách (Challenge)", value: "challenge" },
        { label: "Quan trọng (Importance)", value: "importance" },
        { label: "Mục tiêu (Objective)", value: "objective" },
      ],
    },
    title: {
      type: "text",
      label: "Tiêu đề ghi chú (Tuỳ chọn)",
    },
    content: {
      type: "textarea",
      label: "Nội dung ghi chú",
    },
  },
  defaultProps: {
    variant: "info",
    title: "",
    content: "Nội dung ghi chú hoặc lưu ý quan trọng dành cho học viên...",
  },
  render: ({ variant, title, content }) => {
    const config = CALLOUT_CONFIG[variant] || CALLOUT_CONFIG.info;
    const displayTitle = title || config.defaultTitle;

    return (
      <div
        className={`my-4 p-4 sm:p-5 rounded-xl border-l-4 border ${config.containerClass} shadow-sm`}
      >
        <div className="flex items-center gap-2 font-bold text-base mb-1.5">
          <span className="text-lg">{config.icon}</span>
          <span>{displayTitle}</span>
        </div>
        <p className="text-sm sm:text-base leading-relaxed whitespace-pre-line pl-7">
          {content}
        </p>
      </div>
    );
  },
};
