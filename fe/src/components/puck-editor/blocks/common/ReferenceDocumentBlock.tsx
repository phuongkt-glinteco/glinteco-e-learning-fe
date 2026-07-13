import React from "react";
import { useTranslations } from "next-intl";
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
      label: "Tên hiển thị tài liệu",
    },
    url: {
      type: "text",
      label: "Đường dẫn tài liệu (URL)",
    },
    kind: {
      type: "select",
      label: "Phân loại tài liệu",
      options: [
        { label: "Hướng dẫn (Guide)", value: "guide" },
        { label: "Tài liệu tham khảo (Reference)", value: "reference" },
        { label: "Quy trình (Runbook)", value: "runbook" },
        { label: "Bài hướng dẫn (Tutorial)", value: "tutorial" },
        { label: "Liên kết ngoài (Link)", value: "link" },
      ],
    },
    description: {
      type: "textarea",
      label: "Mô tả ngắn về tài liệu",
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
    kind: "reference",
    description: "",
    documentId: "",
  },
  render: ({ altText, url, documentId, kind, description }) => {
    const t = useTranslations("PuckEditor.Common.documentEmbed");
    const title = altText || t("defaultTitle");

    return (
      <div className="my-4 rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-4 space-y-2">
        <a
          href={url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-surface/80"
        >
          <div className="flex min-w-0 items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <span className="truncate underline decoration-primary/40 underline-offset-4">
              {title}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {kind && (
              <span className="rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium uppercase text-secondary">
                {kind}
              </span>
            )}
            {documentId && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-normal text-primary">
                {t("internalBadge")}
              </span>
            )}
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </div>
        </a>
        {description && (
          <p className="text-xs text-muted-foreground px-1">{description}</p>
        )}
      </div>
    );
  },
};
