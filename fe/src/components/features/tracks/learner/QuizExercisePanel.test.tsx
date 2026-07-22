import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { LearnerAutoGradeResult, LearnerExerciseDetail } from './types';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/components/ui/default/button', () => ({
  Button: ({
    children,
    disabled,
    type,
    className,
  }: {
    children?: ReactNode;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
  }) => (
    <button disabled={disabled} type={type} className={className}>
      {children}
    </button>
  ),
}));

vi.mock('@/lib/md-renderer', () => ({
  MarkdownRenderer: ({ content }: { content: string }) => content,
}));

import { QuizExercisePanel } from './QuizExercisePanel';

const exercise = {
  id: 'quiz-1',
  lessonId: null,
  trackId: 'track-1',
  trackTitle: 'Track',
  title: 'Quiz title',
  brief: 'Quiz brief',
  difficulty: 'Beginner',
  estimatedTime: '5m',
  xp: 10,
  status: 'pending',
  isMandatory: true,
  isReadOnly: false,
  tag: 'quiz',
  prUrl: null,
  type: 'QUIZ',
  overview: '',
  objectives: [],
  steps: [],
  resources: [],
  hint: null,
  questionsData: [
    {
      id: 'q-1',
      prompt: 'Choose one',
      options: ['A', 'B'],
      correctAnswer: 'ANSWER_KEY_SECRET',
      explanation: 'Detail explanation must not render.',
    },
  ],
} satisfies Omit<LearnerExerciseDetail, 'questionsData'> & {
  questionsData: Array<LearnerExerciseDetail['questionsData'][number] & {
    correctAnswer: string;
    explanation: string;
  }>;
};

function renderPanel(gradeResult: LearnerAutoGradeResult | null) {
  return renderToStaticMarkup(
    createElement(QuizExercisePanel, {
      exercise,
      answers: { 'q-1': 'A' },
      gradeResult,
      submitting: false,
      error: null,
      onAnswerChange: () => {},
      onSubmit: () => {},
      onRetry: () => {},
    }),
  );
}

function renderQuiz(
  quiz: LearnerExerciseDetail,
  answers: Record<string, string>,
  gradeResult: LearnerAutoGradeResult | null = null,
) {
  return renderToStaticMarkup(
    createElement(QuizExercisePanel, {
      exercise: quiz,
      answers,
      gradeResult,
      submitting: false,
      error: null,
      onAnswerChange: () => {},
      onSubmit: () => {},
      onRetry: () => {},
    }),
  );
}

describe('QuizExercisePanel', () => {
  it('keeps answer-key data hidden before submission', () => {
    const markup = renderPanel(null);

    expect(markup).not.toContain('ANSWER_KEY_SECRET');
    expect(markup).not.toContain('Detail explanation must not render.');
  });

  it('renders explanation from the auto-grade result after submission', () => {
    const markup = renderPanel({
      score: 0,
      correctCount: 0,
      totalQuestions: 1,
      targetScore: 100,
      passed: false,
      completed: false,
      results: [{ questionId: 'q-1', correct: false, explanation: 'Grade explanation.' }],
    });

    expect(markup).toContain('Grade explanation.');
    expect(markup).not.toContain('Detail explanation must not render.');
  });

  it('renders every question and disables submit until each has an answer', () => {
    const multiQuestionQuiz = {
      ...exercise,
      questionsData: [
        { id: 'q-1', prompt: 'Choose one', options: ['A', 'B'] },
        { id: 'q-2', prompt: 'Choose two', options: ['C', 'D'] },
      ],
    };

    const incompleteMarkup = renderQuiz(multiQuestionQuiz, { 'q-1': 'A' });
    expect(incompleteMarkup).toContain('Choose one');
    expect(incompleteMarkup).toContain('Choose two');
    expect(incompleteMarkup).toMatch(/<button[^>]*disabled/);

    expect(renderQuiz(multiQuestionQuiz, { 'q-1': 'A', 'q-2': 'C' })).not.toMatch(
      /<button[^>]*disabled/,
    );
  });

  it('shows an unavailable state instead of a submit control for an empty quiz', () => {
    const markup = renderQuiz({ ...exercise, questionsData: [] }, {});

    expect(markup).toContain('noQuestionsAvailable');
    expect(markup).not.toContain('<button');
  });
});
