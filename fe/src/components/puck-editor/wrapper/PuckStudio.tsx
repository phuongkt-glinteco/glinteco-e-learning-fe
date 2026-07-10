"use client";

import "@puckeditor/core/dist/index.css";
import React from "react";
import { Puck, Config, Data } from "@puckeditor/core";

export interface PuckStudioProps {
  config: any;
  initialData?: any;
  onPublish: (data: any) => void | Promise<void>;
  overrides?: any;
}

export function PuckStudio({
  config,
  initialData = { content: [], root: {} },
  onPublish,
  overrides = { headerActions: () => null },
}: PuckStudioProps) {
  return (
    <div className="w-full h-[calc(100vh-9rem)] mb-4 flex flex-col overflow-hidden">
      <Puck
        config={config as any}
        data={initialData as any}
        onPublish={onPublish as any}
        overrides={overrides}
      />
    </div>
  );
}
