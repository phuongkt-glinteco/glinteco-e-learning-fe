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
      <div className="my-5 w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              {(headers || []).map((th, idx) => (
                <th key={idx} className="px-4 py-3 whitespace-nowrap">
                  {th.text}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">
            {(rows || []).map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
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
