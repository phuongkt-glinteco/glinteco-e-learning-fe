import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CohortService } from './cohort.service';
import { Cohort } from '../database/entities/cohort.entity';
import { User, UserRole } from '../database/entities/user.entity';
import { Track } from '../database/entities/track.entity';
import { TrackProgress, ProgressStatus } from '../database/entities/track-progress.entity';
import { Submission, SubmissionStatus } from '../database/entities/submission.entity';
import { Lesson } from '../database/entities/lesson.entity';
import { LessonProgress } from '../database/entities/lesson-progress.entity';
import { CreateCohortDto } from './dto/create-cohort.dto';
import { UpdateCohortDto } from './dto/update-cohort.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('CohortService', () => {
  let service: CohortService;

  const mockCohortRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockUserRepository = {
    count: jest.fn(),
    find: jest.fn(),
  };

  const mockTrackRepository = {
    count: jest.fn(),
    find: jest.fn(),
  };

  const mockTrackProgressRepository = {
    find: jest.fn(),
    count: jest.fn(),
  };

  const mockSubmissionRepository = {
    count: jest.fn(),
    findOne: jest.fn(),
  };

  const mockLessonRepository = {
    count: jest.fn(),
  };

  const mockLessonProgressRepository = {
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CohortService,
        {
          provide: getRepositoryToken(Cohort),
          useValue: mockCohortRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Track),
          useValue: mockTrackRepository,
        },
        {
          provide: getRepositoryToken(TrackProgress),
          useValue: mockTrackProgressRepository,
        },
        {
          provide: getRepositoryToken(Submission),
          useValue: mockSubmissionRepository,
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

    service = module.get<CohortService>(CohortService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a new cohort', async () => {
      const dto: CreateCohortDto = { name: 'Batch 1', targetRampDays: 30 };
      const expectedCohort = { id: 'uuid-1', ...dto, isActive: true };

      mockCohortRepository.create.mockReturnValue(expectedCohort);
      mockCohortRepository.save.mockResolvedValue(expectedCohort);

      const result = await service.create(dto);
      expect(mockCohortRepository.create).toHaveBeenCalledWith(dto);
      expect(mockCohortRepository.save).toHaveBeenCalledWith(expectedCohort);
      expect(result).toEqual(expectedCohort);
    });
  });

  describe('findAll', () => {
    it('should return paginated cohorts', async () => {
      const cohorts = [
        { id: 'uuid-1', name: 'Batch 1', targetRampDays: 30, isActive: true },
      ];
      mockCohortRepository.findAndCount.mockResolvedValue([cohorts, 1]);

      const result = await service.findAll(1, 20);
      expect(mockCohortRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual({
        data: cohorts,
        meta: {
          total: 1,
          page: 1,
          limit: 20,
          lastPage: 1,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a cohort by ID if it exists', async () => {
      const cohort = {
        id: 'uuid-1',
        name: 'Batch 1',
        targetRampDays: 30,
        isActive: true,
      };
      mockCohortRepository.findOne.mockResolvedValue(cohort);

      const result = await service.findOne('uuid-1');
      expect(mockCohortRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
      });
      expect(result).toEqual(cohort);
    });

    it('should throw NotFoundException if cohort does not exist', async () => {
      mockCohortRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update and save the cohort', async () => {
      const cohort = {
        id: 'uuid-1',
        name: 'Batch 1',
        targetRampDays: 30,
        isActive: true,
      };
      const dto: UpdateCohortDto = { name: 'Updated Name', isActive: false };
      const updatedCohort = { ...cohort, ...dto };

      mockCohortRepository.findOne.mockResolvedValue(cohort);
      mockCohortRepository.save.mockResolvedValue(updatedCohort);

      const result = await service.update('uuid-1', dto);
      expect(mockCohortRepository.save).toHaveBeenCalledWith(updatedCohort);
      expect(result).toEqual(updatedCohort);
    });
  });

  describe('remove', () => {
    it('should delete the cohort if there are no users associated', async () => {
      const cohort = {
        id: 'uuid-1',
        name: 'Batch 1',
        targetRampDays: 30,
        isActive: true,
      };
      mockCohortRepository.findOne.mockResolvedValue(cohort);
      mockUserRepository.count.mockResolvedValue(0);
      mockCohortRepository.remove.mockResolvedValue(undefined);

      await service.remove('uuid-1');
      expect(mockUserRepository.count).toHaveBeenCalledWith({
        where: { cohortId: 'uuid-1' },
      });
      expect(mockCohortRepository.remove).toHaveBeenCalledWith(cohort);
    });

    it('should throw BadRequestException if cohort has users', async () => {
      const cohort = {
        id: 'uuid-1',
        name: 'Batch 1',
        targetRampDays: 30,
        isActive: true,
      };
      mockCohortRepository.findOne.mockResolvedValue(cohort);
      mockUserRepository.count.mockResolvedValue(3);

      await expect(service.remove('uuid-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(mockCohortRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('getOverview', () => {
    it('should return overview stats correctly', async () => {
      const cohort = { id: 'cohort-1', name: 'Batch 1', targetRampDays: 14 };
      mockCohortRepository.findOne.mockResolvedValue(cohort);

      const learners = [
        { id: 'user-1', name: 'Mina', email: 'mina@acme.dev', role: UserRole.LEARNER, createdAt: new Date() },
      ];
      mockUserRepository.find.mockResolvedValue(learners);
      mockLessonRepository.count.mockResolvedValue(10);
      
      const queryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([{ userId: 'user-1', count: '5' }]),
      };
      mockLessonProgressRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);
      mockSubmissionRepository.count.mockResolvedValue(2);
      mockSubmissionRepository.findOne.mockResolvedValue({
        submittedAt: new Date(Date.now() - 3600000 * 3), // 3h ago
      });
      mockTrackRepository.count.mockResolvedValue(2);
      mockTrackProgressRepository.find.mockResolvedValue([
        { userId: 'user-1', trackId: 'track-1', status: ProgressStatus.COMPLETED, completedAt: new Date() },
        { userId: 'user-1', trackId: 'track-2', status: ProgressStatus.COMPLETED, completedAt: new Date() },
      ]);

      const result = await service.getOverview('cohort-1');
      expect(result).toBeDefined();
      expect(result.activeLearners).toBe(1);
      expect(result.avgCompletion).toBe(50);
      expect(result.pendingReview).toBe(2);
      expect(result.oldestPendingAgo).toBe('3h');
      expect(result.avgRampDays).toBeDefined();
      expect(result.targetRampDays).toBe(14);
    });
  });

  describe('getTrackCompletion', () => {
    it('should return track completion rate array', async () => {
      mockCohortRepository.findOne.mockResolvedValue({ id: 'cohort-1' });
      mockUserRepository.find.mockResolvedValue([{ id: 'user-1' }, { id: 'user-2' }]);
      mockTrackRepository.find.mockResolvedValue([
        { id: 't1', name: 'Track 1', order: 1 },
      ]);
      mockTrackProgressRepository.find.mockResolvedValue([
        { userId: 'user-1', trackId: 't1', status: ProgressStatus.COMPLETED },
      ]);

      const result = await service.getTrackCompletion('cohort-1');
      expect(result.data).toHaveLength(1);
      expect(result.data[0].trackId).toBe('t1');
      expect(result.data[0].completionPct).toBe(50);
    });
  });

  describe('exportReport', () => {
    it('should return CSV text', async () => {
      mockCohortRepository.findOne.mockResolvedValue({ id: 'cohort-1' });
      mockUserRepository.find.mockResolvedValue([
        { id: 'user-1', name: 'Mina', email: 'mina@acme.dev', xp: 500, level: 2 },
      ]);
      mockLessonRepository.count.mockResolvedValue(10);
      mockLessonProgressRepository.count.mockResolvedValue(4);
      mockTrackProgressRepository.count.mockResolvedValue(1);
      mockSubmissionRepository.count.mockResolvedValue(1);

      const csv = await service.exportReport('cohort-1');
      expect(csv).toContain('name,email,completion,xp,level,tracksCompleted,exercisesApproved');
      expect(csv).toContain('Mina,mina@acme.dev,40,500,2,1,1');
    });
  });
});
