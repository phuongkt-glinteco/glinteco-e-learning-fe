import React from "react";
import { ComponentConfig } from "@puckeditor/core";
import { LessonBlockProps } from "../../types";

export const HeadingBlock: ComponentConfig<LessonBlockProps["HeadingBlock"]> = {
  fields: {
    title: { type: "text", label: "Tiêu đề" },
    level: {
      type: "select",
      label: "Cấp độ thẻ",
      options: [
        { label: "H1 - Tiêu đề chính", value: "h1" },
        { label: "H2 - Tiêu đề mục lớn", value: "h2" },
        { label: "H3 - Tiêu đề mục con", value: "h3" },
        { label: "H4 - Tiêu đề nhỏ", value: "h4" },
      ],
    },
    align: {
      type: "radio",
      label: "Căn lề",
      options: [
        { label: "Trái", value: "left" },
        { label: "Giữa", value: "center" },
        { label: "Phải", value: "right" },
      ],
    },
  },
  defaultProps: {
    title: "Tiêu đề mới",
    level: "h2",
    align: "left",
  },
  render: ({ title, level, align }) => {
    const Tag = level;
    const alignClass =
      align === "center"
        ? "text-center"
        : align === "right"
          ? "text-right"
          : "text-left";

    const sizeClass =
      level === "h1"
        ? "text-3xl font-extrabold tracking-tight"
        : level === "h2"
          ? "text-2xl font-bold"
          : level === "h3"
            ? "text-xl font-semibold"
            : "text-lg font-medium";

    return (
      <Tag
        className={`${sizeClass} ${alignClass} my-4 text-slate-900 dark:text-slate-100`}
      >
        {title}
      </Tag>
    );
  },
};
