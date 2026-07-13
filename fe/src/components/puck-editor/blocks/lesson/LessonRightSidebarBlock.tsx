"use client";

import React, { useState } from "react";
import { usePuck } from "@puckeditor/core";
import { LessonRightSidebar } from "../../../features/tracks/components/LessonRightSidebar";
import { slugifyHeadingId } from "../../helper";

export interface LessonRightSidebarBlockProps {
  id?: string;
  documents?: Array<{ id?: string; title?: string; url?: string }>;
  exercises?: Array<{ id?: string; title?: string }>;
  showToLearner?: boolean;
  maxHeadingLevel?: number;
}

interface DerivedCanvasState {
  documents: Array<{ id?: string; title?: string; url?: string }>;
  exercises: Array<{ id?: string; title?: string }>;
  headings: Array<{ id: string; text: string; level: number }>;
}

function deduplicateItems<T extends { id?: string; url?: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    const key = item.id ? String(item.id) : item.url ? String(item.url) : JSON.stringify(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  return result;
}

class SilentErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function CanvasDerivedScanner({
  onDerive,
}: {
  onDerive: (state: DerivedCanvasState) => void;
}) {
  const puck = usePuck();
  const content = puck?.appState?.data?.content || [];

  React.useEffect(() => {
    const derivedDocs: Array<{ id?: string; title?: string; url?: string }> = [];
    const derivedExs: Array<{ id?: string; title?: string }> = [];
    const derivedHeadings: Array<{ id: string; text: string; level: number }> = [];

    content.forEach((block: any, idx: number) => {
      if (block.type === "ExerciseEmbedBlock") {
        const exId = block.props?.exerciseId || block.props?.id;
        if (exId || block.props?.title) {
          derivedExs.push({
            id: exId || `ex-${idx}`,
            title: block.props?.title || "Bài tập đính kèm",
          });
        }
      } else if (block.type === "ReferenceDocumentBlock") {
        const docId = block.props?.documentId || block.props?.id;
        if (docId || block.props?.url || block.props?.altText) {
          derivedDocs.push({
            id: docId || block.props?.url || `doc-${idx}`,
            title: block.props?.altText || block.props?.title || "Tài liệu tham khảo",
            url: block.props?.url,
          });
        }
      } else if (block.type === "HeadingBlock" && block.props?.title) {
        const levelNum =
          parseInt((block.props.level || "h2").replace("h", ""), 10) || 2;
        const headingId =
          block.props.id || slugifyHeadingId(block.props.title);
        derivedHeadings.push({
          id: headingId,
          text: block.props.title,
          level: levelNum,
        });
      }
    });

    onDerive({
      documents: derivedDocs,
      exercises: derivedExs,
      headings: derivedHeadings,
    });
  }, [content, onDerive]);

  return null;
}

export const LessonRightSidebarBlock: React.FC<LessonRightSidebarBlockProps> = ({
  documents = [],
  exercises = [],
  showToLearner = true,
  maxHeadingLevel = 3,
}) => {
  const [derivedState, setDerivedState] = useState<DerivedCanvasState>({
    documents: [],
    exercises: [],
    headings: [],
  });

  const mergedDocuments = React.useMemo(
    () => deduplicateItems([...documents, ...derivedState.documents]),
    [documents, derivedState.documents]
  );

  const mergedExercises = React.useMemo(
    () => deduplicateItems([...exercises, ...derivedState.exercises]),
    [exercises, derivedState.exercises]
  );

  return (
    <div className="w-full transition-all">
      <SilentErrorBoundary>
        <CanvasDerivedScanner onDerive={setDerivedState} />
      </SilentErrorBoundary>
      <LessonRightSidebar
        lesson={{ documents: mergedDocuments }}
        exercises={mergedExercises}
        canvasHeadings={derivedState.headings}
        showToLearner={showToLearner}
        maxHeadingLevel={maxHeadingLevel}
      />
    </div>
  );
};
