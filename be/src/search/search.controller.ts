import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchResponseDto } from './dto/search-response.dto';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';

@ApiTags('search')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @ApiOperation({
    summary: 'Tìm kiếm toàn cục (⌘K) trên tracks, documents, và exercises',
  })
  @ApiResponse({
    status: 200,
    type: SearchResponseDto,
    description: 'Tìm kiếm thành công.',
  })
  @Get()
  async globalSearch(
    @Query() query: SearchQueryDto,
  ): Promise<SearchResponseDto> {
    return this.searchService.globalSearch(query);
  }
}
