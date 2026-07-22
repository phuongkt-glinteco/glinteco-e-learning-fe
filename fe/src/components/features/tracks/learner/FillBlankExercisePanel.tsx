'use client';

import React, { useState } from 'react';
import { Code2, Play, RefreshCw, CheckCircle2, XCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/default/button';
import { useTranslations } from 'next-intl';
import { parseFillInBlankTokens, validateFillInBlankAnswers } from '@/components/puck-editor/fields/fillInBlankUtils';
import type { AutoGradeResultDto } from '@/services/api-client';
import type { LearnerExerciseDetail } from './types';

export interface FillBlankExercisePanelProps {
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

export function FillBlankExercisePanel({
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
}: FillBlankExercisePanelProps) {
  const t = useTranslations('FillBlankExercisePanel');
  const questions = exercise.questionsData || [];
  const isGraded = Boolean(gradeResult);
  const isPassed = gradeResult?.passed ?? false;

  const gradeMap = new Map(
    gradeResult?.results?.map((r) => [r.questionId, r.correct]) || []
  );

  const [localError, setLocalError] = useState<string | null>(null);

  const qPrompt = exercise.questionsData?.[0]?.prompt;
  const hasTokens = (str?: string) => Boolean(str && (str.includes('[') || str.includes('{{')));
  const codeTemplate = hasTokens(qPrompt)
    ? (qPrompt as string)
    : hasTokens(exercise.overview)
      ? (exercise.overview as string)
      : hasTokens(exercise.brief)
        ? (exercise.brief as string)
        : qPrompt || exercise.overview || exercise.brief || '';

  const renderedInlineIds = new Set<string>();

  function renderInlineSnippet(template: string) {
    const { parts } = parseFillInBlankTokens(template);

    return parts.map((part, index) => {
      const match = part.match(/^\[(\d+)_(\d+)\]$/);
      if (!match) {
        return <span key={index}>{part}</span>;
      }

      const rawKey = match[1].trim();
      const targetLength = match[2] ? Number(match[2]) : undefined;
      const question =
        questions.find((q) => q.id === rawKey) ||
        questions[Number(rawKey)] || { id: rawKey };
      const qId = question.id;
      renderedInlineIds.add(qId);
      const value = answers[qId] || '';
      const isCorrect = isGraded && gradeMap.get(qId) === true;
      const isWrong = isGraded && gradeMap.get(qId) === false;

      let inputClass = 'border-border focus:border-primary focus:ring-1 focus:ring-primary';
      if (isCorrect) {
        inputClass = 'border-green-500 bg-green-500/20 font-semibold text-green-700 dark:text-green-300';
      } else if (isWrong) {
        inputClass = 'border-red-500 bg-red-500/20 font-semibold text-red-700 dark:text-red-300';
      }

      return (
        <input
          key={`${qId}-${index}`}
          type="text"
          disabled={isGraded || submitting}
          maxLength={targetLength}
          value={value}
          onChange={(e) => {
            if (localError) setLocalError(null);
            onAnswerChange(qId, e.target.value);
          }}
          placeholder="___"
          style={{ width: targetLength ? `${Math.max(4, targetLength + 2)}ch` : `${Math.max(4, value.length + 1)}ch` }}
          className={`mx-1 inline-block rounded border bg-surface-container-low dark:bg-surface-container px-2 py-0.5 text-[13px] text-center font-mono text-foreground transition-all focus:outline-none ${inputClass}`}
        />
      );
    });
  }

  const renderedSnippet = renderInlineSnippet(codeTemplate);
  const unrenderedQuestions = questions.filter((q) => !renderedInlineIds.has(q.id));

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-primary" />
            <h2 className="headline-sm text-foreground">{t('title')}</h2>
          </div>
          <span className="label-sm rounded-full bg-surface-container px-2.5 py-0.5 text-muted-foreground">
            {exercise.difficulty}
          </span>
        </div>

        <p className="body-md mb-4 text-muted-foreground">
          {(exercise.questionsData?.[0] as any)?.title || exercise.brief || t('defaultBrief')}
        </p>

        {codeTemplate && (
          <div className="body-sm mb-6 overflow-x-auto rounded-lg border border-border bg-surface-container-lowest p-5 font-mono leading-relaxed text-foreground">
            <pre className="whitespace-pre-wrap">{renderedSnippet}</pre>
          </div>
        )}

        {unrenderedQuestions.length > 0 && (
          <div className="mb-6 flex flex-col gap-4">
            {unrenderedQuestions.map((q, idx) => {
              const value = answers[q.id] || '';
              const isCorrect = isGraded && gradeMap.get(q.id) === true;
              const isWrong = isGraded && gradeMap.get(q.id) === false;

              let borderClass = 'border-border focus:border-primary';
              if (isCorrect) borderClass = 'border-green-500 bg-green-500/10 text-green-800 dark:text-green-200';
              if (isWrong) borderClass = 'border-red-500 bg-red-500/10 text-red-800 dark:text-red-200';

              return (
                <div key={q.id} className="flex flex-col gap-1.5 rounded-lg border border-border bg-surface-container-low p-4">
                  <label htmlFor={`blank-input-${q.id}`} className="label-md text-foreground">
                    {q.prompt || t('blankLabel', { index: idx + 1, defaultValue: `Blank #${idx + 1}` })}
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      id={`blank-input-${q.id}`}
                      type="text"
                      disabled={isGraded || submitting}
                      value={value}
                      onChange={(e) => {
                        if (localError) setLocalError(null);
                        onAnswerChange(q.id, e.target.value);
                      }}
                      placeholder="___"
                      className={`body-md w-full rounded-md border bg-surface px-3 py-2 font-mono transition-colors focus:outline-none focus:ring-1 focus:ring-primary ${borderClass}`}
                    />
                    {isCorrect && <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />}
                    {isWrong && <XCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {isGraded && (
          <div
            className={`mt-6 flex items-start gap-3 rounded-lg border p-4 ${
              isPassed
                ? 'border-green-500/30 bg-green-500/10 text-green-950 dark:text-green-100'
                : 'border-red-500/30 bg-red-500/10 text-red-950 dark:text-red-100'
            }`}
          >
            {isPassed ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
            )}
            <div className="min-w-0 flex-1">
              <h4 className="label-md font-semibold">
                {isPassed ? t('verifiedSuccessTitle') : t('verifiedFailedTitle')}
              </h4>
              <p className="body-sm mt-0.5 text-muted-foreground">
                {isPassed
                  ? t('verifiedSuccessDesc', { count: questions.length })
                  : t('verifiedFailedDesc')}
              </p>
            </div>
          </div>
        )}

        {(error || localError) && (
          <div className="label-sm mt-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-red-600 dark:text-red-400">
            <XCircle className="h-4 w-4 shrink-0" />
            <span>{localError || error}</span>
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
          {!isGraded ? (
            <Button
              type="button"
              size="lg"
              disabled={submitting}
              onClick={() => {
                const { tokens } = parseFillInBlankTokens(codeTemplate);
                const rawIds = tokens.map((tk) => tk.id);
                const validation = validateFillInBlankAnswers(questions, answers, rawIds);
                if (!validation.isValid) {
                  setLocalError(t('fillAllBlanksError') || 'Vui lòng điền đầy đủ tất cả các ô trống trước khi kiểm tra đáp án.');
                  return;
                }
                setLocalError(null);
                onSubmit();
              }}
              className="gap-2 cursor-pointer"
            >
              <Play className="h-4 w-4 fill-current" />
              {submitting ? t('checkingCode') : t('checkCode')}
            </Button>
          ) : isPassed ? (
            <Button
              type="button"
              size="lg"
              onClick={onContinue}
              className="gap-2 bg-green-600 text-white hover:bg-green-700 cursor-pointer"
            >
              {t('continueToNext')} <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={() => {
                if (localError) setLocalError(null);
                onRetry();
              }}
              className="gap-2 border-border hover:bg-surface-container cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" /> {t('tryAgain')}
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
