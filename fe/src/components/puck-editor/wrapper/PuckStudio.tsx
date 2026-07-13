"use client";

import "@puckeditor/core/dist/index.css";
import React from "react";
import { Puck, type Config, type Data } from "@puckeditor/core";

export interface PuckStudioProps {
  config: Config<any, any>;
  initialData?: Data | any;
  onPublish: (data: any) => void | Promise<void>;
  onChange?: (data: any) => void;
  overrides?: Record<string, unknown>;
}

export function PuckStudio({
  config,
  initialData = { content: [], root: {} },
  onPublish,
  onChange,
  overrides = { headerActions: () => null },
}: PuckStudioProps) {
  const mergedOverrides: Record<string, unknown> = {
    ...overrides,
    iframe: ({ children }: { children: React.ReactNode }) => (
      <div
        style={{
          width: "100%",
          height: "100%",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {children}
      </div>
    ),
  };

  return (
    <div className="w-full flex-1 h-full flex flex-col overflow-hidden bg-surface text-foreground [&_[data-puck-header]]:bg-surface [&_[data-puck-header]]:border-border [&_[data-puck-sidebar]]:bg-surface [&_[data-puck-sidebar]]:border-border">
      <Puck
        config={config}
        data={initialData}
        onPublish={onPublish}
        onChange={onChange}
        overrides={mergedOverrides}
      />
    </div>
  );
}

