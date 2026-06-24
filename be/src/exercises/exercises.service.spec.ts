import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ExercisesService } from './exercises.service';
import {
  Exercise,
  ExerciseDifficulty,
} from '../database/entities/exercise.entity';
import { Track } from '../database/entities/track.entity';
import { Document } from '../database/entities/document.entity';
import {
  Submission,
  SubmissionStatus,
} from '../database/entities/submission.entity';
import { NotFoundException } from '@nestjs/common';

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
  };

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
          track: { name: 'Track 1' },
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

      const result = await service.findAll({ limit: 20 }, 'user-1');
      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe('submitted');
      expect(result.data[0].prUrl).toBe('github.com/pr');
      expect(result.data[0].objectiveCount).toBe(1);
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
        track: { name: 'Track 1' },
      });
      mockSubmissionRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('ex-1', 'user-1');
      expect(result).toBeDefined();
      expect(result.status).toBe('pending');
    });

    it('should throw NotFoundException if exercise not found', async () => {
      mockExerciseRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('ex-1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
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
