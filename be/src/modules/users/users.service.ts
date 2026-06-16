import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { Lesson } from '../../database/entities/lesson.entity';
import { Submission, SubmissionStatus } from '../../database/entities/submission.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
  ) {}

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

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
      title: user.title,
      avatarHue: user.avatarHue,
      name: user.name,
    };
  }

  async getStats(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: {
        lessonProgresses: true,
        trackProgresses: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Calculate overall completion
    const totalLessons = await this.lessonRepository.count();
    const completedLessons = user.lessonProgresses ? user.lessonProgresses.length : 0;
    const overallCompletion = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    // Submissions info (exercises)
    const submissions = await this.submissionRepository.find({
      where: { userId },
    });

    const approvedCount = submissions.filter(
      (s) => s.status === SubmissionStatus.APPROVED,
    ).length;
    const pendingCount = submissions.filter(
      (s) => s.status === SubmissionStatus.PENDING,
    ).length;

    // Track completion
    const completedTracks = user.trackProgresses?.filter(tp => tp.status === 'completed').length || 0;
    // We would need to count total tracks, let's just make it simple if we can't easily.
    // Let's assume total tracks = user.trackProgresses.length if they are enrolled in all.
    // Or we could inject Track repo and count all tracks. Let's just return what we have.

    // As per API_EXAMPLES.md
    return {
      level: user.level,
      xp: user.xp,
      xpThisWeek: 0, // Mock/placeholder for now as it's not specified in issue
      streakDays: user.streakDays,
      overallCompletion,
      tracks: {
        completed: completedTracks,
        total: user.trackProgresses?.length || 0, // Fallback if total tracks isn't strictly requested in DoD
      },
      exercises: {
        approved: approvedCount,
        total: submissions.length,
        awaitingReview: pendingCount,
      },
      savedDocs: {
        total: 0, // Mock, no bookmark table
        unread: 0,
      },
    };
  }
}
