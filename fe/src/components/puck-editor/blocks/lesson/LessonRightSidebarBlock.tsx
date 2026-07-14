"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { LessonRightSidebar } from "../../../features/tracks/components/LessonRightSidebar";
import { deriveLessonSidebarState, useSafePuck } from "../../helper";

export interface LessonRightSidebarBlockProps {
  id?: string;
  showToLearner?: boolean;
  maxHeadingLevel?: number;
  sidebarContent?: unknown;
}

export const LessonRightSidebarBlock: React.FC<LessonRightSidebarBlockProps> = ({
  showToLearner = true,
  maxHeadingLevel = 3,
}) => {
  const t = useTranslations("PuckEditor.Common.sidebar");
  const puck = useSafePuck();
  const isEditing = Boolean(puck);

  const derivedState = React.useMemo(() => {
    const content = (puck?.appState?.data?.content || []) as Array<{
      type?: string;
      props?: Record<string, unknown>;
    }>;
    return deriveLessonSidebarState(content, {
      defaultExerciseTitle: t("defaultExerciseTitle"),
      defaultDocTitle: t("defaultDocTitle"),
    });
  }, [puck?.appState?.data?.content, t]);

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
        canvasHeadings={
          derivedState.headings.length > 0 ? derivedState.headings : undefined
        }
        showToLearner={showToLearner}
        maxHeadingLevel={maxHeadingLevel}
        isEditing={isEditing}
        onSelectExercise={handleSelectExercise}
      />
    </div>
  );
};
