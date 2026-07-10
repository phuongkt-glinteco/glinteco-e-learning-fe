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
        documents:
          fallbackRoot.documents && fallbackRoot.documents.length > 0
            ? fallbackRoot.documents
            : existingSidebar?.props?.documents || [],
        exercises:
          fallbackRoot.exercises && fallbackRoot.exercises.length > 0
            ? fallbackRoot.exercises
            : existingSidebar?.props?.exercises || [],
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
