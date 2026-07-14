import type { ExerciseSummaryDto, ExerciseDetailDto, CreateExerciseDto, UpdateExerciseDto } from '@/services/client/types.gen';

const MOCK_TRACK_ID = '00000000-0000-0000-0000-000000000000';

const INITIAL_MOCK_EXERCISES: ExerciseDetailDto[] = [
  {
    id: 'mock-ex-001',
    title: 'Biến và Kiểu dữ liệu trong JavaScript',
    trackId: MOCK_TRACK_ID,
    track: 'Lập trình Web Cơ bản',
    tag: 'quiz',
    difficulty: 'Beginner',
    estimatedTime: '15 mins',
    xp: 50,
    brief: 'Kiểm tra kiến thức về các kiểu dữ liệu cơ bản trong JavaScript',
    overview: 'Bài tập trắc nghiệm về các khái niệm cơ bản của JavaScript như var, let, const, các kiểu dữ liệu nguyên thủy.',
    objectives: { '0': 'Hiểu các kiểu dữ liệu trong JS', '1': 'Phân biệt var, let, const' },
    steps: { '0': 'Chọn đáp án đúng cho mỗi câu hỏi', '1': 'Nộp bài để xem kết quả' },
    resources: [],
    hint: null,
    status: 'approved',
    prUrl: null,
    lessonId: null,
  },
  {
    id: 'mock-ex-002',
    title: 'Vòng lặp và Functions',
    trackId: MOCK_TRACK_ID,
    track: 'Lập trình Web Cơ bản',
    tag: 'fill_in_blank',
    difficulty: 'Beginner',
    estimatedTime: '20 mins',
    xp: 75,
    brief: 'Điền vào chỗ trống để hoàn thành code',
    overview: 'Bài tập điền từ về vòng lặp for, while và khai báo function trong JavaScript.',
    objectives: { '0': 'Nắm vững cú pháp vòng lặp', '1': 'Hiểu cách khai báo function' },
    steps: { '0': 'Điền từ thích hợp vào ô trống', '1': 'Kiểm tra kết quả' },
    resources: [],
    hint: 'Sử dụng từ khóa function để khai báo hàm',
    status: 'approved',
    prUrl: null,
    lessonId: null,
  },
  {
    id: 'mock-ex-003',
    title: 'Xây dựng REST API với Express',
    trackId: MOCK_TRACK_ID,
    track: 'Backend Development',
    tag: 'coding',
    difficulty: 'Intermediate',
    estimatedTime: '45 mins',
    xp: 150,
    brief: 'Tạo một REST API đơn giản sử dụng Express.js',
    overview: 'Bài tập lập trình yêu cầu xây dựng một REST API với các endpoints CRUD cho quản lý sản phẩm.',
    objectives: { '0': 'Hiểu routing trong Express', '1': 'Xử lý request/response' },
    steps: { '0': 'Khởi tạo project Express', '1': 'Tạo model Product', '2': 'Implement CRUD endpoints' },
    resources: [],
    hint: null,
    status: 'approved',
    prUrl: null,
    lessonId: null,
  },
  {
    id: 'mock-ex-004',
    title: 'CSS Flexbox Layout',
    trackId: MOCK_TRACK_ID,
    track: 'Lập trình Web Cơ bản',
    tag: 'quiz',
    difficulty: 'Beginner',
    estimatedTime: '10 mins',
    xp: 30,
    brief: 'Trắc nghiệm kiến thức về CSS Flexbox',
    overview: 'Kiểm tra hiểu biết về các thuộc tính Flexbox như justify-content, align-items, flex-direction.',
    objectives: { '0': 'Hiểu các thuộc tính Flexbox chính' },
    steps: { '0': 'Trả lời câu hỏi trắc nghiệm' },
    resources: [],
    hint: null,
    status: 'approved',
    prUrl: null,
    lessonId: null,
  },
  {
    id: 'mock-ex-005',
    title: 'SQL Join Operations',
    trackId: MOCK_TRACK_ID,
    track: 'Cơ sở dữ liệu',
    tag: 'fill_in_blank',
    difficulty: 'Intermediate',
    estimatedTime: '25 mins',
    xp: 100,
    brief: 'Hoàn thành câu truy vấn SQL với các loại JOIN',
    overview: 'Bài tập điền từ về INNER JOIN, LEFT JOIN, RIGHT JOIN trong SQL.',
    objectives: { '0': 'Phân biệt các loại JOIN', '1': 'Viết câu truy vấn JOIN chính xác' },
    steps: { '0': 'Điền từ khóa JOIN thích hợp vào câu SQL' },
    resources: [],
    hint: 'INNER JOIN chỉ trả về các bản ghi có khớp ở cả hai bảng',
    status: 'approved',
    prUrl: null,
    lessonId: null,
  },
  {
    id: 'mock-ex-006',
    title: 'Authentication với JWT',
    trackId: MOCK_TRACK_ID,
    track: 'Backend Development',
    tag: 'coding',
    difficulty: 'Advanced',
    estimatedTime: '60 mins',
    xp: 200,
    brief: 'Triển khai xác thực JWT trong ứng dụng Node.js',
    overview: 'Xây dựng hệ thống đăng ký, đăng nhập sử dụng JWT tokens với access và refresh tokens.',
    objectives: { '0': 'Hiểu cơ chế JWT', '1': 'Triển khai login/register endpoints' },
    steps: { '0': 'Cài đặt thư viện jsonwebtoken', '1': 'Tạo auth middleware', '2': 'Implement refresh token' },
    resources: [],
    hint: 'Sử dụng bcrypt để hash password trước khi lưu',
    status: 'approved',
    prUrl: null,
    lessonId: null,
  },
  {
    id: 'mock-ex-007',
    title: 'React Component Lifecycle',
    trackId: MOCK_TRACK_ID,
    track: 'Frontend Development',
    tag: 'quiz',
    difficulty: 'Intermediate',
    estimatedTime: '15 mins',
    xp: 50,
    brief: 'Trắc nghiệm về vòng đời component trong React',
    overview: 'Kiểm tra kiến thức về useEffect, useState và các lifecycle methods.',
    objectives: { '0': 'Hiểu useEffect dependencies', '1': 'Phân biệt mount/unmount' },
    steps: { '0': 'Chọn đáp án đúng' },
    resources: [],
    hint: null,
    status: 'approved',
    prUrl: null,
    lessonId: null,
  },
  {
    id: 'mock-ex-008',
    title: 'Docker Containerization',
    trackId: MOCK_TRACK_ID,
    track: 'DevOps Cơ bản',
    tag: 'fill_in_blank',
    difficulty: 'Intermediate',
    estimatedTime: '20 mins',
    xp: 80,
    brief: 'Điền các lệnh Docker còn thiếu',
    overview: 'Bài tập về các lệnh Docker cơ bản: build, run, compose.',
    objectives: { '0': 'Hiểu Dockerfile syntax', '1': 'Nắm docker-compose' },
    steps: { '0': 'Điền lệnh Docker thích hợp' },
    resources: [],
    hint: 'docker build -t tag . để build image',
    status: 'pending',
    prUrl: null,
    lessonId: null,
  },
  {
    id: 'mock-ex-009',
    title: 'Xây dựng REST API Best Practices',
    trackId: MOCK_TRACK_ID,
    track: 'Backend Development',
    tag: 'pr',
    difficulty: 'Intermediate',
    estimatedTime: '90 mins',
    xp: 200,
    brief: 'Tạo Pull Request với REST API tuân thủ best practices',
    overview: 'Bài tập yêu cầu tạo một Pull Request trên GitHub với các endpoints REST API đúng chuẩn RESTful, bao gồm validation, error handling, và documentation.',
    objectives: { '0': 'Áp dụng RESTful naming conventions', '1': 'Implement proper error handling', '2': 'Viết API documentation' },
    steps: { '0': 'Fork repository và tạo branch mới', '1': 'Implement các endpoints theo spec', '2': 'Viết unit tests', '3': 'Tạo Pull Request và self-review' },
    resources: [],
    hint: 'Xem lại REST API design guidelines trước khi bắt đầu',
    status: 'pending',
    prUrl: null,
    lessonId: null,
  },
  {
    id: 'mock-ex-010',
    title: 'Git Branching Strategy',
    trackId: MOCK_TRACK_ID,
    track: 'DevOps Cơ bản',
    tag: 'minigame',
    difficulty: 'Beginner',
    estimatedTime: '10 mins',
    xp: 30,
    brief: 'Game sắp xếp các lệnh Git theo đúng thứ tự',
    overview: 'Trong minigame này, bạn cần kéo thả các lệnh Git vào đúng thứ tự để hoàn thành một quy trình làm việc với nhánh (branching workflow).',
    objectives: { '0': 'Hiểu Git branching workflow' },
    steps: { '0': 'Sắp xếp các bước theo đúng thứ tự', '1': 'Xác nhận và nhận điểm' },
    resources: [],
    hint: 'Nhớ rằng git add phải trước git commit',
    status: 'pending',
    prUrl: null,
    lessonId: null,
  },
];

let mockExercisesStore = [...INITIAL_MOCK_EXERCISES];

export type ExerciseMockQuery = {
  trackId?: string;
  tag?: string;
  difficulty?: string;
  limit?: number;
};

function getObjectiveCount(objectives: unknown): number {
  if (typeof objectives === 'object' && objectives !== null) {
    return Object.keys(objectives).length;
  }
  return 0;
}

export async function mockFetchExercises(query: ExerciseMockQuery = {}): Promise<{ data: ExerciseSummaryDto[] }> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  let filtered = mockExercisesStore;

  if (query.trackId) {
    filtered = filtered.filter((ex) => ex.trackId === query.trackId);
  }
  if (query.tag) {
    filtered = filtered.filter((ex) => ex.tag === query.tag);
  }
  if (query.difficulty) {
    filtered = filtered.filter((ex) => ex.difficulty === query.difficulty);
  }

  const summaries: ExerciseSummaryDto[] = filtered.map((ex) => ({
    id: ex.id,
    title: ex.title,
    trackId: ex.trackId,
    track: ex.track,
    tag: ex.tag,
    difficulty: ex.difficulty,
    estimatedTime: ex.estimatedTime,
    xp: ex.xp,
    brief: ex.brief,
    objectiveCount: getObjectiveCount(ex.objectives),
    status: ex.status,
    prUrl: null,
    lessonId: null,
  }));

  const limit = query.limit ?? 50;
  return { data: summaries.slice(0, limit) };
}

export async function mockFetchExercise(id: string): Promise<ExerciseDetailDto> {
  await new Promise((resolve) => setTimeout(resolve, 150));

  const exercise = mockExercisesStore.find((ex) => ex.id === id);
  if (!exercise) {
    throw new Error('Exercise not found');
  }
  return { ...exercise };
}

export async function mockCreateExercise(payload: CreateExerciseDto): Promise<{ id: string }> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const newId = `mock-ex-${Date.now()}`;
  const newExercise: ExerciseDetailDto = {
    id: newId,
    title: payload.title,
    trackId: payload.trackId,
    track: payload.trackId === MOCK_TRACK_ID ? 'Mock Track' : 'Unknown',
    tag: payload.tag,
    difficulty: payload.difficulty,
    estimatedTime: payload.estimatedTime,
    xp: payload.xp,
    brief: payload.brief,
    overview: payload.overview,
    objectives: { '0': payload.title },
    steps: { '0': 'Complete the exercise' },
    resources: [],
    hint: payload.hint ?? null,
    status: 'pending',
    prUrl: null,
    lessonId: payload.lessonId
      ? { id: payload.lessonId }
      : null,
  };
  mockExercisesStore.unshift(newExercise);

  return { id: newId };
}

export async function mockUpdateExercise(id: string, payload: UpdateExerciseDto): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const index = mockExercisesStore.findIndex((ex) => ex.id === id);
  if (index === -1) {
    throw new Error('Exercise not found');
  }

  mockExercisesStore[index] = {
    ...mockExercisesStore[index],
    ...payload,
  } as ExerciseDetailDto;
}

export async function mockRemoveExercise(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 150));

  const index = mockExercisesStore.findIndex((ex) => ex.id === id);
  if (index === -1) {
    throw new Error('Exercise not found');
  }
  mockExercisesStore.splice(index, 1);
}
