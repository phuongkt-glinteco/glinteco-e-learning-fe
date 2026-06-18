import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';
import { SubmissionStatus } from '../database/entities/submission.entity';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../modules/auth/guards/roles.guard';

describe('SubmissionsController', () => {
  let controller: SubmissionsController;

  const mockSubmissionsService = {
    findExercises: jest.fn(),
    submit: jest.fn(),
    resubmit: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    review: jest.fn(),
    findHistory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubmissionsController],
      providers: [
        { provide: SubmissionsService, useValue: mockSubmissionsService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SubmissionsController>(SubmissionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findExercises', () => {
    it('should delegate findExercises to service', async () => {
      const req = { user: { id: 'user-1', role: 'learner' } };
      mockSubmissionsService.findExercises.mockResolvedValue({ data: [] });

      const result = await controller.findExercises('track-1', req);
      expect(mockSubmissionsService.findExercises).toHaveBeenCalledWith(
        'track-1',
        'user-1',
      );
      expect(result).toEqual({ data: [] });
    });
  });

  describe('submit', () => {
    it('should delegate submit to service', async () => {
      const req = { user: { id: 'user-1', role: 'learner' } };
      const dto = { prUrl: 'https://github.com/pr/1' };
      mockSubmissionsService.submit.mockResolvedValue({ id: 'sub-1' });

      const result = await controller.submit('ex-1', dto, req);
      expect(mockSubmissionsService.submit).toHaveBeenCalledWith(
        'ex-1',
        'user-1',
        dto.prUrl,
      );
      expect(result).toEqual({ id: 'sub-1' });
    });
  });

  describe('resubmit', () => {
    it('should delegate resubmit to service', async () => {
      const req = { user: { id: 'user-1', role: 'learner' } };
      const dto = { prUrl: 'https://github.com/pr/2' };
      mockSubmissionsService.resubmit.mockResolvedValue({ id: 'sub-1' });

      const result = await controller.resubmit('ex-1', dto, req);
      expect(mockSubmissionsService.resubmit).toHaveBeenCalledWith(
        'ex-1',
        'user-1',
        dto.prUrl,
      );
      expect(result).toEqual({ id: 'sub-1' });
    });
  });

  describe('findAll', () => {
    it('should delegate findAll to service', async () => {
      const query = { status: SubmissionStatus.SUBMITTED };
      mockSubmissionsService.findAll.mockResolvedValue({ data: [] });

      const result = await controller.findAll(query);
      expect(mockSubmissionsService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual({ data: [] });
    });
  });

  describe('findMine', () => {
    it('should delegate findAll with userId filter to service', async () => {
      const req = { user: { id: 'user-1', role: 'learner' } };
      mockSubmissionsService.findAll.mockResolvedValue({ data: [] });

      const result = await controller.findMine(req);
      expect(mockSubmissionsService.findAll).toHaveBeenCalledWith({
        userId: 'user-1',
      });
      expect(result).toEqual({ data: [] });
    });
  });

  describe('findOne', () => {
    it('should delegate findOne to service', async () => {
      const req = { user: { id: 'user-1', role: 'learner' } };
      mockSubmissionsService.findOne.mockResolvedValue({ id: 'sub-1' });

      const result = await controller.findOne('sub-1', req);
      expect(mockSubmissionsService.findOne).toHaveBeenCalledWith(
        'sub-1',
        'user-1',
        'learner',
      );
      expect(result).toEqual({ id: 'sub-1' });
    });
  });

  describe('review', () => {
    it('should delegate review to service', async () => {
      const req = { user: { id: 'admin-1', role: 'admin' } };
      const dto = { status: SubmissionStatus.APPROVED, comment: 'Good' };
      mockSubmissionsService.review.mockResolvedValue({ id: 'sub-1' });

      const result = await controller.review('sub-1', dto, req);
      expect(mockSubmissionsService.review).toHaveBeenCalledWith(
        'sub-1',
        'admin-1',
        dto.status,
        dto.comment,
      );
      expect(result).toEqual({ id: 'sub-1' });
    });
  });

  describe('approve', () => {
    it('should delegate review with APPROVED to service', async () => {
      const req = { user: { id: 'admin-1', role: 'admin' } };
      const body = { comment: 'Approve' };
      mockSubmissionsService.review.mockResolvedValue({ id: 'sub-1' });

      const result = await controller.approve('sub-1', body, req);
      expect(mockSubmissionsService.review).toHaveBeenCalledWith(
        'sub-1',
        'admin-1',
        SubmissionStatus.APPROVED,
        body.comment,
      );
      expect(result).toEqual({ id: 'sub-1' });
    });
  });

  describe('requestChanges', () => {
    it('should delegate review with CHANGES to service', async () => {
      const req = { user: { id: 'admin-1', role: 'admin' } };
      const body = { comment: 'Fix stuff' };
      mockSubmissionsService.review.mockResolvedValue({ id: 'sub-1' });

      const result = await controller.requestChanges('sub-1', body, req);
      expect(mockSubmissionsService.review).toHaveBeenCalledWith(
        'sub-1',
        'admin-1',
        SubmissionStatus.CHANGES,
        body.comment,
      );
      expect(result).toEqual({ id: 'sub-1' });
    });
  });

  describe('findHistory', () => {
    it('should delegate findHistory to service', async () => {
      const req = { user: { id: 'user-1', role: 'learner' } };
      mockSubmissionsService.findHistory.mockResolvedValue({ data: [] });

      const result = await controller.findHistory('sub-1', req);
      expect(mockSubmissionsService.findHistory).toHaveBeenCalledWith(
        'sub-1',
        'user-1',
        'learner',
      );
      expect(result).toEqual({ data: [] });
    });
  });
});
