import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { SubmissionNotificationsListener } from './submission-notifications.listener';
import { NotificationsService } from '../notifications.service';
import { User, UserRole } from '../../database/entities/user.entity';
import { SubmissionCreatedEvent } from '../events/submission-created.event';
import { SubmissionResubmittedEvent } from '../events/submission-resubmitted.event';
import { SubmissionReviewedEvent } from '../events/submission-reviewed.event';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: '123' }),
  }),
}));

describe('SubmissionNotificationsListener', () => {
  let listener: SubmissionNotificationsListener;
  let notificationsService: jest.Mocked<Pick<NotificationsService, 'create'>>;
  let userRepository: jest.Mocked<Pick<Repository<User>, 'find'>>;
  let configService: jest.Mocked<Pick<ConfigService, 'get'>>;

  const mockAdmins = [
    {
      id: 'admin-1',
      email: 'admin1@glinteco.com',
      role: UserRole.ADMIN,
      name: 'Admin 1',
    } as User,
  ];

  beforeEach(async () => {
    jest.clearAllMocks();

    notificationsService = {
      create: jest.fn().mockResolvedValue({}),
    };

    userRepository = {
      find: jest.fn().mockResolvedValue(mockAdmins),
    };

    configService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'SLACK_ADMIN_WEBHOOK_URL')
          return 'https://slack.com/webhook';
        if (key === 'SMTP_HOST') return 'localhost';
        return undefined;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionNotificationsListener,
        {
          provide: NotificationsService,
          useValue: notificationsService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    listener = module.get<SubmissionNotificationsListener>(
      SubmissionNotificationsListener,
    );

    // Mock global fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    } as any);
  });

  it('should be defined', () => {
    expect(listener).toBeDefined();
  });

  describe('handleSubmissionCreated', () => {
    it('should create in-app notifications, send Slack message, and send emails to admins', async () => {
      const event: SubmissionCreatedEvent = {
        submissionId: 'sub-123',
        userId: 'user-123',
        userName: 'John Learner',
        userEmail: 'john@glinteco.com',
        exerciseId: 'ex-123',
        exerciseTitle: 'Exercise 1',
        trackId: 'track-123',
        trackName: 'Track 1',
        prUrl: 'https://github.com/pr/1',
        submittedAt: new Date(),
      };

      await listener.handleSubmissionCreated(event);

      expect(userRepository.find).toHaveBeenCalledWith({
        where: { role: UserRole.ADMIN },
      });
      expect(notificationsService.create).toHaveBeenCalledWith(
        'admin-1',
        'submission_created',
        'Bài nộp mới cần chấm',
        "Học viên John Learner đã nộp bài tập 'Exercise 1'",
      );
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('handleSubmissionResubmitted', () => {
    it('should notify admins of resubmission', async () => {
      const event: SubmissionResubmittedEvent = {
        submissionId: 'sub-123',
        userId: 'user-123',
        userName: 'John Learner',
        userEmail: 'john@glinteco.com',
        exerciseId: 'ex-123',
        exerciseTitle: 'Exercise 1',
        trackId: 'track-123',
        trackName: 'Track 1',
        prUrl: 'https://github.com/pr/2',
        submittedAt: new Date(),
        previousComments: ['Please refactor naming'],
      };

      await listener.handleSubmissionResubmitted(event);

      expect(notificationsService.create).toHaveBeenCalledWith(
        'admin-1',
        'submission_resubmitted',
        'Bài nộp cập nhật lại',
        "Học viên John Learner đã cập nhật lại bài nộp 'Exercise 1'",
      );
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('handleSubmissionReviewed', () => {
    it('should notify learner of approval', async () => {
      const event: SubmissionReviewedEvent = {
        submissionId: 'sub-123',
        userId: 'user-123',
        userName: 'John Learner',
        userEmail: 'john@glinteco.com',
        exerciseId: 'ex-123',
        exerciseTitle: 'Exercise 1',
        status: 'approved',
        adminId: 'admin-1',
        adminName: 'Admin 1',
        comment: 'Excellent code',
        xpAwarded: 100,
        newXp: 150,
        newLevel: 1,
        levelUpgraded: false,
        reviewedAt: new Date(),
      };

      await listener.handleSubmissionReviewed(event);

      expect(notificationsService.create).toHaveBeenCalledWith(
        'user-123',
        'submission_reviewed',
        'Bài tập đã được duyệt',
        "Bài nộp cho 'Exercise 1' đã được duyệt bởi Admin 1. Bạn được cộng +100 XP!",
      );
    });

    it('should notify learner of changes requested', async () => {
      const event: SubmissionReviewedEvent = {
        submissionId: 'sub-123',
        userId: 'user-123',
        userName: 'John Learner',
        userEmail: 'john@glinteco.com',
        exerciseId: 'ex-123',
        exerciseTitle: 'Exercise 1',
        status: 'changes',
        adminId: 'admin-1',
        adminName: 'Admin 1',
        comment: 'Please fix index',
        xpAwarded: 0,
        newXp: 50,
        newLevel: 1,
        levelUpgraded: false,
        reviewedAt: new Date(),
      };

      await listener.handleSubmissionReviewed(event);

      expect(notificationsService.create).toHaveBeenCalledWith(
        'user-123',
        'submission_reviewed',
        'Bài tập cần sửa đổi',
        "Người duyệt Admin 1 yêu cầu sửa đổi bài nộp 'Exercise 1'. Lý do: Please fix index",
      );
    });
  });
});
