import { create } from 'zustand';
import type { ExerciseData } from '../components/puck-editor/fields/ExerciseSelectorField';

interface LessonExercisesState {
  exercises: Record<string, ExerciseData>;
  registerExercise: (id: string, data: ExerciseData) => void;
  unregisterExercise: (id: string) => void;
}

export const useLessonExercisesStore = create<LessonExercisesState>((set) => ({
  exercises: {},
  registerExercise: (id, data) => set((state) => ({
    exercises: { ...state.exercises, [id]: data }
  })),
  unregisterExercise: (id) => set((state) => {
    const newExercises = { ...state.exercises };
    delete newExercises[id];
    return { exercises: newExercises };
  }),
}));
