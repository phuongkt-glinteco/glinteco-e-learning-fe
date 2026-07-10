import React from "react";
import { Render, Config, Data } from "@puckeditor/core";

export interface PuckViewerProps {
  config: Config<any, any> | Config;
  data: Data<any, any> | Data;
}

export function PuckViewer({ config, data }: PuckViewerProps) {
  return <Render config={config as any} data={data as any} />;
}
