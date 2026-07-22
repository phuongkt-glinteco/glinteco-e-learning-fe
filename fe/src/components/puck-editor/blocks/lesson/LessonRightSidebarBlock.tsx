"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { LessonRightSidebar } from "../../../features/tracks/components/LessonRightSidebar";
import { useLessonSSOT, useSafePuck, deriveLessonSidebarState } from "../../helper";

export interface LessonRightSidebarBlockProps {
  id?: string;
  showToLearner?: boolean;
  maxHeadingLevel?: number;
  sidebarContent?: unknown;
}

/** Merge root‑only items (added via sidebar) with canvas‑derived items. */
function mergeWithRootOnly<
  T extends { id?: string; exerciseId?: string },
>(canvasItems: T[], rootItems: unknown[]): T[] {
  const canvasIds = new Set(canvasItems.map((i) => i.exerciseId || i.id));
  const rootOnly = (rootItems as T[]).filter(
    (i) => !canvasIds.has(i.exerciseId || i.id),
  );
  return [...canvasItems, ...rootOnly];
}

export const LessonRightSidebarBlock: React.FC<LessonRightSidebarBlockProps> = ({
  showToLearner = true,
  maxHeadingLevel = 3,
}) => {
  const t = useTranslations("PuckEditor.Common.sidebar");
  const puck = useSafePuck();
  const isEditing = Boolean(puck);

  // Auto‑sync canvas content → root.props (SSOT) with debounce ~ onBlur
  const contentKey = JSON.stringify(puck?.appState?.data?.content);

  React.useEffect(() => {
    if (!puck?.appState?.data) return;

    const timer = setTimeout(() => {
      const content = (puck.appState.data.content || []) as Array<{
        type?: string;
        props?: Record<string, unknown>;
      }>;
      const currentRootProps = (puck.appState.data.root?.props || {}) as Record<string, unknown>;

      const { exercises: canvasExs, documents: canvasDocs, headings: canvasHeadings } =
        deriveLessonSidebarState(
          content,
          {
            defaultExerciseTitle: t("defaultExerciseTitle"),
            defaultDocTitle: t("defaultDocTitle"),
          },
        );

      const rootExs = (currentRootProps.exercises || []) as unknown[];
      const rootDocs = (currentRootProps.documents || []) as unknown[];
      const rootHeadings = (currentRootProps.headings || []) as unknown[];

      // Merge: canvas items + root‑only items (preserve sidebar‑added items)
      const mergedExs = mergeWithRootOnly(canvasExs, rootExs);
      const mergedDocs = mergeWithRootOnly(canvasDocs, rootDocs);
      const mergedHeadings = canvasHeadings; // headings are always on canvas

      const exsChanged = JSON.stringify(mergedExs) !== JSON.stringify(rootExs);
      const docsChanged = JSON.stringify(mergedDocs) !== JSON.stringify(rootDocs);
      const headingsChanged = JSON.stringify(mergedHeadings) !== JSON.stringify(rootHeadings);

      if (exsChanged || docsChanged || headingsChanged) {
        const newRootProps = { ...currentRootProps };
        if (exsChanged) newRootProps.exercises = mergedExs;
        if (docsChanged) newRootProps.documents = mergedDocs;
        if (headingsChanged) newRootProps.headings = mergedHeadings;

        puck.dispatch({
          type: "setData",
          data: {
            ...puck.appState.data,
            root: {
              ...(puck.appState.data.root || {}),
              props: newRootProps,
            },
          },
          recordHistory: false,
        } as any);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [contentKey, puck, t]);

  const derivedState = useLessonSSOT({
    defaultExerciseTitle: t("defaultExerciseTitle"),
    defaultDocTitle: t("defaultDocTitle"),
  });

  const handleSelectExercise = React.useCallback(
    (blockIndex?: number) => {
      if (typeof blockIndex !== 'number' || !puck) return;
      puck.dispatch({
        type: "setUi",
        ui: { itemSelector: { index: blockIndex } },
        recordHistory: false,
      });
    },
    [puck]
  );

  return (
    <div className="w-full transition-all">
      <LessonRightSidebar
        lesson={{ documents: derivedState.documents }}
        exercises={derivedState.exercises}
        canvasHeadings={derivedState.headings}
        showToLearner={showToLearner}
        maxHeadingLevel={maxHeadingLevel}
        isEditing={isEditing}
        onSelectExercise={handleSelectExercise}
      />
    </div>
  );
};
