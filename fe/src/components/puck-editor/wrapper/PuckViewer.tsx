import React from "react";
import { Render, Config, Data } from "@puckeditor/core";
import { deriveLessonSidebarState, LessonSSOTContext } from "../helper";

export interface PuckViewerProps {
  config: any;
  data: any;
}

export function PuckViewer({ config, data }: PuckViewerProps) {
  const derivedSSOT = React.useMemo(() => {
    const content = (data?.content || []) as Array<{ type?: string; props?: Record<string, unknown> }>;
    const rootProps = (data?.root?.props || {}) as Record<string, unknown>;
    return deriveLessonSidebarState(
      content,
      { defaultExerciseTitle: "Exercise", defaultDocTitle: "Document" },
      rootProps
    );
  }, [data]);

  return (
    <LessonSSOTContext.Provider value={derivedSSOT}>
      <Render config={config as any} data={data as any} />
    </LessonSSOTContext.Provider>
  );
}
