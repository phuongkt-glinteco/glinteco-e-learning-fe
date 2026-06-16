import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Not, IsNull } from 'typeorm';
import { UsersService } from './users.service';
import { User } from '../../database/entities/user.entity';
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
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };
  const mockLessonRepository = {
    count: jest.fn(),
  };
  const mockLessonProgressRepository = {
    count: jest.fn(),
  };
  const mockTrackRepository = {
    count: jest.fn(),
  };
  const mockTrackProgressRepository = {
    count: jest.fn(),
  };
  const mockSubmissionRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: getRepositoryToken(Lesson), useValue: mockLessonRepository },
        {
          provide: getRepositoryToken(LessonProgress),
          useValue: mockLessonProgressRepository,
        },
        { provide: getRepositoryToken(Track), useValue: mockTrackRepository },
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
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateProfile', () => {
    it('should throw NotFoundException if user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
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
      mockUserRepository.findOne.mockResolvedValue(user);
      mockUserRepository.save.mockImplementation(async (u) => u);

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
      // email / role are never touched by the service.
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
      mockUserRepository.findOne.mockResolvedValue(user);
      mockUserRepository.save.mockImplementation(async (u) => u);

      const result = await service.updateProfile('u_123', { avatarHue: 42 });

      expect(result).toEqual({
        id: 'u_123',
        name: 'Mina',
        title: 'Engineer',
        avatarHue: 42,
      });
    });
  });

  describe('getStats', () => {
    it('should throw NotFoundException if user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.getStats('u_123')).rejects.toThrow(NotFoundException);
    });

    it('should calculate stats correctly', async () => {
      const mockUser = {
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

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockLessonRepository.count.mockResolvedValue(10);
      // 3 lessons marked complete out of 10 -> 30%.
      mockLessonProgressRepository.count.mockResolvedValue(3);
      mockTrackRepository.count.mockResolvedValue(5);
      mockTrackProgressRepository.count.mockResolvedValue(2);
      mockSubmissionRepository.find.mockResolvedValue(mockSubmissions);

      const result = await service.getStats('u_123');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'u_123' },
      });
      // Completion must count only lessons with completedAt set.
      expect(mockLessonProgressRepository.count).toHaveBeenCalledWith({
        where: { userId: 'u_123', completedAt: Not(IsNull()) },
      });
      // Completed tracks must filter on the COMPLETED status.
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
      mockUserRepository.findOne.mockResolvedValue({
        id: 'u_123',
        level: 1,
        xp: 0,
        streakDays: 0,
      });
      mockLessonRepository.count.mockResolvedValue(3);
      // 1 of 3 -> 33.33% -> 33.
      mockLessonProgressRepository.count.mockResolvedValue(1);
      mockTrackRepository.count.mockResolvedValue(0);
      mockTrackProgressRepository.count.mockResolvedValue(0);
      mockSubmissionRepository.find.mockResolvedValue([]);

      const result = await service.getStats('u_123');
      expect(result.overallCompletion).toBe(33);
    });

    it('should not count in-progress lessons toward completion', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        id: 'u_123',
        level: 1,
        xp: 0,
        streakDays: 0,
      });
      mockLessonRepository.count.mockResolvedValue(10);
      // Repo is queried with the completedAt filter, so in-progress rows are
      // already excluded — 0 completed -> 0%.
      mockLessonProgressRepository.count.mockResolvedValue(0);
      mockTrackRepository.count.mockResolvedValue(0);
      mockTrackProgressRepository.count.mockResolvedValue(0);
      mockSubmissionRepository.find.mockResolvedValue([]);

      const result = await service.getStats('u_123');
      expect(result.overallCompletion).toBe(0);
    });

    it('should handle zero total lessons without dividing by zero', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        id: 'u_123',
        level: 1,
        xp: 100,
        streakDays: 1,
      });
      mockLessonRepository.count.mockResolvedValue(0);
      mockLessonProgressRepository.count.mockResolvedValue(0);
      mockTrackRepository.count.mockResolvedValue(0);
      mockTrackProgressRepository.count.mockResolvedValue(0);
      mockSubmissionRepository.find.mockResolvedValue([]);

      const result = await service.getStats('u_123');
      expect(result.overallCompletion).toBe(0);
    });
  });
});
