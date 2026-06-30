'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Skeleton from '@/components/ui/loading/Skeleton';
import { fetchMyExercises } from './courseLearningApi';
import { MyExercisesView, type ExerciseFeedTab } from './MyExercisesView';
import type { LearnerExerciseFeedItem } from './types';
import { getErrorMessage } from './utils';

function MyExercisesLoadingState() {
  return (
    <div className="mx-auto flex max-w-container-max flex-col gap-8 px-gutter py-8">
      <div>
        <Skeleton width={220} height={40} rounded="rounded" />
        <Skeleton width="42%" height={20} rounded="rounded" className="mt-3" />
      </div>
      <Skeleton height={46} rounded="rounded" />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} height={300} rounded="rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function MyExercisesErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section className="mx-auto max-w-container-max px-gutter py-8">
      <div className="rounded-lg border border-error-container bg-error-container/40 p-6 text-error">
        <h1 className="headline-sm">Exercises could not be loaded</h1>
        <p className="body-sm mt-2">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 label-sm text-on-primary hover:opacity-90 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          Retry
        </button>
      </div>
    </section>
  );
}

export default function MyExercisesContainer() {
  const router = useRouter();
  const [exercises, setExercises] = useState<LearnerExerciseFeedItem[]>([]);
  const [activeTab, setActiveTab] = useState<ExerciseFeedTab>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadExercises = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyExercises();
      setExercises(data.exercises);
    } catch (loadError: unknown) {
      setError(getErrorMessage(loadError, 'Failed to load your exercises.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  function handleOpenExercise(exercise: LearnerExerciseFeedItem) {
    window.sessionStorage.setItem(
      'learnerExerciseReturnTo',
      JSON.stringify({ exerciseId: exercise.id, returnTo: '/exercises' })
    );

    if (exercise.trackId && exercise.lessonId) {
      router.push(`/tracks/${exercise.trackId}/lessons/${exercise.lessonId}/exercises/${exercise.id}`);
      return;
    }

    router.push(`/exercises/${exercise.id}`);
  }

  if (loading) return <MyExercisesLoadingState />;
  if (error) return <MyExercisesErrorState message={error} onRetry={loadExercises} />;

  return (
    <MyExercisesView
      exercises={exercises}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onOpenExercise={handleOpenExercise}
      onOpenPr={(url) => window.open(url, '_blank', 'noopener,noreferrer')}
    />
  );
}
