'use client';

import React, { useState } from "react";
import { DropZone } from "@puckeditor/core";
import { ListTree, X } from "lucide-react";
import type { LessonRootProps } from "../../types";

type LessonRootRenderProps = LessonRootProps & {
  children: React.ReactNode;
};

export const LessonRootHeader: React.FC<LessonRootRenderProps> = ({
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className="w-full min-h-screen bg-slate-50/60 dark:bg-slate-950/60 p-4 pb-40 transition-colors"
      style={{ containerType: "inline-size" }}
    >
      <style>{`
        /* ── Desktop (container >= 1024px) ── */
        @container (min-width: 1024px) {
          .lrh-layout { flex-direction: row; align-items: flex-start; }
          .lrh-sidebar-desktop { display: flex; }
          .lrh-sidebar-mobile { display: none; }
        }

        /* ── Tablet (768px <= container < 1024px) ── */
        @container (min-width: 768px) and (max-width: 1023px) {
          .lrh-layout { flex-direction: column; align-items: stretch; }
          .lrh-sidebar-desktop { display: none; }
          .lrh-sidebar-mobile { display: none; }
          .lrh-sidebar-tablet { display: block; }
        }

        /* ── Mobile (container < 768px) ── */
        @container (max-width: 767px) {
          .lrh-layout { flex-direction: column; align-items: stretch; }
          .lrh-sidebar-desktop { display: none; }
          .lrh-sidebar-tablet { display: none; }
          .lrh-sidebar-mobile { display: flex; }
        }
      `}</style>

      <div className="lrh-layout max-w-7xl mx-auto flex flex-col gap-8">
        {/* Content area */}
        <div className="flex-1 min-w-0 w-full flex flex-col gap-6">
          <DropZone
            zone="header-zone"
            allow={["LessonHeaderBlock"]}
          />
          <main className="w-full space-y-6">
            {children}
          </main>
        </div>

        {/* Desktop sidebar (sticky two-column) */}
        <aside className="lrh-sidebar-desktop hidden w-80 shrink-0 flex-col gap-6 sticky top-6">
          <DropZone
            zone="sidebar-zone"
            allow={["LessonRightSidebarBlock"]}
          />
        </aside>

        {/* Tablet sidebar (inline below content) */}
        <aside className="lrh-sidebar-tablet hidden w-full shrink-0 flex-col gap-4 border-t border-border pt-6">
          <h2 className="text-sm font-semibold text-foreground">Navigation</h2>
          <DropZone
            zone="sidebar-zone"
            allow={["LessonRightSidebarBlock"]}
          />
        </aside>
      </div>

      {/* Mobile FAB + sidebar overlay */}
      <div className="lrh-sidebar-mobile hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-12 h-12 rounded-full bg-primary text-on-primary shadow-lg hover:opacity-90 transition-opacity cursor-pointer"
          aria-label="Open navigation"
        >
          <ListTree className="w-5 h-5" />
        </button>

        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] bg-white dark:bg-neutral-900 shadow-xl overflow-y-auto">
              <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-border sticky top-0 bg-white dark:bg-neutral-900">
                <h2 className="text-sm font-semibold text-foreground">
                  Navigation
                </h2>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded-md hover:bg-muted transition-colors cursor-pointer"
                  aria-label="Close navigation"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-2">
                <DropZone
                  zone="sidebar-zone"
                  allow={["LessonRightSidebarBlock"]}
                />
              </div>
            </aside>
          </>
        )}
      </div>
    </div>
  );
};
