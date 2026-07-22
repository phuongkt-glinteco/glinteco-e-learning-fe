import React from "react";
import Link from "next/link";
import { ArrowRight, ListChecks } from "lucide-react";
import { useTranslations } from "next-intl";
import { ComponentConfig } from "@puckeditor/core";
import { LessonBlockProps } from "../../types";
import { useLessonSSOT } from "../../helper";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/default/dialog";

type GroupExerciseBlockProps = LessonBlockProps["GroupExerciseBlock"];

function GroupExerciseSelectorWrapper({
  value,
  onChange,
  readOnly,
}: {
  value?: Array<{ exerciseId?: string; id?: string; title?: string; type?: string; isMandatory?: boolean }>;
  onChange: (val: any) => void;
  readOnly?: boolean;
}) {
  const { exercises: allExercises } = useLessonSSOT({ defaultExerciseTitle: "Bài tập" });
  const [open, setOpen] = React.useState(false);
  const selectedList = value || [];

  const toggleSelect = (ex: any) => {
    if (readOnly) return;
    const exId = ex.exerciseId || ex.id;
    if (!exId) return;
    const exists = selectedList.some((item) => (item.exerciseId || item.id) === exId);
    if (exists) {
      const next = selectedList.filter((item) => (item.exerciseId || item.id) !== exId);
      onChange(next);
    } else {
      onChange([...selectedList, { exerciseId: exId, id: exId, title: ex.title, type: ex.type, isMandatory: ex.isMandatory }]);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => !readOnly && setOpen(true)}
        disabled={readOnly || allExercises.length === 0}
        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-primary/30 bg-primary/10 text-primary font-medium text-xs hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <ListChecks className="w-4 h-4 shrink-0" />
        <span>⚡ Chọn từ danh sách Root Props ({selectedList.length}/{allExercises.length})</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-surface border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-primary" />
              <span>Chọn bài tập vào nhóm từ Root Props</span>
            </DialogTitle>
          </DialogHeader>
          <p className="text-[11px] text-muted-foreground">
            Tick chọn các bài tập hiển thị trong nhóm này (nếu không chọn, mặc định hiển thị tất cả bài tập của bài học):
          </p>
          <div className="space-y-1.5 max-h-72 overflow-y-auto py-2">
            {allExercises.length === 0 ? (
              <p className="text-xs italic text-muted-foreground py-4 text-center">Chưa có bài tập nào ở Root Props</p>
            ) : (
              allExercises.map((ex, i) => {
                const exId = ex.exerciseId || ex.id || "";
                const isChecked = selectedList.some((item) => (item.exerciseId || item.id) === exId);
                return (
                  <div
                    key={exId || i}
                    onClick={() => toggleSelect(ex)}
                    className={`flex items-center justify-between gap-2 p-2.5 rounded-lg text-xs transition-colors cursor-pointer border ${
                      isChecked
                        ? "bg-primary/10 border-primary text-primary font-semibold"
                        : "bg-surface-container-lowest hover:bg-primary/5 border-outline-variant/60 text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary shrink-0"
                      />
                      <span className="truncate">{ex.title || `Bài tập #${i + 1}`}</span>
                    </div>
                    <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                      {ex.type === "PR_REVIEW" ? "PR" : ex.type === "QUIZ" ? "Quiz" : ex.type === "FILL_IN_BLANK" ? "Fill" : ex.type || "Ex"}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const GroupExerciseBlock: ComponentConfig<GroupExerciseBlockProps> = {
  fields: {
    title: { type: "text", label: "Tiêu đề nhóm bài tập" },
    description: { type: "textarea", label: "Mô tả ngắn" },
    exerciseData: {
      type: "custom",
      label: "Danh sách bài tập trong nhóm",
      render: ({ value, onChange, readOnly }: any) => (
        <GroupExerciseSelectorWrapper value={value} onChange={onChange} readOnly={readOnly} />
      ),
    },
  },
  defaultProps: {
    title: "Bài tập thực hành",
    description: "Hoàn thành các bài tập sau để kết thúc bài học",
  },
  render: ({ title, description, exerciseData }) => {
    const t = useTranslations("PuckEditor.Common.groupExercise");
    const { exercises: allExercises } = useLessonSSOT({ defaultExerciseTitle: "Bài tập thực hành" });
    const displayExercises = (exerciseData && Array.isArray(exerciseData) && exerciseData.length > 0)
      ? exerciseData
      : allExercises;

    return (
      <div className="my-8 rounded-xl border border-border bg-surface-container-lowest p-6">
        <div className="mb-4">
          <h3 className="text-title-lg font-bold text-foreground">{title || "Bài tập thực hành"}</h3>
          {description && (
            <p className="mt-1 text-body-sm text-muted-foreground">{description}</p>
          )}
        </div>
        
        {displayExercises.length === 0 ? (
          <p className="text-body-sm text-muted-foreground italic">Không có bài tập nào được đăng ký trong bài học này.</p>
        ) : (
          <div className="space-y-3">
            {displayExercises.map((ex, idx) => {
              const exId = ex.exerciseId || ex.id;
              return (
                <div key={exId || idx} className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${ex.isMandatory ? 'border-primary/40 bg-primary/5' : 'border-outline-variant/60 bg-surface hover:bg-surface-container'}`}>
                  <div className="flex flex-col gap-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      {ex.isMandatory && <span className="inline-block w-2 h-2 rounded-full bg-primary shrink-0" title="Bắt buộc" />}
                      <span className={`font-semibold text-body-sm truncate ${ex.isMandatory ? 'text-primary' : 'text-foreground'}`}>{ex.title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-label-xs text-muted-foreground flex-wrap">
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full shrink-0">
                        {ex.type === "PR_REVIEW" ? "Lập trình" : ex.type === "QUIZ" ? "Trắc nghiệm" : ex.type === "FILL_IN_BLANK" ? "Điền khuyết" : ex.type}
                      </span>
                      {ex.isMandatory && <span className="font-medium text-amber-600 dark:text-amber-400 shrink-0">Bắt buộc</span>}
                    </div>
                  </div>
                  {exId && !exId.startsWith("draft-") && (
                    <Link href={`/exercises/${exId}`} className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-label-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
                      <span>Làm bài</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                  {(!exId || exId.startsWith("draft-")) && (
                    <span className="shrink-0 inline-flex items-center text-[10px] font-semibold px-2 py-1 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                      Bản nháp
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
};
