import { z } from "zod";
import type { LessonPuckData, LessonRootProps } from "./types";

export type LessonPuckRootData = LessonRootProps;

export type LessonPuckFallback = {
  [Key in keyof LessonPuckRootData]?: LessonPuckRootData[Key] | null;
};

export interface LessonPuckBlockData {
  type: string;
  props?: Record<string, unknown>;
}

export type LessonPuckDataShape = LessonPuckData;

const LESSON_PUCK_COMPONENT_TYPES = new Set([
  "LessonHeaderBlock",
  "LessonRightSidebarBlock",
  "HeadingBlock",
  "ParagraphBlock",
  "ListBlock",
  "TableBlock",
  "CodeBlock",
  "CalloutBlock",
  "FlexLayoutBlock",
  "GridLayoutBlock",
  "SingleExerciseBlock",
  "GroupExerciseBlock",
  "ReferenceDocumentBlock",
  "ExternalLinkBlock",
  "ImageBlock",
]);

const puckBlockSchema = z
  .object({
    type: z.string(),
    props: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

const puckRootPropsSchema = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    estimatedTime: z.string().optional(),
    order: z.number().optional(),
    type: z.string().optional(),
    documents: z.array(z.unknown()).optional(),
    exercises: z.array(z.unknown()).optional(),
  })
  .passthrough();

const lessonPuckDataSchema = z
  .object({
    content: z.array(puckBlockSchema),
    root: z
      .object({
        props: puckRootPropsSchema.optional(),
      })
      .passthrough()
      .optional(),
    zones: z.record(z.string(), z.array(puckBlockSchema)).optional(),
  })
  .passthrough();

export type LessonPuckReadResult =
  | { ok: true; data: LessonPuckDataShape }
  | { ok: false; reason: "invalid_json" | "invalid_shape" | "unknown_block" };

function buildDefaultRoot(
  fallbackRoot: LessonPuckFallback,
): LessonPuckRootData {
  return {
    title: fallbackRoot.title || "Tiêu đề bài học",
    description: fallbackRoot.description || "",
    estimatedTime: fallbackRoot.estimatedTime || "15 mins",
    order: fallbackRoot.order || 1,
    type: fallbackRoot.type || "reading",
    documents: fallbackRoot.documents || [],
    exercises: fallbackRoot.exercises || [],
  };
}

function buildFixedZones(
  existingZones: Record<string, LessonPuckBlockData[]> | undefined,
  fallbackRoot: LessonPuckFallback,
  defaultRoot: LessonPuckRootData,
) {
  const existingHeader =
    existingZones?.["header-zone"]?.[0] ||
    existingZones?.["root:header-zone"]?.[0];
  const existingSidebar =
    existingZones?.["sidebar-zone"]?.[0] ||
    existingZones?.["root:sidebar-zone"]?.[0];

  const header: LessonPuckBlockData = {
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

  const sidebar: LessonPuckBlockData = {
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
}

function hasUnknownBlockTypes(data: z.infer<typeof lessonPuckDataSchema>) {
  const zoneBlocks = Object.values(data.zones ?? {}).flat();
  return [...data.content, ...zoneBlocks].some(
    (block) => !LESSON_PUCK_COMPONENT_TYPES.has(block.type),
  );
}

export function readLessonPuckData(
  body: string | null | undefined,
  fallbackRoot: LessonPuckFallback = {},
): LessonPuckReadResult {
  if (!body || !body.trim()) {
    return { ok: false, reason: "invalid_shape" };
  }

  let parsedBody: unknown;

  try {
    parsedBody = JSON.parse(body);
  } catch {
    return { ok: false, reason: "invalid_json" };
  }

  const parsedResult = lessonPuckDataSchema.safeParse(parsedBody);
  if (!parsedResult.success) {
    return { ok: false, reason: "invalid_shape" };
  }

  if (hasUnknownBlockTypes(parsedResult.data)) {
    return { ok: false, reason: "unknown_block" };
  }

  const defaultRoot = buildDefaultRoot(fallbackRoot);

  return {
    ok: true,
    data: {
      content: parsedResult.data.content as LessonPuckData["content"],
      root: {
        props: {
          ...parsedResult.data.root?.props,
          ...defaultRoot,
          documents:
            parsedResult.data.root?.props?.documents ?? fallbackRoot.documents ?? [],
          exercises:
            parsedResult.data.root?.props?.exercises ?? fallbackRoot.exercises ?? [],
        },
      },
      zones: buildFixedZones(
        parsedResult.data.zones,
        fallbackRoot,
        defaultRoot,
      ) as unknown as LessonPuckData["zones"],
    },
  };
}

export function buildEmptyLessonPuckData(
  fallbackRoot: LessonPuckFallback = {},
): LessonPuckDataShape {
  const defaultRoot = buildDefaultRoot(fallbackRoot);

  return {
    content: [],
    root: {
      props: defaultRoot as LessonPuckRootData & Record<string, unknown>,
    },
    zones: buildFixedZones(
      undefined,
      fallbackRoot,
      defaultRoot,
    ) as unknown as LessonPuckData["zones"],
  };
}
