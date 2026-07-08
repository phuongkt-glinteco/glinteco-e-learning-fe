export interface CohortUserLessonProgressDto {
  id: string;
  title: string;
  order: number;
  type: 'video' | 'reading' | 'quiz' | 'coding' | 'assignment';
  status: 'completed' | 'in_progress' | 'locked';
  completedAt?: string;
}

export interface CohortUserTrackProgressDto {
  trackId: string;
  title: string;
  progressPct: number;
  completedLessons: number;
  totalLessons: number;
  status: 'not_started' | 'in_progress' | 'completed';
  lessons: CohortUserLessonProgressDto[];
}

export interface CohortUserProgressItemDto {
  userId: string;
  name: string;
  email: string;
  avatarHue: number;
  role?: string;
  title?: string;
  level: number;
  xp: number;
  streakDays: number;
  overallProgressPct: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
  paceStatus: 'ahead' | 'on_track' | 'behind';
  paceDeltaDays: number;
  tracks: CohortUserTrackProgressDto[];
}

export interface CohortUsersProgressResponseDto {
  cohortId: string;
  totalUsers: number;
  data: CohortUserProgressItemDto[];
}

const MOCK_LEARNERS_PROGRESS: CohortUserProgressItemDto[] = [
  {
    userId: 'usr_01',
    name: 'Nguyễn Văn Lâm',
    email: 'lam.nguyen@glinteco.com',
    avatarHue: 210,
    role: 'Learner',
    title: 'Frontend Specialist',
    level: 7,
    xp: 4850,
    streakDays: 14,
    overallProgressPct: 68,
    completedLessonsCount: 13,
    totalLessonsCount: 19,
    paceStatus: 'ahead',
    paceDeltaDays: 4,
    tracks: [
      {
        trackId: 'tr_fund',
        title: 'Web Fundamentals & Git Workflow',
        progressPct: 100,
        completedLessons: 6,
        totalLessons: 6,
        status: 'completed',
        lessons: [
          { id: 'ls_101', title: 'HTML5 Semantic Architecture', order: 1, type: 'reading', status: 'completed', completedAt: '2026-06-20T10:00:00Z' },
          { id: 'ls_102', title: 'Modern CSS Grid & Flexbox Systems', order: 2, type: 'coding', status: 'completed', completedAt: '2026-06-21T14:30:00Z' },
          { id: 'ls_103', title: 'Git & Enterprise Branching Strategy', order: 3, type: 'video', status: 'completed', completedAt: '2026-06-22T09:15:00Z' },
          { id: 'ls_104', title: 'ES6+ Core & Functional Patterns', order: 4, type: 'coding', status: 'completed', completedAt: '2026-06-23T11:00:00Z' },
          { id: 'ls_105', title: 'Asynchronous JavaScript & Event Loop', order: 5, type: 'video', status: 'completed', completedAt: '2026-06-24T16:20:00Z' },
          { id: 'ls_106', title: 'Capstone: Fundamentals Assessment', order: 6, type: 'assignment', status: 'completed', completedAt: '2026-06-25T17:00:00Z' },
        ],
      },
      {
        trackId: 'tr_react',
        title: 'React 19 & TypeScript Advanced Architecture',
        progressPct: 75,
        completedLessons: 6,
        totalLessons: 8,
        status: 'in_progress',
        lessons: [
          { id: 'ls_201', title: 'TypeScript Strict Mode & Generics', order: 1, type: 'coding', status: 'completed', completedAt: '2026-06-28T10:00:00Z' },
          { id: 'ls_202', title: 'React 19 Hooks & Concurrency', order: 2, type: 'video', status: 'completed', completedAt: '2026-06-30T11:30:00Z' },
          { id: 'ls_203', title: 'Custom Hooks & Performance Optimization', order: 3, type: 'coding', status: 'completed', completedAt: '2026-07-02T14:00:00Z' },
          { id: 'ls_204', title: 'State Management with Zustand', order: 4, type: 'coding', status: 'completed', completedAt: '2026-07-04T15:00:00Z' },
          { id: 'ls_205', title: 'Next.js 15 App Router Deep Dive', order: 5, type: 'video', status: 'completed', completedAt: '2026-07-06T09:00:00Z' },
          { id: 'ls_206', title: 'Server Actions & Mutations', order: 6, type: 'coding', status: 'completed', completedAt: '2026-07-07T16:00:00Z' },
          { id: 'ls_207', title: 'Design Systems with Shadcn UI & Tailwind', order: 7, type: 'coding', status: 'in_progress' },
          { id: 'ls_208', title: 'Enterprise E2E Testing with Playwright', order: 8, type: 'assignment', status: 'locked' },
        ],
      },
      {
        trackId: 'tr_backend',
        title: 'REST API Integration & GraphQL Ecosystem',
        progressPct: 20,
        completedLessons: 1,
        totalLessons: 5,
        status: 'in_progress',
        lessons: [
          { id: 'ls_301', title: 'HTTP/2 & RESTful Best Practices', order: 1, type: 'reading', status: 'completed', completedAt: '2026-07-01T10:00:00Z' },
          { id: 'ls_302', title: 'OAuth2 & Bearer Token Interceptors', order: 2, type: 'coding', status: 'in_progress' },
          { id: 'ls_303', title: 'GraphQL Schema & Apollo Integration', order: 3, type: 'video', status: 'locked' },
          { id: 'ls_304', title: 'Realtime WebSockets & SSE Architecture', order: 4, type: 'coding', status: 'locked' },
          { id: 'ls_305', title: 'Final Integration Capstone', order: 5, type: 'assignment', status: 'locked' },
        ],
      },
    ],
  },
  {
    userId: 'usr_02',
    name: 'Trần Minh Khang',
    email: 'khang.tran@glinteco.com',
    avatarHue: 150,
    role: 'Learner',
    title: 'Frontend Developer',
    level: 5,
    xp: 3240,
    streakDays: 7,
    overallProgressPct: 47,
    completedLessonsCount: 9,
    totalLessonsCount: 19,
    paceStatus: 'on_track',
    paceDeltaDays: 0,
    tracks: [
      {
        trackId: 'tr_fund',
        title: 'Web Fundamentals & Git Workflow',
        progressPct: 100,
        completedLessons: 6,
        totalLessons: 6,
        status: 'completed',
        lessons: [
          { id: 'ls_101', title: 'HTML5 Semantic Architecture', order: 1, type: 'reading', status: 'completed' },
          { id: 'ls_102', title: 'Modern CSS Grid & Flexbox Systems', order: 2, type: 'coding', status: 'completed' },
          { id: 'ls_103', title: 'Git & Enterprise Branching Strategy', order: 3, type: 'video', status: 'completed' },
          { id: 'ls_104', title: 'ES6+ Core & Functional Patterns', order: 4, type: 'coding', status: 'completed' },
          { id: 'ls_105', title: 'Asynchronous JavaScript & Event Loop', order: 5, type: 'video', status: 'completed' },
          { id: 'ls_106', title: 'Capstone: Fundamentals Assessment', order: 6, type: 'assignment', status: 'completed' },
        ],
      },
      {
        trackId: 'tr_react',
        title: 'React 19 & TypeScript Advanced Architecture',
        progressPct: 37,
        completedLessons: 3,
        totalLessons: 8,
        status: 'in_progress',
        lessons: [
          { id: 'ls_201', title: 'TypeScript Strict Mode & Generics', order: 1, type: 'coding', status: 'completed' },
          { id: 'ls_202', title: 'React 19 Hooks & Concurrency', order: 2, type: 'video', status: 'completed' },
          { id: 'ls_203', title: 'Custom Hooks & Performance Optimization', order: 3, type: 'coding', status: 'completed' },
          { id: 'ls_204', title: 'State Management with Zustand', order: 4, type: 'coding', status: 'in_progress' },
          { id: 'ls_205', title: 'Next.js 15 App Router Deep Dive', order: 5, type: 'video', status: 'locked' },
          { id: 'ls_206', title: 'Server Actions & Mutations', order: 6, type: 'coding', status: 'locked' },
          { id: 'ls_207', title: 'Design Systems with Shadcn UI & Tailwind', order: 7, type: 'coding', status: 'locked' },
          { id: 'ls_208', title: 'Enterprise E2E Testing with Playwright', order: 8, type: 'assignment', status: 'locked' },
        ],
      },
      {
        trackId: 'tr_backend',
        title: 'REST API Integration & GraphQL Ecosystem',
        progressPct: 0,
        completedLessons: 0,
        totalLessons: 5,
        status: 'not_started',
        lessons: [
          { id: 'ls_301', title: 'HTTP/2 & RESTful Best Practices', order: 1, type: 'reading', status: 'in_progress' },
          { id: 'ls_302', title: 'OAuth2 & Bearer Token Interceptors', order: 2, type: 'coding', status: 'locked' },
          { id: 'ls_303', title: 'GraphQL Schema & Apollo Integration', order: 3, type: 'video', status: 'locked' },
          { id: 'ls_304', title: 'Realtime WebSockets & SSE Architecture', order: 4, type: 'coding', status: 'locked' },
          { id: 'ls_305', title: 'Final Integration Capstone', order: 5, type: 'assignment', status: 'locked' },
        ],
      },
    ],
  },
  {
    userId: 'usr_03',
    name: 'Lê Thảo My',
    email: 'my.le@glinteco.com',
    avatarHue: 340,
    role: 'Learner',
    title: 'Junior UI/UX Engineer',
    level: 3,
    xp: 1420,
    streakDays: 2,
    overallProgressPct: 21,
    completedLessonsCount: 4,
    totalLessonsCount: 19,
    paceStatus: 'behind',
    paceDeltaDays: -5,
    tracks: [
      {
        trackId: 'tr_fund',
        title: 'Web Fundamentals & Git Workflow',
        progressPct: 66,
        completedLessons: 4,
        totalLessons: 6,
        status: 'in_progress',
        lessons: [
          { id: 'ls_101', title: 'HTML5 Semantic Architecture', order: 1, type: 'reading', status: 'completed' },
          { id: 'ls_102', title: 'Modern CSS Grid & Flexbox Systems', order: 2, type: 'coding', status: 'completed' },
          { id: 'ls_103', title: 'Git & Enterprise Branching Strategy', order: 3, type: 'video', status: 'completed' },
          { id: 'ls_104', title: 'ES6+ Core & Functional Patterns', order: 4, type: 'coding', status: 'completed' },
          { id: 'ls_105', title: 'Asynchronous JavaScript & Event Loop', order: 5, type: 'video', status: 'in_progress' },
          { id: 'ls_106', title: 'Capstone: Fundamentals Assessment', order: 6, type: 'assignment', status: 'locked' },
        ],
      },
      {
        trackId: 'tr_react',
        title: 'React 19 & TypeScript Advanced Architecture',
        progressPct: 0,
        completedLessons: 0,
        totalLessons: 8,
        status: 'not_started',
        lessons: [
          { id: 'ls_201', title: 'TypeScript Strict Mode & Generics', order: 1, type: 'coding', status: 'in_progress' },
          { id: 'ls_202', title: 'React 19 Hooks & Concurrency', order: 2, type: 'video', status: 'locked' },
          { id: 'ls_203', title: 'Custom Hooks & Performance Optimization', order: 3, type: 'coding', status: 'locked' },
          { id: 'ls_204', title: 'State Management with Zustand', order: 4, type: 'coding', status: 'locked' },
          { id: 'ls_205', title: 'Next.js 15 App Router Deep Dive', order: 5, type: 'video', status: 'locked' },
          { id: 'ls_206', title: 'Server Actions & Mutations', order: 6, type: 'coding', status: 'locked' },
          { id: 'ls_207', title: 'Design Systems with Shadcn UI & Tailwind', order: 7, type: 'coding', status: 'locked' },
          { id: 'ls_208', title: 'Enterprise E2E Testing with Playwright', order: 8, type: 'assignment', status: 'locked' },
        ],
      },
      {
        trackId: 'tr_backend',
        title: 'REST API Integration & GraphQL Ecosystem',
        progressPct: 0,
        completedLessons: 0,
        totalLessons: 5,
        status: 'not_started',
        lessons: [
          { id: 'ls_301', title: 'HTTP/2 & RESTful Best Practices', order: 1, type: 'reading', status: 'in_progress' },
          { id: 'ls_302', title: 'OAuth2 & Bearer Token Interceptors', order: 2, type: 'coding', status: 'locked' },
          { id: 'ls_303', title: 'GraphQL Schema & Apollo Integration', order: 3, type: 'video', status: 'locked' },
          { id: 'ls_304', title: 'Realtime WebSockets & SSE Architecture', order: 4, type: 'coding', status: 'locked' },
          { id: 'ls_305', title: 'Final Integration Capstone', order: 5, type: 'assignment', status: 'locked' },
        ],
      },
    ],
  },
  {
    userId: 'usr_04',
    name: 'Hoàng Đức Anh',
    email: 'ducanh.hoang@glinteco.com',
    avatarHue: 280,
    role: 'Learner',
    title: 'Senior Frontend Engineer',
    level: 8,
    xp: 6100,
    streakDays: 21,
    overallProgressPct: 89,
    completedLessonsCount: 17,
    totalLessonsCount: 19,
    paceStatus: 'ahead',
    paceDeltaDays: 7,
    tracks: [
      {
        trackId: 'tr_fund',
        title: 'Web Fundamentals & Git Workflow',
        progressPct: 100,
        completedLessons: 6,
        totalLessons: 6,
        status: 'completed',
        lessons: [
          { id: 'ls_101', title: 'HTML5 Semantic Architecture', order: 1, type: 'reading', status: 'completed' },
          { id: 'ls_102', title: 'Modern CSS Grid & Flexbox Systems', order: 2, type: 'coding', status: 'completed' },
          { id: 'ls_103', title: 'Git & Enterprise Branching Strategy', order: 3, type: 'video', status: 'completed' },
          { id: 'ls_104', title: 'ES6+ Core & Functional Patterns', order: 4, type: 'coding', status: 'completed' },
          { id: 'ls_105', title: 'Asynchronous JavaScript & Event Loop', order: 5, type: 'video', status: 'completed' },
          { id: 'ls_106', title: 'Capstone: Fundamentals Assessment', order: 6, type: 'assignment', status: 'completed' },
        ],
      },
      {
        trackId: 'tr_react',
        title: 'React 19 & TypeScript Advanced Architecture',
        progressPct: 100,
        completedLessons: 8,
        totalLessons: 8,
        status: 'completed',
        lessons: [
          { id: 'ls_201', title: 'TypeScript Strict Mode & Generics', order: 1, type: 'coding', status: 'completed' },
          { id: 'ls_202', title: 'React 19 Hooks & Concurrency', order: 2, type: 'video', status: 'completed' },
          { id: 'ls_203', title: 'Custom Hooks & Performance Optimization', order: 3, type: 'coding', status: 'completed' },
          { id: 'ls_204', title: 'State Management with Zustand', order: 4, type: 'coding', status: 'completed' },
          { id: 'ls_205', title: 'Next.js 15 App Router Deep Dive', order: 5, type: 'video', status: 'completed' },
          { id: 'ls_206', title: 'Server Actions & Mutations', order: 6, type: 'coding', status: 'completed' },
          { id: 'ls_207', title: 'Design Systems with Shadcn UI & Tailwind', order: 7, type: 'coding', status: 'completed' },
          { id: 'ls_208', title: 'Enterprise E2E Testing with Playwright', order: 8, type: 'assignment', status: 'completed' },
        ],
      },
      {
        trackId: 'tr_backend',
        title: 'REST API Integration & GraphQL Ecosystem',
        progressPct: 60,
        completedLessons: 3,
        totalLessons: 5,
        status: 'in_progress',
        lessons: [
          { id: 'ls_301', title: 'HTTP/2 & RESTful Best Practices', order: 1, type: 'reading', status: 'completed' },
          { id: 'ls_302', title: 'OAuth2 & Bearer Token Interceptors', order: 2, type: 'coding', status: 'completed' },
          { id: 'ls_303', title: 'GraphQL Schema & Apollo Integration', order: 3, type: 'video', status: 'completed' },
          { id: 'ls_304', title: 'Realtime WebSockets & SSE Architecture', order: 4, type: 'coding', status: 'in_progress' },
          { id: 'ls_305', title: 'Final Integration Capstone', order: 5, type: 'assignment', status: 'locked' },
        ],
      },
    ],
  },
  {
    userId: 'usr_05',
    name: 'Phạm Kiều Trang',
    email: 'trang.pham@glinteco.com',
    avatarHue: 45,
    role: 'Learner',
    title: 'Intern Frontend Developer',
    level: 1,
    xp: 350,
    streakDays: 1,
    overallProgressPct: 10,
    completedLessonsCount: 2,
    totalLessonsCount: 19,
    paceStatus: 'behind',
    paceDeltaDays: -6,
    tracks: [
      {
        trackId: 'tr_fund',
        title: 'Web Fundamentals & Git Workflow',
        progressPct: 33,
        completedLessons: 2,
        totalLessons: 6,
        status: 'in_progress',
        lessons: [
          { id: 'ls_101', title: 'HTML5 Semantic Architecture', order: 1, type: 'reading', status: 'completed' },
          { id: 'ls_102', title: 'Modern CSS Grid & Flexbox Systems', order: 2, type: 'coding', status: 'completed' },
          { id: 'ls_103', title: 'Git & Enterprise Branching Strategy', order: 3, type: 'video', status: 'in_progress' },
          { id: 'ls_104', title: 'ES6+ Core & Functional Patterns', order: 4, type: 'coding', status: 'locked' },
          { id: 'ls_105', title: 'Asynchronous JavaScript & Event Loop', order: 5, type: 'video', status: 'locked' },
          { id: 'ls_106', title: 'Capstone: Fundamentals Assessment', order: 6, type: 'assignment', status: 'locked' },
        ],
      },
      {
        trackId: 'tr_react',
        title: 'React 19 & TypeScript Advanced Architecture',
        progressPct: 0,
        completedLessons: 0,
        totalLessons: 8,
        status: 'not_started',
        lessons: [
          { id: 'ls_201', title: 'TypeScript Strict Mode & Generics', order: 1, type: 'coding', status: 'in_progress' },
          { id: 'ls_202', title: 'React 19 Hooks & Concurrency', order: 2, type: 'video', status: 'locked' },
          { id: 'ls_203', title: 'Custom Hooks & Performance Optimization', order: 3, type: 'coding', status: 'locked' },
          { id: 'ls_204', title: 'State Management with Zustand', order: 4, type: 'coding', status: 'locked' },
          { id: 'ls_205', title: 'Next.js 15 App Router Deep Dive', order: 5, type: 'video', status: 'locked' },
          { id: 'ls_206', title: 'Server Actions & Mutations', order: 6, type: 'coding', status: 'locked' },
          { id: 'ls_207', title: 'Design Systems with Shadcn UI & Tailwind', order: 7, type: 'coding', status: 'locked' },
          { id: 'ls_208', title: 'Enterprise E2E Testing with Playwright', order: 8, type: 'assignment', status: 'locked' },
        ],
      },
      {
        trackId: 'tr_backend',
        title: 'REST API Integration & GraphQL Ecosystem',
        progressPct: 0,
        completedLessons: 0,
        totalLessons: 5,
        status: 'not_started',
        lessons: [
          { id: 'ls_301', title: 'HTTP/2 & RESTful Best Practices', order: 1, type: 'reading', status: 'in_progress' },
          { id: 'ls_302', title: 'OAuth2 & Bearer Token Interceptors', order: 2, type: 'coding', status: 'locked' },
          { id: 'ls_303', title: 'GraphQL Schema & Apollo Integration', order: 3, type: 'video', status: 'locked' },
          { id: 'ls_304', title: 'Realtime WebSockets & SSE Architecture', order: 4, type: 'coding', status: 'locked' },
          { id: 'ls_305', title: 'Final Integration Capstone', order: 5, type: 'assignment', status: 'locked' },
        ],
      },
    ],
  },
];

export async function getMockCohortUsersProgress(
  cohortId: string,
  params?: { search?: string; page?: number; limit?: number }
): Promise<{ data: CohortUsersProgressResponseDto }> {
  // Simulate slight network latency
  await new Promise((resolve) => setTimeout(resolve, 300));

  let filtered = [...MOCK_LEARNERS_PROGRESS];

  if (params?.search && params.search.trim() !== '') {
    const q = params.search.toLowerCase().trim();
    filtered = filtered.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }

  return {
    data: {
      cohortId,
      totalUsers: filtered.length,
      data: filtered,
    },
  };
}
