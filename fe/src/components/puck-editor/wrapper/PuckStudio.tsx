"use client";

import "@puckeditor/core/dist/index.css";
import React from "react";
import { Puck, type Config, type Data } from "@puckeditor/core";

export interface PuckStudioProps {
  config: Config<any, any>;
  initialData?: Data | any;
  onPublish: (data: any) => void | Promise<void>;
  overrides?: Record<string, unknown>;
}

export function PuckStudio({
  config,
  initialData = { content: [], root: {} },
  onPublish,
  overrides = { headerActions: () => null },
}: PuckStudioProps) {
  return (
    <div className="w-full flex-1 h-full flex flex-col overflow-hidden bg-surface text-foreground [&_[data-puck-header]]:bg-surface [&_[data-puck-header]]:border-border [&_[data-puck-sidebar]]:bg-surface [&_[data-puck-sidebar]]:border-border">
      <Puck
        config={config}
        data={initialData}
        onPublish={onPublish}
        overrides={overrides}
      />
    </div>
  );
}

