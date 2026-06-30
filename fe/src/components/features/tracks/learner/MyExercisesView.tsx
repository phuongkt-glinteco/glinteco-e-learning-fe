import type { LearnerExerciseFeedItem, LearnerSubmissionStatus } from './types';

export type ExerciseFeedTab = 'all' | 'todo' | 'review' | 'changes' | 'completed';

interface MyExercisesViewProps {
  exercises: LearnerExerciseFeedItem[];
  activeTab: ExerciseFeedTab;
  onTabChange: (tab: ExerciseFeedTab) => void;
  onOpenExercise: (exercise: LearnerExerciseFeedItem) => void;
  onOpenPr: (url: string) => void;
}

const tabMeta: Array<{ id: ExerciseFeedTab; label: string; statuses: LearnerSubmissionStatus[] | null }> = [
  { id: 'all', label: 'All', statuses: null },
  { id: 'todo', label: 'To Do', statuses: ['pending'] },
  { id: 'review', label: 'In Review', statuses: ['submitted'] },
  { id: 'changes', label: 'Action Required', statuses: ['changes', 'rejected'] },
  { id: 'completed', label: 'Completed', statuses: ['approved'] },
];

function getStatusMeta(status: LearnerSubmissionStatus) {
  switch (status) {
    case 'approved':
      return {
        label: 'Completed',
        icon: 'check_circle',
        badgeClass: 'border-green-200 bg-green-50 text-green-700',
        cardClass: 'border-l-4 border-l-tertiary',
      };
    case 'changes':
    case 'rejected':
      return {
        label: 'Action Required',
        icon: 'assignment_late',
        badgeClass: 'border-error-container bg-error-container text-on-error-container',
        cardClass: 'border-l-4 border-l-error',
      };
    case 'submitted':
      return {
        label: 'In Review',
        icon: 'hourglass_top',
        badgeClass: 'border-secondary-fixed bg-secondary-fixed text-secondary',
        cardClass: 'border-l-4 border-l-secondary',
      };
    case 'pending':
      return {
        label: 'Not Started',
        icon: 'pending_actions',
        badgeClass: 'border-outline-variant bg-surface-container text-on-surface-variant',
        cardClass: 'border-l-4 border-l-outline-variant',
      };
  }
}

function getPrimaryAction(status: LearnerSubmissionStatus) {
  switch (status) {
    case 'pending':
      return 'Start Exercise';
    case 'submitted':
      return 'Review Submission';
    case 'changes':
    case 'rejected':
      return 'Review Feedback';
    case 'approved':
      return 'Review Submission';
  }
}

function formatDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(date);
}

function getTabCount(exercises: LearnerExerciseFeedItem[], tab: ExerciseFeedTab) {
  const meta = tabMeta.find((item) => item.id === tab);
  if (!meta?.statuses) return exercises.length;
  return exercises.filter((exercise) => meta.statuses?.includes(exercise.status)).length;
}

export function MyExercisesView({
  exercises,
  activeTab,
  onTabChange,
  onOpenExercise,
  onOpenPr,
}: MyExercisesViewProps) {
  const activeMeta = tabMeta.find((tab) => tab.id === activeTab) ?? tabMeta[0];
  const visibleExercises = activeMeta.statuses
    ? exercises.filter((exercise) => activeMeta.statuses?.includes(exercise.status))
    : exercises;

  return (
    <div className="mx-auto flex max-w-container-max flex-col gap-8 px-gutter py-8">
      <header className="flex flex-col gap-4 border-b border-outline-variant pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="headline-lg text-on-surface">My Exercises</h1>
          <p className="body-md mt-2 max-w-2xl text-on-surface-variant">
            Track your progress and review feedback on technical assignments.
          </p>
        </div>
        <div
          className="inline-flex items-center justify-between gap-3 rounded-lg border border-outline-variant bg-surface px-4 py-2.5 label-sm text-on-surface shadow-sm lg:min-w-[240px]"
          aria-label="Module filter"
        >
          <span className="inline-flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            All Modules
          </span>
        </div>
      </header>

      <div className="flex flex-wrap gap-2 border-b border-outline-variant">
        {tabMeta.map((tab) => {
          const count = getTabCount(exercises, tab.id);
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`-mb-px inline-flex items-center gap-2 border-b-2 px-3 py-3 label-sm transition-colors cursor-pointer ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab.label}
              <span className={`rounded-full px-2 py-0.5 text-[11px] ${isActive ? 'bg-primary-fixed text-primary' : 'bg-surface-container text-on-surface-variant'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {visibleExercises.length === 0 ? (
        <section className="rounded-lg border border-dashed border-outline-variant bg-surface p-8 text-center">
          <span className="material-symbols-outlined mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-fixed text-[28px] text-primary">
            checklist
          </span>
          <h2 className="headline-sm mt-4 text-on-surface">No exercises found</h2>
          <p className="body-sm mx-auto mt-2 max-w-md text-on-surface-variant">
            There are no exercises in this status yet.
          </p>
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {visibleExercises.map((exercise) => {
            const statusMeta = getStatusMeta(exercise.status);
            const submittedDate = formatDate(exercise.submittedAt);

            return (
              <article
                key={exercise.id}
                className={`flex min-w-0 flex-col rounded-lg border border-outline-variant bg-surface p-5 shadow-sm ${statusMeta.cardClass}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 label-sm ${statusMeta.badgeClass}`}>
                    <span className="material-symbols-outlined text-[15px]">{statusMeta.icon}</span>
                    {statusMeta.label}
                  </span>
                  <button
                    type="button"
                    aria-label="Exercise actions"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">more_vert</span>
                  </button>
                </div>

                <div className="mt-6 min-w-0 flex-1">
                  <h2 className="headline-sm line-clamp-2 break-words text-on-surface">{exercise.title}</h2>
                  <p className="body-sm mt-2 text-on-surface-variant">
                    {exercise.trackTitle} {exercise.lessonId ? '- Lesson linked' : ''}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-4 label-sm text-on-surface-variant">
                    <span className="inline-flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      {exercise.estimatedTime}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">bar_chart</span>
                      {exercise.difficulty}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">bolt</span>
                      {exercise.xp} XP
                    </span>
                  </div>

                  {exercise.status === 'pending' && (
                    <p className="body-sm mt-6 line-clamp-3 break-words text-on-surface-variant">
                      {exercise.brief}
                    </p>
                  )}

                  {(exercise.status === 'changes' || exercise.status === 'rejected') && (
                    <div className="mt-6 rounded-lg border border-error-container bg-error-container/30 p-3 body-sm text-on-error-container">
                      <p className="label-sm text-on-error-container">{exercise.reviewerName ?? 'Mentor'}:</p>
                      <p className="mt-1 line-clamp-3 break-words">
                        {exercise.reviewNote ?? 'Please review the feedback and resubmit your work.'}
                      </p>
                    </div>
                  )}

                  {exercise.status === 'submitted' && (
                    <div className="mt-6 rounded-lg border border-outline-variant bg-surface-container-lowest p-3 label-sm text-on-surface-variant">
                      <div className="flex min-w-0 items-center justify-between gap-3">
                        <span className="min-w-0 truncate">{exercise.prUrl ?? 'Submitted PR'}</span>
                        <span className="shrink-0 text-on-surface">{submittedDate ?? 'Submitted'}</span>
                      </div>
                    </div>
                  )}

                  {exercise.status === 'approved' && (
                    <p className="body-sm mt-6 text-on-surface-variant">
                      Approved{exercise.reviewerName ? ` by ${exercise.reviewerName}` : ''}.
                    </p>
                  )}
                </div>

                <div className="mt-6 flex flex-wrap gap-3 border-t border-outline-variant pt-4">
                  <button
                    type="button"
                    onClick={() => onOpenExercise(exercise)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 label-sm text-on-primary hover:opacity-90 cursor-pointer"
                  >
                    {getPrimaryAction(exercise.status)}
                    <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
                  </button>
                  {exercise.prUrl && (
                    <button
                      type="button"
                      onClick={() => exercise.prUrl && onOpenPr(exercise.prUrl)}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-primary px-4 py-2.5 label-sm text-primary hover:bg-primary-fixed cursor-pointer"
                    >
                      Open PR
                      <span className="material-symbols-outlined text-[17px]">open_in_new</span>
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
