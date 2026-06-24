import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  Submission,
  SubmissionStatus,
} from '../database/entities/submission.entity';
import { SubmissionHistory } from '../database/entities/submission-history.entity';
import { Exercise } from '../database/entities/exercise.entity';
import { User } from '../database/entities/user.entity';
import { SubmissionQueryDto } from './dto/submission-query.dto';
import { SubmissionCreatedEvent } from '../notifications/events/submission-created.event';
import { SubmissionResubmittedEvent } from '../notifications/events/submission-resubmitted.event';
import { SubmissionReviewedEvent } from '../notifications/events/submission-reviewed.event';

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
    private readonly eventEmitter: EventEmitter2,
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
      relations: { track: true },
    });
    if (!exercise) {
      throw new NotFoundException(`Exercise with ID ${exerciseId} not found`);
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
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

    const savedSubmission = await this.submissionRepository.save(submission);

    // Create SubmissionHistory log entry
    const history = this.submissionHistoryRepository.create({
      submissionId: savedSubmission.id,
      adminId: null,
      action: 'submitted',
      prUrl,
      comment: '',
    });
    await this.submissionHistoryRepository.save(history);

    // Emit event
    const event = new SubmissionCreatedEvent();
    event.submissionId = savedSubmission.id;
    event.userId = user.id;
    event.userName = user.name;
    event.userEmail = user.email;
    event.exerciseId = exercise.id;
    event.exerciseTitle = exercise.title;
    event.trackId = exercise.trackId;
    event.trackName = exercise.track?.title || '';
    event.prUrl = prUrl;
    event.submittedAt = savedSubmission.submittedAt || new Date();
    this.eventEmitter.emit('submission.created', event);

    // Trigger notification stub
    console.log(
      `[Notification] Slack Webhook: Learner ${userId} đã nộp bài tập '${exercise.title}' (PR: ${prUrl})`,
    );

    return savedSubmission;
  }

  async resubmit(exerciseId: string, userId: string, prUrl: string) {
    const submission = await this.submissionRepository.findOne({
      where: { exerciseId, userId },
      relations: { exercise: { track: true }, user: true },
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

    const savedSubmission = await this.submissionRepository.save(submission);

    // Create SubmissionHistory log entry
    const history = this.submissionHistoryRepository.create({
      submissionId: savedSubmission.id,
      adminId: null,
      action: 'resubmitted',
      prUrl,
      comment: '',
    });
    await this.submissionHistoryRepository.save(history);

    const user = submission.user;
    const exercise = submission.exercise;

    if (user && exercise) {
      // Get previous comments from history
      const histories = await this.submissionHistoryRepository.find({
        where: { submissionId: savedSubmission.id },
      });
      const previousComments = histories.map(h => h.comment).filter(c => !!c);

      const event = new SubmissionResubmittedEvent();
      event.submissionId = savedSubmission.id;
      event.userId = user.id;
      event.userName = user.name;
      event.userEmail = user.email;
      event.exerciseId = exercise.id;
      event.exerciseTitle = exercise.title;
      event.trackId = exercise.trackId;
      event.trackName = exercise.track?.title || '';
      event.prUrl = prUrl;
      event.submittedAt = savedSubmission.submittedAt || new Date();
      event.previousComments = previousComments;
      this.eventEmitter.emit('submission.resubmitted', event);
    }

    // Trigger notification stub
    console.log(
      `[Notification] Slack Webhook: Learner ${userId} đã cập nhật lại bài nộp '${submission.exercise?.title}' (PR: ${prUrl})`,
    );

    return savedSubmission;
  }

  async findAll(query: SubmissionQueryDto) {
    const { status, cohortId, userId, exerciseId, limit = 10, cursor } = query;

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

    // Keyset pagination sorting: order by submittedAt DESC, id ASC
    qb.orderBy('submission.submittedAt', 'DESC').addOrderBy(
      'submission.id',
      'ASC',
    );

    // Keyset pagination cursor decoding & filter
    if (cursor) {
      try {
        const decoded = JSON.parse(
          Buffer.from(cursor, 'base64').toString('ascii'),
        ) as { submittedAt?: string; id?: string };
        const { submittedAt, id } = decoded;

        if (submittedAt && id) {
          qb.andWhere(
            '(submission.submittedAt < :submittedAt OR (submission.submittedAt = :submittedAt AND submission.id > :id))',
            { submittedAt: new Date(submittedAt), id },
          );
        }
      } catch {
        // Ignore invalid cursor
      }
    }

    // Fetch limit + 1 to check for next page
    qb.take(limit + 1);

    const results = await qb.getMany();

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;

    let nextCursor: string | null = null;
    if (hasMore && data.length > 0) {
      const lastItem = data[data.length - 1];
      nextCursor = Buffer.from(
        JSON.stringify({
          submittedAt: lastItem.submittedAt?.toISOString(),
          id: lastItem.id,
        }),
      ).toString('base64');
    }

    return {
      data,
      nextCursor,
      hasMore,
    };
  }

  async findOne(id: string, userId: string, userRole: string) {
    const submission = await this.submissionRepository.findOne({
      where: { id },
      relations: { user: true, exercise: true, histories: { admin: true } },
      order: { histories: { createdAt: 'DESC' } },
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
      relations: { user: true, exercise: { track: true }, histories: { admin: true } },
      order: { histories: { createdAt: 'DESC' } },
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

    const user = submission.user;
    const exercise = submission.exercise;
    const reviewer = await this.userRepository.findOne({
      where: { id: reviewerId },
    });

    const oldLevel = user ? user.level : 1;
    let xpAwarded = 0;
    let levelUpgraded = false;

    // Side-effect: Award dynamic XP if approved
    if (status === SubmissionStatus.APPROVED) {
      if (user) {
        xpAwarded = exercise?.xp ?? 200; // fallback just in case
        user.xp += xpAwarded;
        user.level = this.resolveLevel(user.xp);
        levelUpgraded = user.level > oldLevel;
        await this.userRepository.save(user);
        console.log(
          `[Notification] Email & Slack: Learner '${user.name}' bài nộp được APPROVED. Cộng +${xpAwarded} XP. Tổng XP: ${user.xp}, Level: ${user.level}`,
        );
      }
    } else if (status === SubmissionStatus.CHANGES) {
      console.log(
        `[Notification] Email & Slack: Learner '${submission.user?.name}' bài nộp yêu cầu chỉnh sửa (Changes Requested). Lý do: ${comment}`,
      );
    }

    if (user && reviewer && exercise) {
      const event = new SubmissionReviewedEvent();
      event.submissionId = submission.id;
      event.userId = user.id;
      event.userName = user.name;
      event.userEmail = user.email;
      event.exerciseId = exercise.id;
      event.exerciseTitle = exercise.title;
      event.status = status === SubmissionStatus.APPROVED ? 'approved' : (status === SubmissionStatus.CHANGES ? 'changes' : 'rejected');
      event.adminId = reviewer.id;
      event.adminName = reviewer.name;
      event.comment = comment;
      event.xpAwarded = xpAwarded;
      event.newXp = user.xp;
      event.newLevel = user.level;
      event.levelUpgraded = levelUpgraded;
      event.reviewedAt = new Date();
      this.eventEmitter.emit('submission.reviewed', event);
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
