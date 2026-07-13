import React from "react";
import { ComponentConfig } from "@puckeditor/core";
import { LessonBlockProps } from "../../types";

export const TableBlock: ComponentConfig<LessonBlockProps["TableBlock"]> = {
  fields: {
    headers: {
      type: "array",
      label: "Cột tiêu đề (Headers)",
      arrayFields: {
        text: { type: "text", label: "Tên cột" },
      },
    },
    rows: {
      type: "array",
      label: "Các hàng dữ liệu (Rows)",
      arrayFields: {
        cells: {
          type: "array",
          label: "Các ô trong hàng",
          arrayFields: {
            text: { type: "text", label: "Giá trị ô" },
          },
        },
      },
    },
  },
  defaultProps: {
    headers: [{ text: "Thuộc tính" }, { text: "Kiểu dữ liệu" }, { text: "Mô tả" }],
    rows: [
      {
        cells: [
          { text: "id" },
          { text: "string" },
          { text: "Mã định danh duy nhất" },
        ],
      },
      {
        cells: [
          { text: "title" },
          { text: "string" },
          { text: "Tiêu đề bài học" },
        ],
      },
    ],
  },
  render: ({ headers, rows }) => {
    return (
      <div className="my-5 w-full overflow-x-auto rounded-xl border border-border shadow-sm">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-surface-container-low text-foreground font-semibold border-b border-border">
            <tr>
              {(headers || []).map((th, idx) => (
                <th key={idx} className="px-4 py-3 whitespace-nowrap">
                  {th.text}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface text-foreground">
            {(rows || []).map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-surface-container transition-colors">
                {(row.cells || []).map((cell, cIdx) => (
                  <td key={cIdx} className="px-4 py-3">
                    {cell.text}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },
};
