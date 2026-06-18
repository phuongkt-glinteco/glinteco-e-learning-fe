import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Not, IsNull, SelectQueryBuilder } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { User, UserRole } from '../../database/entities/user.entity';
import { Lesson } from '../../database/entities/lesson.entity';
import { LessonProgress } from '../../database/entities/lesson-progress.entity';
import { Track } from '../../database/entities/track.entity';
import {
  TrackProgress,
  ProgressStatus,
} from '../../database/entities/track-progress.entity';
import {
  Submission,
  SubmissionStatus,
} from '../../database/entities/submission.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  let userRepository: jest.Mocked<
    Pick<Repository<User>, 'findOne' | 'create' | 'save' | 'createQueryBuilder'>
  >;
  let mockLessonRepository: jest.Mocked<Pick<Repository<Lesson>, 'count'>>;
  let mockLessonProgressRepository: jest.Mocked<
    Pick<Repository<LessonProgress>, 'count'>
  >;
  let mockTrackRepository: jest.Mocked<Pick<Repository<Track>, 'count'>>;
  let mockTrackProgressRepository: jest.Mocked<
    Pick<Repository<TrackProgress>, 'count'>
  >;
  let mockSubmissionRepository: jest.Mocked<
    Pick<Repository<Submission>, 'find'>
  >;

  const mockUser = {
    id: 'user-id-123',
    email: 'test@example.com',
    name: 'Test User',
    role: UserRole.LEARNER,
    level: 1,
    xp: 0,
    streakDays: 0,
  } as User;

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    mockLessonRepository = {
      count: jest.fn(),
    };
    mockLessonProgressRepository = {
      count: jest.fn(),
    };
    mockTrackRepository = {
      count: jest.fn(),
    };
    mockTrackProgressRepository = {
      count: jest.fn(),
    };
    mockSubmissionRepository = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: getRepositoryToken(Lesson),
          useValue: mockLessonRepository,
        },
        {
          provide: getRepositoryToken(LessonProgress),
          useValue: mockLessonProgressRepository,
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
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById('user-id-123');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-id-123' },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByEmailWithPassword', () => {
    it('should fetch user with password from createQueryBuilder', async () => {
      const mockQueryBuilder = {
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockUser),
      };
      userRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as unknown as SelectQueryBuilder<User>,
      );

      const result = await service.findByEmailWithPassword('test@example.com');

      expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith('user.password');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'user.email = :email',
        { email: 'test@example.com' },
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('create', () => {
    it('should create and save a new user', async () => {
      const dto = { email: 'test@example.com', name: 'Test User' };
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(dto);

      expect(userRepository.create).toHaveBeenCalledWith(dto);
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateProfile', () => {
    it('should throw NotFoundException if user is not found', async () => {
      userRepository.findOne.mockResolvedValue(null);
      await expect(
        service.updateProfile('u_123', { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update only the whitelisted fields and return them', async () => {
      const user = {
        id: 'u_123',
        name: 'Old',
        title: 'Old Title',
        avatarHue: 10,
        email: 'old@example.com',
        role: 'learner',
      };
      userRepository.findOne.mockResolvedValue(user as User);
      userRepository.save.mockImplementation((u: unknown) =>
        Promise.resolve(u as User),
      );

      const result = await service.updateProfile('u_123', {
        name: 'Mina',
        title: 'Senior Frontend Engineer',
        avatarHue: 200,
      });

      expect(result).toEqual({
        id: 'u_123',
        name: 'Mina',
        title: 'Senior Frontend Engineer',
        avatarHue: 200,
      });
      expect(user.email).toBe('old@example.com');
      expect(user.role).toBe('learner');
    });

    it('should leave untouched fields unchanged when only one field is sent', async () => {
      const user = {
        id: 'u_123',
        name: 'Mina',
        title: 'Engineer',
        avatarHue: 200,
      };
      userRepository.findOne.mockResolvedValue(user as User);
      userRepository.save.mockImplementation((u: unknown) =>
        Promise.resolve(u as User),
      );

      const result = await service.updateProfile('u_123', { avatarHue: 42 });

      expect(result).toEqual({
        id: 'u_123',
        name: 'Mina',
        title: 'Engineer',
        avatarHue: 42,
      });
    });

    it('should update name only and leave title and avatarHue unchanged', async () => {
      const user = {
        id: 'u_123',
        name: 'Old Name',
        title: 'Engineer',
        avatarHue: 200,
      };
      userRepository.findOne.mockResolvedValue(user as User);
      userRepository.save.mockImplementation((u: unknown) =>
        Promise.resolve(u as User),
      );

      const result = await service.updateProfile('u_123', { name: 'New Name' });

      expect(result).toEqual({
        id: 'u_123',
        name: 'New Name',
        title: 'Engineer',
        avatarHue: 200,
      });
    });

    it('should update title only and leave name and avatarHue unchanged', async () => {
      const user = {
        id: 'u_123',
        name: 'Mina',
        title: 'Old Title',
        avatarHue: 200,
      };
      userRepository.findOne.mockResolvedValue(user as User);
      userRepository.save.mockImplementation((u: unknown) =>
        Promise.resolve(u as User),
      );

      const result = await service.updateProfile('u_123', {
        title: 'New Title',
      });

      expect(result).toEqual({
        id: 'u_123',
        name: 'Mina',
        title: 'New Title',
        avatarHue: 200,
      });
    });

    it('should not change any fields if update DTO is empty', async () => {
      const user = {
        id: 'u_123',
        name: 'Mina',
        title: 'Engineer',
        avatarHue: 200,
      };
      userRepository.findOne.mockResolvedValue(user as User);
      userRepository.save.mockImplementation((u: unknown) =>
        Promise.resolve(u as User),
      );

      const result = await service.updateProfile('u_123', {});

      expect(result).toEqual({
        id: 'u_123',
        name: 'Mina',
        title: 'Engineer',
        avatarHue: 200,
      });
    });
  });

  describe('getStats', () => {
    it('should throw NotFoundException if user is not found', async () => {
      userRepository.findOne.mockResolvedValue(null);
      await expect(service.getStats('u_123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should calculate stats correctly', async () => {
      const mockUserStats = {
        id: 'u_123',
        level: 3,
        xp: 1240,
        streakDays: 6,
      };
      const mockSubmissions = [
        { id: 's1', status: SubmissionStatus.APPROVED },
        { id: 's2', status: SubmissionStatus.PENDING },
        { id: 's3', status: SubmissionStatus.APPROVED },
      ];

      userRepository.findOne.mockResolvedValue(mockUserStats as User);
      mockLessonRepository.count.mockResolvedValue(10);
      mockLessonProgressRepository.count.mockResolvedValue(3);
      mockTrackRepository.count.mockResolvedValue(5);
      mockTrackProgressRepository.count.mockResolvedValue(2);
      mockSubmissionRepository.find.mockResolvedValue(
        mockSubmissions as Submission[],
      );

      const result = await service.getStats('u_123');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'u_123' },
      });
      expect(mockLessonProgressRepository.count).toHaveBeenCalledWith({
        where: { userId: 'u_123', completedAt: Not(IsNull()) },
      });
      expect(mockTrackProgressRepository.count).toHaveBeenCalledWith({
        where: { userId: 'u_123', status: ProgressStatus.COMPLETED },
      });

      expect(result).toEqual({
        level: 3,
        xp: 1240,
        xpThisWeek: 0,
        streakDays: 6,
        overallCompletion: 30,
        tracks: { completed: 2, total: 5 },
        exercises: { approved: 2, total: 3, awaitingReview: 1 },
        savedDocs: { total: 0, unread: 0 },
      });
    });

    it('should round the completion percentage to the nearest integer', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 'u_123',
        level: 1,
        xp: 0,
        streakDays: 0,
      } as User);
      mockLessonRepository.count.mockResolvedValue(3);
      mockLessonProgressRepository.count.mockResolvedValue(1);
      mockTrackRepository.count.mockResolvedValue(0);
      mockTrackProgressRepository.count.mockResolvedValue(0);
      mockSubmissionRepository.find.mockResolvedValue([]);

      const result = await service.getStats('u_123');
      expect(result.overallCompletion).toBe(33);
    });

    it('should not count in-progress lessons toward completion', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 'u_123',
        level: 1,
        xp: 0,
        streakDays: 0,
      } as User);
      mockLessonRepository.count.mockResolvedValue(10);
      mockLessonProgressRepository.count.mockResolvedValue(0);
      mockTrackRepository.count.mockResolvedValue(0);
      mockTrackProgressRepository.count.mockResolvedValue(0);
      mockSubmissionRepository.find.mockResolvedValue([]);

      const result = await service.getStats('u_123');
      expect(result.overallCompletion).toBe(0);
    });

    it('should handle zero total lessons without dividing by zero', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 'u_123',
        level: 1,
        xp: 100,
        streakDays: 1,
      } as User);
      mockLessonRepository.count.mockResolvedValue(0);
      mockLessonProgressRepository.count.mockResolvedValue(0);
      mockTrackRepository.count.mockResolvedValue(0);
      mockTrackProgressRepository.count.mockResolvedValue(0);
      mockSubmissionRepository.find.mockResolvedValue([]);

      const result = await service.getStats('u_123');
      expect(result.overallCompletion).toBe(0);
    });
  });

  describe('findAll', () => {
    it('should query and return users list with pagination', async () => {
      const mockUsers = [{ id: 'user-1', name: 'John Doe', email: 'john@company.com' }];
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockUsers, 1]),
      };

      userRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll({
        cohortId: 'cohort-123',
        role: 'learner',
        q: 'john',
        page: 1,
        limit: 10,
      });

      expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('user.cohort', 'cohort');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('user.cohortId = :cohortId', { cohortId: 'cohort-123' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('user.role = :role', { role: 'learner' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(LOWER(user.name) LIKE :q OR LOWER(user.email) LIKE :q)',
        { q: '%john%' }
      );
      expect(result.data).toEqual(mockUsers);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOneOrFail', () => {
    it('should throw NotFoundException if user is not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.findOneOrFail('invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('should return user if found', async () => {
      const user = { id: 'user-123', email: 'user@company.com' } as User;
      userRepository.findOne.mockResolvedValue(user);

      const result = await service.findOneOrFail('user-123');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        relations: { cohort: true },
      });
      expect(result).toEqual(user);
    });
  });
});
