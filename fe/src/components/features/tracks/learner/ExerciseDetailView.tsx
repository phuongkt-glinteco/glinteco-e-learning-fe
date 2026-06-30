'use client';

import { useEffect, useState, type ReactNode } from 'react';
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
  startError: string | null;
  submitError: string | null;
  submitMessage: string | null;
  backLabel: string;
  onBackToLesson: () => void;
  onPrUrlChange: (value: string) => void;
  onStartExercise: () => void;
  onSubmit: () => void;
}

function formatDateTime(value: string | null) {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function getStatusLabel(status: LearnerSubmissionState['status']) {
  switch (status) {
    case 'in_progress':
      return 'In Progress';
    case 'approved':
      return 'Completed';
    case 'changes':
    case 'rejected':
      return 'Action Required';
    case 'submitted':
      return 'In Review';
    case 'pending':
      return 'Not Started';
  }
}

function getStatusBadgeClass(status: LearnerSubmissionState['status']) {
  switch (status) {
    case 'in_progress':
      return 'border-primary-fixed bg-primary-fixed text-primary';
    case 'approved':
      return 'border-green-200 bg-green-50 text-green-700';
    case 'changes':
    case 'rejected':
      return 'border-error-container bg-error-container text-on-error-container';
    case 'submitted':
      return 'border-secondary-fixed bg-secondary-fixed text-secondary';
    case 'pending':
      return 'border-primary-fixed bg-primary-fixed text-primary';
  }
}

function InfoSection({
  icon,
  title,
  children,
  className = '',
}: {
  icon: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-lg border border-outline-variant bg-surface p-5 shadow-sm ${className}`}>
      <div className="flex items-center gap-2 border-b border-outline-variant pb-3">
        <span className="material-symbols-outlined text-[20px] text-primary">{icon}</span>
        <h2 className="headline-sm text-on-surface">{title}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function AcceptanceCriteriaList({ exercise }: { exercise: LearnerExerciseDetail }) {
  const [checkedItems, setCheckedItems] = useState<boolean[]>(() => exercise.steps.map(() => false));

  useEffect(() => {
    setCheckedItems(exercise.steps.map(() => false));
  }, [exercise.id, exercise.steps]);

  function toggleItem(index: number) {
    setCheckedItems((current) =>
      current.map((checked, itemIndex) => (itemIndex === index ? !checked : checked))
    );
  }

  if (exercise.steps.length === 0) {
    return <p className="body-sm text-on-surface-variant">Criteria are being prepared.</p>;
  }

  return (
    <ul className="divide-y divide-outline-variant rounded-lg border border-outline-variant">
      {exercise.steps.map((step, index) => {
        const inputId = `acceptance-${exercise.id}-${index}`;
        const checked = checkedItems[index] ?? false;

        return (
          <li key={`${step}-${index}`}>
            <label
              htmlFor={inputId}
              className="flex min-w-0 cursor-pointer items-start gap-3 px-4 py-3 body-sm text-on-surface transition-colors hover:bg-primary/5"
            >
              <input
                id={inputId}
                type="checkbox"
                checked={checked}
                onChange={() => toggleItem(index)}
                className="mt-0.5 h-5 w-5 shrink-0 rounded border-outline text-primary focus:ring-2 focus:ring-primary/30"
              />
              <span className={`min-w-0 break-words ${checked ? 'text-on-surface-variant line-through' : ''}`}>
                {step}
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

function ExerciseContent({ exercise }: { exercise: LearnerExerciseDetail }) {
  return (
    <div className="flex min-w-0 flex-col gap-6">
      <InfoSection icon="flag" title="Learning Objectives">
        {exercise.objectives.length > 0 ? (
          <ol className="space-y-4">
            {exercise.objectives.map((objective, index) => (
              <li key={objective} className="flex min-w-0 gap-3 body-sm text-on-surface">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-semibold text-on-primary">
                  {index + 1}
                </span>
                <span className="min-w-0 break-words">{objective}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="body-sm text-on-surface-variant">Objectives are being prepared.</p>
        )}
      </InfoSection>

      <InfoSection icon="integration_instructions" title="Instructions">
        {exercise.overview.trim() ? (
          <article className="min-w-0 break-words text-on-surface-variant">
            <MarkdownRenderer content={exercise.overview} />
          </article>
        ) : (
          <p className="body-sm text-on-surface-variant">Exercise details are being prepared.</p>
        )}
      </InfoSection>

      <InfoSection icon="fact_check" title="Acceptance Criteria">
        <AcceptanceCriteriaList exercise={exercise} />
      </InfoSection>

      <InfoSection icon="library_books" title="Resources">
        {exercise.resources.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {exercise.resources.map((resource) => (
              <a
                key={resource.id}
                href={resource.url ?? '#'}
                target={resource.url ? '_blank' : undefined}
                rel={resource.url ? 'noreferrer' : undefined}
                className="flex min-w-0 items-start gap-3 rounded-lg border border-outline-variant p-4 hover:border-primary/40 hover:bg-primary/5"
              >
                <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
                  {resource.kind === 'Link' ? 'play_circle' : 'description'}
                </span>
                <span className="min-w-0">
                  <span className="block label-md break-words text-on-surface">{resource.title}</span>
                  {resource.content && (
                    <span className="mt-1 block body-sm line-clamp-2 break-words text-on-surface-variant">
                      {resource.content}
                    </span>
                  )}
                </span>
              </a>
            ))}
          </div>
        ) : (
          <p className="body-sm text-on-surface-variant">No linked resources for this exercise yet.</p>
        )}
      </InfoSection>
    </div>
  );
}

function SubmitPanel({
  mode,
  prUrl,
  disabled,
  submitting,
  submitError,
  submitMessage,
  onPrUrlChange,
  onSubmit,
}: {
  mode: 'submit' | 'resubmit';
  prUrl: string;
  disabled: boolean;
  submitting: boolean;
  submitError: string | null;
  submitMessage: string | null;
  onPrUrlChange: (value: string) => void;
  onSubmit: () => void;
}) {
  const title = mode === 'resubmit' ? 'Resubmit Work' : 'Submit PR';
  const buttonLabel = mode === 'resubmit' ? 'Resubmit Exercise' : 'Submit for Review';

  return (
    <section className={`rounded-lg border border-outline-variant bg-surface p-5 shadow-sm ${disabled ? 'opacity-55' : ''}`}>
      <div className="flex items-center gap-2 border-b border-outline-variant pb-3">
        <span className="material-symbols-outlined text-[20px] text-primary">send</span>
        <h2 className="headline-sm text-on-surface">{title}</h2>
      </div>
      <form
        className="mt-4 flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <Input
          id="exercise-pr-url"
          label={mode === 'resubmit' ? 'New Pull Request URL *' : 'Pull Request URL'}
          type="url"
          value={prUrl}
          onChange={(event) => onPrUrlChange(event.target.value)}
          placeholder="https://github.com/org/repo/pull/123"
          disabled={disabled || submitting}
          className={submitError ? 'border-error focus:border-error focus:ring-error' : ''}
        />
        {submitError && (
          <p className="flex items-start gap-1.5 label-sm text-error">
            <span className="material-symbols-outlined mt-0.5 text-[15px]">error</span>
            {submitError}
          </p>
        )}
        {submitMessage && (
          <p className="flex items-start gap-1.5 label-sm text-tertiary">
            <span className="material-symbols-outlined mt-0.5 text-[15px]">task_alt</span>
            {submitMessage}
          </p>
        )}
        <button
          type="submit"
          disabled={disabled || submitting || !prUrl.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 label-sm text-on-primary transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:bg-surface-container disabled:text-outline"
        >
          <span className="material-symbols-outlined text-[18px]">{submitting ? 'progress_activity' : 'upload'}</span>
          {submitting ? 'Submitting...' : buttonLabel}
        </button>
      </form>
    </section>
  );
}

function SubmittedState({
  submission,
  backLabel,
  onBackToLesson,
}: {
  submission: LearnerSubmissionState;
  backLabel: string;
  onBackToLesson: () => void;
}) {
  return (
    <section className="rounded-lg border border-outline-variant bg-surface p-8 text-center shadow-sm">
      <span className="material-symbols-outlined mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-tertiary-fixed/40 text-[36px] text-tertiary">
        check_circle
      </span>
      <h2 className="headline-lg mt-6 text-on-surface">Submission Received</h2>
      <p className="body-md mt-2 text-on-surface-variant">Waiting for mentor review</p>
      <div className="mx-auto mt-6 max-w-[680px] rounded-lg border border-outline-variant bg-surface-container-low p-4 text-left">
        <div className="flex justify-between gap-3 border-b border-outline-variant pb-3 label-sm text-on-surface">
          <span>Submitted</span>
          <span>{formatDateTime(submission.submittedAt)}</span>
        </div>
        {submission.prUrl && (
          <a href={submission.prUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex max-w-full items-center gap-1 text-primary hover:underline">
            <span className="min-w-0 truncate">{submission.prUrl}</span>
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
          </a>
        )}
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={onBackToLesson} className="rounded-lg bg-primary px-6 py-2.5 label-sm text-on-primary hover:opacity-90">
          {backLabel}
        </button>
      </div>
    </section>
  );
}

function ApprovedState({
  exercise,
  submission,
  track,
  backLabel,
  onBackToLesson,
}: {
  exercise: LearnerExerciseDetail;
  submission: LearnerSubmissionState;
  track: LearnerTrack;
  backLabel: string;
  onBackToLesson: () => void;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-6">
      <section className="rounded-lg border border-tertiary-container bg-tertiary-fixed/20 p-8 text-center shadow-sm">
        <span className="material-symbols-outlined mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-tertiary text-[44px] text-on-tertiary">
          check
        </span>
        <h2 className="headline-lg mt-6 text-on-surface">Exercise Passed!</h2>
        <p className="body-md mx-auto mt-3 max-w-xl text-on-surface-variant">
          Outstanding work. Your pull request met the technical requirements.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-secondary-fixed bg-secondary-fixed/50 px-5 py-2 label-md text-secondary">
          <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
          XP Awarded: +{exercise.xp} XP
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" className="rounded-lg bg-primary px-6 py-2.5 label-sm text-on-primary hover:opacity-90">
            Next Lesson
          </button>
          <button type="button" onClick={onBackToLesson} className="rounded-lg border border-primary px-6 py-2.5 label-sm text-primary hover:bg-primary-fixed">
            {backLabel}
          </button>
        </div>
      </section>

      <InfoSection icon="mode_comment" title="Mentor Feedback">
        <p className="body-sm break-words text-on-surface-variant">
          {submission.reviewNote ?? 'Great job. Your submission has been approved.'}
        </p>
      </InfoSection>

      {submission.prUrl && (
        <a href={submission.prUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-lg border border-outline-variant bg-surface p-5 label-md text-on-surface shadow-sm hover:border-primary/40">
          <span className="min-w-0 truncate">Pull request approved for {track.title}</span>
          <span className="inline-flex shrink-0 items-center gap-1 text-primary">
            View PR
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
          </span>
        </a>
      )}
    </div>
  );
}

function StatusAside({
  track,
  activeLesson,
  exercise,
  submission,
}: {
  track: LearnerTrack;
  activeLesson: LearnerLesson;
  exercise: LearnerExerciseDetail;
  submission: LearnerSubmissionState;
}) {
  return (
    <aside className="flex min-w-0 flex-col gap-6">
      <section className="rounded-lg border border-outline-variant bg-surface p-5 shadow-sm">
        <div className="border-b border-outline-variant pb-3">
          <h2 className="headline-sm text-on-surface">Status</h2>
        </div>
        <div className="mt-4 space-y-3 body-sm text-on-surface-variant">
          <div className="flex items-center justify-between gap-3">
            <span>Current State</span>
            <span className={`rounded-full border px-2.5 py-1 label-sm ${getStatusBadgeClass(submission.status)}`}>
              {getStatusLabel(submission.status)}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span>Submitted</span>
            <span className="text-right text-on-surface">{formatDateTime(submission.submittedAt)}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span>Reviewed</span>
            <span className="text-right text-on-surface">{formatDateTime(submission.reviewedAt)}</span>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-outline-variant bg-surface p-5 shadow-sm">
        <h2 className="label-sm uppercase text-on-surface-variant">Context</h2>
        <p className="mt-2 headline-sm break-words text-on-surface">{track.title}</p>
        <p className="mt-1 body-sm break-words text-on-surface-variant">{activeLesson.title}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded bg-surface-container px-2 py-0.5 label-sm text-on-surface-variant">{exercise.difficulty}</span>
          <span className="rounded bg-surface-container px-2 py-0.5 label-sm text-on-surface-variant">{exercise.estimatedTime}</span>
          <span className="rounded bg-secondary-fixed px-2 py-0.5 label-sm text-secondary">+{exercise.xp} XP</span>
        </div>
      </section>
    </aside>
  );
}

export function ExerciseDetailView({
  track,
  activeLesson,
  exercise,
  submission,
  prUrl,
  submitting,
  startError,
  submitError,
  submitMessage,
  backLabel,
  onBackToLesson,
  onPrUrlChange,
  onStartExercise,
  onSubmit,
}: ExerciseDetailViewProps) {
  const isNotStarted = submission.status === 'pending';
  const isInProgress = submission.status === 'in_progress';
  const isSubmitted = submission.status === 'submitted';
  const isChangesRequested = submission.status === 'changes' || submission.status === 'rejected';
  const isApproved = submission.status === 'approved';
  const startCardTitle = isInProgress ? 'Exercise in progress' : 'Ready to begin?';
  const startCardCopy = isInProgress
    ? 'Your progress is saved. Submit your pull request when the work is ready for review.'
    : 'Start the exercise to clock your time and unlock the submission form.';

  return (
    <div className="mx-auto flex max-w-container-max flex-col gap-8 px-gutter py-8">
      <header className="flex flex-col gap-4 border-b border-outline-variant pb-6">
        <button
          type="button"
          onClick={onBackToLesson}
          className="inline-flex w-fit items-center gap-2 label-sm text-on-surface-variant hover:text-on-surface cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          {backLabel}
        </button>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-3 py-1 label-sm ${getStatusBadgeClass(submission.status)}`}>
                {getStatusLabel(submission.status)}
              </span>
              <span className="label-sm uppercase text-on-surface-variant">
                Module {activeLesson.order} - Exercise
              </span>
            </div>
            <h1 className="headline-lg break-words text-on-surface">{exercise.title}</h1>
            <p className="body-md mt-2 max-w-3xl break-words text-on-surface-variant">{exercise.brief}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <span className="rounded-full border border-secondary-fixed bg-secondary-fixed/50 px-3 py-1 label-sm text-secondary">
              +{exercise.xp} XP
            </span>
            <span className="rounded-full border border-outline-variant bg-surface-container px-3 py-1 label-sm text-on-surface-variant">
              {exercise.estimatedTime}
            </span>
          </div>
        </div>
      </header>

      {isApproved ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <ApprovedState exercise={exercise} submission={submission} track={track} backLabel={backLabel} onBackToLesson={onBackToLesson} />
          <StatusAside track={track} activeLesson={activeLesson} exercise={exercise} submission={submission} />
        </div>
      ) : isSubmitted ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex flex-col gap-6">
            <SubmittedState submission={submission} backLabel={backLabel} onBackToLesson={onBackToLesson} />
            <InfoSection icon="article" title="Exercise Instructions">
              <ExerciseContent exercise={exercise} />
            </InfoSection>
          </div>
          <StatusAside track={track} activeLesson={activeLesson} exercise={exercise} submission={submission} />
        </div>
      ) : isChangesRequested ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <main className="flex min-w-0 flex-col gap-6">
            <section className="rounded-lg border border-error bg-surface p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3 border-b border-outline-variant pb-4">
                <div>
                  <h2 className="headline-sm text-on-surface">Mentor Feedback</h2>
                  <p className="body-sm mt-1 text-on-surface-variant">Update your PR based on this feedback.</p>
                </div>
                <span className="rounded-md bg-error-container px-2.5 py-1 label-sm text-on-error-container">Action Required</span>
              </div>
              <p className="body-md mt-4 break-words text-on-surface">
                {submission.reviewNote ?? 'Please address the requested changes and resubmit your work.'}
              </p>
              {submission.prUrl && (
                <div className="mt-5 rounded-lg border border-outline-variant bg-surface-container-low p-3 label-sm text-on-surface-variant">
                  Previous Submission:{' '}
                  <a href={submission.prUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    {submission.prUrl}
                  </a>
                </div>
              )}
            </section>
            <SubmitPanel
              mode="resubmit"
              prUrl={prUrl}
              disabled={false}
              submitting={submitting}
              submitError={submitError}
              submitMessage={submitMessage}
              onPrUrlChange={onPrUrlChange}
              onSubmit={onSubmit}
            />
          </main>
          <StatusAside track={track} activeLesson={activeLesson} exercise={exercise} submission={submission} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <main className="min-w-0">
            <ExerciseContent exercise={exercise} />
          </main>
          <aside className="flex min-w-0 flex-col gap-6">
            <section className="rounded-lg border border-outline-variant bg-surface p-5 text-center shadow-sm">
              <span className={`rounded-full border px-3 py-1 label-sm ${getStatusBadgeClass(submission.status)}`}>
                Status: {getStatusLabel(submission.status)}
              </span>
              <h2 className="headline-sm mt-4 text-on-surface">{startCardTitle}</h2>
              <p className="body-sm mt-2 text-on-surface-variant">{startCardCopy}</p>
              {startError && (
                <p className="mt-4 flex items-start gap-1.5 rounded-lg border border-error-container bg-error-container/30 p-3 text-left label-sm text-on-error-container">
                  <span className="material-symbols-outlined mt-0.5 text-[15px]">error</span>
                  <span className="min-w-0 break-words">{startError}</span>
                </p>
              )}
              <button
                type="button"
                onClick={onStartExercise}
                disabled={!isNotStarted}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 label-sm text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:bg-surface-container disabled:text-outline"
              >
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                {isInProgress ? 'Exercise Started' : 'Start Exercise'}
              </button>
            </section>
            <SubmitPanel
              mode="submit"
              prUrl={prUrl}
              disabled={!submission.canSubmit}
              submitting={submitting}
              submitError={submitError}
              submitMessage={submitMessage}
              onPrUrlChange={onPrUrlChange}
              onSubmit={onSubmit}
            />
          </aside>
        </div>
      )}
    </div>
  );
}
