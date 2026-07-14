import React from "react";
import { ComponentConfig } from "@puckeditor/core";
import { LessonBlockProps } from "../../types";

export const TextBlock: ComponentConfig<NonNullable<LessonBlockProps["TextBlock"]>> = {
  fields: {
    content: { type: "textarea", label: "Nội dung văn bản" },
    size: {
      type: "select",
      label: "Kích thước chữ",
      options: [
        { label: "Nhỏ (Small)", value: "sm" },
        { label: "Mặc định (Base)", value: "base" },
        { label: "Lớn (Large)", value: "lg" },
      ],
    },
  },
  defaultProps: {
    content: "Nhập nội dung văn bản của bạn tại đây...",
    size: "base",
  },
  render: ({ content, size }) => {
    const sizeClass =
      size === "sm"
        ? "text-sm"
        : size === "lg"
          ? "text-lg"
          : "text-base";

    return (
      <p
        className={`${sizeClass} leading-relaxed text-slate-700 dark:text-slate-300 my-3 whitespace-pre-line`}
      >
        {content}
      </p>
    );
  },
};
