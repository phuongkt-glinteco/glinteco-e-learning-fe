"use client";

import "@puckeditor/core/dist/index.css";
import React from "react";
import { Puck, Config, Data } from "@puckeditor/core";

export interface PuckStudioProps {
  config: Config<any, any> | Config;
  initialData?: Data<any, any> | Data;
  onPublish: (data: Data<any, any>) => void | Promise<void>;
}

export function PuckStudio({
  config,
  initialData = { content: [], root: {} },
  onPublish,
}: PuckStudioProps) {
  return (
    <div className="w-full h-screen">
      <Puck
        config={config as any}
        data={initialData as any}
        onPublish={onPublish as any}
      />
    </div>
  );
}
