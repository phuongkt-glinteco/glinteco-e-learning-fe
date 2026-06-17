import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TracksService } from './tracks.service';
import { TracksRepository } from './tracks.repository';
import { Track } from '../database/entities/track.entity';

describe('TracksService', () => {
  let service: TracksService;

  const mockTracksRepository = {
    findByIds: jest.fn(),
    count: jest.fn(),
    applyOrder: jest.fn(),
  };

  const makeTrack = (id: string): Track => ({ id }) as Track;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TracksService,
        { provide: TracksRepository, useValue: mockTracksRepository },
      ],
    }).compile();

    service = module.get<TracksService>(TracksService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('reorder', () => {
    const id1 = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const id2 = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';

    it('reorders all tracks and returns the count', async () => {
      mockTracksRepository.findByIds.mockResolvedValue([
        makeTrack(id1),
        makeTrack(id2),
      ]);
      mockTracksRepository.count.mockResolvedValue(2);
      mockTracksRepository.applyOrder.mockResolvedValue(2);

      const result = await service.reorder({ order: [id2, id1] });

      expect(mockTracksRepository.applyOrder).toHaveBeenCalledWith([id2, id1]);
      expect(result).toEqual({ message: 'Tracks reordered', count: 2 });
    });

    it('throws NotFoundException when a track id does not exist', async () => {
      mockTracksRepository.findByIds.mockResolvedValue([makeTrack(id1)]);
      mockTracksRepository.count.mockResolvedValue(2);

      await expect(service.reorder({ order: [id1, id2] })).rejects.toThrow(
        NotFoundException,
      );
      expect(mockTracksRepository.applyOrder).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when the payload omits some tracks', async () => {
      mockTracksRepository.findByIds.mockResolvedValue([makeTrack(id1)]);
      mockTracksRepository.count.mockResolvedValue(2);

      await expect(service.reorder({ order: [id1] })).rejects.toThrow(
        BadRequestException,
      );
      expect(mockTracksRepository.applyOrder).not.toHaveBeenCalled();
    });
  });
});
