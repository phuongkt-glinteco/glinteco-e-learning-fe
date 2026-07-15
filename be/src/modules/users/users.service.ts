import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, IsNull, Repository, In } from 'typeorm';
import { User, UserRole } from '../../database/entities/user.entity';
import { Lesson } from '../../database/entities/lesson.entity';
import { LessonProgress } from '../../database/entities/lesson-progress.entity';
import { Track } from '../../database/entities/track.entity';
import {
  TrackProgress,
  ProgressStatus,
} from '../../database/entities/track-progress.entity';
import {
  Submission,
  SubmissionStatus,
} from '../../database/entities/submission.entity';
import { SubmissionHistory } from '../../database/entities/submission-history.entity';
import { Notification } from '../../database/entities/notification.entity';
import { Cohort } from '../../database/entities/cohort.entity';
import { RefreshToken } from '../../database/entities/refresh-token.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { AdminUserQueryDto } from './dto/admin-user-query.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { BanUserDto } from './dto/ban-user.dto';
import * as bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(LessonProgress)
    private readonly lessonProgressRepository: Repository<LessonProgress>,
    @InjectRepository(Track)
    private readonly trackRepository: Repository<Track>,
    @InjectRepository(TrackProgress)
    private readonly trackProgressRepository: Repository<TrackProgress>,
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
    @InjectRepository(SubmissionHistory)
    private readonly submissionHistoryRepository: Repository<SubmissionHistory>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(Cohort)
    private readonly cohortRepository: Repository<Cohort>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  /**
   * Look up a user by id. The `password` hash is excluded by the entity's
   * `select: false`, so the returned record is safe to expose.
   */
  findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: { cohort: true },
    });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  /**
   * Fetch a user together with the normally-hidden `password` hash. Used only
   * by the authentication flow when a credential check is required.
   */
  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  create(data: Partial<User>): Promise<User> {
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only whitelisted, self-editable fields are applied here. `email` and
    // `role` are intentionally NOT part of UpdateProfileDto, so the global
    // ValidationPipe ({ whitelist, forbidNonWhitelisted }) rejects any attempt
    // to change them — those remain admin-only.
    if (updateProfileDto.name !== undefined) {
      user.name = updateProfileDto.name;
    }
    if (updateProfileDto.title !== undefined) {
      user.title = updateProfileDto.title;
    }
    if (updateProfileDto.avatarHue !== undefined) {
      user.avatarHue = updateProfileDto.avatarHue;
    }

    await this.userRepository.save(user);

    return {
      id: user.id,
      name: user.name,
      title: user.title,
      avatarHue: user.avatarHue,
    };
  }

  async getStats(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Curriculum completion = lessons the user has MARKED COMPLETE
    // (completedAt set) divided by the total number of lessons. A
    // LessonProgress row may exist for a lesson that is only in progress, so
    // we must filter on completedAt rather than counting every progress row.
    const totalLessons = await this.lessonRepository.count();
    const completedLessons = await this.lessonProgressRepository.count({
      where: { userId, completedAt: Not(IsNull()) },
    });
    const overallCompletion =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    // Tracks: completed by this user out of the total tracks in the system.
    const totalTracks = await this.trackRepository.count();
    const completedTracks = await this.trackProgressRepository.count({
      where: { userId, status: ProgressStatus.COMPLETED },
    });

    // Exercises (submissions) — approved / total and how many await review.
    const submissions = await this.submissionRepository.find({
      where: { userId },
    });
    const approvedCount = submissions.filter(
      (s) => s.status === SubmissionStatus.APPROVED,
    ).length;
    const pendingCount = submissions.filter(
      (s) => s.status === SubmissionStatus.PENDING,
    ).length;

    return {
      // `level` is the stored, gamification-maintained value. The spec only
      // provides data points (xp 1240 -> 3, 720 -> 2) and no XP->level
      // formula, so we do not derive it here.
      // TODO: derive level from XP once the formula is defined.
      level: user.level,
      xp: user.xp,
      // Placeholder: there is no XP transaction/event log in the schema yet,
      // so a real "this week" rollup cannot be computed.
      xpThisWeek: 0,
      streakDays: user.streakDays,
      overallCompletion,
      tracks: {
        completed: completedTracks,
        total: totalTracks,
      },
      exercises: {
        approved: approvedCount,
        total: submissions.length,
        awaitingReview: pendingCount,
      },
      // Placeholder: no bookmark/saved-document table exists in the schema yet.
      savedDocs: {
        total: 0,
        unread: 0,
      },
    };
  }

  async findAll(query: UserQueryDto) {
    const { cohortId, role, q, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.cohort', 'cohort');

    if (cohortId) {
      qb.andWhere('user.cohortId = :cohortId', { cohortId });
    }

    if (role) {
      qb.andWhere('user.role = :role', { role });
    }

    if (q) {
      qb.andWhere('(LOWER(user.name) LIKE :q OR LOWER(user.email) LIKE :q)', {
        q: `%${q.toLowerCase()}%`,
      });
    }

    const [users, total] = await qb
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const lastPage = Math.ceil(total / limit);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        lastPage,
      },
    };
  }

  async findOneOrFail(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { cohort: true },
    });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }
    return user;
  }

  resolveLevel(xp: number): number {
    if (xp >= 1200) return 3;
    if (xp >= 600) return 2;
    return 1;
  }

  async claimDailyXp(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    const now = new Date();
    const todayStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);

    if (user.lastClaimedXpAt) {
      const lastClaimed = new Date(user.lastClaimedXpAt);
      const lastClaimedUTC = new Date(
        Date.UTC(
          lastClaimed.getUTCFullYear(),
          lastClaimed.getUTCMonth(),
          lastClaimed.getUTCDate(),
        ),
      );

      if (lastClaimedUTC.getTime() >= todayStart.getTime()) {
        throw new BadRequestException('Bạn đã nhận XP ngày hôm nay rồi.');
      } else if (lastClaimedUTC.getTime() === yesterdayStart.getTime()) {
        user.streakDays += 1;
      } else {
        user.streakDays = 1;
      }
    } else {
      user.streakDays = 1;
    }

    user.lastClaimedXpAt = now;
    const xpAwarded = 50;
    user.xp += xpAwarded;
    user.level = this.resolveLevel(user.xp);

    await this.userRepository.save(user);

    return {
      success: true,
      xpAwarded,
      streakDays: user.streakDays,
      level: user.level,
      xp: user.xp,
      lastClaimedXpAt: user.lastClaimedXpAt,
    };
  }

  async adminList(query: AdminUserQueryDto) {
    const { role, q, isActive, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.cohort', 'cohort');

    if (role) {
      qb.andWhere('user.role = :role', { role });
    }

    if (isActive !== undefined) {
      const activeBool = isActive === 'true';
      qb.andWhere('user.isActive = :activeBool', { activeBool });
    }

    if (q) {
      qb.andWhere('(LOWER(user.name) LIKE :q OR LOWER(user.email) LIKE :q)', {
        q: `%${q.toLowerCase()}%`,
      });
    }

    const [users, total] = await qb
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const lastPage = Math.ceil(total / limit);

    return {
      data: users,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        lastPage,
      },
    };
  }

  async adminCreate(dto: CreateUserDto): Promise<User> {
    const existing = await this.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email đã tồn tại');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = this.userRepository.create({
      name: dto.name,
      email: dto.email,
      password: passwordHash,
      role: dto.role || UserRole.LEARNER,
      isActive: true,
    });

    const saved = await this.userRepository.save(user);
    const { password: _, ...sanitized } = saved;
    return sanitized;
  }

  async adminChangeRole(
    actingUserId: string,
    targetId: string,
    role: UserRole,
  ): Promise<User> {
    if (actingUserId === targetId) {
      throw new BadRequestException(
        'Không thể tự thay đổi vai trò của chính mình.',
      );
    }

    const user = await this.userRepository.findOne({ where: { id: targetId } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng.');
    }

    user.role = role;
    return this.userRepository.save(user);
  }

  async adminSetStatus(
    actingUserId: string,
    targetId: string,
    isActive: boolean,
  ): Promise<User> {
    if (actingUserId === targetId && isActive === false) {
      throw new BadRequestException(
        'Không thể tự khóa tài khoản của chính mình.',
      );
    }

    const user = await this.userRepository.findOne({ where: { id: targetId } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng.');
    }

    user.isActive = isActive;
    if (isActive) {
      user.banReason = null;
      user.bannedUntil = null;
    }
    return this.userRepository.save(user);
  }

  async adminBan(
    actingUserId: string,
    targetId: string,
    dto: BanUserDto,
  ): Promise<User> {
    if (actingUserId === targetId) {
      throw new BadRequestException(
        'Không thể tự khóa tài khoản của chính mình.',
      );
    }

    const user = await this.userRepository.findOne({ where: { id: targetId } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng.');
    }

    user.isActive = false;
    user.banReason = dto.reason;
    user.bannedUntil = dto.expiresAt ? new Date(dto.expiresAt) : null;
    return this.userRepository.save(user);
  }

  async adminUnban(actingUserId: string, targetId: string): Promise<User> {
    if (actingUserId === targetId) {
      throw new BadRequestException('Không thể tự thao tác trên chính mình.');
    }

    const user = await this.userRepository.findOne({ where: { id: targetId } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng.');
    }

    user.isActive = true;
    user.banReason = null;
    user.bannedUntil = null;
    return this.userRepository.save(user);
  }

  async adminUpdate(
    actingUserId: string,
    targetId: string,
    dto: UpdateUserAdminDto,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: targetId } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng.');
    }

    if (dto.role !== undefined) {
      if (actingUserId === targetId && dto.role !== user.role) {
        throw new BadRequestException(
          'Không thể tự thay đổi vai trò của chính mình.',
        );
      }
      user.role = dto.role;
    }

    if (dto.cohortId !== undefined) {
      if (dto.cohortId === null) {
        user.cohortId = null;
      } else {
        const cohort = await this.cohortRepository.findOne({
          where: { id: dto.cohortId },
        });
        if (!cohort) {
          throw new BadRequestException('Cohort không tồn tại');
        }
        user.cohortId = dto.cohortId;
      }
    }

    return this.userRepository.save(user);
  }

  async adminDelete(actingUserId: string, targetId: string): Promise<void> {
    if (actingUserId === targetId) {
      throw new BadRequestException(
        'Không thể tự xóa tài khoản của chính mình.',
      );
    }

    const user = await this.userRepository.findOne({ where: { id: targetId } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng.');
    }

    // 1. Delete refresh tokens
    await this.refreshTokenRepository.delete({ userId: targetId });

    // 2. Delete notifications
    await this.notificationRepository.delete({ userId: targetId });

    // 3. Delete submission histories linked to the user's submissions
    const userSubmissions = await this.submissionRepository.find({
      where: { userId: targetId },
      select: { id: true },
    });
    if (userSubmissions.length > 0) {
      const submissionIds = userSubmissions.map((s) => s.id);
      await this.submissionHistoryRepository.delete({
        submissionId: In(submissionIds),
      });
    }

    // 4. Set adminId to null in submission histories reviewed by this user
    await this.submissionHistoryRepository.update(
      { adminId: targetId },
      { adminId: null },
    );

    // 5. Delete user submissions
    await this.submissionRepository.delete({ userId: targetId });

    // 6. Delete lesson progress
    await this.lessonProgressRepository.delete({ userId: targetId });

    // 7. Delete track progress
    await this.trackProgressRepository.delete({ userId: targetId });

    // 8. Delete user bookmarks (join table)
    await this.userRepository.manager.query(
      'DELETE FROM "user_bookmarks" WHERE "userId" = $1',
      [targetId],
    );

    // 9. Delete user
    await this.userRepository.delete(targetId);
  }

  async adminAssignCohort(
    actingUserId: string,
    targetId: string,
    cohortId: string,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: targetId } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng.');
    }

    const cohort = await this.cohortRepository.findOne({
      where: { id: cohortId },
    });
    if (!cohort) {
      throw new NotFoundException('Cohort không tồn tại');
    }

    if (user.cohortId === cohortId) {
      throw new ConflictException('Người dùng đã ở trong cohort này');
    }

    user.cohortId = cohortId;
    return this.userRepository.save(user);
  }
}
