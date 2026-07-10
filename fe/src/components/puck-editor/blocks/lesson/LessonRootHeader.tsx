import React from "react";
import { DropZone } from "@puckeditor/core";
import type { LessonRootProps } from "../../types";

type LessonRootRenderProps = LessonRootProps & {
  children: React.ReactNode;
};

export const LessonRootHeader: React.FC<LessonRootRenderProps> = ({
  children,
}) => {
  return (
    <div className="w-full min-h-screen bg-slate-50/60 dark:bg-slate-950/60 p-4 sm:p-6 pb-40 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
        {/* Cột Trái: Header Block cố định (click để chọn & chỉnh sửa) + Nội dung bài học */}
        <div className="flex-1 min-w-0 w-full flex flex-col gap-6">
          <DropZone
            zone="header-zone"
            allow={["LessonHeaderBlock"]}
          />
          <main className="w-full space-y-6">
            {children}
          </main>
        </div>

        {/* Cột Phải: Right Sidebar Block cố định (click để chọn & chỉnh sửa) */}
        <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-6 sticky top-6">
          <DropZone
            zone="sidebar-zone"
            allow={["LessonRightSidebarBlock"]}
          />
        </aside>
      </div>
    </div>
  );
};
