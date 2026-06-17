import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../database/entities/user.entity';
import {
  LeaderboardQueryDto,
  LeaderboardScope,
} from './dto/leaderboard-query.dto';

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getLeaderboard(query: LeaderboardQueryDto, userId: string) {
    const {
      cohortId: queryCohortId,
      scope = LeaderboardScope.GLOBAL,
      limit = 10,
      cursor,
    } = query;

    let cohortId = queryCohortId;
    if (scope === LeaderboardScope.COHORT && !cohortId) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      cohortId = user?.cohortId;
      if (!cohortId) {
        throw new BadRequestException(
          'Học viên hiện tại không thuộc khóa học (cohort) nào.',
        );
      }
    }

    const qb = this.userRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: UserRole.LEARNER });

    if (scope === LeaderboardScope.COHORT && cohortId) {
      qb.andWhere('user.cohortId = :cohortId', { cohortId });
    }

    // Sort order: level DESC, xp DESC, streakDays DESC, createdAt ASC, id ASC
    qb.orderBy('user.level', 'DESC')
      .addOrderBy('user.xp', 'DESC')
      .addOrderBy('user.streakDays', 'DESC')
      .addOrderBy('user.createdAt', 'ASC')
      .addOrderBy('user.id', 'ASC');

    // Keyset pagination cursor filter
    if (cursor) {
      try {
        const decoded = JSON.parse(
          Buffer.from(cursor, 'base64').toString('ascii'),
        ) as {
          level?: number;
          xp?: number;
          streakDays?: number;
          createdAt?: string;
          id?: string;
        };
        const { level, xp, streakDays, createdAt, id } = decoded;

        if (
          level !== undefined &&
          xp !== undefined &&
          streakDays !== undefined &&
          createdAt &&
          id
        ) {
          qb.andWhere(
            `(user.level < :level OR
              (user.level = :level AND user.xp < :xp) OR
              (user.level = :level AND user.xp = :xp AND user.streakDays < :streakDays) OR
              (user.level = :level AND user.xp = :xp AND user.streakDays = :streakDays AND user.createdAt > :createdAt) OR
              (user.level = :level AND user.xp = :xp AND user.streakDays = :streakDays AND user.createdAt = :createdAt AND user.id > :id))`,
            {
              level,
              xp,
              streakDays,
              createdAt: new Date(createdAt),
              id,
            },
          );
        }
      } catch {
        // Ignore invalid cursor
      }
    }

    qb.take(limit + 1);

    const results = await qb.getMany();

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;

    let nextCursor: string | null = null;
    if (hasMore && data.length > 0) {
      const lastItem = data[data.length - 1];
      nextCursor = Buffer.from(
        JSON.stringify({
          level: lastItem.level,
          xp: lastItem.xp,
          streakDays: lastItem.streakDays,
          createdAt: lastItem.createdAt.toISOString(),
          id: lastItem.id,
        }),
      ).toString('base64');
    }

    // Calculate ranks dynamically
    let startRank = 1;
    if (data.length > 0) {
      const firstItem = data[0];
      const countQb = this.userRepository
        .createQueryBuilder('user')
        .where('user.role = :role', { role: UserRole.LEARNER });

      if (scope === LeaderboardScope.COHORT && cohortId) {
        countQb.andWhere('user.cohortId = :cohortId', { cohortId });
      }

      const higherCount = await countQb
        .andWhere(
          `(user.level > :level OR
            (user.level = :level AND user.xp > :xp) OR
            (user.level = :level AND user.xp = :xp AND user.streakDays > :streakDays) OR
            (user.level = :level AND user.xp = :xp AND user.streakDays = :streakDays AND user.createdAt < :createdAt) OR
            (user.level = :level AND user.xp = :xp AND user.streakDays = :streakDays AND user.createdAt = :createdAt AND user.id < :id))`,
          {
            level: firstItem.level,
            xp: firstItem.xp,
            streakDays: firstItem.streakDays,
            createdAt: firstItem.createdAt,
            id: firstItem.id,
          },
        )
        .getCount();

      startRank = higherCount + 1;
    }

    const resolvedEntries = data.map((user, index) => ({
      userId: user.id,
      name: user.name,
      level: user.level,
      xp: user.xp,
      streakDays: user.streakDays,
      rank: startRank + index,
    }));

    return {
      data: resolvedEntries,
      nextCursor,
      hasMore,
    };
  }
}
