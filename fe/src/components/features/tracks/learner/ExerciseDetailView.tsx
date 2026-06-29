import { Input } from '@/components/ui/forms';
import { MarkdownRenderer } from '@/lib/md-renderer';
import type {
  LearnerExerciseDetail,
  LearnerLesson,
  LearnerSubmissionState,
  LearnerTrack,
} from './types';

interface ExerciseDetailViewProps {
  track: LearnerTrack;
  activeLesson: LearnerLesson;
  exercise: LearnerExerciseDetail;
  submission: LearnerSubmissionState;
  prUrl: string;
  submitting: boolean;
  submitError: string | null;
  submitMessage: string | null;
  onBackToLesson: () => void;
  onPrUrlChange: (value: string) => void;
  onSubmit: () => void;
}

function formatDateTime(value: string | null) {
  if (!value) return 'Not available';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function getSubmissionLabel(status: LearnerSubmissionState['status']) {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'approved':
      return 'Approved';
    case 'changes':
      return 'Changes requested';
    case 'rejected':
      return 'Rejected';
    case 'submitted':
      return 'Submitted';
  }
}

function getSubmissionBadgeClass(status: LearnerSubmissionState['status']) {
  switch (status) {
    case 'approved':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'changes':
    case 'rejected':
      return 'bg-error-container text-on-error-container border-error-container';
    case 'submitted':
      return 'bg-primary-fixed text-primary border-primary-fixed';
    case 'pending':
      return 'bg-surface-container text-on-surface-variant border-outline-variant';
  }
}

function getSubmissionPanelClass(status: LearnerSubmissionState['status']) {
  switch (status) {
    case 'approved':
      return 'border-l-4 border-l-tertiary';
    case 'changes':
    case 'rejected':
      return 'border-l-4 border-l-error';
    case 'submitted':
      return 'border-l-4 border-l-primary';
    case 'pending':
      return '';
  }
}

function getSubmissionHelpText(status: LearnerSubmissionState['status']) {
  switch (status) {
    case 'approved':
      return 'Exercise complete. You can keep the submitted PR for reference.';
    case 'changes':
      return 'Review the mentor note, update your work, then resubmit the PR.';
    case 'rejected':
      return 'This submission was rejected. Submit an updated PR when ready.';
    case 'submitted':
      return 'Waiting for mentor review. You can continue learning while this is reviewed.';
    case 'pending':
      return 'Submit your GitHub pull request when your work is ready for review.';
  }
}

export function ExerciseDetailView({
  track,
  activeLesson,
  exercise,
  submission,
  prUrl,
  submitting,
  submitError,
  submitMessage,
  onBackToLesson,
  onPrUrlChange,
  onSubmit,
}: ExerciseDetailViewProps) {
  const canUseForm = submission.canSubmit || submission.canResubmit;
  const submitLabel = submission.canResubmit ? 'Resubmit Exercise' : 'Submit Exercise';
  const statusLabel = getSubmissionLabel(submission.status);

  return (
    <div className="mx-auto flex max-w-container-max flex-col gap-6 px-gutter py-8">
      <header className="rounded-lg border border-outline-variant bg-surface p-4 shadow-sm">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={onBackToLesson}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container-low cursor-pointer"
              aria-label="Back to lesson"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </button>
            <div className="min-w-0">
              <span className="label-sm uppercase text-primary">Exercise</span>
              <h1 className="headline-sm line-clamp-2 break-words text-on-surface">{exercise.title}</h1>
            </div>
          </div>
          <span className={`rounded-full border px-3 py-1 label-sm ${getSubmissionBadgeClass(submission.status)}`}>
            {statusLabel}
          </span>
        </div>
      </header>

      {submitMessage && (
        <div className="flex min-w-0 items-center gap-2 rounded-lg border border-tertiary-container bg-tertiary-fixed/40 p-4 label-sm text-tertiary">
          <span className="material-symbols-outlined text-[18px]">task_alt</span>
          <span className="min-w-0 break-words">{submitMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <main className="flex min-w-0 flex-col gap-6 rounded-lg border border-outline-variant bg-surface p-6 shadow-sm">
          <div className="border-b border-outline-variant pb-4">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded bg-surface-container px-2 py-0.5 label-sm text-on-surface-variant">
                {exercise.difficulty}
              </span>
              <span className="rounded bg-surface-container px-2 py-0.5 label-sm text-on-surface-variant">
                {exercise.tag}
              </span>
              <span className="inline-flex items-center gap-1 label-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-[15px]">schedule</span>
                {exercise.estimatedTime}
              </span>
              <span className="inline-flex items-center gap-1 label-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-[15px]">bolt</span>
                {exercise.xp} XP
              </span>
            </div>
            <p className="body-sm break-words text-on-surface-variant">{exercise.brief}</p>
          </div>

          <section className="min-w-0">
            <h2 className="headline-sm text-on-surface">Requirement</h2>
            {exercise.overview.trim() ? (
              <article className="mt-3 min-w-0 break-words text-on-surface-variant">
                <MarkdownRenderer content={exercise.overview} />
              </article>
            ) : (
              <p className="mt-2 body-sm text-on-surface-variant">
                Exercise details are being prepared.
              </p>
            )}
          </section>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
              <div className="flex items-center gap-2 border-b border-outline-variant pb-3">
                <span className="material-symbols-outlined text-[20px] text-primary">checklist</span>
                <h2 className="headline-sm text-on-surface">Objectives</h2>
              </div>
              {exercise.objectives.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {exercise.objectives.map((objective) => (
                    <li key={objective} className="flex min-w-0 gap-2 body-sm text-on-surface-variant">
                      <span className="material-symbols-outlined mt-0.5 shrink-0 text-[16px] text-primary">check_circle</span>
                      <span className="min-w-0 break-words">{objective}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 body-sm text-on-surface-variant">
                  Objectives are being prepared.
                </p>
              )}
            </section>

            <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
              <div className="flex items-center gap-2 border-b border-outline-variant pb-3">
                <span className="material-symbols-outlined text-[20px] text-primary">menu_book</span>
                <h2 className="headline-sm text-on-surface">Resources</h2>
              </div>
              {exercise.resources.length > 0 ? (
                <ul className="mt-3 space-y-3">
                  {exercise.resources.map((resource) => (
                    <li key={resource.id} className="flex min-w-0 items-start gap-3">
                      <span className="material-symbols-outlined mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-[18px] text-on-primary">
                        {resource.kind === 'Link' ? 'link' : 'article'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="label-md break-words text-on-surface">{resource.title}</p>
                        {resource.content && (
                          <p className="body-sm mt-0.5 line-clamp-2 break-words text-on-surface-variant">
                            {resource.content}
                          </p>
                        )}
                        {resource.url && (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-flex max-w-full items-center gap-1 text-primary hover:underline"
                          >
                            <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                            <span className="min-w-0 truncate">Open resource</span>
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 body-sm text-on-surface-variant">
                  No linked resources for this exercise yet.
                </p>
              )}
            </section>
          </div>

          <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
            <div className="flex items-center gap-2 border-b border-outline-variant pb-3">
              <span className="material-symbols-outlined text-[20px] text-primary">format_list_numbered</span>
              <h2 className="headline-sm text-on-surface">Steps</h2>
            </div>
            {exercise.steps.length > 0 ? (
              <ol className="mt-3 space-y-3">
                {exercise.steps.map((step, index) => (
                  <li key={step} className="flex min-w-0 gap-3 rounded-lg border border-outline-variant bg-surface p-3 body-sm text-on-surface-variant">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary label-sm text-on-primary">
                      {index + 1}
                    </span>
                    <span className="min-w-0 break-words">{step}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-3 body-sm text-on-surface-variant">
                Steps are being prepared.
              </p>
            )}
          </section>

          {exercise.hint && (
            <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
              <h2 className="headline-sm text-on-surface">Hint</h2>
              <p className="mt-2 body-sm break-words text-on-surface-variant">{exercise.hint}</p>
            </section>
          )}
        </main>

        <aside className="flex min-w-0 flex-col gap-6">
          <section className={`rounded-lg border border-outline-variant bg-surface p-5 shadow-sm ${getSubmissionPanelClass(submission.status)}`}>
            <div className="flex min-w-0 items-center justify-between gap-3 border-b border-outline-variant pb-3">
              <h2 className="headline-sm text-on-surface">Submission status</h2>
              <span className={`shrink-0 rounded-full border px-2.5 py-1 label-sm ${getSubmissionBadgeClass(submission.status)}`}>
                {statusLabel}
              </span>
            </div>
            <div className="mt-4 space-y-3 body-sm text-on-surface-variant">
              <p className="rounded-lg border border-outline-variant bg-surface-container-lowest p-3">
                {getSubmissionHelpText(submission.status)}
              </p>
              <div className="flex min-w-0 items-center justify-between gap-3">
                <span>Submitted</span>
                <span className="min-w-0 break-words text-right text-on-surface">
                  {formatDateTime(submission.submittedAt)}
                </span>
              </div>
              {submission.prUrl && (
                <a
                  href={submission.prUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-w-0 items-center gap-1 text-primary hover:underline"
                >
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  <span className="min-w-0 break-words">Open submitted PR</span>
                </a>
              )}
              {submission.reviewNote && (
                <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-3">
                  <div className="label-sm text-on-surface">Review note</div>
                  <p className="mt-1 break-words">{submission.reviewNote}</p>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-lg border border-outline-variant bg-surface p-5 shadow-sm">
            <h2 className="headline-sm text-on-surface">{submitLabel}</h2>
            <p className="mt-1 body-sm text-on-surface-variant">
              GitHub pull request URL is required for review.
            </p>
            <form
              className="mt-4 flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                onSubmit();
              }}
            >
              <Input
                id="exercise-pr-url"
                label="Pull request URL"
                type="url"
                value={prUrl}
                onChange={(event) => onPrUrlChange(event.target.value)}
                placeholder="https://github.com/org/repo/pull/123"
                disabled={!canUseForm || submitting}
              />
              {submitError && (
                <div className="rounded-lg border border-error-container bg-error-container/40 p-3 label-sm text-error">
                  {submitError}
                </div>
              )}
              {!canUseForm && (
                <p className="body-sm text-on-surface-variant">
                  Current submission status does not allow another submission.
                </p>
              )}
              <button
                type="submit"
                disabled={!canUseForm || submitting || !prUrl.trim()}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 label-sm text-on-primary transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:bg-surface-container disabled:text-outline"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {submitting ? 'progress_activity' : 'upload'}
                </span>
                {submitting ? 'Submitting...' : submitLabel}
              </button>
            </form>
          </section>

          <section className="rounded-lg border border-outline-variant bg-surface p-5 shadow-sm">
            <h2 className="label-sm uppercase text-on-surface-variant">Context</h2>
            <p className="mt-2 headline-sm break-words text-on-surface">{track.title}</p>
            <p className="mt-1 body-sm break-words text-on-surface-variant">{activeLesson.title}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
