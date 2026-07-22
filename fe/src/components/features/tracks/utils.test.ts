import { describe, it, expect } from 'vitest';
import { isTrackDirectExercise } from './utils';
import type { ExerciseSummaryDto } from '@/services/api-client';

describe('isTrackDirectExercise', () => {
  it('returns false for null/undefined exercise', () => {
    expect(isTrackDirectExercise(null)).toBe(false);
    expect(isTrackDirectExercise(undefined)).toBe(false);
  });

  it('returns true when lessonId is null or undefined', () => {
    const ex1 = { id: 'ex-1', title: 'Track Ex 1', lessonId: null } as unknown as ExerciseSummaryDto;
    const ex2 = { id: 'ex-2', title: 'Track Ex 2' } as unknown as ExerciseSummaryDto;
    expect(isTrackDirectExercise(ex1)).toBe(true);
    expect(isTrackDirectExercise(ex2)).toBe(true);
  });

  it('returns true when lessonId is an empty object', () => {
    const ex = { id: 'ex-3', title: 'Track Ex 3', lessonId: {} } as unknown as ExerciseSummaryDto;
    expect(isTrackDirectExercise(ex)).toBe(true);
  });

  it('returns false when lessonId is a string or populated object with properties', () => {
    const exString = { id: 'ex-4', title: 'Lesson Ex', lessonId: 'lesson-abc' } as unknown as ExerciseSummaryDto;
    const exObject = { id: 'ex-5', title: 'Lesson Ex 2', lessonId: { _id: 'lesson-xyz' } } as unknown as ExerciseSummaryDto;
    expect(isTrackDirectExercise(exString)).toBe(false);
    expect(isTrackDirectExercise(exObject)).toBe(false);
  });
});
