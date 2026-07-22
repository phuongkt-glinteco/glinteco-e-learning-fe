import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  Exercise,
  ExerciseType,
  ExerciseQuestion,
} from '../database/entities/exercise.entity';
import { Track, TrackStatus } from '../database/entities/track.entity';
import { Document } from '../database/entities/document.entity';
import {
  Submission,
  SubmissionStatus,
} from '../database/entities/submission.entity';
import { Lesson } from '../database/entities/lesson.entity';
import { LessonProgress } from '../database/entities/lesson-progress.entity';
import { AutoGrade } from '../database/entities/auto-grade.entity';
import { Tag } from '../database/entities/tag.entity';
import { User, UserRole } from '../database/entities/user.entity';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import {
  ExerciseQueryDto,
  ExerciseFilterStatus,
} from './dto/exercise-query.dto';
import { SubmitAutoDto, AutoGradeResultDto } from './dto/submit-auto.dto';

@Injectable()
export class ExercisesService {
  constructor(
    @InjectRepository(Exercise)
    private readonly exerciseRepository: Repository<Exercise>,
    @InjectRepository(Track)
    private readonly trackRepository: Repository<Track>,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(LessonProgress)
    private readonly lessonProgressRepository: Repository<LessonProgress>,
    @InjectRepository(AutoGrade)
    private readonly autoGradeRepository: Repository<AutoGrade>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private resolveLevel(xp: number): number {
    if (xp >= 1200) return 3;
    if (xp >= 600) return 2;
    return 1;
  }

  async create(dto: CreateExerciseDto): Promise<Exercise> {
    const track = await this.trackRepository.findOne({
      where: { id: dto.trackId },
    });
    if (!track) {
      throw new NotFoundException(
        `Không tìm thấy Track với ID: ${dto.trackId}`,
      );
    }

    let tagId: string | null = dto.tagId || null;
    if (tagId) {
      const tag = await this.tagRepository.findOne({ where: { id: tagId } });
      if (!tag) {
        throw new NotFoundException(`Không tìm thấy Tag với ID: ${tagId}`);
      }
    } else if (dto.tag) {
      const tag = await this.tagRepository.findOne({
        where: { name: dto.tag },
      });
      if (tag) {
        tagId = tag.id;
      }
    }

    const content = dto.content || {
      overview: dto.overview || '',
      objectives: dto.objectives || [],
      steps: dto.steps || [],
      questions: dto.questionsData || [],
      targetScore: dto.targetScore ?? 100,
    };

    if (dto.type === ExerciseType.QUIZ) {
      const qList = content.questions || dto.questionsData || [];
      if (Array.isArray(qList)) {
        for (const q of qList) {
          if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
            throw new BadRequestException('Câu hỏi Quiz phải có ít nhất 2 lựa chọn.');
          }
          const uniqueOptions = new Set(q.options);
          if (uniqueOptions.size !== q.options.length) {
            throw new BadRequestException('Lựa chọn trong câu hỏi Quiz không được trùng lặp.');
          }
          if (!q.correctAnswer || !uniqueOptions.has(q.correctAnswer)) {
            throw new BadRequestException('Đáp án đúng phải nằm trong danh sách các lựa chọn.');
          }
        }
      }
    }

    const exercise = this.exerciseRepository.create({
      title: dto.title,
      trackId: dto.trackId,
      lessonId: dto.lessonId || null,
      tagId,
      difficulty: dto.difficulty,
      estimatedTime: dto.estimatedTime,
      xp: dto.xp,
      brief: dto.brief,
      hint: dto.hint,
      type: dto.type ?? ExerciseType.PR_REVIEW,
      content,
      isMandatory: dto.isMandatory ?? true,
    });

    if (dto.resourceDocIds && dto.resourceDocIds.length > 0) {
      exercise.resources = await this.documentRepository.findBy({
        id: In(dto.resourceDocIds),
      });
    }

    return this.exerciseRepository.save(exercise);
  }

  async findAll(query: ExerciseQueryDto, userId?: string, role?: string) {
    const where: any = {};
    if (query.trackId) where.trackId = query.trackId;
    if (query.difficulty) where.difficulty = query.difficulty;
    if (query.lessonId) where.lessonId = query.lessonId;

    const exercises = await this.exerciseRepository.find({
      where,
      relations: { track: true, tagEntity: true },
    });

    const submissions = userId
      ? ((await this.submissionRepository.find({ where: { userId } })) || [])
      : [];
    const submissionMap = new Map<string, Submission>();
    submissions.forEach((s) => submissionMap.set(s.exerciseId, s));

    const autoGrades = userId
      ? ((await this.autoGradeRepository.find({ where: { userId } })) || [])
      : [];
    const autoGradeMap = new Map<string, AutoGrade[]>();
    autoGrades.forEach((ag) => {
      const list = autoGradeMap.get(ag.exerciseId) || [];
      list.push(ag);
      autoGradeMap.set(ag.exerciseId, list);
    });

    let data = exercises.map((e) => {
      let status: ExerciseFilterStatus = ExerciseFilterStatus.PENDING;
      let prUrl: string | null = null;
      const exType = e.type ?? ExerciseType.PR_REVIEW;

      if (exType === ExerciseType.PR_REVIEW) {
        const sub = submissionMap.get(e.id);
        if (sub) {
          status = sub.status as unknown as ExerciseFilterStatus;
          prUrl = sub.prUrl;
        }
      } else {
        const attempts = autoGradeMap.get(e.id) || [];
        if (attempts.some((a) => a.passed)) {
          status = ExerciseFilterStatus.APPROVED;
        } else if (attempts.length > 0) {
          status = ExerciseFilterStatus.IN_PROGRESS;
        }
      }

      const content = e.content || {};
      const anyE = e as any;
      const objectives = content.objectives || anyE.objectives || [];
      const objectiveCount = Array.isArray(objectives)
        ? objectives.length
        : typeof objectives === 'object' && objectives !== null
          ? Object.keys(objectives).length
          : 0;

      const tagName = e.tagEntity?.name || '';
      const isReadOnly =
        role !== UserRole.ADMIN &&
        e.track?.status !== TrackStatus.ACTIVE &&
        status !== ExerciseFilterStatus.PENDING;

      return {
        id: e.id,
        title: e.title,
        trackId: e.trackId,
        track: e.track?.title || '',
        tag: tagName,
        tagId: e.tagId || null,
        difficulty: e.difficulty,
        estimatedTime: e.estimatedTime,
        xp: e.xp,
        brief: e.brief,
        objectiveCount,
        status,
        prUrl,
        lessonId: e.lessonId,
        type: e.type,
        isMandatory: e.isMandatory,
        isReadOnly,
      };
    });

    if (role !== UserRole.ADMIN) {
      const trackIds = Array.from(
        new Set(exercises.map((e) => e.trackId).filter(Boolean)),
      );
      const lessonsByTrack = new Map<string, Lesson[]>();
      for (const tId of trackIds) {
        const lList =
          (await this.lessonRepository.find({ where: { trackId: tId } })) || [];
        lessonsByTrack.set(tId, lList);
      }

      const allLessonIds = Array.from(
        new Set(
          Array.from(lessonsByTrack.values())
            .flat()
            .map((l) => l.id),
        ),
      );
      const completedProgress =
        userId && allLessonIds.length > 0
          ? ((await this.lessonProgressRepository.find({
              where: { userId, lessonId: In(allLessonIds) },
            })) || [])
          : [];
      const isCompleted = (p: any) =>
        Boolean(p.completedAt) ||
        p.status === 'completed' ||
        p.status === 'COMPLETED';
      const completedLessonIds = new Set(
        completedProgress.filter(isCompleted).map((p) => p.lessonId),
      );

      data = data.filter((item) => {
        const isSubmittedOrPassed =
          item.status !== ExerciseFilterStatus.PENDING;
        const exEntity = exercises.find((e) => e.id === item.id);
        if (!exEntity) return false;

        if (
          exEntity.track &&
          exEntity.track.status &&
          exEntity.track.status !== TrackStatus.ACTIVE &&
          !isSubmittedOrPassed
        ) {
          return false;
        }

        if (item.lessonId && !isSubmittedOrPassed) {
          const lessons = lessonsByTrack.get(item.trackId) || [];
          const currentLesson = lessons.find((l) => l.id === item.lessonId);
          if (currentLesson && typeof currentLesson.order === 'number') {
            const prevLessons = lessons.filter(
              (l) =>
                (typeof l.order === 'number' ? l.order : 0) <
                currentLesson.order,
            );
            if (prevLessons.some((l) => !completedLessonIds.has(l.id))) {
              return false;
            }
          }
        }

        return true;
      });
    }

    if (query.tag) {
      data = data.filter((item) => item.tag === query.tag);
    }

    if (query.status) {
      data = data.filter((item) => item.status === query.status);
    }

    return { data };
  }

  private sanitizeQuestionsData(
    questions: any[] | null,
    keepExplanation = false,
  ): any[] | null {
    if (!questions) return null;
    return questions.map((q) => {
      const {
        correctAnswer: _correctAnswer,
        correctAnswers: _correctAnswers,
        explanation: _explanation,
        ...safe
      } = q;
      void _correctAnswer;
      void _correctAnswers;
      if (keepExplanation && _explanation !== undefined) {
        safe.explanation = _explanation;
      } else {
        void _explanation;
      }
      return safe;
    });
  }

  async findOne(id: string, userId: string, role?: UserRole) {
    const exercise = await this.exerciseRepository.findOne({
      where: { id },
      relations: { track: true, resources: true, tagEntity: true },
    });

    if (!exercise) {
      throw new NotFoundException({
        code: 'EXERCISE_NOT_FOUND',
        message: `Không tìm thấy bài tập với ID: ${id}`,
      });
    }

    const exType = exercise.type ?? ExerciseType.PR_REVIEW;
    const submission = await this.submissionRepository.findOne({
      where: { exerciseId: id, userId },
    });
    const autoGrades =
      (await this.autoGradeRepository.find({
        where: { exerciseId: id, userId },
      })) || [];

    let status: ExerciseFilterStatus = ExerciseFilterStatus.PENDING;
    let prUrl: string | null = null;

    if (exType === ExerciseType.PR_REVIEW || (submission && !autoGrades.length)) {
      if (submission) {
        status = submission.status as unknown as ExerciseFilterStatus;
        prUrl = submission.prUrl;
      }
    } else {
      if (autoGrades.some((ag) => ag.passed)) {
        status = ExerciseFilterStatus.APPROVED;
      } else if (autoGrades.length > 0) {
        status = ExerciseFilterStatus.IN_PROGRESS;
      }
    }

    const isSubmittedOrPassed =
      status !== ExerciseFilterStatus.PENDING ||
      Boolean(
        (submission && submission.status !== SubmissionStatus.PENDING) ||
          autoGrades.some((ag) => ag.passed),
      );

    if (role !== UserRole.ADMIN) {
      if (
        exercise.track &&
        exercise.track.status &&
        exercise.track.status !== TrackStatus.ACTIVE &&
        !isSubmittedOrPassed
      ) {
        throw new ForbiddenException({
          code: 'TRACK_INACTIVE',
          message: 'Lộ trình học đã ngừng hoạt động.',
        });
      }

      if (exercise.lessonId && !isSubmittedOrPassed) {
        const lessons =
          (await this.lessonRepository.find({
            where: { trackId: exercise.trackId },
          })) || [];
        const currentLesson = lessons.find((l) => l.id === exercise.lessonId);
        if (currentLesson && typeof currentLesson.order === 'number') {
          const prevLessons = lessons.filter(
            (l) =>
              (typeof l.order === 'number' ? l.order : 0) < currentLesson.order,
          );
          if (prevLessons.length > 0) {
            const progress =
              (await this.lessonProgressRepository.find({
                where: {
                  userId,
                  lessonId: In(prevLessons.map((l) => l.id)),
                },
              })) || [];
            const isCompleted = (p: any) =>
              Boolean(p.completedAt) ||
              p.status === 'completed' ||
              p.status === 'COMPLETED';
            const completedIds = new Set(
              progress.filter(isCompleted).map((p) => p.lessonId),
            );
            if (prevLessons.some((l) => !completedIds.has(l.id))) {
              throw new ForbiddenException({
                code: 'EXERCISE_LOCKED',
                message:
                  'Bài tập đang bị khóa cho đến khi bạn hoàn thành bài học trước.',
              });
            }
          }
        }
      }
    }

    const content = exercise.content || {};
    const isApproved = status === ExerciseFilterStatus.APPROVED;
    let sanitizedContent = { ...content };

    if (role !== UserRole.ADMIN) {
      if (
        sanitizedContent.questions &&
        Array.isArray(sanitizedContent.questions)
      ) {
        sanitizedContent.questions = this.sanitizeQuestionsData(
          sanitizedContent.questions,
          isApproved,
        );
      }
      if (sanitizedContent.blanks && Array.isArray(sanitizedContent.blanks)) {
        sanitizedContent.blanks = this.sanitizeQuestionsData(
          sanitizedContent.blanks,
          isApproved,
        );
      }
    }

    const tagName = exercise.tagEntity?.name || '';
    const anyEx = exercise as any;
    const rawQuestions = content.questions || anyEx.questionsData || null;
    const questionsData =
      role === UserRole.ADMIN
        ? rawQuestions
        : this.sanitizeQuestionsData(rawQuestions, isApproved);

    const isReadOnly =
      role !== UserRole.ADMIN &&
      exercise.track?.status !== TrackStatus.ACTIVE &&
      isSubmittedOrPassed;

    return {
      id: exercise.id,
      title: exercise.title,
      trackId: exercise.trackId,
      track: exercise.track?.title || '',
      tag: tagName,
      tagId: exercise.tagId || null,
      tagData: exercise.tagEntity || null,
      difficulty: exercise.difficulty,
      estimatedTime: exercise.estimatedTime,
      xp: exercise.xp,
      brief: exercise.brief,
      content: sanitizedContent,
      overview: content.overview || anyEx.overview || '',
      objectives: content.objectives || anyEx.objectives || [],
      steps: content.steps || anyEx.steps || [],
      resources: exercise.resources,
      hint: exercise.hint,
      status,
      prUrl,
      lessonId: exercise.lessonId,
      type: exercise.type,
      isMandatory: exercise.isMandatory,
      isReadOnly,
      targetScore: content.targetScore ?? anyEx.targetScore ?? 100,
      questionsData,
    };
  }

  async startExercise(exerciseId: string, userId: string) {
    const exercise = await this.exerciseRepository.findOne({
      where: { id: exerciseId },
    });
    if (!exercise) {
      throw new NotFoundException(
        `Không tìm thấy bài tập với ID: ${exerciseId}`,
      );
    }

    if (exercise.type === ExerciseType.PR_REVIEW) {
      let sub = await this.submissionRepository.findOne({
        where: { exerciseId, userId },
      });
      if (!sub) {
        sub = this.submissionRepository.create({
          exerciseId,
          userId,
          prUrl: null,
          status: SubmissionStatus.IN_PROGRESS,
          submittedAt: null,
        });
        await this.submissionRepository.save(sub);
      } else if (sub.status === SubmissionStatus.PENDING) {
        sub.status = SubmissionStatus.IN_PROGRESS;
        await this.submissionRepository.save(sub);
      }
      return { status: sub.status, prUrl: sub.prUrl };
    } else {
      let autoGrade = await this.autoGradeRepository.findOne({
        where: { exerciseId, userId },
      });
      if (!autoGrade) {
        autoGrade = this.autoGradeRepository.create({
          exerciseId,
          userId,
          result: { started: true },
          passed: false,
        });
        await this.autoGradeRepository.save(autoGrade);
      }
      return { status: ExerciseFilterStatus.IN_PROGRESS, prUrl: null };
    }
  }

  async submitAuto(
    exerciseId: string,
    userId: string,
    dto: SubmitAutoDto,
  ): Promise<AutoGradeResultDto> {
    const exercise = await this.exerciseRepository.findOne({
      where: { id: exerciseId },
    });
    if (!exercise) {
      throw new NotFoundException(
        `Không tìm thấy bài tập với ID: ${exerciseId}`,
      );
    }

    if (
      exercise.type !== ExerciseType.QUIZ &&
      exercise.type !== ExerciseType.FILL_IN_BLANK
    ) {
      throw new BadRequestException(
        'Bài tập này không hỗ trợ tự động chấm điểm (chỉ QUIZ hoặc FILL_IN_BLANK).',
      );
    }

    const content = exercise.content || {};
    const anyEx = exercise as any;
    const questions =
      exercise.type === ExerciseType.QUIZ
        ? content.questions || anyEx.questionsData || []
        : content.blanks || [];

    if (!questions || questions.length === 0) {
      throw new BadRequestException('Bài tập chưa được cấu hình câu hỏi/đáp án.');
    }

    const answerMap = new Map(dto.answers.map((a) => [a.questionId, a.answer]));

    const normalize = (value: string): string =>
      exercise.type === ExerciseType.FILL_IN_BLANK
        ? (value || '').trim().toLowerCase()
        : (value || '').trim();

    const results = questions.map((q: any, idx: number) => {
      const qId = q.id || `blank-${q.position ?? idx}`;
      const given = answerMap.get(qId);
      let correct = false;

      if (given !== undefined) {
        if (exercise.type === ExerciseType.FILL_IN_BLANK) {
          correct = normalize(given) === normalize(q.correctAnswer || '');
        } else if (Array.isArray(q.correctAnswers)) {
          correct = q.correctAnswers.some(
            (ca: string) => normalize(given) === normalize(ca),
          );
        } else {
          correct = normalize(given) === normalize(q.correctAnswer || '');
        }
      }

      return {
        questionId: qId,
        correct,
        explanation: q.explanation ?? null,
      };
    });

    const correctCount = results.filter((r) => r.correct).length;
    const score = Math.round((correctCount / questions.length) * 100);
    const targetScore = content.targetScore ?? anyEx.targetScore ?? 100;
    const passed = score >= targetScore;

    const existingPassed = await this.autoGradeRepository.findOne({
      where: { exerciseId, userId, passed: true },
    });
    const alreadyCompleted = !!existingPassed;

    const autoGrade = this.autoGradeRepository.create({
      exerciseId,
      userId,
      result: { score, correctCount, totalQuestions: questions.length, targetScore, passed, results },
      passed,
    });
    await this.autoGradeRepository.save(autoGrade);

    let completed = alreadyCompleted;
    if (passed && !alreadyCompleted) {
      let sub = await this.submissionRepository.findOne({
        where: { exerciseId, userId },
      });
      if (!sub) {
        sub = this.submissionRepository.create({
          exerciseId,
          userId,
          prUrl: null,
          status: SubmissionStatus.APPROVED,
          submittedAt: new Date(),
        });
      } else {
        sub.status = SubmissionStatus.APPROVED;
        sub.submittedAt = new Date();
      }
      await this.submissionRepository.save(sub);

      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (user) {
        user.xp += exercise.xp ?? 0;
        user.level = this.resolveLevel(user.xp);
        await this.userRepository.save(user);
      }
      completed = true;
    }

    return {
      score,
      correctCount,
      totalQuestions: questions.length,
      targetScore,
      passed,
      completed,
      results,
    };
  }

  async update(id: string, dto: UpdateExerciseDto): Promise<Exercise> {
    const exercise = await this.exerciseRepository.findOne({
      where: { id },
      relations: { resources: true },
    });
    if (!exercise) {
      throw new NotFoundException(`Không tìm thấy bài tập với ID: ${id}`);
    }

    if (dto.trackId) {
      const track = await this.trackRepository.findOne({
        where: { id: dto.trackId },
      });
      if (!track) {
        throw new NotFoundException(
          `Không tìm thấy Track với ID: ${dto.trackId}`,
        );
      }
    }

    if (dto.tagId) {
      const tag = await this.tagRepository.findOne({
        where: { id: dto.tagId },
      });
      if (!tag) {
        throw new NotFoundException(`Không tìm thấy Tag với ID: ${dto.tagId}`);
      }
      exercise.tagId = tag.id;
    }

    if (dto.content) {
      exercise.content = dto.content;
    } else {
      const currentContent = exercise.content || {};
      if (dto.overview !== undefined) currentContent.overview = dto.overview;
      if (dto.objectives !== undefined) currentContent.objectives = dto.objectives;
      if (dto.steps !== undefined) currentContent.steps = dto.steps;
      if (dto.questionsData !== undefined) currentContent.questions = dto.questionsData;
      if (dto.targetScore !== undefined) currentContent.targetScore = dto.targetScore;
      exercise.content = currentContent;
    }

    Object.assign(exercise, {
      title: dto.title !== undefined ? dto.title : exercise.title,
      trackId: dto.trackId !== undefined ? dto.trackId : exercise.trackId,
      lessonId: dto.lessonId !== undefined ? dto.lessonId : exercise.lessonId,
      difficulty:
        dto.difficulty !== undefined ? dto.difficulty : exercise.difficulty,
      estimatedTime:
        dto.estimatedTime !== undefined
          ? dto.estimatedTime
          : exercise.estimatedTime,
      xp: dto.xp !== undefined ? dto.xp : exercise.xp,
      brief: dto.brief !== undefined ? dto.brief : exercise.brief,
      hint: dto.hint !== undefined ? dto.hint : exercise.hint,
      type: dto.type !== undefined ? dto.type : exercise.type,
      isMandatory:
        dto.isMandatory !== undefined ? dto.isMandatory : exercise.isMandatory,
    });

    if (dto.resourceDocIds !== undefined) {
      if (dto.resourceDocIds.length > 0) {
        exercise.resources = await this.documentRepository.findBy({
          id: In(dto.resourceDocIds),
        });
      } else {
        exercise.resources = [];
      }
    }

    return this.exerciseRepository.save(exercise);
  }

  async remove(id: string): Promise<void> {
    const exercise = await this.exerciseRepository.findOne({ where: { id } });
    if (!exercise) {
      throw new NotFoundException(`Không tìm thấy bài tập với ID: ${id}`);
    }
    await this.exerciseRepository.remove(exercise);
  }
}
