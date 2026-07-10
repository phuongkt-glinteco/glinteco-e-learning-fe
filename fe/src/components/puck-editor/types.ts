import { Data } from "@puckeditor/core";
import type { LessonDetailDto, CreateLessonDto, UpdateLessonDto } from "@/services/client";

// Re-export kiểu dữ liệu chuẩn từ Backend Client SDK để đồng bộ hoàn toàn
export type LessonType = LessonDetailDto["type"]; // 'video' | 'reading' | 'quiz' | 'coding' | 'assignment'

// 1. Root Metadata chuẩn của Lesson (Đồng bộ với DTO gửi lên Backend)
export interface LessonRootProps {
  title: string;
  description?: string;
  estimatedTime?: string;
  order?: number;
  type: LessonType;
  documents?: any[];
  exercises?: any[];
}

// 2. Định nghĩa các Enum / Type cho Code Block (chia theo nhóm như mô tả)
export type CodeCategory = "code" | "text" | "command";

export type ProgrammingLanguage =
  | "js"
  | "jsx"
  | "ts"
  | "tsx"
  | "python"
  | "html"
  | "css";

export type TextFormatLanguage = "json" | "yaml" | "txt" | "md";

export type CommandLanguage = "powershell" | "terminal" | "sql";

export type CodeBlockLanguage =
  | ProgrammingLanguage
  | TextFormatLanguage
  | CommandLanguage;

// 3. Enum cho các loại Ghi chú (Callout / Note)
export type CalloutVariant = "info" | "challenge" | "importance" | "objective";

import type {
  LessonHeaderBlockProps,
  LessonRightSidebarBlockProps,
} from "./blocks/lesson";

// 4. Props cho tất cả các khối (Blocks) trong Lesson
export interface LessonBlockProps {
  LessonHeaderBlock: LessonHeaderBlockProps;
  LessonRightSidebarBlock: LessonRightSidebarBlockProps;
  HeadingBlock: {
    title: string;
    level: "h1" | "h2" | "h3" | "h4";
    align: "left" | "center" | "right";
  };
  TextBlock?: {
    content: string;
    size?: "sm" | "base" | "lg";
  };
  ParagraphBlock: {
    content: string;
    align: "left" | "center" | "right" | "justify";
    bold: boolean;
    italic: boolean;
    underline: boolean;
    lineHeight: "tight" | "normal" | "relaxed" | "loose";
    fontSize: "sm" | "base" | "lg" | "xl";
    color: "default" | "muted" | "primary" | "accent";
  };
  ListBlock: {
    listType: "unordered" | "ordered";
    items: { text: string }[];
  };
  TableBlock: {
    headers: { text: string }[];
    rows: { cells: { text: string }[] }[];
  };
  CodeBlock: {
    category: CodeCategory;
    language: CodeBlockLanguage;
    code: string;
    showLineNumbers: boolean;
  };
  CalloutBlock: {
    variant: CalloutVariant;
    title?: string;
    content: string;
  };
  FlexLayoutBlock: {
    direction: "row" | "column";
    justify: "start" | "center" | "between";
    align: "start" | "center" | "stretch";
    gap: "sm" | "md" | "lg";
  };
  GridLayoutBlock: {
    columns: 1 | 2 | 3 | 4;
    gap: "sm" | "md" | "lg";
  };
  ExerciseEmbedBlock: {
    exerciseId: string;
    title: string;
    description?: string;
  };
  ReferenceDocumentBlock: {
    documentId?: string;
    url: string;
    altText: string;
  };
  ExternalLinkBlock: {
    url: string;
    label: string;
    description?: string;
    openInNewTab: boolean;
  };
  ImageBlock: {
    imageUrl: string;
    mode: "decorative" | "main";
    name?: string;
    figureNumber?: string;
    description?: string;
    alt?: string;
    align?: "left" | "center" | "right";
  };
}

// 5. Kiểu dữ liệu JSON hoàn chỉnh của Puck Editor cho Lesson
export type LessonPuckData = Data<LessonBlockProps, LessonRootProps>;

export type { LessonDetailDto, CreateLessonDto, UpdateLessonDto };
