import React from "react";
import { ComponentConfig } from "@puckeditor/core";
import { LessonBlockProps } from "../../types";

export const ImageBlock: ComponentConfig<LessonBlockProps["ImageBlock"]> = {
  fields: {
    imageUrl: {
      type: "text",
      label: "Đường dẫn hình ảnh (URL)",
    },
    mode: {
      type: "radio",
      label: "Chế độ hình ảnh",
      options: [
        { label: "Nội dung chính (Có Tên, Đánh số, Mô tả)", value: "main" },
        { label: "Trang trí (Decorative - Không tên/Mô tả)", value: "decorative" },
      ],
    },
    align: {
      type: "radio",
      label: "Căn chỉnh",
      options: [
        { label: "Trái", value: "left" },
        { label: "Giữa", value: "center" },
        { label: "Phải", value: "right" },
      ],
    },
    figureNumber: {
      type: "text",
      label: "Đánh số hình (VD: Hình 1.1)",
    },
    name: {
      type: "text",
      label: "Tên hình ảnh / Tiêu đề",
    },
    description: {
      type: "textarea",
      label: "Mô tả chi tiết / Chú giải",
    },
    alt: {
      type: "text",
      label: "Văn bản thay thế (Alt Text cho SEO/Trình đọc)",
    },
  },
  defaultProps: {
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop",
    mode: "main",
    align: "center",
    figureNumber: "Hình 1.1",
    name: "Sơ đồ minh hoạ kiến thức",
    description: "Mô tả chi tiết các thành phần trong hình ảnh bài học.",
    alt: "Hình ảnh minh hoạ bài học",
  },
  render: ({
    imageUrl,
    mode,
    name,
    figureNumber,
    description,
    alt,
    align,
  }) => {
    const alignClass = {
      left: "items-start text-left",
      center: "items-center text-center",
      right: "items-end text-right",
    }[align || "center"];

    if (mode === "decorative") {
      return (
        <div className={`my-4 flex flex-col ${alignClass}`}>
          <img
            src={imageUrl || ""}
            alt=""
            aria-hidden="true"
            className="max-w-full h-auto rounded-xl object-cover border border-outline-variant/60"
          />
        </div>
      );
    }

    return (
      <figure className={`my-6 flex flex-col ${alignClass}`}>
        <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest max-w-full">
          <img
            src={imageUrl || ""}
            alt={alt || name || ""}
            className="max-w-full h-auto object-cover"
          />
        </div>
        <figcaption className="mt-2.5 max-w-2xl space-y-0.5">
          <div className="font-semibold text-body-sm text-on-surface">
            {figureNumber && (
              <span className="text-primary mr-1.5">{figureNumber}:</span>
            )}
            <span>{name}</span>
          </div>
          {description && (
            <p className="text-body-xs text-secondary">{description}</p>
          )}
        </figcaption>
      </figure>
    );
  },
};
