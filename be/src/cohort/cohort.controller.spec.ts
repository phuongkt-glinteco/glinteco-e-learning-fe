import { Test, TestingModule } from '@nestjs/testing';
import { CohortController } from './cohort.controller';
import { CohortService } from './cohort.service';
import { CreateCohortDto } from './dto/create-cohort.dto';
import { UpdateCohortDto } from './dto/update-cohort.dto';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../modules/auth/guards/roles.guard';

describe('CohortController', () => {
  let controller: CohortController;

  const mockCohortService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockJwtAuthGuard = { canActivate: jest.fn(() => true) };
  const mockRolesGuard = { canActivate: jest.fn(() => true) };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CohortController],
      providers: [
        {
          provide: CohortService,
          useValue: mockCohortService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<CohortController>(CohortController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call cohortService.create', async () => {
      const dto: CreateCohortDto = { name: 'Batch 1', targetRampDays: 30 };
      const expectedCohort = { id: 'uuid-1', ...dto, isActive: true };
      mockCohortService.create.mockResolvedValue(expectedCohort);

      const result = await controller.create(dto);
      expect(mockCohortService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedCohort);
    });
  });

  describe('findAll', () => {
    it('should call cohortService.findAll', async () => {
      const expectedResult = {
        data: [
          { id: 'uuid-1', name: 'Batch 1', targetRampDays: 30, isActive: true },
        ],
        meta: { total: 1, page: 1, limit: 20, lastPage: 1 },
      };
      mockCohortService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll('1', '20');
      expect(mockCohortService.findAll).toHaveBeenCalledWith(1, 20);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should call cohortService.findOne', async () => {
      const expectedCohort = {
        id: 'uuid-1',
        name: 'Batch 1',
        targetRampDays: 30,
        isActive: true,
      };
      mockCohortService.findOne.mockResolvedValue(expectedCohort);

      const result = await controller.findOne('uuid-1');
      expect(mockCohortService.findOne).toHaveBeenCalledWith('uuid-1');
      expect(result).toEqual(expectedCohort);
    });
  });

  describe('update', () => {
    it('should call cohortService.update', async () => {
      const dto: UpdateCohortDto = { name: 'Batch 1 Updated' };
      const expectedCohort = {
        id: 'uuid-1',
        name: 'Batch 1 Updated',
        targetRampDays: 30,
        isActive: true,
      };
      mockCohortService.update.mockResolvedValue(expectedCohort);

      const result = await controller.update('uuid-1', dto);
      expect(mockCohortService.update).toHaveBeenCalledWith('uuid-1', dto);
      expect(result).toEqual(expectedCohort);
    });
  });

  describe('remove', () => {
    it('should call cohortService.remove', async () => {
      mockCohortService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('uuid-1');
      expect(mockCohortService.remove).toHaveBeenCalledWith('uuid-1');
      expect(result).toBeUndefined();
    });
  });
});
