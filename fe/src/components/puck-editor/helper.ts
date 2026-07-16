import { usePuck } from "@puckeditor/core";
import { LessonPuckData, LessonRootProps } from "./types";

/**
 * Chuyển đổi nội dung body (có thể là JSON Puck hoặc Markdown cũ)
 * sang định dạng chuẩn JSON Puck Data.
 */
export function parseBodyToPuckData(
  body: string | null | undefined,
  fallbackRoot: Record<string, any> = {}
): LessonPuckData {
  const defaultRoot: LessonRootProps = {
    title: fallbackRoot.title || "Tiêu đề bài học",
    description: fallbackRoot.description || "",
    estimatedTime: fallbackRoot.estimatedTime || "15 mins",
    order: fallbackRoot.order || 1,
    type: fallbackRoot.type || "reading",
    documents: fallbackRoot.documents || [],
    exercises: fallbackRoot.exercises || [],
  };

  const ensureFixedZones = (existingZones?: Record<string, any[]>) => {
    const existingHeader =
      existingZones?.["header-zone"]?.[0] ||
      existingZones?.["root:header-zone"]?.[0];
    const existingSidebar =
      existingZones?.["sidebar-zone"]?.[0] ||
      existingZones?.["root:sidebar-zone"]?.[0];

    const header = {
      type: "LessonHeaderBlock",
      props: {
        id: existingHeader?.props?.id || "lesson-header-fixed",
        title:
          fallbackRoot.title || existingHeader?.props?.title || defaultRoot.title,
        description:
          fallbackRoot.description ||
          existingHeader?.props?.description ||
          defaultRoot.description,
        estimatedTime:
          fallbackRoot.estimatedTime ||
          existingHeader?.props?.estimatedTime ||
          defaultRoot.estimatedTime,
        order:
          fallbackRoot.order || existingHeader?.props?.order || defaultRoot.order,
        type:
          fallbackRoot.type || existingHeader?.props?.type || defaultRoot.type,
      },
    };

    const sidebar = {
      type: "LessonRightSidebarBlock",
      props: {
        id: existingSidebar?.props?.id || "lesson-sidebar-fixed",
        showToLearner: existingSidebar?.props?.showToLearner ?? true,
        maxHeadingLevel: existingSidebar?.props?.maxHeadingLevel ?? 3,
      },
    };

    return {
      ...(existingZones || {}),
      "header-zone": [header],
      "root:header-zone": [header],
      "sidebar-zone": [sidebar],
      "root:sidebar-zone": [sidebar],
    };
  };

  if (!body || !body.trim()) {
    return {
      content: [],
      root: {
        props: defaultRoot,
      },
      zones: ensureFixedZones(),
    } as any;
  }

  try {
    const parsed = JSON.parse(body);
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.content)) {
      return {
        content: parsed.content,
        root: {
          props: {
            ...defaultRoot,
            ...(parsed.root?.props || {}),
            documents:
              fallbackRoot.documents || parsed.root?.props?.documents || [],
            exercises:
              fallbackRoot.exercises || parsed.root?.props?.exercises || [],
          },
        },
        zones: ensureFixedZones(parsed.zones),
      } as any;
    }
  } catch {
    // Không phải JSON, xử lý như văn bản / markdown cũ
  }

  return {
    content: [
      {
        type: "ParagraphBlock",
        props: {
          id: "legacy-paragraph-1",
          content: body,
          align: "left",
          fontSize: "base",
          lineHeight: "relaxed",
          bold: false,
          italic: false,
          underline: false,
          color: "default",
        },
      },
    ],
    root: {
      props: defaultRoot,
    },
    zones: ensureFixedZones(),
  } as any;
}

/**
 * Kiểm tra xem chuỗi body có phải là dữ liệu Puck JSON hợp lệ không
 */
export function isPuckJsonBody(body: string | null | undefined): boolean {
  if (!body) return false;
  try {
    const parsed = JSON.parse(body);
    return Boolean(
      parsed &&
        typeof parsed === "object" &&
        Array.isArray(parsed.content)
    );
  } catch {
    return false;
  }
}

export interface SerializedLessonPayload {
  title: string;
  description: string;
  estimatedTime: string;
  order: number;
  type: string;
  body: string;
}

/**
 * Trích xuất metadata từ Puck Data (ưu tiên từ LessonHeaderBlock / root props)
 * và chuyển đổi cấu trúc JSON sang chuỗi body để gửi lên API.
 */
export function serializePuckDataToPayload(
  data: LessonPuckData,
  fallback?: {
    title?: string;
    description?: string;
    estimatedTime?: string;
    order?: number;
    type?: string;
  }
): SerializedLessonPayload {
  const rootProps = (data.root?.props || {}) as Record<string, unknown>;
  const zones = data.zones as Record<string, Array<{ props?: Record<string, unknown> }>> | undefined;
  const headerBlock =
    zones?.["header-zone"]?.[0] ||
    zones?.["root:header-zone"]?.[0] ||
    data.content?.find((b) => b && b.type === "LessonHeaderBlock");
  const headerProps = (headerBlock?.props || {}) as Record<string, unknown>;

  const title =
    (headerProps.title as string) ||
    (rootProps.title as string) ||
    fallback?.title ||
    "";
  const description =
    (headerProps.description as string) ||
    (rootProps.description as string) ||
    fallback?.description ||
    "";
  const order =
    Number(headerProps.order ?? rootProps.order ?? fallback?.order) || 1;
  const estimatedTime =
    (headerProps.estimatedTime as string) ||
    (rootProps.estimatedTime as string) ||
    fallback?.estimatedTime ||
    "15 min";
  const type =
    (headerProps.type as string) ||
    (rootProps.type as string) ||
    fallback?.type ||
    "reading";

  return {
    title,
    description,
    estimatedTime,
    order,
    type,
    body: JSON.stringify(data),
  };
}

export function slugifyHeadingId(title: string, index?: number): string {
  if (!title) return `heading-${index ?? 0}`;
  const slug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  return slug || `heading-${index ?? 0}`;
}

export function useSafePuck() {
  try {
    return usePuck();
  } catch {
    return null;
  }
}

export interface DerivedExerciseItem {
  id?: string;
  title?: string;
  blockIndex?: number;
  status?: "draft" | "complete";
  type?: "pr" | "minigame_quiz" | "minigame_fill";
}

export interface DerivedDocumentItem {
  id?: string;
  title?: string;
  url?: string;
}

export interface DerivedHeadingItem {
  id: string;
  text: string;
  level: number;
}

export function deriveLessonSidebarState(
  content: Array<{ type?: string; props?: Record<string, unknown> }>,
  fallbacks: { defaultExerciseTitle: string; defaultDocTitle: string }
): {
  documents: DerivedDocumentItem[];
  exercises: DerivedExerciseItem[];
  headings: DerivedHeadingItem[];
} {
  const derivedDocs: DerivedDocumentItem[] = [];
  const derivedExs: DerivedExerciseItem[] = [];
  const derivedHeadings: DerivedHeadingItem[] = [];

  content.forEach((block, idx) => {
    if (block.type === "SingleExerciseBlock") {
      const exData = (block.props?.content || block.props?.exerciseData) as
        | {
            exerciseId?: string;
            title?: string;
            status?: "draft" | "complete";
            type?: "pr" | "minigame_quiz" | "minigame_fill";
          }
        | undefined;
      if (exData?.exerciseId) {
        derivedExs.push({
          id: exData.exerciseId,
          title: exData.title || fallbacks.defaultExerciseTitle,
          status: exData.status || "complete",
          type: exData.type,
          blockIndex: idx,
        });
      }
      return;
    }

    if (block.type === "ReferenceDocumentBlock") {
      const docId =
        (block.props?.documentId as string | undefined) ||
        (block.props?.id as string | undefined);
      const url = block.props?.url as string | undefined;
      const title =
        (block.props?.altText as string | undefined) ||
        (block.props?.title as string | undefined) ||
        fallbacks.defaultDocTitle;

      if (docId || url || title) {
        derivedDocs.push({
          id: docId || url || `doc-${idx}`,
          title,
          url,
        });
      }
      return;
    }

    if (block.type === "HeadingBlock") {
      const text = block.props?.title as string | undefined;
      if (!text) return;
      const levelNum =
        parseInt(String(block.props?.level || "h2").replace("h", ""), 10) || 2;
      const headingId =
        (block.props?.id as string | undefined) || slugifyHeadingId(text);
      derivedHeadings.push({
        id: headingId,
        text,
        level: levelNum,
      });
    }
  });

  return {
    documents: derivedDocs,
    exercises: derivedExs,
    headings: derivedHeadings,
  };
}
