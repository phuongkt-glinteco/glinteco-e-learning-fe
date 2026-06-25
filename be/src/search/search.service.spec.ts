import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SearchService } from './search.service';
import { Track } from '../database/entities/track.entity';
import { Document, DocumentKind } from '../database/entities/document.entity';
import { Exercise } from '../database/entities/exercise.entity';
import { SearchQueryDto } from './dto/search-query.dto';

describe('SearchService', () => {
  let service: SearchService;

  const mockTrackRepository = {
    find: jest.fn(),
  };

  const mockDocumentRepository = {
    find: jest.fn(),
  };

  const mockExerciseRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: getRepositoryToken(Track), useValue: mockTrackRepository },
        {
          provide: getRepositoryToken(Document),
          useValue: mockDocumentRepository,
        },
        {
          provide: getRepositoryToken(Exercise),
          useValue: mockExerciseRepository,
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('globalSearch', () => {
    it('should find tracks, documents, and exercises matching ILike search term', async () => {
      const query: SearchQueryDto = { q: 'react' };
      const tracks = [{ id: 'track-1', title: 'React Track' }];
      const documents = [
        { id: 'doc-1', title: 'React Documentation', kind: DocumentKind.GUIDE },
      ];
      const exercises = [
        {
          id: 'ex-1',
          title: 'React Basics Exercise',
          track: { title: 'React Track' },
        },
      ];

      mockTrackRepository.find.mockResolvedValue(tracks);
      mockDocumentRepository.find.mockResolvedValue(documents);
      mockExerciseRepository.find.mockResolvedValue(exercises);

      const result = await service.globalSearch(query);

      expect(mockTrackRepository.find).toHaveBeenCalled();
      expect(mockDocumentRepository.find).toHaveBeenCalled();
      expect(mockExerciseRepository.find).toHaveBeenCalled();

      expect(result.tracks).toHaveLength(1);
      expect(result.tracks[0]).toEqual({ id: 'track-1', title: 'React Track' });
      expect(result.documents).toHaveLength(1);
      expect(result.documents[0]).toEqual({
        id: 'doc-1',
        title: 'React Documentation',
        kind: DocumentKind.GUIDE,
      });
      expect(result.exercises).toHaveLength(1);
      expect(result.exercises[0]).toEqual({
        id: 'ex-1',
        title: 'React Basics Exercise',
        tag: 'React Track',
      });
    });

    it('should handle exercise with no track', async () => {
      const query: SearchQueryDto = { q: 'react' };
      const exercises = [{ id: 'ex-1', title: 'React Exercise', track: null }];

      mockTrackRepository.find.mockResolvedValue([]);
      mockDocumentRepository.find.mockResolvedValue([]);
      mockExerciseRepository.find.mockResolvedValue(exercises);

      const result = await service.globalSearch(query);
      expect(result.exercises[0].tag).toBe('N/A');
    });
  });
});
