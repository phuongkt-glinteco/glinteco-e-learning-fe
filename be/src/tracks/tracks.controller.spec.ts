import { Test, TestingModule } from '@nestjs/testing';
import { TracksController } from './tracks.controller';
import { TracksService } from './tracks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ReorderTracksDto } from './dto/reorder-tracks.dto';

describe('TracksController', () => {
  let controller: TracksController;

  const mockTracksService = {
    reorder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TracksController],
      providers: [{ provide: TracksService, useValue: mockTracksService }],
    })
      // The reorder route is guarded, but the controller unit test only checks
      // delegation — override both guards to no-ops.
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TracksController>(TracksController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('reorder', () => {
    it('delegates to tracksService.reorder and returns the result', async () => {
      const dto: ReorderTracksDto = {
        order: [
          'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        ],
      };
      const expected = { message: 'Tracks reordered', count: 2 };
      mockTracksService.reorder.mockResolvedValue(expected);

      const result = await controller.reorder(dto);

      expect(mockTracksService.reorder).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });
});
