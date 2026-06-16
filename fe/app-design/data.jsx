/* mock data for the onboarding portal */

const PORTAL_USER = {
  learner: { name: 'Mina Okonkwo', handle: '@mina', role: 'Frontend Engineer', avatarHue: 162, level: 3, xp: 1240, joined: 'Apr 2026' },
  admin:   { name: 'Devs Lead', handle: '@lead', role: 'Engineering Manager', avatarHue: 232, level: 9, xp: 9800, joined: 'Jan 2025' },
};

const TAGS = ['Frontend', 'NestJS', 'Architecture', 'Testing', 'DevOps', 'Database'];

const TAG_COLOR = {
  Frontend: 'accent', NestJS: 'info', Architecture: 'warn',
  Testing: 'muted', DevOps: 'danger', Database: 'info',
};

const TRACKS = [
  { id: 't1', title: 'Local Dev Environment', time: '1.5h', status: 'completed', icon: 'pixelarticons:device-laptop',
    desc: 'Clone the monorepo, install pnpm, run the dev stack with Docker Compose.', lessons: 4 },
  { id: 't2', title: 'Frontend Fundamentals', time: '3h', status: 'completed', icon: 'pixelarticons:layout',
    desc: 'Next.js App Router, our component library, and Tailwind conventions.', lessons: 6 },
  { id: 't3', title: 'NestJS Service Layer', time: '2.5h', status: 'in_progress', icon: 'pixelarticons:server',
    desc: 'Modules, providers, DTO validation, and how we structure controllers.', lessons: 5, done: 3 },
  { id: 't4', title: 'System Architecture', time: '2h', status: 'locked', icon: 'pixelarticons:sitemap',
    desc: 'Event-driven boundaries, the gateway pattern, and our data contracts.', lessons: 4 },
  { id: 't5', title: 'Testing & CI Pipeline', time: '1.5h', status: 'locked', icon: 'pixelarticons:checkbox',
    desc: 'Unit, integration, e2e with Playwright, and how the CI gate works.', lessons: 3 },
];

const DOCS = [
  { id: 'd1', title: 'Next.js App Router Conventions', url: 'wiki/frontend/app-router', tags: ['Frontend', 'Architecture'], kind: 'Guide', updated: '3d ago' },
  { id: 'd2', title: 'Component Library Storybook', url: 'storybook.internal.dev', tags: ['Frontend'], kind: 'Reference', updated: '1w ago' },
  { id: 'd3', title: 'NestJS Module Boundaries', url: 'wiki/backend/modules', tags: ['NestJS', 'Architecture'], kind: 'Guide', updated: '2d ago' },
  { id: 'd4', title: 'Database Migration Playbook', url: 'wiki/data/migrations', tags: ['Database', 'DevOps'], kind: 'Runbook', updated: '5d ago' },
  { id: 'd5', title: 'Service Auth & JWT Flow', url: 'wiki/backend/auth', tags: ['NestJS', 'Architecture'], kind: 'Guide', updated: '6h ago' },
  { id: 'd6', title: 'Playwright E2E Setup', url: 'wiki/testing/e2e', tags: ['Testing', 'Frontend'], kind: 'Tutorial', updated: '4d ago' },
  { id: 'd7', title: 'Deploy Pipeline & Rollbacks', url: 'wiki/devops/deploy', tags: ['DevOps'], kind: 'Runbook', updated: '1d ago' },
  { id: 'd8', title: 'Event Bus Contract Registry', url: 'wiki/architecture/events', tags: ['Architecture', 'Database'], kind: 'Reference', updated: '2w ago' },
];

const EXERCISES = [
  { id: 'e1', title: 'Build a Profile Card Component', track: 'Frontend Fundamentals', tag: 'Frontend',
    brief: 'Create a reusable <ProfileCard/> using our component library tokens. Must be responsive and pass a11y lint.',
    status: 'approved', pr: 'github.com/acme/web/pull/482',
    difficulty: 'Beginner', est: '2h', xp: 120,
    overview: 'Engineers reach for shared primitives constantly. This task gets you fluent with our design tokens, the component library API, and the a11y lint gate that every PR must pass before merge.',
    objectives: [
      'Render avatar, name, role and a status dot from props',
      'Use only design tokens — no hard-coded colors or spacing',
      'Responsive from 320px up; no horizontal scroll',
      'Passes `pnpm lint:a11y` with zero violations',
    ],
    steps: [
      'Scaffold the component under `packages/ui/src/ProfileCard`',
      'Wire props + Storybook story with 3 states',
      'Add a unit test for the status-dot color mapping',
      'Open a PR and paste the link below',
    ],
    resources: ['d2', 'd1'],
    hint: 'The status dot maps to the same token set as our badge variants — reuse `getStatusColor()` instead of a new switch.' },
  { id: 'e2', title: 'Add a Paginated Users Endpoint', track: 'NestJS Service Layer', tag: 'NestJS',
    brief: 'Implement GET /users with cursor pagination, DTO validation, and a unit test for the service.',
    status: 'submitted', pr: 'github.com/acme/api/pull/119',
    difficulty: 'Intermediate', est: '3h', xp: 200,
    overview: 'Cursor pagination is our standard for every list endpoint. You will build one end-to-end: controller, service, DTO validation, and a unit test that proves the cursor is stable across inserts.',
    objectives: [
      'GET /users accepts `?cursor` and `?limit` (max 50)',
      'Response includes `nextCursor` and `hasMore`',
      'Invalid params return 400 via class-validator DTO',
      'Service unit test covers empty, partial and full pages',
    ],
    steps: [
      'Add the `PaginationQueryDto` with validation decorators',
      'Implement keyset pagination in `UsersService.list()`',
      'Write the Jest spec for the service',
      'Open a PR and paste the link below',
    ],
    resources: ['d3', 'd5'],
    hint: 'Keyset beats OFFSET here — order by `(createdAt, id)` and encode both into the cursor so inserts never shift a page.' },
  { id: 'e3', title: 'Diagram the Order Flow', track: 'System Architecture', tag: 'Architecture',
    brief: 'Document the event flow from checkout to fulfillment. Submit a branch with the .md + mermaid diagram.',
    status: 'pending', pr: '',
    difficulty: 'Advanced', est: '2h', xp: 160,
    overview: 'Before touching the order domain, every engineer maps it. You will trace the events from checkout to fulfillment and capture the contract boundaries in a diagram the team can review.',
    objectives: [
      'Sequence diagram from checkout → payment → fulfillment',
      'Every arrow names the event on the bus',
      'Call out at least one failure / retry path',
      'Committed as Markdown + mermaid under `/docs/architecture`',
    ],
    steps: [
      'Skim the event bus contract registry',
      'Draft the mermaid sequence diagram',
      'Annotate failure handling + idempotency keys',
      'Open a branch PR and paste the link below',
    ],
    resources: ['d8', 'd5'],
    hint: 'Start from the contract registry — the event names there are the source of truth for your arrows.' },
];

/* admin: incoming submissions feed */
const SUBMISSIONS = [
  { id: 's1', who: 'Mina Okonkwo', hue: 162, exercise: 'Add a Paginated Users Endpoint', pr: 'github.com/acme/api/pull/119', when: '14m ago', status: 'submitted' },
  { id: 's2', who: 'Raj Patel', hue: 40, exercise: 'Build a Profile Card Component', pr: 'github.com/acme/web/pull/477', when: '1h ago', status: 'submitted' },
  { id: 's3', who: 'Lena Vogt', hue: 300, exercise: 'Service Auth Middleware', pr: 'github.com/acme/api/pull/115', when: '3h ago', status: 'submitted' },
  { id: 's4', who: 'Tom Becker', hue: 232, exercise: 'Diagram the Order Flow', pr: 'github.com/acme/web/pull/468', when: 'Yesterday', status: 'approved' },
];

const RECENT_DOCS = ['d5', 'd3', 'd1'];

Object.assign(window, {
  PORTAL_USER, TAGS, TAG_COLOR, TRACKS, DOCS, EXERCISES, SUBMISSIONS, RECENT_DOCS,
});
