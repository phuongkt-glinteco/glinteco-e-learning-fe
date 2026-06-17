import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CohortService } from './cohort.service';
import { Cohort } from '../database/entities/cohort.entity';
import { User } from '../database/entities/user.entity';
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
});
