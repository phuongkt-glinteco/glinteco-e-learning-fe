'use client';

import { useState } from 'react';
import { Lightbulb, CheckCircle2, XCircle, ArrowRight, RefreshCw, HelpCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/default/button';
import { MarkdownRenderer } from '@/lib/md-renderer';
import { useTranslations } from 'next-intl';
import type { AutoGradeResultDto } from '@/services/api-client';
import type { LearnerExerciseDetail } from './types';

export interface QuizExercisePanelProps {
  exercise: LearnerExerciseDetail;
  answers: Record<string, string>;
  gradeResult: AutoGradeResultDto | null;
  submitting: boolean;
  error: string | null;
  onAnswerChange: (questionId: string, answer: string) => void;
  onSubmit: () => void;
  onRetry: () => void;
  onBack?: () => void;
  onContinue?: () => void;
}

export function QuizExercisePanel({
  exercise,
  answers,
  gradeResult,
  submitting,
  error,
  onAnswerChange,
  onSubmit,
  onRetry,
  onBack,
  onContinue,
}: QuizExercisePanelProps) {
  const t = useTranslations('QuizExercisePanel');
  const [showHint, setShowHint] = useState(false);

  const question = exercise.questionsData?.[0];
  const questionId = question?.id || 'q1';
  const selectedOption = answers[questionId] || '';

  const questionGrade = gradeResult?.results?.find((r) => r.questionId === questionId);
  const isGraded = Boolean(gradeResult);
  const isPassed = gradeResult?.passed ?? false;

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            {exercise.isMandatory && (
              <span className="label-sm rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary">
                {t('mandatory')}
              </span>
            )}
            <span className="label-sm rounded-full bg-surface-container px-2.5 py-0.5 text-muted-foreground">
              {exercise.difficulty}
            </span>
          </div>
          {exercise.hint && (
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className={`label-sm inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors ${
                showHint
                  ? 'border border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  : 'bg-surface-container text-muted-foreground hover:bg-surface-container-low'
              }`}
            >
              <Lightbulb className="h-4 w-4" />
              {showHint ? t('hideHint') : t('hint')}
            </button>
          )}
        </div>

        {showHint && exercise.hint && (
          <div className="mb-5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-200">
            <div className="body-sm flex items-start gap-2.5">
              <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <div className="min-w-0 flex-1">
                <MarkdownRenderer content={exercise.hint} />
              </div>
            </div>
          </div>
        )}

        <div className="headline-sm mb-4 text-foreground">
          {question?.prompt || exercise.title}
        </div>

        {exercise.overview && (
          <div className="body-sm mb-6 overflow-x-auto rounded-lg border border-border bg-surface-container-low p-4 font-mono text-foreground">
            <MarkdownRenderer content={exercise.overview} />
          </div>
        )}

        <div className="flex flex-col gap-3">
          {(question?.options || []).map((optionText, idx) => {
            const isSelected = selectedOption === optionText;
            const isCorrectOption = isGraded && isSelected && questionGrade?.correct;
            const isWrongOption = isGraded && isSelected && !questionGrade?.correct;

            let optionStyle = 'border-border bg-surface hover:border-primary/40 hover:bg-surface-container-low';
            if (isCorrectOption) {
              optionStyle = 'border-green-500 bg-green-500/10 font-medium text-green-900 dark:text-green-200';
            } else if (isWrongOption) {
              optionStyle = 'border-red-500 bg-red-500/10 text-red-900 dark:text-red-200';
            } else if (isSelected && !isGraded) {
              optionStyle = 'border-primary bg-primary/10 font-medium text-primary ring-1 ring-primary';
            } else if (isGraded) {
              optionStyle = 'pointer-events-none border-border bg-surface opacity-50';
            }

            return (
              <button
                key={optionText}
                type="button"
                disabled={isGraded || submitting}
                onClick={() => onAnswerChange(questionId, optionText)}
                className={`group flex cursor-pointer items-center justify-between rounded-lg border p-4 text-left transition-all ${optionStyle}`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="label-sm flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-surface-container text-muted-foreground group-hover:border-primary/40">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="body-md min-w-0 break-words text-foreground">{optionText}</span>
                </div>

                {isCorrectOption && (
                  <span className="label-sm inline-flex shrink-0 items-center gap-1.5 font-semibold text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-5 w-5" /> {t('correct')}
                  </span>
                )}
                {isWrongOption && (
                  <span className="label-sm inline-flex shrink-0 items-center gap-1.5 font-semibold text-red-600 dark:text-red-400">
                    <XCircle className="h-5 w-5" /> {t('incorrect')}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {isGraded && (
          <div
            className={`mt-6 rounded-lg border p-5 ${
              isPassed
                ? 'border-green-500/30 bg-green-500/10 text-green-950 dark:text-green-100'
                : 'border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-100'
            }`}
          >
            <div className="flex items-start gap-3">
              <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <h4 className="label-md mb-1 font-semibold">
                  {isPassed ? t('whyCorrectTitle') : t('gradingFeedbackTitle')}
                </h4>
                <div className="body-sm text-muted-foreground">
                  {((question as unknown as { hint?: string; explanation?: string })?.hint ||
                  (question as unknown as { hint?: string; explanation?: string })?.explanation) ? (
                    <MarkdownRenderer
                      content={
                        (question as unknown as { hint?: string; explanation?: string }).hint ||
                        (question as unknown as { hint?: string; explanation?: string }).explanation ||
                        ''
                      }
                    />
                  ) : isPassed ? (
                    t('defaultPassedExplanation')
                  ) : (
                    t('defaultFailedExplanation')
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="label-sm mt-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-red-600 dark:text-red-400">
            <XCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
          {!isGraded ? (
            <Button
              type="button"
              size="lg"
              disabled={!selectedOption || submitting}
              onClick={onSubmit}
              className="gap-2"
            >
              <Check className="h-4 w-4" />
              {submitting ? t('checking') : t('checkAnswer')}
            </Button>
          ) : isPassed ? (
            <Button
              type="button"
              size="lg"
              onClick={onContinue}
              className="gap-2 bg-green-600 text-white hover:bg-green-700"
            >
              {t('continueToNext')} <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={onRetry}
              className="gap-2 border-border hover:bg-surface-container"
            >
              <RefreshCw className="h-4 w-4" /> {t('tryAgain')}
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
