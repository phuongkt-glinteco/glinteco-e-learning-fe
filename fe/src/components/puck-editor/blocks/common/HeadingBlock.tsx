import React from "react";
import { ComponentConfig } from "@puckeditor/core";
import { LessonBlockProps } from "../../types";
import { slugifyHeadingId } from "../../helper";

export const HeadingBlock: ComponentConfig<any> = {
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
  render: ({ id, title, level, align }) => {
    const Tag = level || "h2";
    const alignClass =
      align === "center"
        ? "text-center"
        : align === "right"
          ? "text-right"
          : "text-left";

    const sizeClass =
      Tag === "h1"
        ? "text-3xl font-extrabold"
        : Tag === "h2"
          ? "text-2xl font-bold"
          : Tag === "h3"
            ? "text-xl font-semibold"
            : "text-lg font-medium";

    const headingId = id || slugifyHeadingId(title);

    return (
      <Tag
        id={headingId}
        className={`${sizeClass} ${alignClass} my-4 text-foreground`}
      >
        {title}
      </Tag>
    );
  },
};

