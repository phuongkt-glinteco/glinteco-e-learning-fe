import React from "react";
import { ComponentConfig, DropZone } from "@puckeditor/core";
import { LessonBlockProps } from "../../types";

export const GridLayoutBlock: ComponentConfig<LessonBlockProps["GridLayoutBlock"]> = {
  fields: {
    columns: {
      type: "select",
      label: "Số lượng cột (Columns)",
      options: [
        { label: "1 cột", value: 1 },
        { label: "2 cột", value: 2 },
        { label: "3 cột", value: 3 },
        { label: "4 cột", value: 4 },
      ],
    },
    gap: {
      type: "select",
      label: "Khoảng cách giữa các cột (Gap)",
      options: [
        { label: "Nhỏ (Small)", value: "sm" },
        { label: "Vừa (Medium)", value: "md" },
        { label: "Lớn (Large)", value: "lg" },
      ],
    },
  },
  defaultProps: {
    columns: 2,
    gap: "md",
  },
  render: ({ columns, gap }) => {
    const colClass =
      columns === 4
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        : columns === 3
          ? "grid-cols-1 sm:grid-cols-3"
          : columns === 2
            ? "grid-cols-1 sm:grid-cols-2"
            : "grid-cols-1";

    const gapClass =
      gap === "sm" ? "gap-3" : gap === "lg" ? "gap-8" : "gap-5";

    // Tạo DropZone riêng biệt cho từng cột
    const colsArray = Array.from({ length: Number(columns) || 1 }, (_, i) => i);

    return (
      <div className={`grid ${colClass} ${gapClass} w-full my-4`}>
        {colsArray.map((colIdx) => (
          <div
            key={colIdx}
            className="min-h-[60px] rounded-lg border border-dashed border-slate-300 dark:border-slate-700 p-2"
          >
            <DropZone zone={`grid-col-${colIdx}`} />
          </div>
        ))}
      </div>
    );
  },
};
