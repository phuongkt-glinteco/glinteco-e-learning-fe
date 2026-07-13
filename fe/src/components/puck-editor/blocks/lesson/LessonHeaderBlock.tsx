import React from "react";
import { BookOpen, Video, HelpCircle, Code, FileText, Clock } from "lucide-react";

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
  { label: string; badgeClass: string; icon: React.ComponentType<{ className?: string }> }
> = {
  reading: {
    label: "Lý thuyết (Reading)",
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    icon: BookOpen,
  },
  video: {
    label: "Video bài giảng",
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    icon: Video,
  },
  quiz: {
    label: "Trắc nghiệm (Quiz)",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: HelpCircle,
  },
  coding: {
    label: "Thực hành Code",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: Code,
  },
  assignment: {
    label: "Bài tập lớn (Assignment)",
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    icon: FileText,
  },
};

export const LessonHeaderBlock: React.FC<LessonHeaderBlockProps> = ({
  title = "Tiêu đề bài học mới",
  description = "",
  estimatedTime = "15 min",
  order = 1,
  type = "reading",
}) => {
  const currentTypeInfo = TYPE_CONFIG[type || "reading"] || TYPE_CONFIG.reading;
  const TypeIcon = currentTypeInfo.icon;

  return (
    <header className="w-full rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm relative overflow-hidden transition-all">
      <div className="flex flex-wrap items-center gap-2.5 mb-4 text-xs font-semibold">
        <span className="px-2.5 py-1 rounded-full bg-surface-container text-foreground font-bold tracking-wider uppercase">
          Bài #{order || 1}
        </span>
        <span
          className={`px-3 py-1 rounded-full border flex items-center gap-1.5 ${currentTypeInfo.badgeClass}`}
        >
          <TypeIcon className="w-3.5 h-3.5" />
          <span>{currentTypeInfo.label}</span>
        </span>
        {estimatedTime && (
          <span className="px-3 py-1 rounded-full bg-surface-container text-muted-foreground flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{estimatedTime}</span>
          </span>
        )}
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-2 leading-tight">
        {title}
      </h1>

      {description && (
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
          {description}
        </p>
      )}
    </header>
  );
};

