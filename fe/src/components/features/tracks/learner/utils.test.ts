import { describe, expect, it } from 'vitest';
import type { AutoGradeResultDto } from '@/services/api-client';
import {
  buildAutoAnswerPayload,
  normalizeAutoGradeResult,
  normalizeExerciseDetail,
  type ExerciseDetailContract,
} from './utils';

const quizDetail = (
  overrides: Partial<Pick<ExerciseDetailContract, 'isReadOnly' | 'questionsData'>> = {},
): ExerciseDetailContract => ({
  id: 'quiz-1',
  title: 'Quiz title',
  trackId: 'track-1',
  track: 'Track',
  tag: 'quiz',
  difficulty: 'Beginner',
  estimatedTime: '5m',
  xp: 10,
  brief: 'Quiz brief',
  overview: '',
  hint: null,
  type: 'QUIZ',
  targetScore: 100,
  ...overrides,
  isMandatory: true,
  questionsData: overrides.questionsData ?? [],
});

describe('learner quiz normalizers', () => {
  it('omits correct answers from exercise detail', () => {
    const exercise = normalizeExerciseDetail(quizDetail({
      questionsData: [{ id: 'q-1', prompt: 'Choose one', options: ['A', 'B'], correctAnswer: 'B' }],
    }));

    expect(exercise?.questionsData).toEqual([{ id: 'q-1', prompt: 'Choose one', options: ['A', 'B'] }]);
    expect(exercise?.questionsData[0]).not.toHaveProperty('correctAnswer');
  });

  it('maps auto-grade results into learner-owned fields', () => {
    expect(normalizeAutoGradeResult({
      score: 80,
      correctCount: 4,
      totalQuestions: 5,
      targetScore: 70,
      passed: true,
      completed: true,
      results: [{ questionId: 'q-1', correct: true }],
    } as AutoGradeResultDto)).toEqual({
      score: 80,
      correctCount: 4,
      totalQuestions: 5,
      targetScore: 70,
      passed: true,
      completed: true,
      results: [{ questionId: 'q-1', correct: true, explanation: null }],
    });
  });

  it('normalizes unusable question data to an empty quiz', () => {
    const exercise = normalizeExerciseDetail(quizDetail({
      questionsData: [{ id: 'q-1', prompt: 'Choose one', options: [], correctAnswer: 'A' }],
    }));

    expect(exercise?.questionsData).toEqual([]);
  });

  it('preserves read-only detail state and excludes blank answers from the payload', () => {
    const exercise = normalizeExerciseDetail(quizDetail({
      isReadOnly: true,
      questionsData: [],
    }));

    expect(exercise?.isReadOnly).toBe(true);
    expect(buildAutoAnswerPayload({ ' q-1 ': ' A ', '': 'B', 'q-2': ' ' })).toEqual([
      { questionId: 'q-1', answer: 'A' },
    ]);
  });
});
