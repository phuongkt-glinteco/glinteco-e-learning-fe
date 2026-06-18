import { Test, TestingModule } from '@nestjs/testing';
import { ExercisesController } from './exercises.controller';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExerciseDifficulty } from '../database/entities/exercise.entity';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../modules/auth/guards/roles.guard';
import { User, UserRole } from '../database/entities/user.entity';

describe('ExercisesController', () => {
  let controller: ExercisesController;

  const mockExercisesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockJwtAuthGuard = { canActivate: jest.fn(() => true) };
  const mockRolesGuard = { canActivate: jest.fn(() => true) };

  const mockUser = {
    id: 'user-123',
    role: UserRole.LEARNER,
  } as User;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExercisesController],
      providers: [
        {
          provide: ExercisesService,
          useValue: mockExercisesService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<ExercisesController>(ExercisesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create', async () => {
      const dto: CreateExerciseDto = {
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
      };
      mockExercisesService.create.mockResolvedValue({ id: 'ex-1', ...dto });

      const result = await controller.create(dto);
      expect(mockExercisesService.create).toHaveBeenCalledWith(dto);
      expect(result.id).toBe('ex-1');
    });
  });

  describe('findAll', () => {
    it('should call service.findAll', async () => {
      const query = { limit: 20 };
      mockExercisesService.findAll.mockResolvedValue({ data: [] });

      const result = await controller.findAll(query, mockUser);
      expect(mockExercisesService.findAll).toHaveBeenCalledWith(query, mockUser.id);
      expect(result).toEqual({ data: [] });
    });
  });

  describe('findOne', () => {
    it('should call service.findOne', async () => {
      mockExercisesService.findOne.mockResolvedValue({ id: 'ex-1' });

      const result = await controller.findOne('ex-1', mockUser);
      expect(mockExercisesService.findOne).toHaveBeenCalledWith('ex-1', mockUser.id);
      expect(result).toEqual({ id: 'ex-1' });
    });
  });

  describe('update', () => {
    it('should call service.update', async () => {
      const dto: UpdateExerciseDto = { title: 'Updated' };
      mockExercisesService.update.mockResolvedValue({ id: 'ex-1', title: 'Updated' });

      const result = await controller.update('ex-1', dto);
      expect(mockExercisesService.update).toHaveBeenCalledWith('ex-1', dto);
      expect(result.title).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should call service.remove', async () => {
      mockExercisesService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('ex-1');
      expect(mockExercisesService.remove).toHaveBeenCalledWith('ex-1');
      expect(result).toBeUndefined();
    });
  });
});
