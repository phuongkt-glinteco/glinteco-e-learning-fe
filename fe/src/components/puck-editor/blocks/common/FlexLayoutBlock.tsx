import React from "react";
import { ComponentConfig, DropZone } from "@puckeditor/core";
import { LessonBlockProps } from "../../types";

export const FlexLayoutBlock: ComponentConfig<LessonBlockProps["FlexLayoutBlock"]> = {
  fields: {
    direction: {
      type: "radio",
      label: "Hướng sắp xếp (Direction)",
      options: [
        { label: "Ngang (Row)", value: "row" },
        { label: "Dọc (Column)", value: "column" },
      ],
    },
    justify: {
      type: "select",
      label: "Căn theo hướng chính (Justify)",
      options: [
        { label: "Đầu (Start)", value: "start" },
        { label: "Giữa (Center)", value: "center" },
        { label: "Hai đầu (Between)", value: "between" },
      ],
    },
    align: {
      type: "select",
      label: "Căn theo trục phụ (Align)",
      options: [
        { label: "Đầu (Start)", value: "start" },
        { label: "Giữa (Center)", value: "center" },
        { label: "Kéo giãn (Stretch)", value: "stretch" },
      ],
    },
    gap: {
      type: "select",
      label: "Khoảng cách (Gap)",
      options: [
        { label: "Nhỏ (Small)", value: "sm" },
        { label: "Vừa (Medium)", value: "md" },
        { label: "Lớn (Large)", value: "lg" },
      ],
    },
  },
  defaultProps: {
    direction: "row",
    justify: "start",
    align: "start",
    gap: "md",
  },
  render: ({ direction, justify, align, gap }) => {
    const dirClass = direction === "row" ? "flex-col sm:flex-row" : "flex-col";

    const justifyClass =
      justify === "center"
        ? "justify-center"
        : justify === "between"
          ? "justify-between"
          : "justify-start";

    const alignClass =
      align === "center"
        ? "items-center"
        : align === "stretch"
          ? "items-stretch"
          : "items-start";

    const gapClass =
      gap === "sm" ? "gap-2" : gap === "lg" ? "gap-6" : "gap-4";

    return (
      <div className={`flex ${dirClass} ${justifyClass} ${alignClass} ${gapClass} w-full my-4`}>
        <DropZone zone="flex-content" />
      </div>
    );
  },
};
