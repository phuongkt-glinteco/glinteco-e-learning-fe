import React from "react";
import { ComponentConfig } from "@puckeditor/core";
import { FileText, ExternalLink } from "lucide-react";
import { LessonBlockProps } from "../../types";
import { DocumentPickerField } from "../../fields";

export const ReferenceDocumentBlock: ComponentConfig<
  LessonBlockProps["ReferenceDocumentBlock"]
> = {
  fields: {
    altText: {
      type: "text",
      label: "Tên hiển thị tài liệu (Link label)",
    },
    url: {
      type: "text",
      label: "Đường dẫn tài liệu (URL ngoài nếu có)",
    },
    documentId: {
      type: "custom",
      label: "Chọn tài liệu từ hệ thống",
      render: ({ value, onChange, readOnly }) => {
        const arr = value ? [{ id: value, title: `Tài liệu ID: ${value}` }] : [];
        return (
          <DocumentPickerField
            value={arr}
            onChange={(items) => onChange(items[0]?.id || "")}
            readOnly={readOnly}
          />
        );
      },
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
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-surface hover:bg-surface/80 transition-colors text-primary font-medium text-sm"
        >
          <FileText className="w-5 h-5 text-primary" />
          <span className="underline decoration-primary/40 underline-offset-4">
            {altText || "Tài liệu tham khảo"}
          </span>
          {documentId && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-normal">
              Internal Docs
            </span>
          )}
          <ExternalLink className="w-4 h-4 text-muted-foreground" />
        </a>
      </div>
    );
  },
};
