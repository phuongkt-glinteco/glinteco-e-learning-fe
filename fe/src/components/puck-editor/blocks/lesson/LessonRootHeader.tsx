import React from "react";
import type { LessonRootProps, LessonType } from "../../types";

type LessonRootRenderProps = LessonRootProps & {
  children: React.ReactNode;
};

const TYPE_CONFIG: Record<
  LessonType,
  { label: string; badgeClass: string }
> = {
  video: {
    label: "Video bài giảng",
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  reading: {
    label: "Bài đọc lý thuyết",
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  quiz: {
    label: "Bài kiểm tra nhanh",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  coding: {
    label: "Thực hành lập trình",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  assignment: {
    label: "Bài tập lớn",
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
};

export const LessonRootHeader: React.FC<LessonRootRenderProps> = ({
  title,
  description,
  estimatedTime,
  order,
  type,
  children,
}) => {
  const currentTypeInfo = TYPE_CONFIG[type] || TYPE_CONFIG.reading;

  return (
    <div className="w-full min-h-screen bg-slate-50/60 dark:bg-slate-950/60 transition-colors">
      {/* Header cố định của Lesson (thông tin Root metadata gửi Backend) */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-8 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center gap-2.5 mb-3.5 text-xs font-bold uppercase tracking-wider">
            <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Bài #{order || 1}
            </span>
            <span className={`px-2.5 py-1 rounded-md border ${currentTypeInfo.badgeClass}`}>
              {currentTypeInfo.label}
            </span>
            {estimatedTime && (
              <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                ⏱️ {estimatedTime}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
            {title || "Chưa đặt tiêu đề bài học"}
          </h1>

          {description && (
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </header>

      {/* Vùng thả các block nội dung của Lesson */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
        {children}
      </main>
    </div>
  );
};
