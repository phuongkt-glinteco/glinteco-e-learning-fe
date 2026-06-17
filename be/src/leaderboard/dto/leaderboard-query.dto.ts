import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum LeaderboardScope {
  COHORT = 'cohort',
  GLOBAL = 'global',
}

export class LeaderboardQueryDto {
  @ApiPropertyOptional({
    description: 'Lọc bảng xếp hạng theo khóa học (cohort) cụ thể.',
    example: '5a9bfabb-1862-46a1-bfcd-03d4c7c0051d',
  })
  @IsOptional()
  @IsUUID('4', { message: 'cohortId phải là UUID hợp lệ' })
  cohortId?: string;

  @ApiPropertyOptional({
    description:
      'Phạm vi bảng xếp hạng (cohort hoặc global). Nếu chọn cohort mà không truyền cohortId, hệ thống tự động lấy cohort của học viên hiện tại.',
    enum: LeaderboardScope,
    default: LeaderboardScope.GLOBAL,
    example: LeaderboardScope.GLOBAL,
  })
  @IsOptional()
  @IsEnum(LeaderboardScope, { message: 'scope phải là cohort hoặc global' })
  scope?: LeaderboardScope = LeaderboardScope.GLOBAL;

  @ApiPropertyOptional({
    description:
      'Số lượng học viên hiển thị tối đa trên bảng xếp hạng (1 - 100).',
    default: 10,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit phải là số nguyên' })
  @Min(1, { message: 'limit phải tối thiểu là 1' })
  @Max(100, { message: 'limit tối đa là 100' })
  limit?: number = 10;

  @ApiPropertyOptional({
    description:
      'Con trỏ base64 dùng để phân trang dựa trên (level, xp, streakDays, createdAt, id).',
    example:
      'eyJsaW1pdCI6MTAsImN1cnNvciI6eyJsZXZlbCI6MiwidHAiOjcyMCwic3RyZWFrRGF5cyI6Miwid3JlYXRlZEF0IjoiMjAyNi0wNi0xNlQxMDoxNTowMFoiLCJpZCI6InV1aWQifX0=',
  })
  @IsOptional()
  @IsString({ message: 'cursor phải là một chuỗi ký tự' })
  cursor?: string;
}
