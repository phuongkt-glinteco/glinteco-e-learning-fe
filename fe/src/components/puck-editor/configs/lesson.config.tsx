"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Config } from "@puckeditor/core";
import { LessonBlockProps, LessonRootProps } from "../types";
import {
  LessonRootHeader,
  LessonHeaderBlock,
  LessonRightSidebarBlock,
  SidebarContentField,
} from "../blocks/lesson";
import {
  HeadingBlock,
  ParagraphBlock,
  ListBlock,
  TableBlock,
  CodeBlock,
  CalloutBlock,
  FlexLayoutBlock,
  GridLayoutBlock,
  SingleExerciseBlock,
  GroupExerciseBlock,
  ReferenceDocumentBlock,
  ExternalLinkBlock,
  ImageBlock,
} from "../blocks/common";

/**
 * Custom Hook: useLessonPuckConfig
 * Trả về cấu hình Puck cho Lesson với toàn bộ nhãn (labels), categories,
 * options được dịch động theo ngôn ngữ hiện tại thông qua next-intl.
 */
export function useLessonPuckConfig(): Config<LessonBlockProps, LessonRootProps> {
  const t = useTranslations("PuckEditor.Lesson");

  return useMemo<Config<LessonBlockProps, LessonRootProps>>(() => ({
    // 1. Cấu hình Root Metadata bắt buộc của Lesson (dịch động label & option theo locale)
    root: {
      fields: {
        title: {
          type: "text",
          label: t("root.titleLabel"),
        },
        description: {
          type: "textarea",
          label: t("root.descriptionLabel"),
        },
        estimatedTime: {
          type: "text",
          label: t("root.estimatedTimeLabel"),
        },
        type: {
          type: "select",
          label: t("root.typeLabel"),
          options: [
            { label: t("root.types.reading"), value: "reading" },
            { label: t("root.types.video"), value: "video" },
            { label: t("root.types.quiz"), value: "quiz" },
            { label: t("root.types.coding"), value: "coding" },
            { label: t("root.types.assignment"), value: "assignment" },
          ],
        },
      },
      defaultProps: {
        title: "Tiêu đề bài học mới",
        description: "Mô tả nội dung chính của bài học này...",
        estimatedTime: "15 mins",
        order: 1,
        type: "reading",
      },
      render: ({ title, description, estimatedTime, order, type, children }) => (
        <LessonRootHeader
          title={title}
          description={description}
          estimatedTime={estimatedTime}
          order={order}
          type={type}
        >
          {children}
        </LessonRootHeader>
      ),
    },

    // 2. Phân loại các khối (Categories) được dịch theo locale
    categories: {
      typography: {
        title: t("categories.typography"),
        components: ["HeadingBlock", "ParagraphBlock", "ListBlock", "TableBlock"],
      },
      media: {
        title: t("categories.media"),
        components: ["ImageBlock", "ExternalLinkBlock", "ReferenceDocumentBlock", "SingleExerciseBlock", "GroupExerciseBlock"],
      },
      code: {
        title: t("categories.code"),
        components: ["CodeBlock"],
      },
      callout: {
        title: t("categories.callout"),
        components: ["CalloutBlock"],
      },
      layout: {
        title: t("categories.layout"),
        components: ["FlexLayoutBlock", "GridLayoutBlock"],
      },
      other: {
        title: "Other",
        components: ["LessonHeaderBlock", "LessonRightSidebarBlock"],
        visible: false,
      },
    },

    // 3. Đăng ký các khối component
    components: {
      LessonHeaderBlock: {
        label: "Header bài học",
        permissions: {
          delete: false,
          drag: false,
          duplicate: false,
        },
        fields: {
          title: { type: "text", label: "Tiêu đề bài học" },
          description: { type: "textarea", label: "Mô tả bài học" },
          estimatedTime: { type: "text", label: "Thời gian ước tính" },
          order: { type: "number", label: "Thứ tự bài học" },
          type: {
            type: "select",
            label: "Loại bài học",
            options: [
              { label: "Lý thuyết (Reading)", value: "reading" },
              { label: "Video bài giảng (Video)", value: "video" },
              { label: "Câu hỏi nhanh (Quiz)", value: "quiz" },
              { label: "Lập trình (Coding)", value: "coding" },
              { label: "Bài tập lớn (Assignment)", value: "assignment" },
            ],
          },
        },
        defaultProps: {
          title: "Tiêu đề bài học mới",
          description: "Mô tả nội dung chính của bài học này...",
          estimatedTime: "15 mins",
          order: 1,
          type: "reading",
        },
        render: (props) => <LessonHeaderBlock {...props} />,
      },
      LessonRightSidebarBlock: {
        label: "Right Sidebar (Tài liệu & Bài tập)",
        permissions: {
          delete: false,
          drag: false,
          duplicate: false,
        },
        fields: {
          showToLearner: {
            type: "radio",
            label: "Hiển thị với học viên",
            options: [
              { label: "Bật", value: true },
              { label: "Ẩn", value: false },
            ],
          },
          maxHeadingLevel: {
            type: "select",
            label: "Mức Heading tối đa",
            options: [
              { label: "H1", value: 1 },
              { label: "H1 - H2", value: 2 },
              { label: "H1 - H3", value: 3 },
              { label: "H1 - H4", value: 4 },
            ],
          },
          sidebarContent: {
            type: "custom",
            label: "Nội dung đã dán",
            render: () => <SidebarContentField />,
          },
        },
        defaultProps: {
           showToLearner: true,
           maxHeadingLevel: 3,
           sidebarContent: <SidebarContentField />,
         },
        render: (props) => <LessonRightSidebarBlock {...props} />,
      },
      HeadingBlock: { ...HeadingBlock, label: "Heading" },
      ParagraphBlock: { ...ParagraphBlock, label: "Paragraph" },
      ListBlock: { ...ListBlock, label: "List" },
      TableBlock: { ...TableBlock, label: "Table" },
      CodeBlock: { ...CodeBlock, label: "Code" },
      CalloutBlock: { ...CalloutBlock, label: "Callout" },
      FlexLayoutBlock: { ...FlexLayoutBlock, label: "Flex Layout" },
      GridLayoutBlock: { ...GridLayoutBlock, label: "Grid Layout" },
      SingleExerciseBlock: { ...SingleExerciseBlock, label: "Exercise" },
      GroupExerciseBlock: { ...GroupExerciseBlock, label: "Group Exercise" },
      ReferenceDocumentBlock: { ...ReferenceDocumentBlock, label: "Document" },
      ExternalLinkBlock: { ...ExternalLinkBlock, label: "Link" },
      ImageBlock: { ...ImageBlock, label: "Image" },
    },
  }), [t]);
}

// Cấu hình tĩnh mặc định (phòng trường hợp dùng ở Server Component hoặc non-hook)
export const lessonPuckConfig: Config<LessonBlockProps, LessonRootProps> = {
  root: {
    fields: {
      title: { type: "text", label: "Tiêu đề bài học (Bắt buộc)" },
      description: { type: "textarea", label: "Mô tả ngắn" },
      estimatedTime: { type: "text", label: "Thời gian ước tính (VD: 15 mins)" },
      type: {
        type: "select",
        label: "Phân loại bài học",
        options: [
          { label: "Lý thuyết (Reading)", value: "reading" },
          { label: "Video bài giảng (Video)", value: "video" },
          { label: "Câu hỏi nhanh (Quiz)", value: "quiz" },
          { label: "Lập trình (Coding)", value: "coding" },
          { label: "Bài tập lớn (Assignment)", value: "assignment" },
        ],
      },
    },
    defaultProps: {
      title: "Tiêu đề bài học mới",
      description: "Mô tả nội dung chính của bài học này...",
      estimatedTime: "15 mins",
      order: 1,
      type: "reading",
    },
    render: ({ title, description, estimatedTime, order, type, children }) => (
      <LessonRootHeader
        title={title}
        description={description}
        estimatedTime={estimatedTime}
        order={order}
        type={type}
      >
        {children}
      </LessonRootHeader>
    ),
  },
  categories: {
    typography: {
      title: "📝 Văn bản & Bảng biểu",
      components: ["HeadingBlock", "ParagraphBlock", "ListBlock", "TableBlock"],
    },
    media: {
      title: "🖼️ Hình ảnh & Liên kết",
      components: ["ImageBlock", "ExternalLinkBlock", "ReferenceDocumentBlock", "SingleExerciseBlock", "GroupExerciseBlock"],
    },
    code: {
      title: "💻 Code & Terminal",
      components: ["CodeBlock"],
    },
    callout: {
      title: "💡 Ghi chú & Chú ý",
      components: ["CalloutBlock"],
    },
    layout: {
      title: "📐 Bố cục (Layout)",
      components: ["FlexLayoutBlock", "GridLayoutBlock"],
    }
  },
  components: {
    LessonHeaderBlock: {
      label: "Header bài học",
      permissions: {
        delete: false,
        drag: false,
        duplicate: false,
      },
      fields: {
        title: { type: "text", label: "Tiêu đề bài học" },
        description: { type: "textarea", label: "Mô tả bài học" },
        estimatedTime: { type: "text", label: "Thời gian ước tính" },
        order: { type: "number", label: "Thứ tự bài học" },
        type: {
          type: "select",
          label: "Loại bài học",
          options: [
            { label: "Lý thuyết (Reading)", value: "reading" },
            { label: "Video bài giảng (Video)", value: "video" },
            { label: "Câu hỏi nhanh (Quiz)", value: "quiz" },
            { label: "Lập trình (Coding)", value: "coding" },
            { label: "Bài tập lớn (Assignment)", value: "assignment" },
          ],
        },
      },
      defaultProps: {
        title: "Tiêu đề bài học mới",
        description: "Mô tả nội dung chính của bài học này...",
        estimatedTime: "15 mins",
        order: 1,
        type: "reading",
      },
      render: (props) => <LessonHeaderBlock {...props} />,
    },
    LessonRightSidebarBlock: {
      label: "Right Sidebar (Tài liệu & Bài tập)",
      permissions: {
        delete: false,
        drag: false,
        duplicate: false,
      },
fields: {
         showToLearner: {
           type: "radio",
           label: "Hiển thị với học viên",
           options: [
             { label: "Bật", value: true },
             { label: "Ẩn", value: false },
           ],
         },
         maxHeadingLevel: {
           type: "select",
           label: "Mức Heading tối đa",
           options: [
             { label: "H1", value: 1 },
             { label: "H1 - H2", value: 2 },
             { label: "H1 - H3", value: 3 },
             { label: "H1 - H4", value: 4 },
           ],
         },
         sidebarContent: {
           type: "custom",
           label: "Nội dung đã dán",
           render: () => <SidebarContentField />,
         },
       },
      defaultProps: {
        showToLearner: true,
        maxHeadingLevel: 3,
      },
      render: (props) => <LessonRightSidebarBlock {...props} />,
    },
    HeadingBlock: { ...HeadingBlock, label: "Heading" },
    ParagraphBlock: { ...ParagraphBlock, label: "Paragraph" },
    ListBlock: { ...ListBlock, label: "List" },
    TableBlock: { ...TableBlock, label: "Table" },
    CodeBlock: { ...CodeBlock, label: "Code" },
    CalloutBlock: { ...CalloutBlock, label: "Callout" },
    FlexLayoutBlock: { ...FlexLayoutBlock, label: "Flex Layout" },
    GridLayoutBlock: { ...GridLayoutBlock, label: "Grid Layout" },
    SingleExerciseBlock: { ...SingleExerciseBlock, label: "Exercise" },
    GroupExerciseBlock: { ...GroupExerciseBlock, label: "Group Exercise" },
    ReferenceDocumentBlock: { ...ReferenceDocumentBlock, label: "Document" },
    ExternalLinkBlock: { ...ExternalLinkBlock, label: "Link" },
    ImageBlock: { ...ImageBlock, label: "Image" },
  },
};
