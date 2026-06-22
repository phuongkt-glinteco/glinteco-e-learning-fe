import { Test, TestingModule } from '@nestjs/testing';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchResponseDto } from './dto/search-response.dto';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../modules/auth/guards/roles.guard';

describe('SearchController', () => {
  let controller: SearchController;

  const mockSearchService = {
    globalSearch: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [{ provide: SearchService, useValue: mockSearchService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SearchController>(SearchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('globalSearch', () => {
    it('should delegate globalSearch to SearchService', async () => {
      const query: SearchQueryDto = { q: 'react' };
      const expectedResult: SearchResponseDto = {
        tracks: [],
        documents: [],
        exercises: [],
      };

      mockSearchService.globalSearch.mockResolvedValue(expectedResult);

      const result = await controller.globalSearch(query);

      expect(mockSearchService.globalSearch).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResult);
    });
  });
});
