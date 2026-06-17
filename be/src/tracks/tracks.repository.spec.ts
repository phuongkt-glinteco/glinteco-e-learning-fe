import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, In } from 'typeorm';
import { TracksRepository } from './tracks.repository';
import { Track } from '../database/entities/track.entity';

describe('TracksRepository', () => {
  let repository: TracksRepository;

  const mockRepository = {
    count: jest.fn(),
    find: jest.fn(),
  };

  const mockManager = {
    update: jest.fn(),
  };

  const mockDataSource = {
    getRepository: jest.fn().mockReturnValue(mockRepository),
    transaction: jest
      .fn()
      .mockImplementation((cb: (manager: typeof mockManager) => unknown) =>
        cb(mockManager),
      ),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TracksRepository,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    repository = module.get<TracksRepository>(TracksRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
    expect(mockDataSource.getRepository).toHaveBeenCalledWith(Track);
  });

  describe('count', () => {
    it('returns the total number of tracks', async () => {
      mockRepository.count.mockResolvedValue(5);
      const result = await repository.count();
      expect(result).toBe(5);
      expect(mockRepository.count).toHaveBeenCalled();
    });
  });

  describe('findByIds', () => {
    it('returns empty array if ids list is empty', async () => {
      const result = await repository.findByIds([]);
      expect(result).toEqual([]);
      expect(mockRepository.find).not.toHaveBeenCalled();
    });

    it('queries the database for matching tracks', async () => {
      const tracks = [{ id: 'id-1' } as Track, { id: 'id-2' } as Track];
      mockRepository.find.mockResolvedValue(tracks);

      const result = await repository.findByIds(['id-1', 'id-2']);
      expect(result).toEqual(tracks);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { id: In(['id-1', 'id-2']) },
      });
    });
  });

  describe('applyOrder', () => {
    it('runs updates inside a transaction and returns total affected rows', async () => {
      mockManager.update.mockResolvedValueOnce({ affected: 1 });
      mockManager.update.mockResolvedValueOnce({ affected: 1 });

      const result = await repository.applyOrder(['id-1', 'id-2']);

      expect(result).toBe(2);
      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(mockManager.update).toHaveBeenNthCalledWith(
        1,
        Track,
        { id: 'id-1' },
        { order: 1 },
      );
      expect(mockManager.update).toHaveBeenNthCalledWith(
        2,
        Track,
        { id: 'id-2' },
        { order: 2 },
      );
    });

    it('handles missing affected count safely', async () => {
      mockManager.update.mockResolvedValueOnce({}); // no affected returned
      const result = await repository.applyOrder(['id-1']);
      expect(result).toBe(0);
    });
  });
});
