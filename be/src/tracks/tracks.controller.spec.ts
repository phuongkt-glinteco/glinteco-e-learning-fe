import { Test, TestingModule } from '@nestjs/testing';
import { TracksController } from './tracks.controller';
import { LessonsController } from './lessons.controller';
import { TracksService } from './tracks.service';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { ReorderTracksDto } from './dto/reorder-tracks.dto';
import { UpdateTrackProgressDto } from './dto/update-track-progress.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../modules/auth/guards/roles.guard';
import { ProgressStatus } from '../database/entities/track-progress.entity';

describe('Tracks and Lessons Controllers', () => {
  let tracksController: TracksController;
  let lessonsController: LessonsController;

  const mockTracksService = {
    findAll: jest.fn(),
    reorder: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    updateTrackProgress: jest.fn(),
    findLessons: jest.fn(),
    createLesson: jest.fn(),
    updateLesson: jest.fn(),
    deleteLesson: jest.fn(),
    completeLesson: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TracksController, LessonsController],
      providers: [{ provide: TracksService, useValue: mockTracksService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    tracksController = module.get<TracksController>(TracksController);
    lessonsController = module.get<LessonsController>(LessonsController);
  });

  it('should be defined', () => {
    expect(tracksController).toBeDefined();
    expect(lessonsController).toBeDefined();
  });

  describe('TracksController', () => {
    it('should delegate findAll to service with default pagination query params', async () => {
      const req = { user: { id: 'user-1', role: 'learner' } };
      mockTracksService.findAll.mockResolvedValue({ data: [] });

      const result = await tracksController.findAll(req);
      expect(mockTracksService.findAll).toHaveBeenCalledWith('user-1', 1, 20);
      expect(result).toEqual({ data: [] });
    });

    it('should delegate findAll to service with custom pagination query params', async () => {
      const req = { user: { id: 'user-1', role: 'learner' } };
      mockTracksService.findAll.mockResolvedValue({ data: [] });

      const result = await tracksController.findAll(req, '2', '10');
      expect(mockTracksService.findAll).toHaveBeenCalledWith('user-1', 2, 10);
      expect(result).toEqual({ data: [] });
    });

    it('should delegate reorder to service', async () => {
      const dto: ReorderTracksDto = { order: ['id-1', 'id-2'] };
      mockTracksService.reorder.mockResolvedValue({
        message: 'Tracks reordered',
      });

      const result = await tracksController.reorder(dto);
      expect(mockTracksService.reorder).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ message: 'Tracks reordered' });
    });

    it('should delegate findOne to service', async () => {
      const req = { user: { id: 'user-1', role: 'learner' } };
      mockTracksService.findOne.mockResolvedValue({ id: 'track-1' });

      const result = await tracksController.findOne('track-1', req);
      expect(mockTracksService.findOne).toHaveBeenCalledWith(
        'track-1',
        'user-1',
      );
      expect(result).toEqual({ id: 'track-1' });
    });

    it('should delegate create to service', async () => {
      const dto: CreateTrackDto = {
        title: 'New Track',
        description: 'New Track Description',
        estimatedTime: '2h',
        lessonCount: 4,
      };
      mockTracksService.create.mockResolvedValue({ id: 'track-1' });

      const result = await tracksController.create(dto);
      expect(mockTracksService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: 'track-1' });
    });

    it('should delegate update to service', async () => {
      const dto: UpdateTrackDto = { title: 'Updated Track' };
      mockTracksService.update.mockResolvedValue({ id: 'track-1' });

      const result = await tracksController.update('track-1', dto);
      expect(mockTracksService.update).toHaveBeenCalledWith('track-1', dto);
      expect(result).toEqual({ id: 'track-1' });
    });

    it('should delegate delete to service', async () => {
      mockTracksService.delete.mockResolvedValue(undefined);
      await tracksController.delete('track-1');
      expect(mockTracksService.delete).toHaveBeenCalledWith('track-1');
    });

    it('should delegate updateProgress to service', async () => {
      const req = { user: { id: 'user-1', role: 'learner' } };
      const dto: UpdateTrackProgressDto = {
        status: ProgressStatus.IN_PROGRESS,
      };
      mockTracksService.updateTrackProgress.mockResolvedValue({
        id: 'progress-1',
      });

      const result = await tracksController.updateProgress('track-1', req, dto);
      expect(mockTracksService.updateTrackProgress).toHaveBeenCalledWith(
        'track-1',
        'user-1',
        ProgressStatus.IN_PROGRESS,
      );
      expect(result).toEqual({ id: 'progress-1' });
    });
  });

  describe('LessonsController', () => {
    it('should delegate findLessons to service', async () => {
      const req = { user: { id: 'user-1', role: 'learner' } };
      mockTracksService.findLessons.mockResolvedValue({ data: [] });

      const result = await lessonsController.findLessons('track-1', req);
      expect(mockTracksService.findLessons).toHaveBeenCalledWith(
        'track-1',
        'user-1',
      );
      expect(result).toEqual({ data: [] });
    });

    it('should delegate createLesson to service', async () => {
      const dto: CreateLessonDto = {
        title: 'Lesson 1',
        order: 1,
        estimatedTime: '30m',
        body: 'Text',
      };
      mockTracksService.createLesson.mockResolvedValue({ id: 'lesson-1' });

      const result = await lessonsController.createLesson('track-1', dto);
      expect(mockTracksService.createLesson).toHaveBeenCalledWith(
        'track-1',
        dto,
      );
      expect(result).toEqual({ id: 'lesson-1' });
    });

    it('should delegate updateLesson to service', async () => {
      const dto: UpdateLessonDto = { title: 'New Lesson Name' };
      mockTracksService.updateLesson.mockResolvedValue({ id: 'lesson-1' });

      const result = await lessonsController.updateLesson('lesson-1', dto);
      expect(mockTracksService.updateLesson).toHaveBeenCalledWith(
        'lesson-1',
        dto,
      );
      expect(result).toEqual({ id: 'lesson-1' });
    });

    it('should delegate deleteLesson to service', async () => {
      mockTracksService.deleteLesson.mockResolvedValue(undefined);
      await lessonsController.deleteLesson('lesson-1');
      expect(mockTracksService.deleteLesson).toHaveBeenCalledWith('lesson-1');
    });

    it('should delegate completeLesson to service', async () => {
      const req = { user: { id: 'user-1', role: 'learner' } };
      mockTracksService.completeLesson.mockResolvedValue({
        message: 'Lesson completed',
      });

      const result = await lessonsController.completeLesson('lesson-1', req);
      expect(mockTracksService.completeLesson).toHaveBeenCalledWith(
        'lesson-1',
        'user-1',
      );
      expect(result).toEqual({ message: 'Lesson completed' });
    });
  });
});
