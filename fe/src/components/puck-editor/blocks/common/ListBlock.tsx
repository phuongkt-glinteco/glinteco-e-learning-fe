import React from "react";
import { ComponentConfig } from "@puckeditor/core";
import { LessonBlockProps } from "../../types";

export const ListBlock: ComponentConfig<LessonBlockProps["ListBlock"]> = {
  fields: {
    listType: {
      type: "radio",
      label: "Loại danh sách",
      options: [
        { label: "Gạch đầu dòng (Bullet)", value: "unordered" },
        { label: "Đánh số (Numbered)", value: "ordered" },
      ],
    },
    items: {
      type: "array",
      label: "Các mục trong danh sách",
      arrayFields: {
        text: { type: "text", label: "Nội dung mục" },
      },
    },
  },
  defaultProps: {
    listType: "unordered",
    items: [
      { text: "Điểm lưu ý thứ nhất" },
      { text: "Điểm lưu ý thứ hai" },
      { text: "Điểm lưu ý thứ ba" },
    ],
  },
  render: ({ listType, items }) => {
    const Tag = listType === "ordered" ? "ol" : "ul";
    const listStyleClass =
      listType === "ordered" ? "list-decimal" : "list-disc";

    return (
      <Tag
        className={`${listStyleClass} pl-6 my-3 space-y-2 text-slate-700 dark:text-slate-300 leading-relaxed`}
      >
        {(items || []).map((item, index) => (
          <li key={index} className="pl-1">
            {item.text}
          </li>
        ))}
      </Tag>
    );
  },
};
