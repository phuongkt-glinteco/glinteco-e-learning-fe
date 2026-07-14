import React from "react";
import { ComponentConfig } from "@puckeditor/core";
import { LessonBlockProps } from "../../types";

export const ParagraphBlock: ComponentConfig<LessonBlockProps["ParagraphBlock"]> = {
  fields: {
    content: {
      type: "textarea",
      label: "Nội dung đoạn văn (Paragraphs)",
    },
    align: {
      type: "radio",
      label: "Căn lề",
      options: [
        { label: "Trái", value: "left" },
        { label: "Giữa", value: "center" },
        { label: "Phải", value: "right" },
        { label: "Đều", value: "justify" },
      ],
    },
    fontSize: {
      type: "select",
      label: "Cỡ chữ",
      options: [
        { label: "Nhỏ (Small)", value: "sm" },
        { label: "Vừa (Base)", value: "base" },
        { label: "Lớn (Large)", value: "lg" },
        { label: "Rất lớn (XL)", value: "xl" },
      ],
    },
    lineHeight: {
      type: "select",
      label: "Dãn dòng (Line Height)",
      options: [
        { label: "Gọn (Tight - 1.25)", value: "tight" },
        { label: "Chuẩn (Normal - 1.5)", value: "normal" },
        { label: "Thoải mái (Relaxed - 1.75)", value: "relaxed" },
        { label: "Rộng (Loose - 2.0)", value: "loose" },
      ],
    },
    bold: {
      type: "radio",
      label: "In đậm (Bold)",
      options: [
        { label: "Không", value: false },
        { label: "Có", value: true },
      ],
    },
    italic: {
      type: "radio",
      label: "In nghiêng (Italic)",
      options: [
        { label: "Không", value: false },
        { label: "Có", value: true },
      ],
    },
    underline: {
      type: "radio",
      label: "Gạch chân (Underline)",
      options: [
        { label: "Không", value: false },
        { label: "Có", value: true },
      ],
    },
    color: {
      type: "select",
      label: "Màu chữ",
      options: [
        { label: "Mặc định", value: "default" },
        { label: "Mờ (Muted)", value: "muted" },
        { label: "Chính (Primary)", value: "primary" },
        { label: "Nhấn (Accent)", value: "accent" },
      ],
    },
  },
  defaultProps: {
    content: "Nhập nội dung đoạn văn của bạn ở đây. Hỗ trợ nhiều dòng văn bản...",
    align: "left",
    fontSize: "base",
    lineHeight: "relaxed",
    bold: false,
    italic: false,
    underline: false,
    color: "default",
  },
  render: ({
    content,
    align,
    fontSize,
    lineHeight,
    bold,
    italic,
    underline,
    color,
  }) => {
    const alignClass = {
      left: "text-left",
      center: "text-center",
      right: "text-right",
      justify: "text-justify",
    }[align || "left"];

    const sizeClass = {
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
    }[fontSize || "base"];

    const lineHeightClass = {
      tight: "leading-tight",
      normal: "leading-normal",
      relaxed: "leading-relaxed",
      loose: "leading-loose",
    }[lineHeight || "relaxed"];

    const colorClass = {
      default: "text-on-surface",
      muted: "text-secondary",
      primary: "text-primary",
      accent: "text-tertiary",
    }[color || "default"];

    const paragraphs = (content || "").split("\n\n");

    return (
      <div
        className={`my-3 space-y-3 ${alignClass} ${sizeClass} ${lineHeightClass} ${colorClass} ${
          bold ? "font-bold" : "font-normal"
        } ${italic ? "italic" : ""} ${underline ? "underline" : ""}`}
      >
        {paragraphs.map((para, i) => (
          <p key={i} className="whitespace-pre-line">
            {para}
          </p>
        ))}
      </div>
    );
  },
};
