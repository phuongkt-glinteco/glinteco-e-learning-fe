import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SubmissionsService } from './submissions.service';
import {
  Submission,
  SubmissionStatus,
} from '../database/entities/submission.entity';
import { SubmissionHistory } from '../database/entities/submission-history.entity';
import { Exercise } from '../database/entities/exercise.entity';
import { User } from '../database/entities/user.entity';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { SubmissionQueryDto } from './dto/submission-query.dto';

describe('SubmissionsService', () => {
  let service: SubmissionsService;

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    getCount: jest.fn(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  const mockSubmissionRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockSubmissionHistoryRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockExerciseRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockUserRepository.findOne.mockResolvedValue({
      id: 'user-1',
      name: 'Learner 1',
      email: 'learner@company.com',
      xp: 500,
      level: 1,
    });
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionsService,
        {
          provide: getRepositoryToken(Submission),
          useValue: mockSubmissionRepository,
        },
        {
          provide: getRepositoryToken(SubmissionHistory),
          useValue: mockSubmissionHistoryRepository,
        },
        {
          provide: getRepositoryToken(Exercise),
          useValue: mockExerciseRepository,
        },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<SubmissionsService>(SubmissionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findExercises', () => {
    it('should return exercises along with submissions map for learner', async () => {
      const exercises = [
        { id: 'ex-1', title: 'Exercise 1', objectives: {}, steps: {} },
        { id: 'ex-2', title: 'Exercise 2', objectives: {}, steps: {} },
      ];
      const submissions = [
        {
          id: 'sub-1',
          exerciseId: 'ex-1',
          prUrl: 'https://github.com/pr/1',
          status: SubmissionStatus.SUBMITTED,
          submittedAt: new Date(),
        },
      ];

      mockExerciseRepository.find.mockResolvedValue(exercises);
      mockSubmissionRepository.find.mockResolvedValue(submissions);

      const result = await service.findExercises('track-1', 'user-1');
      expect(result.data).toHaveLength(2);
      expect(result.data[0].submission).toBeDefined();
      expect(result.data[0].submission?.id).toBe('sub-1');
      expect(result.data[1].submission).toBeNull();
    });
  });

  describe('submit', () => {
    it('should throw NotFoundException if exercise does not exist', async () => {
      mockExerciseRepository.findOne.mockResolvedValue(null);
      await expect(
        service.submit('invalid-ex', 'user-1', 'https://github.com/pr/1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if already submitted and not in pending/rejected state', async () => {
      const ex = { id: 'ex-1', title: 'Exercise 1' };
      const existingSub = {
        id: 'sub-1',
        exerciseId: 'ex-1',
        userId: 'user-1',
        status: SubmissionStatus.APPROVED,
      };

      mockExerciseRepository.findOne.mockResolvedValue(ex);
      mockSubmissionRepository.findOne.mockResolvedValue(existingSub);

      await expect(
        service.submit('ex-1', 'user-1', 'https://github.com/pr/1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create new submission if none exists', async () => {
      const ex = { id: 'ex-1', title: 'Exercise 1' };
      const subObj = {
        id: 'sub-1',
        exerciseId: 'ex-1',
        userId: 'user-1',
        prUrl: 'https://github.com/pr/1',
        status: SubmissionStatus.SUBMITTED,
      };

      mockExerciseRepository.findOne.mockResolvedValue(ex);
      mockSubmissionRepository.findOne.mockResolvedValue(null);
      mockSubmissionRepository.create.mockReturnValue(subObj);
      mockSubmissionRepository.save.mockResolvedValue(subObj);
      mockSubmissionHistoryRepository.create.mockReturnValue({});
      mockSubmissionHistoryRepository.save.mockResolvedValue({});

      const result = await service.submit(
        'ex-1',
        'user-1',
        'https://github.com/pr/1',
      );
      expect(result).toBeDefined();
      expect(result.status).toBe(SubmissionStatus.SUBMITTED);
      expect(mockSubmissionRepository.create).toHaveBeenCalled();
      expect(mockSubmissionHistoryRepository.create).toHaveBeenCalledWith({
        submissionId: 'sub-1',
        adminId: null,
        action: 'submitted',
        prUrl: 'https://github.com/pr/1',
        comment: '',
      });
    });
  });

  describe('resubmit', () => {
    it('should throw NotFoundException if old submission does not exist', async () => {
      mockSubmissionRepository.findOne.mockResolvedValue(null);
      await expect(
        service.resubmit('ex-1', 'user-1', 'https://github.com/pr/1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if status is not changes', async () => {
      const oldSub = { id: 'sub-1', status: SubmissionStatus.SUBMITTED };
      mockSubmissionRepository.findOne.mockResolvedValue(oldSub);
      await expect(
        service.resubmit('ex-1', 'user-1', 'https://github.com/pr/1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update prUrl and set status to submitted', async () => {
      const oldSub = {
        id: 'sub-1',
        prUrl: 'url-old',
        status: SubmissionStatus.CHANGES,
        exercise: { title: 'Exercise 1' },
      };
      mockSubmissionRepository.findOne.mockResolvedValue(oldSub);
      mockSubmissionRepository.save.mockImplementation((x) =>
        Promise.resolve({ ...x, id: 'sub-1' }),
      );
      mockSubmissionHistoryRepository.create.mockReturnValue({});
      mockSubmissionHistoryRepository.save.mockResolvedValue({});

      const result = await service.resubmit(
        'ex-1',
        'user-1',
        'https://github.com/pr/new',
      );
      expect(result.prUrl).toBe('https://github.com/pr/new');
      expect(result.status).toBe(SubmissionStatus.SUBMITTED);
      expect(mockSubmissionHistoryRepository.create).toHaveBeenCalledWith({
        submissionId: 'sub-1',
        adminId: null,
        action: 'resubmitted',
        prUrl: 'https://github.com/pr/new',
        comment: '',
      });
    });
  });

  describe('findAll', () => {
    it('should search with parameters and keyset cursor-based pagination', async () => {
      const query: SubmissionQueryDto = {
        status: SubmissionStatus.SUBMITTED,
        limit: 5,
        cursor: Buffer.from(
          JSON.stringify({
            submittedAt: new Date('2026-06-18T08:00:00.000Z').toISOString(),
            id: 'sub-0',
          }),
        ).toString('base64'),
      };
      const mockSubmissions = [
        { id: 'sub-1', submittedAt: new Date('2026-06-18T07:59:00.000Z') },
        { id: 'sub-2', submittedAt: new Date('2026-06-18T07:58:00.000Z') },
        { id: 'sub-3', submittedAt: new Date('2026-06-18T07:57:00.000Z') },
        { id: 'sub-4', submittedAt: new Date('2026-06-18T07:56:00.000Z') },
        { id: 'sub-5', submittedAt: new Date('2026-06-18T07:55:00.000Z') },
        { id: 'sub-6', submittedAt: new Date('2026-06-18T07:54:00.000Z') },
      ];
      mockQueryBuilder.getMany.mockResolvedValue(mockSubmissions);

      const result = await service.findAll(query);
      expect(result.data).toHaveLength(5);
      expect(result.hasMore).toBe(true);
      expect(result.nextCursor).toBeDefined();
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'submission.status = :status',
        { status: SubmissionStatus.SUBMITTED },
      );

      const expectedCursor = Buffer.from(
        JSON.stringify({
          submittedAt: mockSubmissions[4].submittedAt.toISOString(),
          id: mockSubmissions[4].id,
        }),
      ).toString('base64');
      expect(result.nextCursor).toBe(expectedCursor);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if submission does not exist', async () => {
      mockSubmissionRepository.findOne.mockResolvedValue(null);
      await expect(
        service.findOne('invalid-sub', 'user-1', 'learner'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the owner and not admin', async () => {
      const sub = { id: 'sub-1', userId: 'user-2' };
      mockSubmissionRepository.findOne.mockResolvedValue(sub);
      await expect(
        service.findOne('sub-1', 'user-1', 'learner'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return submission if user is owner', async () => {
      const sub = { id: 'sub-1', userId: 'user-1' };
      mockSubmissionRepository.findOne.mockResolvedValue(sub);
      const result = await service.findOne('sub-1', 'user-1', 'learner');
      expect(result).toEqual(sub);
    });

    it('should return submission if user is admin but not owner', async () => {
      const sub = { id: 'sub-1', userId: 'user-2' };
      mockSubmissionRepository.findOne.mockResolvedValue(sub);
      const result = await service.findOne('sub-1', 'user-1', 'admin');
      expect(result).toEqual(sub);
    });
  });

  describe('review', () => {
    it('should throw NotFoundException if submission not found', async () => {
      mockSubmissionRepository.findOne.mockResolvedValue(null);
      await expect(
        service.review('invalid-sub', 'admin-1', SubmissionStatus.APPROVED),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if already approved', async () => {
      const sub = { id: 'sub-1', status: SubmissionStatus.APPROVED };
      mockSubmissionRepository.findOne.mockResolvedValue(sub);
      await expect(
        service.review('sub-1', 'admin-1', SubmissionStatus.CHANGES),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update status and create submission history with dynamic XP award', async () => {
      const user = { id: 'user-1', name: 'Learner 1', xp: 500, level: 1 };
      const exercise = { id: 'ex-1', title: 'Exercise 1', xp: 300 };
      const sub = {
        id: 'sub-1',
        status: SubmissionStatus.SUBMITTED,
        user,
        exercise,
      };
      const history = {
        id: 'h-1',
        submissionId: 'sub-1',
        adminId: 'admin-1',
        action: 'approved',
        comment: 'Good job',
      };

      mockSubmissionRepository.findOne.mockResolvedValue(sub);
      mockSubmissionRepository.save.mockResolvedValue(sub);
      mockSubmissionHistoryRepository.create.mockReturnValue(history);
      mockSubmissionHistoryRepository.save.mockResolvedValue(history);
      mockUserRepository.save.mockResolvedValue(user);

      const result = await service.review(
        'sub-1',
        'admin-1',
        SubmissionStatus.APPROVED,
        'Good job',
      );
      expect(result.status).toBe(SubmissionStatus.APPROVED);
      expect(user.xp).toBe(800); // 500 + 300
      expect(user.level).toBe(2); // level 2 is xp >= 600
    });
  });

  describe('findHistory', () => {
    it('should return list of history logs if owner or admin', async () => {
      const sub = { id: 'sub-1', userId: 'user-1' };
      const logs = [{ id: 'log-1', submissionId: 'sub-1', action: 'approved' }];

      mockSubmissionRepository.findOne.mockResolvedValue(sub);
      mockSubmissionHistoryRepository.find.mockResolvedValue(logs);

      const result = await service.findHistory('sub-1', 'user-1', 'learner');
      expect(result.data).toHaveLength(1);
    });
  });
});
