import React from "react";
import { Icon } from "@iconify/react";

export interface LessonHeaderBlockProps {
  id?: string;
  title?: string;
  description?: string;
  estimatedTime?: string;
  order?: number;
  type?: "reading" | "video" | "quiz" | "coding" | "assignment";
}

const TYPE_CONFIG: Record<
  string,
  { label: string; badgeClass: string; icon: string }
> = {
  reading: {
    label: "Lý thuyết (Reading)",
    badgeClass:
      "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    icon: "lucide:book-open",
  },
  video: {
    label: "Video bài giảng",
    badgeClass:
      "bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    icon: "lucide:video",
  },
  quiz: {
    label: "Trắc nghiệm (Quiz)",
    badgeClass:
      "bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    icon: "lucide:help-circle",
  },
  coding: {
    label: "Thực hành Code",
    badgeClass:
      "bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    icon: "lucide:code",
  },
  assignment: {
    label: "Bài tập lớn (Assignment)",
    badgeClass:
      "bg-rose-50 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    icon: "lucide:file-text",
  },
};

export const LessonHeaderBlock: React.FC<LessonHeaderBlockProps> = ({
  title = "Tiêu đề bài học mới",
  description = "",
  estimatedTime = "15 mins",
  order = 1,
  type = "reading",
}) => {
  const currentTypeInfo = TYPE_CONFIG[type || "reading"] || TYPE_CONFIG.reading;

  return (
    <header className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-white via-white to-slate-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900/80 p-6 sm:p-8 shadow-sm relative overflow-hidden transition-all group hover:border-primary/40">
      <div className="flex flex-wrap items-center gap-2.5 mb-4 text-xs font-semibold">
        <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold tracking-wider uppercase">
          Bài #{order || 1}
        </span>
        <span
          className={`px-3 py-1 rounded-full border flex items-center gap-1.5 ${currentTypeInfo.badgeClass}`}
        >
          <Icon icon={currentTypeInfo.icon} className="w-3.5 h-3.5" />
          <span>{currentTypeInfo.label}</span>
        </span>
        {estimatedTime && (
          <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <Icon icon="lucide:clock" className="w-3.5 h-3.5" />
            <span>{estimatedTime}</span>
          </span>
        )}
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mb-2 leading-tight">
        {title}
      </h1>

      {description && (
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
          {description}
        </p>
      )}
    </header>
  );
};
