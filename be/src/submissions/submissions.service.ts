import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Submission,
  SubmissionStatus,
} from '../database/entities/submission.entity';
import { SubmissionHistory } from '../database/entities/submission-history.entity';
import { Exercise } from '../database/entities/exercise.entity';
import { User } from '../database/entities/user.entity';
import { SubmissionQueryDto, SortOrder } from './dto/submission-query.dto';

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
    @InjectRepository(SubmissionHistory)
    private readonly submissionHistoryRepository: Repository<SubmissionHistory>,
    @InjectRepository(Exercise)
    private readonly exerciseRepository: Repository<Exercise>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private resolveLevel(xp: number): number {
    if (xp >= 1200) return 3;
    if (xp >= 600) return 2;
    return 1;
  }

  async findExercises(trackId: string, userId: string) {
    const exercises = await this.exerciseRepository.find({
      where: { trackId },
      order: { createdAt: 'ASC' },
    });

    const submissions = await this.submissionRepository.find({
      where: { userId },
    });
    const subMap = new Map<string, Submission>();
    for (const sub of submissions) {
      subMap.set(sub.exerciseId, sub);
    }

    const data = exercises.map((ex) => {
      const sub = subMap.get(ex.id);
      return {
        id: ex.id,
        title: ex.title,
        objectives: ex.objectives || {},
        steps: ex.steps || {},
        submission: sub
          ? {
              id: sub.id,
              prUrl: sub.prUrl,
              status: sub.status,
              submittedAt: sub.submittedAt,
            }
          : null,
      };
    });

    return { data };
  }

  async submit(exerciseId: string, userId: string, prUrl: string) {
    const exercise = await this.exerciseRepository.findOne({
      where: { id: exerciseId },
    });
    if (!exercise) {
      throw new NotFoundException(`Exercise with ID ${exerciseId} not found`);
    }

    let submission = await this.submissionRepository.findOne({
      where: { exerciseId, userId },
    });

    if (submission && submission.status !== SubmissionStatus.PENDING) {
      throw new BadRequestException(
        'Bài tập đã được nộp. Vui lòng sử dụng tính năng Resubmit (PUT) để cập nhật.',
      );
    }

    if (!submission) {
      submission = this.submissionRepository.create({
        exerciseId,
        userId,
        prUrl,
        status: SubmissionStatus.SUBMITTED,
        submittedAt: new Date(),
      });
    } else {
      submission.prUrl = prUrl;
      submission.status = SubmissionStatus.SUBMITTED;
      submission.submittedAt = new Date();
    }

    // Trigger notification stub
    console.log(
      `[Notification] Slack Webhook: Learner ${userId} đã nộp bài tập '${exercise.title}' (PR: ${prUrl})`,
    );

    return await this.submissionRepository.save(submission);
  }

  async resubmit(exerciseId: string, userId: string, prUrl: string) {
    const submission = await this.submissionRepository.findOne({
      where: { exerciseId, userId },
      relations: { exercise: true },
    });

    if (!submission) {
      throw new NotFoundException('Không tìm thấy bài nộp cũ để cập nhật.');
    }

    if (submission.status !== SubmissionStatus.CHANGES) {
      throw new BadRequestException(
        'Chỉ được phép resubmit khi trạng thái bài nộp là changes (cần sửa đổi).',
      );
    }

    submission.prUrl = prUrl;
    submission.status = SubmissionStatus.SUBMITTED;
    submission.submittedAt = new Date();

    // Trigger notification stub
    console.log(
      `[Notification] Slack Webhook: Learner ${userId} đã cập nhật lại bài nộp '${submission.exercise?.title}' (PR: ${prUrl})`,
    );

    return await this.submissionRepository.save(submission);
  }

  async findAll(query: SubmissionQueryDto) {
    const {
      status,
      cohortId,
      userId,
      exerciseId,
      page = 1,
      limit = 10,
      sortBy = 'submittedAt',
      sortOrder = SortOrder.ASC,
    } = query;

    const qb = this.submissionRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.user', 'user')
      .leftJoinAndSelect('submission.exercise', 'exercise');

    if (status) {
      qb.andWhere('submission.status = :status', { status });
    }

    if (userId) {
      qb.andWhere('submission.userId = :userId', { userId });
    }

    if (exerciseId) {
      qb.andWhere('submission.exerciseId = :exerciseId', { exerciseId });
    }

    if (cohortId) {
      qb.andWhere('user.cohortId = :cohortId', { cohortId });
    }

    // Sort order mapping
    const orderDirection = sortOrder === SortOrder.DESC ? 'DESC' : 'ASC';
    if (sortBy === 'submittedAt') {
      qb.orderBy('submission.submittedAt', orderDirection);
    } else {
      qb.orderBy(`submission.${sortBy}`, orderDirection);
    }

    const total = await qb.getCount();
    const skip = (page - 1) * limit;
    qb.skip(skip).take(limit);

    const data = await qb.getMany();
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: string, userId: string, userRole: string) {
    const submission = await this.submissionRepository.findOne({
      where: { id },
      relations: { user: true, exercise: true },
    });

    if (!submission) {
      throw new NotFoundException(`Submission with ID ${id} not found`);
    }

    // Auth check: only owners or admins can see details
    if (userRole !== 'admin' && submission.userId !== userId) {
      throw new ForbiddenException(
        'Bạn không có quyền xem thông tin bài nộp này.',
      );
    }

    return submission;
  }

  async review(
    id: string,
    reviewerId: string,
    status: SubmissionStatus,
    comment?: string,
  ) {
    const submission = await this.submissionRepository.findOne({
      where: { id },
      relations: { user: true, exercise: true },
    });

    if (!submission) {
      throw new NotFoundException(`Submission with ID ${id} not found`);
    }

    if (submission.status === SubmissionStatus.APPROVED) {
      throw new BadRequestException(
        'Bài nộp đã được duyệt thành công và không thể cập nhật thêm.',
      );
    }

    // Map action labels
    let action = 'reviewed';
    if (status === SubmissionStatus.APPROVED) {
      action = 'approved';
    } else if (status === SubmissionStatus.CHANGES) {
      action = 'request-changes';
    } else if (status === SubmissionStatus.REJECTED) {
      action = 'rejected';
    }

    submission.status = status;
    await this.submissionRepository.save(submission);

    // Create SubmissionHistory log entry
    const history = this.submissionHistoryRepository.create({
      submissionId: id,
      adminId: reviewerId,
      action,
      comment: comment || '',
    });
    await this.submissionHistoryRepository.save(history);

    // Side-effect: Award +200 XP if approved
    if (status === SubmissionStatus.APPROVED) {
      const user = submission.user;
      if (user) {
        user.xp += 200;
        user.level = this.resolveLevel(user.xp);
        await this.userRepository.save(user);
        console.log(
          `[Notification] Email & Slack: Learner '${user.name}' bài nộp được APPROVED. Cộng +200 XP. Tổng XP: ${user.xp}, Level: ${user.level}`,
        );
      }
    } else if (status === SubmissionStatus.CHANGES) {
      console.log(
        `[Notification] Email & Slack: Learner '${submission.user?.name}' bài nộp yêu cầu chỉnh sửa (Changes Requested). Lý do: ${comment}`,
      );
    }

    return submission;
  }

  async findHistory(submissionId: string, userId: string, userRole: string) {
    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new NotFoundException(
        `Submission with ID ${submissionId} not found`,
      );
    }

    if (userRole !== 'admin' && submission.userId !== userId) {
      throw new ForbiddenException(
        'Bạn không có quyền xem lịch sử bài nộp này.',
      );
    }

    const histories = await this.submissionHistoryRepository.find({
      where: { submissionId },
      relations: { admin: true },
      order: { createdAt: 'DESC' },
    });

    return { data: histories };
  }
}
