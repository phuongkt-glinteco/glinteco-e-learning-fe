'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Input } from '@/components/ui/forms';
import { Button } from '@/components/ui/default/button';
import { MarkdownRenderer } from '@/lib/md-renderer';
import { useTranslations } from 'next-intl';
import { Checkbox } from '@/components/ui/default/checkbox';
import { DynamicBreadcrumbs } from '@/components/ui/containers/DynamicBreadcrumbs';
import {
  Send,
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  History as HistoryIcon,
  CheckCircle2,
  Play,
  PlayCircle,
  HelpCircle,
  AlertCircle,
  Upload,
  Loader2,
  Check,
  Sparkles,
  MessageSquare,
  Flag,
  FileText,
  CheckSquare,
} from 'lucide-react';
import { QuizExercisePanel } from './QuizExercisePanel';
import { FillBlankExercisePanel } from './FillBlankExercisePanel';
import type {
  LearnerAutoGradeResult,
  LearnerExerciseDetail,
  LearnerLesson,
  LearnerSubmissionHistoryItem,
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
  historyItems: LearnerSubmissionHistoryItem[];
  historyLoading: boolean;
  historyError: string | null;
  autoAnswers?: Record<string, string>;
  autoGradeResult?: LearnerAutoGradeResult | null;
  onAutoAnswerChange?: (questionId: string, answer: string) => void;
  onAutoSubmit?: () => void;
  onAutoRetry?: () => void;
  onPrUrlChange: (value: string) => void;
  onStartExercise: () => void;
  onSubmit: () => void;
  onRetryHistory: () => void;
  onBackToTrack?: () => void;
  onContinue?: () => void;
}

const SUBMISSION_STATUS_CONFIG: Record<
  LearnerSubmissionState['status'],
  { labelKey: string; badgeClass: string }
> = {
  in_progress: {
    labelKey: 'statusInProgress',
    badgeClass: 'border-primary/20 bg-primary/10 text-primary',
  },
  approved: {
    labelKey: 'statusCompleted',
    badgeClass: 'border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-300',
  },
  changes: {
    labelKey: 'actionRequired',
    badgeClass: 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300',
  },
  rejected: {
    labelKey: 'statusRejected',
    badgeClass: 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300',
  },
  submitted: {
    labelKey: 'statusInReview',
    badgeClass: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  },
  pending: {
    labelKey: 'statusNotStarted',
    badgeClass: 'border-border bg-surface-container text-muted-foreground',
  },
};

function formatDateTime(value: string | null, fallback = 'Not available') {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function getStatusLabel(status: LearnerSubmissionState['status']) {
  return SUBMISSION_STATUS_CONFIG[status].labelKey;
}

function getStatusBadgeClass(status: LearnerSubmissionState['status']) {
  return SUBMISSION_STATUS_CONFIG[status].badgeClass;
}

function InfoSection({
  icon,
  title,
  children,
  className = '',
}: {
  icon: ReactNode | string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const renderIcon = () => {
    if (typeof icon !== 'string') return icon;
    switch (icon) {
      case 'flag': return <Flag className="h-5 w-5 text-primary" />;
      case 'integration_instructions':
      case 'article': return <FileText className="h-5 w-5 text-primary" />;
      case 'fact_check': return <CheckSquare className="h-5 w-5 text-primary" />;
      case 'mode_comment': return <MessageSquare className="h-5 w-5 text-primary" />;
      default: return <HelpCircle className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <section className={`rounded-lg border border-outline-variant bg-surface p-5 shadow-sm ${className}`}>
      <div className="flex items-center gap-2 border-b border-outline-variant pb-3">
        {renderIcon()}
        <h2 className="headline-sm text-on-surface">{title}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function AcceptanceCriteriaList({ exercise }: { exercise: LearnerExerciseDetail }) {
  const [checkedItems, setCheckedItems] = useState<boolean[]>(() => exercise.steps.map(() => false));
  const t = useTranslations('ExerciseDetailView');

  useEffect(() => {
    setCheckedItems(exercise.steps.map(() => false));
  }, [exercise.id, exercise.steps]);

  function toggleItem(index: number) {
    setCheckedItems((current) =>
      current.map((checked, itemIndex) => (itemIndex === index ? !checked : checked))
    );
  }

  if (exercise.steps.length === 0) {
    return <p className="body-sm text-on-surface-variant">{t('criteriaPrepared')}</p>;
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
              <Checkbox
                id={inputId}
                checked={checked}
                onCheckedChange={() => toggleItem(index)}
                className="mt-0.5 h-5 w-5 shrink-0 border-outline"
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
  const t = useTranslations('ExerciseDetailView');
  return (
    <div className="flex min-w-0 flex-col gap-6">
      <InfoSection icon="flag" title={t('learningObjectives')}>
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
          <p className="body-sm text-on-surface-variant">{t('objectivesPrepared')}</p>
        )}
      </InfoSection>

      <InfoSection icon="integration_instructions" title={t('instructions')}>
        {exercise.overview.trim() ? (
          <article className="min-w-0 break-words text-on-surface-variant">
            <MarkdownRenderer content={exercise.overview} />
          </article>
        ) : (
          <p className="body-sm text-on-surface-variant">{t('exerciseDetailsPrepared')}</p>
        )}
      </InfoSection>

      <InfoSection icon="fact_check" title={t('acceptanceCriteria')}>
        <AcceptanceCriteriaList exercise={exercise} />
      </InfoSection>

      <InfoSection icon="library_books" title={t('resources')}>
        {exercise.resources.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {exercise.resources.map((resource) => (
              <a
                key={resource.id}
                href={resource.url ?? '#'}
                target={resource.url ? '_blank' : undefined}
                rel={resource.url ? 'noreferrer' : undefined}
                className="group flex min-w-0 items-start gap-3 rounded-lg border border-outline-variant p-4 hover:border-primary/40 hover:bg-primary/5"
              >
                {resource.kind === 'Link' ? (
                  <PlayCircle className="mt-0.5 h-5 w-5 shrink-0 text-on-surface-variant" />
                ) : (
                  <FileText className="mt-0.5 h-5 w-5 shrink-0 text-on-surface-variant" />
                )}
                <span className="min-w-0">
                  <span className="block label-md break-words text-on-surface">{resource.title}</span>
                  {resource.content && (
                    <span className="mt-1 block body-sm line-clamp-2 break-words text-on-surface-variant">
                      {resource.content}
                    </span>
                  )}
                </span>
                <ExternalLink className="ml-auto h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            ))}
          </div>
        ) : (
          <p className="body-sm text-on-surface-variant">{t('noResources')}</p>
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
  const t = useTranslations('ExerciseDetailView');
  const title = mode === 'resubmit' ? t('resubmitTitle') : t('submitTitle');
  const buttonLabel = mode === 'resubmit' ? t('resubmitButton') : t('submitButton');

  return (
    <section className={`rounded-lg border border-outline-variant bg-surface p-5 shadow-sm ${disabled ? 'opacity-55' : ''}`}>
      <div className="flex items-center gap-2 border-b border-outline-variant pb-3">
        <Send className="h-5 w-5 text-primary" />
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
          label={mode === 'resubmit' ? t('resubmitPrUrlLabel') : t('prUrlLabel')}
          type="url"
          value={prUrl}
          onChange={(event) => onPrUrlChange(event.target.value)}
          placeholder="https://github.com/org/repo/pull/123"
          disabled={disabled || submitting}
          className={submitError ? 'border-error focus:border-error focus:ring-error' : ''}
        />
        {submitError && (
          <p className="flex items-start gap-1.5 label-sm text-error">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {submitError}
          </p>
        )}
        {submitMessage && (
          <p className="flex items-start gap-1.5 label-sm text-tertiary">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            {submitMessage}
          </p>
        )}
        <Button
          type="submit"
          size="lg"
          className="h-auto gap-2 px-4 py-2.5"
          disabled={disabled || submitting || !prUrl.trim()}
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {submitting ? t('submitting') : buttonLabel}
        </Button>
      </form>
    </section>
  );
}

function SubmittedState({
  submission,
  onBackToTrack,
}: {
  submission: LearnerSubmissionState;
  onBackToTrack?: () => void;
}) {
  const t = useTranslations('ExerciseDetailView');
  return (
    <section className="rounded-lg border border-outline-variant bg-surface p-8 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-tertiary-fixed/40">
        <CheckCircle2 className="h-9 w-9 text-tertiary" />
      </div>
      <h2 className="headline-lg mt-6 text-on-surface">{t('submissionReceived')}</h2>
      <p className="body-md mt-2 text-on-surface-variant">{t('waitingMentorReview')}</p>
      <div className="mx-auto mt-6 max-w-[680px] rounded-lg border border-outline-variant bg-surface-container-low p-4 text-left">
        <div className="flex justify-between gap-3 border-b border-outline-variant pb-3 label-sm text-on-surface">
          <span>{t('submitted')}</span>
          <span>{formatDateTime(submission.submittedAt, t('notAvailable', { defaultValue: 'Not available' }))}</span>
        </div>
        {submission.prUrl && (
          <a href={submission.prUrl} target="_blank" rel="noreferrer" className="group mt-3 inline-flex max-w-full items-center gap-1 text-primary hover:underline">
            <span className="min-w-0 truncate">{submission.prUrl}</span>
            <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        )}
      </div>
      {onBackToTrack && (
        <div className="mt-8 flex justify-center">
          <Button
            type="button"
            size="lg"
            className="h-auto gap-2 px-6 py-2.5"
            onClick={onBackToTrack}
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover/button:-translate-x-1" />
            {t('backToTrack', { defaultValue: 'Back to Track' })}
          </Button>
        </div>
      )}
    </section>
  );
}

function ReviewHistorySection({
  items,
  loading,
  error,
  onRetry,
}: {
  items: LearnerSubmissionHistoryItem[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  const t = useTranslations('ExerciseDetailView');

  return (
    <section className="rounded-lg border border-outline-variant bg-surface p-5 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-outline-variant pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <HistoryIcon className="h-5 w-5 text-primary" />
          <div className="min-w-0">
            <h2 className="headline-sm text-on-surface">{t('reviewHistory')}</h2>
            <p className="body-sm text-on-surface-variant">{t('reviewHistoryDescription')}</p>
          </div>
        </div>
        {error && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-outline-variant px-3 py-2 label-sm text-on-surface hover:bg-surface-container-low"
          >
            <RefreshCw className="h-4 w-4" />
            {t('retryHistory')}
          </button>
        )}
      </div>

      {loading ? (
        <div className="mt-4 space-y-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="rounded-lg border border-outline-variant p-4">
              <div className="h-4 w-36 rounded bg-surface-container" />
              <div className="mt-3 h-3 w-full max-w-[520px] rounded bg-surface-container" />
              <div className="mt-2 h-3 w-2/3 rounded bg-surface-container" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="mt-4 rounded-lg border border-error-container bg-error-container/30 p-4 text-on-error-container">
          <p className="flex items-start gap-2 label-sm">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="min-w-0 break-words">{error}</span>
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-outline-variant bg-surface-container-low p-5 text-center">
          <HistoryIcon className="mx-auto h-7 w-7 text-on-surface-variant" />
          <p className="label-md mt-2 text-on-surface">{t('historyEmptyTitle')}</p>
          <p className="body-sm mt-1 text-on-surface-variant">{t('historyEmptyDescription')}</p>
        </div>
      ) : (
        <ol className="mt-4 space-y-4">
          {items.map((item) => {
            const isReviewEvent = item.eventType === 'review';
            const eventTime = isReviewEvent ? item.reviewedAt : item.submittedAt;

            return (
              <li key={item.id} className="relative flex min-w-0 gap-3">
                <div className="flex flex-col items-center">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-full ${isReviewEvent ? 'bg-secondary-fixed text-secondary' : 'bg-primary-fixed text-primary'}`}>
                    {isReviewEvent ? <MessageSquare className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                  </span>
                </div>
                <article className="min-w-0 flex-1 rounded-lg border border-outline-variant bg-surface-container-low p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="label-md text-on-surface">
                        {isReviewEvent ? t('historyReviewEvent') : t('historySubmissionEvent')}
                      </p>
                      <p className="body-sm text-on-surface-variant">{formatDateTime(eventTime, t('notAvailable', { defaultValue: 'Not available' }))}</p>
                    </div>
                    <span className={`w-fit rounded-full border px-2.5 py-1 label-sm ${getStatusBadgeClass(item.status)}`}>
                      {t(getStatusLabel(item.status))}
                    </span>
                  </div>

                  {item.prUrl && (
                    <a
                      href={item.prUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex max-w-full min-w-0 items-center gap-1 text-primary hover:underline"
                    >
                      <span className="min-w-0 truncate">{item.prUrl}</span>
                      <ExternalLink className="h-4 w-4 shrink-0" />
                    </a>
                  )}

                  {isReviewEvent && (
                    <div className="mt-3 space-y-2 border-t border-outline-variant pt-3 body-sm text-on-surface-variant">
                      {item.reviewerId && (
                        <p className="break-words">
                          <span className="font-medium text-on-surface">{t('reviewer')}:</span> {item.reviewerId}
                        </p>
                      )}
                      {item.reviewNote && (
                        <p className="break-words">
                          <span className="font-medium text-on-surface">{t('reviewNote')}:</span> {item.reviewNote}
                        </p>
                      )}
                      {item.submittedAt && (
                        <p>
                          <span className="font-medium text-on-surface">{t('submitted')}:</span> {formatDateTime(item.submittedAt, t('notAvailable', { defaultValue: 'Not available' }))}
                        </p>
                      )}
                    </div>
                  )}
                </article>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

function ApprovedState({
  exercise,
  submission,
  track,
  onBackToTrack,
}: {
  exercise: LearnerExerciseDetail;
  submission: LearnerSubmissionState;
  track: LearnerTrack;
  onBackToTrack?: () => void;
}) {
  const t = useTranslations('ExerciseDetailView');
  return (
    <div className="flex min-w-0 flex-col gap-6">
      <section className="rounded-lg border border-tertiary-container bg-tertiary-fixed/20 p-8 text-center shadow-sm">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-tertiary-container">
          <Check className="h-11 w-11 text-on-tertiary" />
        </div>
        <h2 className="headline-lg mt-6 text-on-surface">{t('exercisePassed')}</h2>
        <p className="body-md mx-auto mt-3 max-w-xl text-on-surface-variant">
          {t('outstandingWork')}
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-secondary-fixed bg-secondary-fixed/50 px-5 py-2 label-md text-secondary">
          <Sparkles className="h-4 w-4" />
          {t('xpAwarded', { xp: exercise.xp })}
        </div>
        {onBackToTrack && (
        <div className="mt-8 flex justify-center">
          <Button
            type="button"
            size="lg"
            className="h-auto gap-2 px-6 py-2.5"
            onClick={onBackToTrack}
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover/button:-translate-x-1" />
            {t('backToTrack', { defaultValue: 'Back to Track' })}
          </Button>
        </div>
        )}
      </section>

      <InfoSection icon="mode_comment" title={t('mentorFeedback')}>
        <p className="body-sm break-words text-on-surface-variant">
          {submission.reviewNote ?? t('defaultFeedback')}
        </p>
      </InfoSection>

      {submission.prUrl && (
        <a href={submission.prUrl} target="_blank" rel="noreferrer" className="group flex items-center justify-between gap-3 rounded-lg border border-outline-variant bg-surface p-5 label-md text-on-surface shadow-sm hover:border-primary/40">
          <span className="min-w-0 truncate">{t('prApprovedFor', { trackTitle: track.title })}</span>
          <span className="inline-flex shrink-0 items-center gap-1 text-primary">
            {t('viewPr')}
            <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
  const t = useTranslations('ExerciseDetailView');
  return (
    <aside className="flex min-w-0 flex-col gap-6">
      <section className="rounded-lg border border-outline-variant bg-surface p-5 shadow-sm">
        <div className="border-b border-outline-variant pb-3">
          <h2 className="headline-sm text-on-surface">{t('status')}</h2>
        </div>
        <div className="mt-4 space-y-3 body-sm text-on-surface-variant">
          <div className="flex items-center justify-between gap-3">
            <span>{t('currentState')}</span>
            <span className={`rounded-full border px-2.5 py-1 label-sm ${getStatusBadgeClass(submission.status)}`}>
              {t(getStatusLabel(submission.status))}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span>{t('submitted')}</span>
            <span className="text-right text-on-surface">{formatDateTime(submission.submittedAt, t('notAvailable', { defaultValue: 'Not available' }))}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span>{t('reviewed')}</span>
            <span className="text-right text-on-surface">{formatDateTime(submission.reviewedAt, t('notAvailable', { defaultValue: 'Not available' }))}</span>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-outline-variant bg-surface p-5 shadow-sm">
        <h2 className="label-sm uppercase text-on-surface-variant">{t('context')}</h2>
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
  historyItems,
  historyLoading,
  historyError,
  autoAnswers,
  autoGradeResult,
  onAutoAnswerChange,
  onAutoSubmit,
  onAutoRetry,
  onPrUrlChange,
  onStartExercise,
  onSubmit,
  onRetryHistory,
  onBackToTrack,
  onContinue,
}: ExerciseDetailViewProps) {
  const t = useTranslations('ExerciseDetailView');
  const isNotStarted = submission.status === 'pending';
  const isInProgress = submission.status === 'in_progress';
  const isSubmitted = submission.status === 'submitted';
  const isChangesRequested = submission.status === 'changes';
  const isRejected = submission.status === 'rejected';
  const isApproved = submission.status === 'approved';
  const startCardTitle = isInProgress ? t('exerciseInProgress') : t('readyToBegin');
  const startCardCopy = isInProgress
    ? t('progressSaved')
    : t('startExerciseToClock');

  return (
    <div className="mx-auto flex max-w-container-max flex-col gap-8 px-gutter py-8">
      <header className="flex flex-col gap-4 border-b border-outline-variant pb-6">
        <div className="mb-2">
          <DynamicBreadcrumbs />
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-3 py-1 label-sm ${getStatusBadgeClass(submission.status)}`}>
                {t(getStatusLabel(submission.status))}
              </span>
              <span className="label-sm uppercase text-on-surface-variant">
                {t('moduleExercise', { order: activeLesson.order })}
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

      {exercise.type === 'QUIZ' || exercise.type === 'FILL_IN_BLANK' ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <main className="min-w-0">
            {exercise.type === 'QUIZ' ? (
              <QuizExercisePanel
                exercise={exercise}
                answers={autoAnswers || {}}
                gradeResult={autoGradeResult || null}
                submitting={submitting}
                error={submitError}
                onAnswerChange={onAutoAnswerChange || (() => {})}
                onSubmit={onAutoSubmit || (() => {})}
                onRetry={onAutoRetry || (() => {})}
                onBack={onBackToTrack}
                onContinue={onContinue || onBackToTrack}
              />
            ) : (
              <FillBlankExercisePanel
                exercise={exercise}
                answers={autoAnswers || {}}
                gradeResult={autoGradeResult || null}
                submitting={submitting}
                error={submitError}
                onAnswerChange={onAutoAnswerChange || (() => {})}
                onSubmit={onAutoSubmit || (() => {})}
                onRetry={onAutoRetry || (() => {})}
                onBack={onBackToTrack}
                onContinue={onContinue || onBackToTrack}
              />
            )}
          </main>
          <StatusAside track={track} activeLesson={activeLesson} exercise={exercise} submission={submission} />
        </div>
      ) : isApproved ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <ApprovedState exercise={exercise} submission={submission} track={track} onBackToTrack={onBackToTrack} />
          <StatusAside track={track} activeLesson={activeLesson} exercise={exercise} submission={submission} />
        </div>
      ) : isSubmitted ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex flex-col gap-6">
            <SubmittedState submission={submission} onBackToTrack={onBackToTrack} />
            <InfoSection icon="article" title={t('instructions')}>
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
                  <h2 className="headline-sm text-on-surface">{t('mentorFeedback')}</h2>
                  <p className="body-sm mt-1 text-on-surface-variant">{t('mentorFeedbackUpdate')}</p>
                </div>
                <span className="rounded-md bg-error-container px-2.5 py-1 label-sm text-on-error-container">{t('actionRequired')}</span>
              </div>
              <p className="body-md mt-4 break-words text-on-surface">
                {submission.reviewNote ?? t('pleaseAddressChanges')}
              </p>
              {submission.prUrl && (
                <div className="mt-5 rounded-lg border border-outline-variant bg-surface-container-low p-3 label-sm text-on-surface-variant">
                  {t('previousSubmission')}{' '}
                  <a href={submission.prUrl} target="_blank" rel="noreferrer" className="break-all text-primary hover:underline">
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
            {onBackToTrack && (
              <div className="mt-2 flex justify-start">
                <button
                  type="button"
                  onClick={onBackToTrack}
                  className="group inline-flex items-center gap-2 rounded-lg border border-outline-variant px-5 py-2 label-md text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  {t('backToTrack', { defaultValue: 'Back to Track' })}
                </button>
              </div>
            )}
          </main>
          <StatusAside track={track} activeLesson={activeLesson} exercise={exercise} submission={submission} />
        </div>
      ) : isRejected ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <main className="flex min-w-0 flex-col gap-6">
            <section className="rounded-lg border border-error bg-surface p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3 border-b border-outline-variant pb-4">
                <div>
                  <h2 className="headline-sm text-on-surface">{t('mentorFeedback')}</h2>
                  <p className="body-sm mt-1 text-on-surface-variant">{t('submissionRejectedDescription')}</p>
                </div>
                <span className="rounded-md bg-error-container px-2.5 py-1 label-sm text-on-error-container">{t('statusRejected')}</span>
              </div>
              <p className="body-md mt-4 break-words text-on-surface">
                {submission.reviewNote ?? t('submissionRejectedFallback')}
              </p>
              {submission.prUrl && (
                <div className="mt-5 rounded-lg border border-outline-variant bg-surface-container-low p-3 label-sm text-on-surface-variant">
                  {t('previousSubmission')}{' '}
                  <a href={submission.prUrl} target="_blank" rel="noreferrer" className="break-all text-primary hover:underline">
                    {submission.prUrl}
                  </a>
                </div>
              )}
            </section>
            {onBackToTrack && (
              <div className="mt-2 flex justify-start">
                <button
                  type="button"
                  onClick={onBackToTrack}
                  className="group inline-flex items-center gap-2 rounded-lg border border-outline-variant px-5 py-2 label-md text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  {t('backToTrack', { defaultValue: 'Back to Track' })}
                </button>
              </div>
            )}
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
                {t('status')}: {t(getStatusLabel(submission.status))}
              </span>
              <h2 className="headline-sm mt-4 text-on-surface">{startCardTitle}</h2>
              <p className="body-sm mt-2 text-on-surface-variant">{startCardCopy}</p>
              {startError && (
                <p className="mt-4 flex items-start gap-1.5 rounded-lg border border-error-container bg-error-container/30 p-3 text-left label-sm text-on-error-container">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="min-w-0 break-words">{startError}</span>
                </p>
              )}
              <Button
                type="button"
                size="lg"
                onClick={onStartExercise}
                disabled={!isNotStarted}
                className="mt-5 h-auto w-full gap-2 px-4 py-2.5"
              >
                <Play className="h-4 w-4 fill-current" />
                {isInProgress ? t('exerciseStarted') : t('startExercise')}
              </Button>
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

      {!(exercise.type === 'QUIZ' || exercise.type === 'FILL_IN_BLANK') || historyItems.length > 0 ? (
        <ReviewHistorySection
          items={historyItems}
          loading={historyLoading}
          error={historyError}
          onRetry={onRetryHistory}
        />
      ) : null}
    </div>
  );
}
