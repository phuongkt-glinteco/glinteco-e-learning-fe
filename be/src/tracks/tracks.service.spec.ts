import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TracksService } from './tracks.service';
import { Track } from '../database/entities/track.entity';
import {
  TrackProgress,
  ProgressStatus,
} from '../database/entities/track-progress.entity';
import { Lesson } from '../database/entities/lesson.entity';
import { LessonProgress } from '../database/entities/lesson-progress.entity';
import { User } from '../database/entities/user.entity';
import { CreateTrackDto } from './dto/create-track.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { ReorderTracksDto } from './dto/reorder-tracks.dto';
import { NotFoundException } from '@nestjs/common';

export interface ProgressInfo {
  lessonsCompleted: number;
  status: string;
}
export interface TrackInfo {
  id: string;
  name: string;
  order: number;
  lessonsCount: number;
  progress: ProgressInfo;
}

describe('TracksService', () => {
  let service: TracksService;

  const mockEntityManager = {
    update: jest.fn(),
    delete: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({}),
    })),
  };

  const mockTrackRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
    manager: {
      transaction: jest
        .fn()
        .mockImplementation(
          async <T>(
            cb: (mgr: typeof mockEntityManager) => Promise<T>,
          ): Promise<T> => {
            return cb(mockEntityManager);
          },
        ),
    },
  };

  const mockTrackProgressRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockLessonRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
    manager: {
      transaction: jest
        .fn()
        .mockImplementation(
          async <T>(
            cb: (mgr: typeof mockEntityManager) => Promise<T>,
          ): Promise<T> => {
            return cb(mockEntityManager);
          },
        ),
    },
  };

  const mockLessonProgressRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TracksService,
        { provide: getRepositoryToken(Track), useValue: mockTrackRepository },
        {
          provide: getRepositoryToken(TrackProgress),
          useValue: mockTrackProgressRepository,
        },
        { provide: getRepositoryToken(Lesson), useValue: mockLessonRepository },
        {
          provide: getRepositoryToken(LessonProgress),
          useValue: mockLessonProgressRepository,
        },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<TracksService>(TracksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all tracks with dynamic progress', async () => {
      const tracks = [
        {
          id: 'track-1',
          name: 'Track 1',
          order: 1,
          lessons: [{ id: 'lesson-1' }],
        },
        {
          id: 'track-2',
          name: 'Track 2',
          order: 2,
          lessons: [{ id: 'lesson-2' }],
        },
      ];
      mockTrackRepository.find.mockResolvedValue(tracks);
      mockTrackProgressRepository.find.mockResolvedValue([]);
      mockLessonProgressRepository.find.mockResolvedValue([
        { lessonId: 'lesson-1', completedAt: new Date() },
      ]);

      const result = await service.findAll('user-1');

      expect(result.data).toHaveLength(2);
      expect(result.data[0].progress.status).toBe('completed');
      expect(result.data[1].progress.status).toBe('in_progress');
    });
  });

  describe('findOne', () => {
    it('should return a single track details using existing progress record', async () => {
      const track = { id: 'track-1', name: 'Track 1', order: 1, lessons: [] };
      mockTrackRepository.findOne.mockResolvedValue(track);
      mockTrackProgressRepository.findOne.mockResolvedValue({
        status: ProgressStatus.COMPLETED,
      });
      mockLessonProgressRepository.find.mockResolvedValue([]);

      const result = await service.findOne('track-1', 'user-1');
      expect(result.id).toBe('track-1');
      expect(result.progress.status).toBe('completed');
    });

    it('should resolve fallback dynamic status for non-first track if previous completed', async () => {
      const allTracks = [
        { id: 'track-1', order: 1 },
        { id: 'track-2', order: 2 },
      ];
      mockTrackRepository.findOne.mockResolvedValue(allTracks[1]);
      mockTrackProgressRepository.findOne.mockResolvedValue(null);
      mockLessonProgressRepository.find.mockResolvedValue([]);
      mockTrackRepository.find.mockResolvedValue(allTracks);
      // Mock previous progress completed
      mockTrackProgressRepository.findOne
        .mockResolvedValueOnce(null) // for track-2
        .mockResolvedValueOnce({ status: ProgressStatus.COMPLETED }); // for track-1

      const result = await service.findOne('track-2', 'user-1');
      expect(result.progress.status).toBe('in_progress');
    });

    it('should throw NotFoundException if track is not found', async () => {
      mockTrackRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('invalid-id', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create and save a new track shifting orders if order is taken', async () => {
      const dto: CreateTrackDto = { name: 'New Track', order: 3 };
      const createdTrack = {
        id: 'track-3',
        name: 'New Track',
        order: 3,
        lessonsCount: 0,
      };

      mockTrackRepository.findOne.mockResolvedValue({
        id: 'existing-track-id',
        order: 3,
      });
      mockTrackRepository.create.mockReturnValue(createdTrack);
      mockTrackRepository.save.mockResolvedValue(createdTrack);

      const result = await service.create(dto);
      expect(result).toEqual(createdTrack);
      expect(mockTrackRepository.manager.transaction).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should throw NotFoundException if track not found', async () => {
      mockTrackRepository.findOne.mockResolvedValue(null);
      await expect(service.update('invalid', {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update name only', async () => {
      const track = { id: 'track-1', name: 'Old Name', order: 1 };
      mockTrackRepository.findOne.mockResolvedValue(track);
      mockTrackRepository.save.mockImplementation((x) => Promise.resolve(x));

      const result = await service.update('track-1', { name: 'New Name' });
      expect(result.name).toBe('New Name');
    });

    it('should shift intermediate orders down if target order is greater', async () => {
      const track = { id: 'track-1', name: 'Track 1', order: 1 };
      mockTrackRepository.findOne.mockResolvedValue(track);
      mockTrackRepository.save.mockImplementation((x) => Promise.resolve(x));

      await service.update('track-1', { order: 3 });
      expect(mockTrackRepository.manager.transaction).toHaveBeenCalled();
    });

    it('should shift intermediate orders up if target order is smaller', async () => {
      const track = { id: 'track-1', name: 'Track 1', order: 3 };
      mockTrackRepository.findOne.mockResolvedValue(track);
      mockTrackRepository.save.mockImplementation((x) => Promise.resolve(x));

      await service.update('track-1', { order: 1 });
      expect(mockTrackRepository.manager.transaction).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should throw NotFoundException if track to delete not found', async () => {
      mockTrackRepository.findOne.mockResolvedValue(null);
      await expect(service.delete('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should delete a track, its lessons/progress and shift order', async () => {
      const track = { id: 'track-1', name: 'Track 1', order: 1 };
      mockTrackRepository.findOne.mockResolvedValue(track);
      mockEntityManager.find.mockResolvedValue([{ id: 'lesson-1' }]);

      await service.delete('track-1');
      expect(mockTrackRepository.manager.transaction).toHaveBeenCalled();
    });
  });

  describe('reorder', () => {
    it('should update order for tracks', async () => {
      const dto: ReorderTracksDto = { order: ['id-1', 'id-2'] };
      mockTrackRepository.find.mockResolvedValue([
        { id: 'id-1' },
        { id: 'id-2' },
      ]);

      const result = await service.reorder(dto);
      expect(result.message).toBe('Tracks reordered');
      expect(result.count).toBe(2);
    });
  });

  describe('updateTrackProgress', () => {
    it('should throw NotFoundException if track not found', async () => {
      mockTrackRepository.findOne.mockResolvedValue(null);
      await expect(
        service.updateTrackProgress(
          'invalid-id',
          'user-1',
          ProgressStatus.IN_PROGRESS,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create new progress record if not exists', async () => {
      mockTrackRepository.findOne.mockResolvedValue({ id: 'track-1' });
      mockTrackProgressRepository.findOne.mockResolvedValue(null);
      const newProgress = {
        trackId: 'track-1',
        userId: 'user-1',
        status: ProgressStatus.IN_PROGRESS,
      };
      mockTrackProgressRepository.create.mockReturnValue(newProgress);
      mockTrackProgressRepository.save.mockResolvedValue(newProgress);

      const result = await service.updateTrackProgress(
        'track-1',
        'user-1',
        ProgressStatus.IN_PROGRESS,
      );
      expect(result.status).toBe(ProgressStatus.IN_PROGRESS);
    });

    it('should update existing progress record', async () => {
      mockTrackRepository.findOne.mockResolvedValue({ id: 'track-1' });
      const existing = {
        trackId: 'track-1',
        userId: 'user-1',
        status: ProgressStatus.NOT_STARTED,
        startedAt: null,
        completedAt: null,
      };
      mockTrackProgressRepository.findOne.mockResolvedValue(existing);
      mockTrackProgressRepository.save.mockImplementation((x) =>
        Promise.resolve(x),
      );

      const result = await service.updateTrackProgress(
        'track-1',
        'user-1',
        ProgressStatus.COMPLETED,
      );
      expect(result.status).toBe(ProgressStatus.COMPLETED);
      expect(result.completedAt).toBeDefined();
    });
  });

  describe('findLessons', () => {
    it('should throw NotFoundException if track not found', async () => {
      mockTrackRepository.findOne.mockResolvedValue(null);
      await expect(service.findLessons('invalid', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return lessons belonging to track with isCompleted tags', async () => {
      mockTrackRepository.findOne.mockResolvedValue({ id: 'track-1' });
      mockLessonRepository.find.mockResolvedValue([
        { id: 'lesson-1', name: 'L1', order: 1, content: 'C' },
      ]);
      mockLessonProgressRepository.find.mockResolvedValue([
        { lessonId: 'lesson-1', completedAt: new Date() },
      ]);

      const result = await service.findLessons('track-1', 'user-1');
      expect(result.data).toHaveLength(1);
      expect(result.data[0].isCompleted).toBe(true);
    });
  });

  describe('createLesson', () => {
    it('should throw NotFoundException if track not found', async () => {
      mockTrackRepository.findOne.mockResolvedValue(null);
      await expect(
        service.createLesson('invalid', { name: 'L', order: 1, content: 'C' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should shift lessons order if order is taken and create lesson', async () => {
      const track = { id: 'track-1', lessonsCount: 0 };
      const dto: CreateLessonDto = {
        name: 'New Lesson',
        order: 1,
        content: 'Text',
      };
      const newLesson = {
        id: 'lesson-1',
        trackId: 'track-1',
        name: 'New Lesson',
        order: 1,
      };

      mockTrackRepository.findOne.mockResolvedValue(track);
      mockLessonRepository.findOne.mockResolvedValue({
        id: 'existing-lesson-id',
        order: 1,
      });
      mockLessonRepository.create.mockReturnValue(newLesson);
      mockLessonRepository.save.mockResolvedValue(newLesson);
      mockLessonRepository.count.mockResolvedValue(1);

      const result = await service.createLesson('track-1', dto);
      expect(result.id).toBe('lesson-1');
      expect(mockLessonRepository.manager.transaction).toHaveBeenCalled();
    });
  });

  describe('updateLesson', () => {
    it('should throw NotFoundException if lesson not found', async () => {
      mockLessonRepository.findOne.mockResolvedValue(null);
      await expect(service.updateLesson('invalid', {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update name/content only', async () => {
      const lesson = { id: 'lesson-1', name: 'Old L', content: 'Old C' };
      mockLessonRepository.findOne.mockResolvedValue(lesson);
      mockLessonRepository.save.mockImplementation((x) => Promise.resolve(x));

      const result = await service.updateLesson('lesson-1', {
        name: 'New L',
        content: 'New C',
      });
      expect(result.name).toBe('New L');
      expect(result.content).toBe('New C');
    });

    it('should shift intermediate orders down if target order is greater', async () => {
      const lesson = { id: 'lesson-1', order: 1, trackId: 'track-1' };
      mockLessonRepository.findOne.mockResolvedValue(lesson);
      mockLessonRepository.save.mockImplementation((x) => Promise.resolve(x));

      await service.updateLesson('lesson-1', { order: 3 });
      expect(mockLessonRepository.manager.transaction).toHaveBeenCalled();
    });

    it('should shift intermediate orders up if target order is smaller', async () => {
      const lesson = { id: 'lesson-1', order: 3, trackId: 'track-1' };
      mockLessonRepository.findOne.mockResolvedValue(lesson);
      mockLessonRepository.save.mockImplementation((x) => Promise.resolve(x));

      await service.updateLesson('lesson-1', { order: 1 });
      expect(mockLessonRepository.manager.transaction).toHaveBeenCalled();
    });
  });

  describe('deleteLesson', () => {
    it('should throw NotFoundException if lesson not found', async () => {
      mockLessonRepository.findOne.mockResolvedValue(null);
      await expect(service.deleteLesson('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should delete a lesson, its progress and update track lessonsCount', async () => {
      const lesson = { id: 'lesson-1', trackId: 'track-1', order: 2 };
      mockLessonRepository.findOne.mockResolvedValue(lesson);
      mockTrackRepository.findOne.mockResolvedValue({
        id: 'track-1',
        lessonsCount: 2,
      });
      mockLessonRepository.count.mockResolvedValue(1);

      await service.deleteLesson('lesson-1');
      expect(mockLessonRepository.manager.transaction).toHaveBeenCalled();
    });
  });

  describe('completeLesson', () => {
    it('should throw NotFoundException if lesson not found', async () => {
      mockLessonRepository.findOne.mockResolvedValue(null);
      await expect(service.completeLesson('invalid', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return early if lesson already completed', async () => {
      mockLessonRepository.findOne.mockResolvedValue({ id: 'lesson-1' });
      mockLessonProgressRepository.findOne.mockResolvedValue({
        lessonId: 'lesson-1',
        completedAt: new Date(),
      });
      mockUserRepository.findOne.mockResolvedValue({
        id: 'user-1',
        xp: 100,
        level: 1,
      });

      const result = await service.completeLesson('lesson-1', 'user-1');
      expect(result.xpAwarded).toBe(0);
      expect(result.message).toBe('Lesson already completed');
    });

    it('should complete lesson and update track progress and unlock next track', async () => {
      const lesson = { id: 'lesson-1', trackId: 'track-1' };
      const user = { id: 'user-1', xp: 1160, level: 2 };
      const currentTrack = { id: 'track-1', order: 1 };
      const nextTrack = { id: 'track-2', order: 2 };

      mockLessonRepository.findOne.mockResolvedValue(lesson);
      mockLessonProgressRepository.findOne.mockResolvedValue(null);
      mockLessonProgressRepository.create.mockReturnValue({
        lessonId: 'lesson-1',
        completedAt: new Date(),
      });
      mockLessonRepository.count.mockResolvedValue(1);
      mockLessonRepository.find.mockResolvedValue([lesson]);
      mockLessonProgressRepository.count.mockResolvedValue(1);

      mockTrackProgressRepository.findOne.mockResolvedValue(null);
      const trackProgress = {
        trackId: 'track-1',
        userId: 'user-1',
        status: ProgressStatus.COMPLETED,
      };
      mockTrackProgressRepository.create.mockReturnValue(trackProgress);

      mockTrackRepository.findOne
        .mockResolvedValueOnce(currentTrack) // first call in completeLesson for current track
        .mockResolvedValueOnce(nextTrack); // second call in completeLesson for next track

      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.completeLesson('lesson-1', 'user-1');
      expect(result.xpAwarded).toBe(40);
      expect(result.totalXp).toBe(1200);
      expect(result.level).toBe(3); // leveled up from 2 to 3
      expect(result.unlockedTrackId).toBe('track-2');
    });

    it('should complete lesson and update existing progress when track not fully completed', async () => {
      const lesson = { id: 'lesson-1', trackId: 'track-1' };
      const user = { id: 'user-1', xp: 100, level: 1 };
      const currentProgress = {
        trackId: 'track-1',
        userId: 'user-1',
        lessonsCompleted: 0,
        status: ProgressStatus.IN_PROGRESS,
      };

      mockLessonRepository.findOne.mockResolvedValue(lesson);
      mockLessonProgressRepository.findOne.mockResolvedValue(null);
      mockLessonProgressRepository.create.mockReturnValue({
        lessonId: 'lesson-1',
        completedAt: new Date(),
      });
      mockLessonRepository.count.mockResolvedValue(2); // total 2 lessons
      mockLessonRepository.find.mockResolvedValue([lesson, { id: 'lesson-2' }]);
      mockLessonProgressRepository.count.mockResolvedValue(1); // 1 lesson completed
      mockTrackProgressRepository.findOne.mockResolvedValue(currentProgress);

      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.completeLesson('lesson-1', 'user-1');
      expect(result.xpAwarded).toBe(40);
      expect(currentProgress.lessonsCompleted).toBe(1);
      expect(currentProgress.status).toBe(ProgressStatus.IN_PROGRESS);
    });

    it('should complete lesson and update existing next progress if it is not_started', async () => {
      const lesson = { id: 'lesson-1', trackId: 'track-1' };
      const user = { id: 'user-1', xp: 100, level: 1 };
      const currentTrack = { id: 'track-1', order: 1 };
      const nextTrack = { id: 'track-2', order: 2 };
      const trackProgress = {
        trackId: 'track-1',
        userId: 'user-1',
        status: ProgressStatus.COMPLETED,
      };
      const nextProgress = {
        trackId: 'track-2',
        userId: 'user-1',
        status: ProgressStatus.NOT_STARTED,
        startedAt: null,
      };

      mockLessonRepository.findOne.mockResolvedValue(lesson);
      mockLessonProgressRepository.findOne.mockResolvedValue(null);
      mockLessonProgressRepository.create.mockReturnValue({
        lessonId: 'lesson-1',
        completedAt: new Date(),
      });
      mockLessonRepository.count.mockResolvedValue(1);
      mockLessonRepository.find.mockResolvedValue([lesson]);
      mockLessonProgressRepository.count.mockResolvedValue(1);

      mockTrackProgressRepository.findOne
        .mockResolvedValueOnce(trackProgress) // check current
        .mockResolvedValueOnce(nextProgress); // check next progress

      mockTrackRepository.findOne
        .mockResolvedValueOnce(currentTrack)
        .mockResolvedValueOnce(nextTrack);

      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.completeLesson('lesson-1', 'user-1');
      expect(result.unlockedTrackId).toBe('track-2');
      expect(nextProgress.status).toBe(ProgressStatus.IN_PROGRESS);
      expect(nextProgress.startedAt).toBeDefined();
    });
  });
});
