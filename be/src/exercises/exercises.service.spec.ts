import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ExercisesService } from './exercises.service';
import {
  Exercise,
  ExerciseDifficulty,
  ExerciseType,
} from '../database/entities/exercise.entity';
import { Track, TrackStatus } from '../database/entities/track.entity';
import { Lesson } from '../database/entities/lesson.entity';
import { LessonProgress } from '../database/entities/lesson-progress.entity';
import { Document } from '../database/entities/document.entity';
import {
  Submission,
  SubmissionStatus,
} from '../database/entities/submission.entity';
import { AutoGrade } from '../database/entities/auto-grade.entity';
import { Tag } from '../database/entities/tag.entity';
import { User, UserRole } from '../database/entities/user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ExercisesService', () => {
  let service: ExercisesService;

  const mockExerciseRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockTrackRepository = {
    findOne: jest.fn(),
  };

  const mockDocumentRepository = {
    findBy: jest.fn(),
  };

  const mockSubmissionRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockAutoGradeRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockTagRepository = {
    findOne: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockLessonRepository = { find: jest.fn() };
  const mockLessonProgressRepository = { find: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExercisesService,
        {
          provide: getRepositoryToken(Exercise),
          useValue: mockExerciseRepository,
        },
        {
          provide: getRepositoryToken(Track),
          useValue: mockTrackRepository,
        },
        {
          provide: getRepositoryToken(Document),
          useValue: mockDocumentRepository,
        },
        {
          provide: getRepositoryToken(Submission),
          useValue: mockSubmissionRepository,
        },
        {
          provide: getRepositoryToken(AutoGrade),
          useValue: mockAutoGradeRepository,
        },
        {
          provide: getRepositoryToken(Tag),
          useValue: mockTagRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Lesson),
          useValue: mockLessonRepository,
        },
        {
          provide: getRepositoryToken(LessonProgress),
          useValue: mockLessonProgressRepository,
        },
      ],
    }).compile();

    service = module.get<ExercisesService>(ExercisesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save an exercise when track exists', async () => {
      const dto = {
        title: 'New Ex',
        trackId: 'track-1',
        tag: 'NestJS',
        difficulty: ExerciseDifficulty.BEGINNER,
        estimatedTime: '2h',
        xp: 100,
        brief: 'Brief',
        overview: 'Overview',
        objectives: ['Obj 1'],
        steps: ['Step 1'],
        resourceDocIds: ['doc-1'],
        hint: 'Hint',
      };

      mockTrackRepository.findOne.mockResolvedValue({ id: 'track-1' });
      mockDocumentRepository.findBy.mockResolvedValue([{ id: 'doc-1' }]);
      mockExerciseRepository.create.mockReturnValue({ id: 'ex-1', ...dto });
      mockExerciseRepository.save.mockImplementation((ex) =>
        Promise.resolve(ex),
      );

      const result = await service.create(dto);
      expect(mockTrackRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'track-1' },
      });
      expect(mockDocumentRepository.findBy).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.title).toBe('New Ex');
    });

    it('should throw NotFoundException when track does not exist', async () => {
      mockTrackRepository.findOne.mockResolvedValue(null);
      await expect(
        service.create({
          title: 'Ex',
          trackId: 'track-1',
          tag: 'NestJS',
          difficulty: ExerciseDifficulty.BEGINNER,
          estimatedTime: '2h',
          xp: 100,
          brief: 'Brief',
          overview: 'Overview',
          objectives: ['Obj 1'],
          steps: ['Step 1'],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('rejects invalid Quiz configuration', async () => {
      mockTrackRepository.findOne.mockResolvedValue({ id: 'track-1' });
      await expect(
        service.create({
          title: 'Quiz',
          trackId: 'track-1',
          tag: 'quiz',
          difficulty: ExerciseDifficulty.BEGINNER,
          estimatedTime: '10m',
          xp: 10,
          brief: 'Brief',
          overview: 'Overview',
          objectives: ['Objective'],
          steps: ['Step'],
          type: ExerciseType.QUIZ,
          questionsData: [
            {
              id: 'q1',
              prompt: 'Question',
              options: ['A', 'A', 'B', 'C'],
              correctAnswer: 'A',
              explanation: 'Explanation',
            },
          ],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return exercises with personal submission status', async () => {
      mockExerciseRepository.find.mockResolvedValue([
        {
          id: 'ex-1',
          title: 'Ex 1',
          trackId: 'track-1',
          tag: 'NestJS',
          difficulty: ExerciseDifficulty.BEGINNER,
          estimatedTime: '2h',
          xp: 100,
          brief: 'Brief',
          objectives: ['Obj 1'],
          track: { title: 'Track 1', status: TrackStatus.ACTIVE },
          type: ExerciseType.PR_REVIEW,
          isMandatory: true,
        },
      ]);
      mockSubmissionRepository.find.mockResolvedValue([
        {
          id: 'sub-1',
          exerciseId: 'ex-1',
          status: SubmissionStatus.SUBMITTED,
          prUrl: 'github.com/pr',
        },
      ]);

      const result = await service.findAll(
        { limit: 20 },
        'user-1',
        UserRole.ADMIN,
      );
      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe('submitted');
      expect(result.data[0].prUrl).toBe('github.com/pr');
      expect(result.data[0].objectiveCount).toBe(1);
    });

    it('shows track-level and unlocked lesson exercises to learners', async () => {
      const baseExercise = {
        trackId: 'track-1',
        track: { title: 'Track 1', status: TrackStatus.ACTIVE },
        tag: 'NestJS',
        difficulty: ExerciseDifficulty.BEGINNER,
        estimatedTime: '10m',
        xp: 10,
        brief: 'Brief',
        objectives: [],
        type: ExerciseType.QUIZ,
        isMandatory: true,
      };
      mockExerciseRepository.find.mockResolvedValue([
        {
          ...baseExercise,
          id: 'track-exercise',
          title: 'Track',
          lessonId: null,
        },
        {
          ...baseExercise,
          id: 'lesson-1-exercise',
          title: 'First',
          lessonId: 'lesson-1',
        },
        {
          ...baseExercise,
          id: 'lesson-2-exercise',
          title: 'Second',
          lessonId: 'lesson-2',
        },
        {
          ...baseExercise,
          id: 'lesson-3-exercise',
          title: 'Locked',
          lessonId: 'lesson-3',
        },
      ]);
      mockLessonRepository.find.mockResolvedValue([
        { id: 'lesson-1', trackId: 'track-1', order: 1 },
        { id: 'lesson-2', trackId: 'track-1', order: 2 },
        { id: 'lesson-3', trackId: 'track-1', order: 3 },
      ]);
      mockLessonProgressRepository.find.mockResolvedValue([
        {
          userId: 'user-1',
          lessonId: 'lesson-1',
          completedAt: new Date(),
        },
      ]);
      mockSubmissionRepository.find.mockResolvedValue([]);

      const result = await service.findAll(
        { limit: 20 },
        'user-1',
        UserRole.LEARNER,
      );

      expect(result.data.map((exercise) => exercise.id)).toEqual([
        'track-exercise',
        'lesson-1-exercise',
        'lesson-2-exercise',
      ]);
    });
  });

  describe('findOne', () => {
    it('should return exercise details and user submission status', async () => {
      mockExerciseRepository.findOne.mockResolvedValue({
        id: 'ex-1',
        title: 'Ex 1',
        trackId: 'track-1',
        tag: 'NestJS',
        difficulty: ExerciseDifficulty.BEGINNER,
        estimatedTime: '2h',
        xp: 100,
        brief: 'Brief',
        overview: 'Overview',
        objectives: ['Obj 1'],
        steps: ['Step 1'],
        hint: 'Hint',
        resources: [],
        track: { title: 'Track 1', status: TrackStatus.ACTIVE },
        type: ExerciseType.PR_REVIEW,
        questionsData: null,
        targetScore: 100,
        isMandatory: true,
      });
      mockSubmissionRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('ex-1', 'user-1', UserRole.ADMIN);
      expect(result).toBeDefined();
      expect(result.status).toBe('pending');
    });

    it('should throw NotFoundException if exercise not found', async () => {
      mockExerciseRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('ex-1', 'user-1')).rejects.toMatchObject({
        response: { code: 'EXERCISE_NOT_FOUND' },
      });
    });

    it('blocks learner detail for an inactive track', async () => {
      mockExerciseRepository.findOne.mockResolvedValue({
        id: 'ex-1',
        trackId: 'track-1',
        lessonId: null,
        track: { status: TrackStatus.ARCHIVED },
      });
      await expect(
        service.findOne('ex-1', 'user-1', UserRole.LEARNER),
      ).rejects.toMatchObject({ response: { code: 'TRACK_INACTIVE' } });
    });

    it('returns EXERCISE_LOCKED for an unsubmitted locked lesson exercise', async () => {
      mockExerciseRepository.findOne.mockResolvedValue({
        id: 'ex-1',
        trackId: 'track-1',
        lessonId: 'lesson-2',
        track: { status: TrackStatus.ACTIVE },
      });
      mockSubmissionRepository.findOne.mockResolvedValue(null);
      mockLessonRepository.find.mockResolvedValue([
        { id: 'lesson-1', trackId: 'track-1', order: 1 },
        { id: 'lesson-2', trackId: 'track-1', order: 2 },
      ]);
      mockLessonProgressRepository.find.mockResolvedValue([]);

      await expect(
        service.findOne('ex-1', 'user-1', UserRole.LEARNER),
      ).rejects.toMatchObject({ response: { code: 'EXERCISE_LOCKED' } });
    });

    it('allows a learner to view a submitted exercise from an inactive track', async () => {
      mockExerciseRepository.findOne.mockResolvedValue({
        id: 'ex-1',
        trackId: 'track-1',
        lessonId: null,
        track: { title: 'Track 1', status: TrackStatus.ARCHIVED },
        resources: [],
        questionsData: null,
      });
      mockSubmissionRepository.findOne.mockResolvedValue({
        id: 'submission-1',
        status: SubmissionStatus.SUBMITTED,
        prUrl: 'https://github.com/acme/api/pull/119',
      });

      const result = await service.findOne(
        'ex-1',
        'user-1',
        UserRole.LEARNER,
      );

      expect(result.status).toBe(SubmissionStatus.SUBMITTED);
      expect(result.isReadOnly).toBe(true);
      expect(mockLessonRepository.find).not.toHaveBeenCalled();
    });
  });

  describe('auto grading', () => {
    it('strips answers from learner detail and returns explanation only after grading', async () => {
      const exercise = {
        id: 'ex-quiz',
        trackId: 'track-1',
        lessonId: null,
        track: { title: 'Track 1', status: TrackStatus.ACTIVE },
        type: ExerciseType.QUIZ,
        targetScore: 100,
        questionsData: [
          {
            id: 'q1',
            prompt: '2 + 2?',
            options: ['1', '2', '3', '4'],
            correctAnswer: '4',
            explanation: 'Two plus two equals four.',
          },
        ],
        resources: [],
      };
      mockExerciseRepository.findOne.mockResolvedValue(exercise);
      mockSubmissionRepository.findOne.mockResolvedValue(null);
      mockSubmissionRepository.create.mockImplementation((value) => value);
      mockSubmissionRepository.save.mockImplementation((value) => value);

      const detail = await service.findOne(
        'ex-quiz',
        'user-1',
        UserRole.LEARNER,
      );
      expect(detail.questionsData).toEqual([
        {
          id: 'q1',
          prompt: '2 + 2?',
          options: ['1', '2', '3', '4'],
        },
      ]);

      const result = await service.submitAuto(
        'ex-quiz',
        'user-1',
        { answers: [{ questionId: 'q1', answer: '4' }] },
      );
      expect(result.passed).toBe(true);
      expect(result.results[0]).toEqual({
        questionId: 'q1',
        correct: true,
        explanation: 'Two plus two equals four.',
      });
      expect(mockSubmissionRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update and save exercise', async () => {
      const existing = {
        id: 'ex-1',
        title: 'Old Title',
        resources: [],
      };
      mockExerciseRepository.findOne.mockResolvedValue(existing);
      mockExerciseRepository.save.mockImplementation((ex) =>
        Promise.resolve(ex),
      );

      const result = await service.update('ex-1', { title: 'New Title' });
      expect(result.title).toBe('New Title');
    });
  });

  describe('remove', () => {
    it('should delete exercise if found', async () => {
      mockExerciseRepository.findOne.mockResolvedValue({ id: 'ex-1' });
      mockExerciseRepository.remove.mockResolvedValue(undefined);

      await service.remove('ex-1');
      expect(mockExerciseRepository.remove).toHaveBeenCalled();
    });
  });
});
