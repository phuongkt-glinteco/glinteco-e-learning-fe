import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Track } from '../database/entities/track.entity';
import {
  TrackProgress,
  ProgressStatus,
} from '../database/entities/track-progress.entity';
import { Lesson } from '../database/entities/lesson.entity';
import { LessonProgress } from '../database/entities/lesson-progress.entity';
import { User } from '../database/entities/user.entity';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { ReorderTracksDto } from './dto/reorder-tracks.dto';

@Injectable()
export class TracksService {
  constructor(
    @InjectRepository(Track)
    private readonly trackRepository: Repository<Track>,
    @InjectRepository(TrackProgress)
    private readonly trackProgressRepository: Repository<TrackProgress>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(LessonProgress)
    private readonly lessonProgressRepository: Repository<LessonProgress>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Resolve user level based on XP to sync gamification state
  private resolveLevel(xp: number): number {
    if (xp >= 1200) return 3;
    if (xp >= 600) return 2;
    return 1;
  }

  // Find all tracks and calculate progress dynamically or from saved progress
  async findAll(userId: string) {
    const tracks = await this.trackRepository.find({
      order: { order: 'ASC' },
      relations: { lessons: true },
    });

    const progressRecords = await this.trackProgressRepository.find({
      where: { userId },
    });

    const progressMap = new Map<string, TrackProgress>();
    for (const record of progressRecords) {
      progressMap.set(record.trackId, record);
    }

    const lessonProgresses = await this.lessonProgressRepository.find({
      where: { userId },
    });
    const completedLessonIds = new Set(
      lessonProgresses
        .filter((lp) => lp.completedAt !== null)
        .map((lp) => lp.lessonId),
    );

    const resolvedTracks: Array<{
      id: string;
      title: string;
      estimatedTime: string;
      order: number;
      lessonCount: number;
      icon: string;
      status: 'completed' | 'in_progress' | 'locked';
      lessonsCompleted: number;
      description: string;
    }> = [];
    let previousCompleted = true; // First track is in_progress by default if unlocked

    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      const lessonsInTrack = track.lessons || [];
      const totalLessons = lessonsInTrack.length;

      // Count actual completed lessons based on LessonProgress
      const completedCount = lessonsInTrack.filter((l) =>
        completedLessonIds.has(l.id),
      ).length;

      const savedProgress = progressMap.get(track.id);
      let status: ProgressStatus = ProgressStatus.NOT_STARTED;

      if (savedProgress) {
        status = savedProgress.status;
      } else {
        // Dynamic status resolution
        if (i === 0 || previousCompleted) {
          status = ProgressStatus.IN_PROGRESS;
        } else {
          status = ProgressStatus.NOT_STARTED; // essentially "locked" in API view
        }
      }

      // Safeguard status based on completion
      if (totalLessons > 0 && completedCount === totalLessons) {
        status = ProgressStatus.COMPLETED;
      }

      // Update previous track completion status for the next iteration
      previousCompleted = status === ProgressStatus.COMPLETED;

      // Translate status to the API expected string: "locked", "in_progress", "completed"
      let apiStatus: 'completed' | 'in_progress' | 'locked' = 'locked';
      if (status === ProgressStatus.COMPLETED) {
        apiStatus = 'completed';
      } else if (
        status === ProgressStatus.IN_PROGRESS ||
        i === 0 ||
        (i > 0 && resolvedTracks[i - 1]?.status === 'completed')
      ) {
        apiStatus = 'in_progress';
      }

      resolvedTracks.push({
        id: track.id,
        title: track.title,
        estimatedTime: track.estimatedTime,
        order: track.order,
        lessonCount: totalLessons,
        icon: track.icon || 'flag',
        status: apiStatus,
        lessonsCompleted: completedCount,
        description: track.description,
      });
    }

    return { data: resolvedTracks };
  }

  async findOne(id: string, userId?: string) {
    const track = await this.trackRepository.findOne({
      where: { id },
      relations: { lessons: true },
    });
    if (!track) {
      throw new NotFoundException(`Track with ID ${id} not found`);
    }

    let lessonsCompleted = 0;
    let apiStatus = 'locked';

    const lessonsInTrack = track.lessons || [];
    const totalLessons = lessonsInTrack.length;

    let completedLessonIds = new Set<string>();

    if (userId) {
      const progress = await this.trackProgressRepository.findOne({
        where: { trackId: id, userId },
      });

      const lessonProgresses = await this.lessonProgressRepository.find({
        where: { userId },
      });
      completedLessonIds = new Set(
        lessonProgresses
          .filter((lp) => lp.completedAt !== null)
          .map((lp) => lp.lessonId),
      );

      lessonsCompleted = lessonsInTrack.filter((l) =>
        completedLessonIds.has(l.id),
      ).length;

      if (progress) {
        if (progress.status === ProgressStatus.COMPLETED) {
          apiStatus = 'completed';
        } else if (progress.status === ProgressStatus.IN_PROGRESS) {
          apiStatus = 'in_progress';
        }
      } else {
        // Fallback dynamic status for individual track
        const allTracks = await this.trackRepository.find({
          order: { order: 'ASC' },
        });
        const trackIndex = allTracks.findIndex((t) => t.id === id);
        if (trackIndex === 0) {
          apiStatus = 'in_progress';
        } else if (trackIndex > 0) {
          const prevTrack = allTracks[trackIndex - 1];
          const prevProgress = await this.trackProgressRepository.findOne({
            where: { trackId: prevTrack.id, userId },
          });
          if (prevProgress && prevProgress.status === ProgressStatus.COMPLETED) {
            apiStatus = 'in_progress';
          }
        }
      }
    }

    const resolvedLessons = lessonsInTrack
      .sort((a, b) => a.order - b.order)
      .map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        order: lesson.order,
        completed: completedLessonIds.has(lesson.id),
      }));

    return {
      id: track.id,
      title: track.title,
      estimatedTime: track.estimatedTime,
      order: track.order,
      icon: track.icon || 'flag',
      status: apiStatus as 'completed' | 'in_progress' | 'locked',
      lessonsCompleted,
      description: track.description,
      lessons: resolvedLessons,
    };
  }

  async create(createTrackDto: CreateTrackDto) {
    let order: number;

    if (createTrackDto.afterTrackId) {
      const prevTrack = await this.trackRepository.findOne({
        where: { id: createTrackDto.afterTrackId },
      });
      if (prevTrack) {
        order = prevTrack.order + 1;
        // Shift orders of subsequent tracks
        await this.trackRepository.manager.transaction(async (entityManager) => {
          await entityManager
            .createQueryBuilder()
            .update(Track)
            .set({ order: () => 'track_order + 1' })
            .where('track_order >= :order', { order })
            .execute();
        });
      } else {
        // Fallback: put at the end
        const maxOrderTrack = await this.trackRepository.findOne({
          where: {},
          order: { order: 'DESC' },
        });
        order = maxOrderTrack ? maxOrderTrack.order + 1 : 1;
      }
    } else {
      // Put at the end
      const maxOrderTrack = await this.trackRepository.findOne({
        where: {},
        order: { order: 'DESC' },
      });
      order = maxOrderTrack ? maxOrderTrack.order + 1 : 1;
    }

    const track = this.trackRepository.create({
      title: createTrackDto.title,
      description: createTrackDto.description,
      estimatedTime: createTrackDto.estimatedTime,
      icon: 'flag',
      order,
      lessonsCount: 0,
    });

    const savedTrack = await this.trackRepository.save(track);

    return {
      id: savedTrack.id,
      title: savedTrack.title,
      estimatedTime: savedTrack.estimatedTime,
      order: savedTrack.order,
      icon: savedTrack.icon,
      status: 'locked' as const,
      lessonsCompleted: 0,
      description: savedTrack.description,
      lessons: [],
    };
  }

  async update(id: string, updateTrackDto: UpdateTrackDto) {
    const track = await this.trackRepository.findOne({ where: { id } });
    if (!track) {
      throw new NotFoundException(`Track with ID ${id} not found`);
    }

    if (updateTrackDto.title !== undefined) {
      track.title = updateTrackDto.title;
    }
    if (updateTrackDto.description !== undefined) {
      track.description = updateTrackDto.description;
    }
    if (updateTrackDto.estimatedTime !== undefined) {
      track.estimatedTime = updateTrackDto.estimatedTime;
    }
    if (updateTrackDto.icon !== undefined) {
      track.icon = updateTrackDto.icon;
    }

    await this.trackRepository.save(track);

    return this.findOne(id);
  }

  async delete(id: string) {
    const track = await this.trackRepository.findOne({ where: { id } });
    if (!track) {
      throw new NotFoundException(`Track with ID ${id} not found`);
    }

    const deletedOrder = track.order;

    await this.trackRepository.manager.transaction(async (entityManager) => {
      // First delete associated lessons and progresses
      const lessons = await entityManager.find(Lesson, {
        where: { trackId: id },
      });
      const lessonIds = lessons.map((l) => l.id);

      if (lessonIds.length > 0) {
        await entityManager.delete(LessonProgress, { lessonId: In(lessonIds) });
        await entityManager.delete(Lesson, { id: In(lessonIds) });
      }

      await entityManager.delete(TrackProgress, { trackId: id });
      await entityManager.delete(Track, { id });

      // Shift subsequent tracks' order up
      await entityManager
        .createQueryBuilder()
        .update(Track)
        .set({ order: () => 'track_order - 1' })
        .where('track_order > :deletedOrder', { deletedOrder })
        .execute();
    });
  }

  async reorder(reorderTracksDto: ReorderTracksDto) {
    const { order } = reorderTracksDto;

    // Verify all IDs exist
    const tracks = await this.trackRepository.find({
      where: { id: In(order) },
    });

    if (tracks.length !== order.length) {
      throw new BadRequestException(
        'Một hoặc nhiều ID của track không tồn tại',
      );
    }

    await this.trackRepository.manager.transaction(async (entityManager) => {
      for (let i = 0; i < order.length; i++) {
        await entityManager.update(Track, { id: order[i] }, { order: i + 1 });
      }
    });

    return {
      message: 'Tracks reordered',
      count: order.length,
    };
  }

  async updateTrackProgress(
    trackId: string,
    userId: string,
    status: ProgressStatus,
  ) {
    const track = await this.trackRepository.findOne({
      where: { id: trackId },
    });
    if (!track) {
      throw new NotFoundException(`Track with ID ${trackId} not found`);
    }

    let progress = await this.trackProgressRepository.findOne({
      where: { trackId, userId },
    });

    if (!progress) {
      progress = this.trackProgressRepository.create({
        trackId,
        userId,
        status,
        lessonsCompleted: 0,
        startedAt: status === ProgressStatus.IN_PROGRESS ? new Date() : null,
        completedAt: status === ProgressStatus.COMPLETED ? new Date() : null,
      });
    } else {
      progress.status = status;
      if (status === ProgressStatus.IN_PROGRESS && !progress.startedAt) {
        progress.startedAt = new Date();
      }
      if (status === ProgressStatus.COMPLETED && !progress.completedAt) {
        progress.completedAt = new Date();
      }
    }

    await this.trackProgressRepository.save(progress);
    return progress;
  }

  // --- Lessons Logic ---

  async findLessons(trackId: string, userId: string) {
    const track = await this.trackRepository.findOne({
      where: { id: trackId },
    });
    if (!track) {
      throw new NotFoundException(`Track with ID ${trackId} not found`);
    }

    const lessons = await this.lessonRepository.find({
      where: { trackId },
      order: { order: 'ASC' },
    });

    const data = lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      order: lesson.order,
      estimatedTime: lesson.estimatedTime,
    }));

    return { data };
  }

  async createLesson(trackId: string, createLessonDto: CreateLessonDto) {
    const track = await this.trackRepository.findOne({
      where: { id: trackId },
    });
    if (!track) {
      throw new NotFoundException(`Track with ID ${trackId} not found`);
    }

    // Check if order is already taken
    const existingLesson = await this.lessonRepository.findOne({
      where: { trackId, order: createLessonDto.order },
    });

    if (existingLesson) {
      // Shift orders of subsequent lessons
      await this.lessonRepository.manager.transaction(async (entityManager) => {
        await entityManager
          .createQueryBuilder()
          .update(Lesson)
          .set({ order: () => 'lesson_order + 1' })
          .where('trackId = :trackId AND lesson_order >= :order', {
            trackId,
            order: createLessonDto.order,
          })
          .execute();
      });
    }

    const lesson = this.lessonRepository.create({
      trackId,
      title: createLessonDto.title,
      order: createLessonDto.order,
      estimatedTime: createLessonDto.estimatedTime,
      body: createLessonDto.body,
    });

    const savedLesson = await this.lessonRepository.save(lesson);

    // Update track lessonsCount
    track.lessonsCount = await this.lessonRepository.count({
      where: { trackId },
    });
    await this.trackRepository.save(track);

    return savedLesson;
  }

  async updateLesson(id: string, updateLessonDto: UpdateLessonDto) {
    const lesson = await this.lessonRepository.findOne({ where: { id } });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    if (
      updateLessonDto.order !== undefined &&
      updateLessonDto.order !== lesson.order
    ) {
      const targetOrder = updateLessonDto.order;
      const trackId = lesson.trackId;

      await this.lessonRepository.manager.transaction(async (entityManager) => {
        if (targetOrder > lesson.order) {
          // Shift intermediate down
          await entityManager
            .createQueryBuilder()
            .update(Lesson)
            .set({ order: () => 'lesson_order - 1' })
            .where(
              'trackId = :trackId AND lesson_order > :currentOrder AND lesson_order <= :targetOrder',
              {
                trackId,
                currentOrder: lesson.order,
                targetOrder,
              },
            )
            .execute();
        } else {
          // Shift intermediate up
          await entityManager
            .createQueryBuilder()
            .update(Lesson)
            .set({ order: () => 'lesson_order + 1' })
            .where(
              'trackId = :trackId AND lesson_order >= :targetOrder AND lesson_order < :currentOrder',
              {
                trackId,
                currentOrder: lesson.order,
                targetOrder,
              },
            )
            .execute();
        }
        lesson.order = targetOrder;
      });
    }

    if (updateLessonDto.title !== undefined) {
      lesson.title = updateLessonDto.title;
    }
    if (updateLessonDto.estimatedTime !== undefined) {
      lesson.estimatedTime = updateLessonDto.estimatedTime;
    }
    if (updateLessonDto.body !== undefined) {
      lesson.body = updateLessonDto.body;
    }

    return await this.lessonRepository.save(lesson);
  }

  async deleteLesson(id: string) {
    const lesson = await this.lessonRepository.findOne({ where: { id } });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    const deletedOrder = lesson.order;
    const trackId = lesson.trackId;

    await this.lessonRepository.manager.transaction(async (entityManager) => {
      await entityManager.delete(LessonProgress, { lessonId: id });
      await entityManager.delete(Lesson, { id });

      // Shift subsequent lessons
      await entityManager
        .createQueryBuilder()
        .update(Lesson)
        .set({ order: () => 'lesson_order - 1' })
        .where('trackId = :trackId AND lesson_order > :deletedOrder', {
          trackId,
          deletedOrder,
        })
        .execute();
    });

    // Update track lessonsCount
    const track = await this.trackRepository.findOne({
      where: { id: trackId },
    });
    if (track) {
      track.lessonsCount = await this.lessonRepository.count({
        where: { trackId },
      });
      await this.trackRepository.save(track);
    }
  }

  async completeLesson(lessonId: string, userId: string) {
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
    });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    let lessonProgress = await this.lessonProgressRepository.findOne({
      where: { lessonId, userId },
    });

    if (lessonProgress && lessonProgress.completedAt) {
      // Already completed, return early
      const user = await this.userRepository.findOne({ where: { id: userId } });
      return {
        message: 'Lesson already completed',
        xpAwarded: 0,
        totalXp: user?.xp ?? 0,
        level: user?.level ?? 1,
      };
    }

    if (!lessonProgress) {
      lessonProgress = this.lessonProgressRepository.create({
        lessonId,
        userId,
        completedAt: new Date(),
      });
    } else {
      lessonProgress.completedAt = new Date();
    }

    await this.lessonProgressRepository.save(lessonProgress);

    // Update track progress
    const trackId = lesson.trackId;
    const totalTrackLessons = await this.lessonRepository.count({
      where: { trackId },
    });

    let trackProgress = await this.trackProgressRepository.findOne({
      where: { trackId, userId },
    });

    // Count how many lessons are actually completed in this track
    const trackLessons = await this.lessonRepository.find({
      where: { trackId },
    });
    const trackLessonIds = trackLessons.map((l) => l.id);

    const completedInTrack = await this.lessonProgressRepository.count({
      where: {
        userId,
        lessonId: In(trackLessonIds),
      },
    });

    if (!trackProgress) {
      trackProgress = this.trackProgressRepository.create({
        trackId,
        userId,
        lessonsCompleted: completedInTrack,
        status:
          completedInTrack === totalTrackLessons
            ? ProgressStatus.COMPLETED
            : ProgressStatus.IN_PROGRESS,
        startedAt: new Date(),
        completedAt: completedInTrack === totalTrackLessons ? new Date() : null,
      });
    } else {
      trackProgress.lessonsCompleted = completedInTrack;
      if (completedInTrack === totalTrackLessons) {
        trackProgress.status = ProgressStatus.COMPLETED;
        trackProgress.completedAt = new Date();
      }
    }

    await this.trackProgressRepository.save(trackProgress);

    // Dynamic unlocking of next track if track is completed
    let unlockedTrackId: string | null = null;
    if (trackProgress.status === ProgressStatus.COMPLETED) {
      // Find the next track in order
      const currentTrack = await this.trackRepository.findOne({
        where: { id: trackId },
      });
      if (currentTrack) {
        const nextTrack = await this.trackRepository.findOne({
          where: { order: currentTrack.order + 1 },
        });

        if (nextTrack) {
          unlockedTrackId = nextTrack.id;
          let nextProgress = await this.trackProgressRepository.findOne({
            where: { trackId: nextTrack.id, userId },
          });
          if (!nextProgress) {
            nextProgress = this.trackProgressRepository.create({
              trackId: nextTrack.id,
              userId,
              status: ProgressStatus.IN_PROGRESS,
              lessonsCompleted: 0,
              startedAt: new Date(),
            });
          } else if (nextProgress.status === ProgressStatus.NOT_STARTED) {
            nextProgress.status = ProgressStatus.IN_PROGRESS;
            nextProgress.startedAt = new Date();
          }
          await this.trackProgressRepository.save(nextProgress);
        }
      }
    }

    // Award +40 XP
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      user.xp += 40;
      user.level = this.resolveLevel(user.xp);
      await this.userRepository.save(user);
    }

    return {
      message: 'Lesson completed',
      xpAwarded: 40,
      totalXp: user?.xp ?? 0,
      level: user?.level ?? 1,
      unlockedTrackId,
    };
  }
}
