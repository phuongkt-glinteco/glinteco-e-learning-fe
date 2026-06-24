import type { LearnerLesson, LearnerTrack } from './types';

export type MockLearnerTrack = LearnerTrack & {
  lessons: LearnerLesson[];
};

export const mockLearnerTracks: MockLearnerTrack[] = [
  {
    id: 'engineering-foundations',
    title: 'Engineering Foundations',
    description: 'Core workflow, codebase navigation, and delivery expectations for new engineers.',
    estimatedTime: '2h',
    lessonCount: 3,
    lessonsCompleted: 1,
    order: 1,
    status: 'in_progress',
    icon: 'lucide:map',
    lessons: [
      {
        id: 'repo-orientation',
        title: 'Repository Orientation',
        body: [
          'Start by mapping the main app folders and the feature boundaries used in this codebase.',
          'Pay attention to route files, feature containers, presentational components, shared UI, and service clients.',
          'By the end of this lesson, you should know where a learner-facing feature starts and where API data is normalized before it reaches the UI.',
        ].join('\n\n'),
        bodySource: 'mock',
        estimatedTime: '30m',
        order: 1,
        completed: true,
        xp: 40,
      },
      {
        id: 'app-router-flow',
        title: 'App Router Flow',
        body: [
          'A production page in this project should stay thin and delegate data/state work to a container.',
          'The container owns loading, empty, error, and action states. The view receives props and renders predictable UI.',
          'Use this pattern when implementing learner tracks, lesson detail, and completion actions.',
        ].join('\n\n'),
        bodySource: 'mock',
        estimatedTime: '35m',
        order: 2,
        completed: false,
        xp: 40,
      },
      {
        id: 'delivery-checklist',
        title: 'Delivery Checklist',
        body: [
          'Before handing off a learner UI task, check route placement, TypeScript types, responsive layout, and state handling.',
          'Run targeted lint/type checks for the touched feature, then note any wider repo failures that are outside the task scope.',
        ].join('\n\n'),
        bodySource: 'mock',
        estimatedTime: '25m',
        order: 3,
        completed: false,
        xp: 40,
      },
    ],
  },
  {
    id: 'service-layer-basics',
    title: 'Service Layer Basics',
    description: 'Understand typed API clients, error handling, and how data is shaped for feature UI.',
    estimatedTime: '1.5h',
    lessonCount: 2,
    lessonsCompleted: 0,
    order: 2,
    status: 'locked',
    icon: 'lucide:lock',
    lessons: [
      {
        id: 'typed-api-client',
        title: 'Typed API Client',
        body: 'Use generated service types when the API contract exists, and keep UI-specific mapping in feature utilities.',
        bodySource: 'mock',
        estimatedTime: '45m',
        order: 1,
        completed: false,
        xp: 40,
      },
      {
        id: 'error-state-design',
        title: 'Error State Design',
        body: 'A learner-facing error state should be explicit, recoverable, and scoped to the failing feature.',
        bodySource: 'mock',
        estimatedTime: '45m',
        order: 2,
        completed: false,
        xp: 40,
      },
    ],
  },
  {
    id: 'first-feature-ship',
    title: 'First Feature Ship',
    description: 'Move from implementation to review with focused changes and a clean manual test path.',
    estimatedTime: '2h',
    lessonCount: 2,
    lessonsCompleted: 0,
    order: 3,
    status: 'locked',
    icon: 'lucide:award',
    lessons: [
      {
        id: 'prepare-review',
        title: 'Prepare for Review',
        body: 'Summarize what changed, why each file exists, and how reviewers can verify the behavior.',
        bodySource: 'mock',
        estimatedTime: '45m',
        order: 1,
        completed: false,
        xp: 40,
      },
      {
        id: 'manual-test-pass',
        title: 'Manual Test Pass',
        body: 'Walk through the learner route, completion action, and responsive layout before marking the task ready.',
        bodySource: 'mock',
        estimatedTime: '45m',
        order: 2,
        completed: false,
        xp: 40,
      },
    ],
  },
];

export function getMockTrackById(trackId: string) {
  return mockLearnerTracks.find((track) => track.id === trackId) ?? null;
}
