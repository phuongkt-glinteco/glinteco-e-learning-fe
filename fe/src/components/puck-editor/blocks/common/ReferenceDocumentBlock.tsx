import React from "react";
import { ComponentConfig } from "@puckeditor/core";
import { LessonBlockProps } from "../../types";

export const ReferenceDocumentBlock: ComponentConfig<
  LessonBlockProps["ReferenceDocumentBlock"]
> = {
  fields: {
    altText: {
      type: "text",
      label: "Tên hiển thị tài liệu (Alt text / Link label)",
    },
    url: {
      type: "text",
      label: "Đường dẫn tài liệu (hoặc chọn từ hệ thống)",
    },
    documentId: {
      type: "text",
      label: "ID Tài liệu hệ thống (nếu liên kết nội bộ)",
    },
  },
  defaultProps: {
    altText: "Tài liệu tham khảo hệ thống",
    url: "#",
    documentId: "",
  },
  render: ({ altText, url, documentId }) => {
    return (
      <div className="my-4">
        <a
          href={url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low hover:bg-surface-container transition-colors text-primary font-medium text-body-base"
        >
          <span className="material-symbols-outlined text-[20px]">
            description
          </span>
          <span className="underline decoration-primary/40 underline-offset-4">
            {altText || "Tài liệu tham khảo"}
          </span>
          {documentId && (
            <span className="text-label-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-normal">
              Internal Docs
            </span>
          )}
          <span className="material-symbols-outlined text-[16px] text-secondary">
            open_in_new
          </span>
        </a>
      </div>
    );
  },
};
