import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from '../../database/entities/user.entity';
import { Lesson } from '../../database/entities/lesson.entity';
import { Submission, SubmissionStatus } from '../../database/entities/submission.entity';
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

  const mockSubmissionRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Lesson),
          useValue: mockLessonRepository,
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
        lessonProgresses: [
          { id: 'lp1' },
          { id: 'lp2' },
          { id: 'lp3' },
        ],
        trackProgresses: [
          { id: 'tp1', status: 'completed' },
          { id: 'tp2', status: 'in_progress' },
        ],
      };

      const mockSubmissions = [
        { id: 's1', status: SubmissionStatus.APPROVED },
        { id: 's2', status: SubmissionStatus.PENDING },
        { id: 's3', status: SubmissionStatus.APPROVED },
      ];

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      // Let's say there are 10 lessons in total. Completion = 3/10 * 100 = 30%.
      mockLessonRepository.count.mockResolvedValue(10);
      mockSubmissionRepository.find.mockResolvedValue(mockSubmissions);

      const result = await service.getStats('u_123');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'u_123' },
        relations: {
          lessonProgresses: true,
          trackProgresses: true,
        },
      });
      expect(mockLessonRepository.count).toHaveBeenCalled();
      expect(mockSubmissionRepository.find).toHaveBeenCalledWith({
        where: { userId: 'u_123' },
      });

      expect(result).toEqual({
        level: 3,
        xp: 1240,
        xpThisWeek: 0,
        streakDays: 6,
        overallCompletion: 30, // 3 / 10 * 100
        tracks: {
          completed: 1, // 1 track is 'completed'
          total: 2, // 2 tracks enrolled
        },
        exercises: {
          approved: 2, // 2 approved submissions
          total: 3, // 3 total submissions
          awaitingReview: 1, // 1 pending submission
        },
        savedDocs: {
          total: 0,
          unread: 0,
        },
      });
    });

    it('should handle zero total lessons without dividing by zero', async () => {
      const mockUser = {
        id: 'u_123',
        level: 1,
        xp: 100,
        streakDays: 1,
        lessonProgresses: [],
        trackProgresses: [],
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockLessonRepository.count.mockResolvedValue(0);
      mockSubmissionRepository.find.mockResolvedValue([]);

      const result = await service.getStats('u_123');

      expect(result.overallCompletion).toBe(0);
    });
  });
});
