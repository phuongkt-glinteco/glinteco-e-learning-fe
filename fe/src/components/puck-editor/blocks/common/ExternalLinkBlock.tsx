import React from "react";
import { ComponentConfig } from "@puckeditor/core";
import { LessonBlockProps } from "../../types";

export const ExternalLinkBlock: ComponentConfig<
  LessonBlockProps["ExternalLinkBlock"]
> = {
  fields: {
    label: {
      type: "text",
      label: "Văn bản hiển thị (Link Label)",
    },
    url: {
      type: "text",
      label: "Đường dẫn URL (https://...)",
    },
    description: {
      type: "textarea",
      label: "Mô tả bổ sung (tuỳ chọn)",
    },
    openInNewTab: {
      type: "radio",
      label: "Mở trong tab mới",
      options: [
        { label: "Có", value: true },
        { label: "Không", value: false },
      ],
    },
  },
  defaultProps: {
    label: "Liên kết ngoài (External Link)",
    url: "https://",
    description: "",
    openInNewTab: true,
  },
  render: ({ label, url, description, openInNewTab }) => {
    return (
      <div className="my-3">
        <a
          href={url || "#"}
          target={openInNewTab ? "_blank" : "_self"}
          rel={openInNewTab ? "noopener noreferrer" : undefined}
          className="group inline-flex flex-col gap-0.5"
        >
          <span className="inline-flex items-center gap-1.5 text-primary font-medium group-hover:underline text-body-base">
            <span className="material-symbols-outlined text-[18px]">link</span>
            <span>{label || url}</span>
            <span className="material-symbols-outlined text-[14px] text-secondary">
              open_in_new
            </span>
          </span>
          {description && (
            <span className="text-body-sm text-secondary pl-6">
              {description}
            </span>
          )}
        </a>
      </div>
    );
  },
};
