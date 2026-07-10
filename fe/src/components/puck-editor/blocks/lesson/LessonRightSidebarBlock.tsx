import React from "react";
import { LessonRightSidebar } from "../../../features/tracks/components/LessonRightSidebar";

export interface LessonRightSidebarBlockProps {
  id?: string;
  documents?: Array<{ id?: string; title?: string; url?: string }>;
  exercises?: Array<{ id?: string; title?: string }>;
  showToLearner?: boolean;
  maxHeadingLevel?: number;
}

export const LessonRightSidebarBlock: React.FC<LessonRightSidebarBlockProps> = ({
  documents = [],
  exercises = [],
}) => {
  return (
    <div className="w-full transition-all">
      <LessonRightSidebar
        lesson={{ documents }}
        exercises={exercises}
      />
    </div>
  );
};
