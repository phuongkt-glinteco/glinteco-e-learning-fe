import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not, IsNull } from 'typeorm';
import { Cohort } from '../database/entities/cohort.entity';
import { User, UserRole } from '../database/entities/user.entity';
import { Track } from '../database/entities/track.entity';
import { TrackProgress, ProgressStatus } from '../database/entities/track-progress.entity';
import { Submission, SubmissionStatus } from '../database/entities/submission.entity';
import { Lesson } from '../database/entities/lesson.entity';
import { LessonProgress } from '../database/entities/lesson-progress.entity';
import { CreateCohortDto } from './dto/create-cohort.dto';
import { UpdateCohortDto } from './dto/update-cohort.dto';

@Injectable()
export class CohortService {
  constructor(
    @InjectRepository(Cohort)
    private readonly cohortRepository: Repository<Cohort>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Track)
    private readonly trackRepository: Repository<Track>,
    @InjectRepository(TrackProgress)
    private readonly trackProgressRepository: Repository<TrackProgress>,
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(LessonProgress)
    private readonly lessonProgressRepository: Repository<LessonProgress>,
  ) {}

  async create(createCohortDto: CreateCohortDto): Promise<Cohort> {
    const cohort = this.cohortRepository.create(createCohortDto);
    return this.cohortRepository.save(cohort);
  }

  async findAll(
    page = 1,
    limit = 20,
  ): Promise<{
    data: Cohort[];
    meta: { total: number; page: number; limit: number; lastPage: number };
  }> {
    const adjustedLimit = Math.min(limit, 50);
    const skip = (page - 1) * adjustedLimit;

    const [data, total] = await this.cohortRepository.findAndCount({
      skip,
      take: adjustedLimit,
      order: { createdAt: 'DESC' },
    });

    const lastPage = Math.ceil(total / adjustedLimit);

    return {
      data,
      meta: {
        total,
        page,
        limit: adjustedLimit,
        lastPage: lastPage || 1,
      },
    };
  }

  async findOne(id: string): Promise<Cohort> {
    const cohort = await this.cohortRepository.findOne({
      where: { id },
    });
    if (!cohort) {
      throw new NotFoundException(`Không tìm thấy Cohort với ID: ${id}`);
    }
    return cohort;
  }

  async update(id: string, updateCohortDto: UpdateCohortDto): Promise<Cohort> {
    const cohort = await this.findOne(id);
    Object.assign(cohort, updateCohortDto);
    return this.cohortRepository.save(cohort);
  }

  async remove(id: string): Promise<void> {
    const cohort = await this.findOne(id);

    // Check if there are users in this cohort
    const usersCount = await this.userRepository.count({
      where: { cohortId: id },
    });
    if (usersCount > 0) {
      throw new BadRequestException(
        'Không thể xóa Cohort vì đang có học viên trực thuộc.',
      );
    }

    await this.cohortRepository.remove(cohort);
  }

  async getOverview(cohortId: string) {
    const cohort = await this.findOne(cohortId);

    const learners = await this.userRepository.find({
      where: { cohortId, role: UserRole.LEARNER },
    });

    const activeLearners = learners.length;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newThisWeek = learners.filter((u) => u.createdAt >= sevenDaysAgo).length;

    const totalLessons = await this.lessonRepository.count();
    const learnerIds = learners.map((l) => l.id);

    let avgCompletion = 0;
    if (learnerIds.length > 0 && totalLessons > 0) {
      const progressCounts = await this.lessonProgressRepository
        .createQueryBuilder('progress')
        .select('progress.userId', 'userId')
        .addSelect('COUNT(*)', 'count')
        .where('progress.userId IN (:...learnerIds)', { learnerIds })
        .andWhere('progress.completedAt IS NOT NULL')
        .groupBy('progress.userId')
        .getRawMany();

      const progressMap = new Map<string, number>();
      progressCounts.forEach((p) => progressMap.set(p.userId, parseInt(p.count, 10)));

      const totalPct = learners.reduce((sum, l) => {
        const completed = progressMap.get(l.id) || 0;
        return sum + Math.round((completed / totalLessons) * 100);
      }, 0);
      avgCompletion = Math.round(totalPct / learners.length);
    }

    const pendingReview =
      learnerIds.length > 0
        ? await this.submissionRepository.count({
            where: {
              userId: In(learnerIds),
              status: SubmissionStatus.SUBMITTED,
            },
          })
        : 0;

    let oldestPendingAgo = '0m';
    if (learnerIds.length > 0) {
      const oldestSubmission = await this.submissionRepository.findOne({
        where: {
          userId: In(learnerIds),
          status: SubmissionStatus.SUBMITTED,
        },
        order: { submittedAt: 'ASC' },
      });
      if (oldestSubmission && oldestSubmission.submittedAt) {
        const diffMs = Date.now() - oldestSubmission.submittedAt.getTime();
        const diffMins = Math.max(0, Math.floor(diffMs / (1000 * 60)));
        if (diffMins < 60) {
          oldestPendingAgo = `${diffMins}m`;
        } else {
          const diffHours = Math.floor(diffMins / 60);
          if (diffHours < 24) {
            oldestPendingAgo = `${diffHours}h`;
          } else {
            const diffDays = Math.floor(diffHours / 24);
            oldestPendingAgo = `${diffDays}d`;
          }
        }
      }
    }

    const totalTracksCount = await this.trackRepository.count();
    let avgRampDays = 0;
    if (learnerIds.length > 0 && totalTracksCount > 0) {
      const completedProgresses = await this.trackProgressRepository.find({
        where: {
          userId: In(learnerIds),
          status: ProgressStatus.COMPLETED,
        },
      });

      const userCompletedMap = new Map<string, Date[]>();
      completedProgresses.forEach((p) => {
        if (p.completedAt) {
          const dates = userCompletedMap.get(p.userId) || [];
          dates.push(p.completedAt);
          userCompletedMap.set(p.userId, dates);
        }
      });

      let totalRampDays = 0;
      let completedLearnersCount = 0;

      learners.forEach((learner) => {
        const completedDates = userCompletedMap.get(learner.id) || [];
        if (completedDates.length >= totalTracksCount) {
          const maxCompletedDate = new Date(
            Math.max(...completedDates.map((d) => d.getTime())),
          );
          const start = learner.createdAt;
          const diffMs = maxCompletedDate.getTime() - start.getTime();
          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          totalRampDays += Math.max(0, diffDays);
          completedLearnersCount++;
        }
      });

      if (completedLearnersCount > 0) {
        avgRampDays = Math.round(totalRampDays / completedLearnersCount);
      }
    }

    return {
      activeLearners,
      newThisWeek,
      avgCompletion,
      avgCompletionDelta: 0, // Mocked delta
      pendingReview,
      oldestPendingAgo,
      avgRampDays,
      targetRampDays: cohort.targetRampDays,
    };
  }

  async getTrackCompletion(cohortId: string) {
    await this.findOne(cohortId);

    const learners = await this.userRepository.find({
      where: { cohortId, role: UserRole.LEARNER },
    });

    const tracks = await this.trackRepository.find({
      order: { order: 'ASC' },
    });

    if (learners.length === 0) {
      return {
        data: tracks.map((t) => ({
          trackId: t.id,
          title: t.name,
          completionPct: 0,
        })),
      };
    }

    const learnerIds = learners.map((l) => l.id);
    const completedProgresses = await this.trackProgressRepository.find({
      where: {
        userId: In(learnerIds),
        status: ProgressStatus.COMPLETED,
      },
    });

    const trackCompletedCount = new Map<string, number>();
    completedProgresses.forEach((p) => {
      trackCompletedCount.set(p.trackId, (trackCompletedCount.get(p.trackId) || 0) + 1);
    });

    const data = tracks.map((t) => {
      const completedCount = trackCompletedCount.get(t.id) || 0;
      const completionPct = Math.round((completedCount / learners.length) * 100);
      return {
        trackId: t.id,
        title: t.name,
        completionPct,
      };
    });

    return { data };
  }

  async exportReport(cohortId: string): Promise<string> {
    await this.findOne(cohortId);

    const learners = await this.userRepository.find({
      where: { cohortId, role: UserRole.LEARNER },
    });

    const totalLessons = await this.lessonRepository.count();

    const csvRows = ['name,email,completion,xp,level,tracksCompleted,exercisesApproved'];

    for (const learner of learners) {
      const completedLessons = await this.lessonProgressRepository.count({
        where: { userId: learner.id, completedAt: Not(IsNull()) },
      });
      const completion =
        totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      const tracksCompleted = await this.trackProgressRepository.count({
        where: { userId: learner.id, status: ProgressStatus.COMPLETED },
      });

      const exercisesApproved = await this.submissionRepository.count({
        where: { userId: learner.id, status: SubmissionStatus.APPROVED },
      });

      const name = learner.name.includes(',') ? `"${learner.name}"` : learner.name;
      const email = learner.email.includes(',') ? `"${learner.email}"` : learner.email;

      csvRows.push(
        `${name},${email},${completion},${learner.xp},${learner.level},${tracksCompleted},${exercisesApproved}`,
      );
    }

    return csvRows.join('\n');
  }
}
