import { ApiProperty } from '@nestjs/swagger';

class SubStatsDto {
  @ApiProperty()
  completed: number;

  @ApiProperty()
  total: number;
}

class ExerciseStatsDto {
  @ApiProperty()
  approved: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  awaitingReview: number;
}

class SavedDocsStatsDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  unread: number;
}

export class UserDashboardStatsDto {
  @ApiProperty()
  level: number;

  @ApiProperty()
  xp: number;

  @ApiProperty()
  xpThisWeek: number;

  @ApiProperty()
  streakDays: number;

  @ApiProperty()
  overallCompletion: number;

  @ApiProperty({ type: SubStatsDto })
  tracks: SubStatsDto;

  @ApiProperty({ type: ExerciseStatsDto })
  exercises: ExerciseStatsDto;

  @ApiProperty({ type: SavedDocsStatsDto })
  savedDocs: SavedDocsStatsDto;
}
