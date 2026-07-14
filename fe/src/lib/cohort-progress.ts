import { CohortUserProgressItemDto } from '@/services/api-client';

export function getLearnerProgressMetrics(learner: CohortUserProgressItemDto, trackIdFilter: string = 'all') {
  let totalLessonsCount = 0;
  let completedLessonsCount = 0;

  const tracks = trackIdFilter === 'all' 
    ? learner.tracks 
    : learner.tracks?.filter(tr => tr.trackId === trackIdFilter);

  if (tracks && tracks.length > 0) {
    totalLessonsCount = tracks.reduce((sum, tr) => sum + (tr.totalLessons || 0), 0);
    completedLessonsCount = tracks.reduce((sum, tr) => sum + (tr.completedLessons || 0), 0);
  }

  const overallProgressPct = totalLessonsCount > 0 ? (completedLessonsCount / totalLessonsCount) * 100 : 0;

  return {
    totalLessonsCount,
    completedLessonsCount,
    overallProgressPct
  };
}

export function getCohortSummaryMetrics(learners: CohortUserProgressItemDto[]) {
  if (learners.length === 0) {
    return { avgProgressPct: 0 };
  }

  const totalProgress = learners.reduce((acc, u) => {
    const { overallProgressPct } = getLearnerProgressMetrics(u);
    return acc + overallProgressPct;
  }, 0);
  
  const avgProgressPct = totalProgress / learners.length;

  return { avgProgressPct };
}
