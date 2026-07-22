import { describe, it, expect, beforeEach } from 'vitest';
import { useLessonExercisesStore } from './lessonExercisesStore';

describe('useLessonExercisesStore', () => {
  beforeEach(() => {
    useLessonExercisesStore.setState({
      exercises: {},
    });
  });

  it('registers and unregisters single exercise without duplicate mutations', () => {
    const store = useLessonExercisesStore.getState();

    store.registerExercise('ex-1', {
      exerciseId: 'ex-1',
      title: 'Quiz 1',
      type: 'QUIZ',
    } as any);

    expect(useLessonExercisesStore.getState().exercises['ex-1'].title).toBe('Quiz 1');

    store.unregisterExercise('ex-1');
    expect(useLessonExercisesStore.getState().exercises['ex-1']).toBeUndefined();
  });
});
