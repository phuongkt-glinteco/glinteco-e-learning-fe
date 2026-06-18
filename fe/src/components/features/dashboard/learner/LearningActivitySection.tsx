import { ProgressBar } from '@/components/ui/HPBar';

interface LearningActivitySectionProps {
  tracks: { completed: number; total: number };
  exercises: { total: number; approved: number; awaitingReview: number };
  savedDocs: { total: number; unread: number };
}

export default function LearningActivitySection({
  tracks,
  exercises,
  savedDocs,
}: LearningActivitySectionProps) {
  return (
    <section>
      <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Learning Activity</h3>
      <div className="bg-white border border-outline-variant rounded-xl p-lg flex flex-col gap-6 h-full shadow-sm">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">route</span>
              <span className="font-label-md text-label-md">Tracks Completed</span>
            </div>
            <span className="font-label-md text-label-md text-primary">
              {tracks.completed}/{tracks.total}
            </span>
          </div>
          <ProgressBar value={(tracks.completed / tracks.total) * 100} />
        </div>
        <div className="grid grid-cols-2 gap-gutter">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-on-surface-variant mb-1">
              <span className="material-symbols-outlined text-[18px]">assignment_turned_in</span>
              <span className="font-label-sm text-label-sm">Exercises</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-headline-sm">{exercises.total}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Total</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-tertiary" />
                <span className="text-body-sm text-body-sm">{exercises.approved} Approved</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200 uppercase tracking-tighter">
                  {exercises.awaitingReview} Awaiting Review
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-on-surface-variant mb-1">
              <span className="material-symbols-outlined text-[18px]">bookmark</span>
              <span className="font-label-sm text-label-sm">Saved Docs</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-headline-sm">{savedDocs.total}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Total</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                <span className="text-body-sm text-body-sm font-semibold text-secondary">{savedDocs.unread} Unread</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
