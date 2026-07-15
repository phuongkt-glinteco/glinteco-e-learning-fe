import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  Exercise,
  ExerciseType,
  ExerciseQuestion,
} from '../database/entities/exercise.entity';
import { Track } from '../database/entities/track.entity';
import { Document } from '../database/entities/document.entity';
import {
  Submission,
  SubmissionStatus,
} from '../database/entities/submission.entity';
import { UserRole } from '../database/entities/user.entity';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExerciseQueryDto } from './dto/exercise-query.dto';
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
  ) {}

  async create(dto: CreateExerciseDto): Promise<Exercise> {
    const track = await this.trackRepository.findOne({
      where: { id: dto.trackId },
    });
    if (!track) {
      throw new NotFoundException(
        `Không tìm thấy Track với ID: ${dto.trackId}`,
      );
    }

    const exercise = this.exerciseRepository.create({
      title: dto.title,
      trackId: dto.trackId,
      lessonId: dto.lessonId || null,
      tag: dto.tag,
      difficulty: dto.difficulty,
      estimatedTime: dto.estimatedTime,
      xp: dto.xp,
      brief: dto.brief,
      overview: dto.overview,
      objectives: dto.objectives,
      steps: dto.steps,
      hint: dto.hint,
      type: dto.type ?? ExerciseType.PR_REVIEW,
      questionsData: dto.questionsData ?? null,
      targetScore: dto.targetScore ?? 100,
      isMandatory: dto.isMandatory ?? true,
    });

    if (dto.resourceDocIds && dto.resourceDocIds.length > 0) {
      exercise.resources = await this.documentRepository.findBy({
        id: In(dto.resourceDocIds),
      });
    }

    return this.exerciseRepository.save(exercise);
  }

  async findAll(query: ExerciseQueryDto, userId: string) {
    const where: any = {};
    if (query.trackId) where.trackId = query.trackId;
    if (query.tag) where.tag = query.tag;
    if (query.difficulty) where.difficulty = query.difficulty;
    if (query.lessonId) where.lessonId = query.lessonId;

    const exercises = await this.exerciseRepository.find({
      where,
      relations: { track: true },
    });

    const submissions = await this.submissionRepository.find({
      where: { userId },
    });

    const submissionMap = new Map<string, Submission>();
    submissions.forEach((s) => submissionMap.set(s.exerciseId, s));

    let data = exercises.map((e) => {
      const sub = submissionMap.get(e.id);
      const objectiveCount = Array.isArray(e.objectives)
        ? e.objectives.length
        : typeof e.objectives === 'object' && e.objectives !== null
          ? Object.keys(e.objectives).length
          : 0;

      return {
        id: e.id,
        title: e.title,
        trackId: e.trackId,
        track: e.track?.title || '',
        tag: e.tag,
        difficulty: e.difficulty,
        estimatedTime: e.estimatedTime,
        xp: e.xp,
        brief: e.brief,
        objectiveCount,
        status: sub ? sub.status : 'pending',
        prUrl: sub ? sub.prUrl : null,
        lessonId: e.lessonId,
        type: e.type,
        isMandatory: e.isMandatory,
      };
    });

    if (query.status) {
      data = data.filter((item) => item.status === query.status);
    }

    return { data };
  }

  /**
   * GLI-92: remove every `correctAnswer` before questions are serialized to
   * a learner. Done server-side so answers can never leak via devtools.
   */
  private sanitizeQuestionsData(
    questions: ExerciseQuestion[] | null,
  ): Array<Omit<ExerciseQuestion, 'correctAnswer'>> | null {
    if (!questions) return null;
    return questions.map((q) => {
      const { correctAnswer: _stripped, ...safe } = q;
      void _stripped;
      return safe;
    });
  }

  async findOne(id: string, userId: string, role?: UserRole) {
    const exercise = await this.exerciseRepository.findOne({
      where: { id },
      relations: { track: true, resources: true },
    });

    if (!exercise) {
      throw new NotFoundException(`Không tìm thấy bài tập với ID: ${id}`);
    }

    const submission = await this.submissionRepository.findOne({
      where: { exerciseId: id, userId },
    });

    // GLI-92: only Admins may see correctAnswer inside questionsData.
    const questionsData =
      role === UserRole.ADMIN
        ? exercise.questionsData
        : this.sanitizeQuestionsData(exercise.questionsData);

    return {
      id: exercise.id,
      title: exercise.title,
      trackId: exercise.trackId,
      track: exercise.track?.title || '',
      tag: exercise.tag,
      difficulty: exercise.difficulty,
      estimatedTime: exercise.estimatedTime,
      xp: exercise.xp,
      brief: exercise.brief,
      overview: exercise.overview,
      objectives: exercise.objectives,
      steps: exercise.steps,
      resources: exercise.resources,
      hint: exercise.hint,
      status: submission ? submission.status : 'pending',
      prUrl: submission ? submission.prUrl : null,
      lessonId: exercise.lessonId,
      type: exercise.type,
      isMandatory: exercise.isMandatory,
      targetScore: exercise.targetScore,
      questionsData,
    };
  }

  /**
   * GLI-92: auto-grade a QUIZ / FILL_IN_BLANK attempt.
   * - First passing attempt marks the exercise completed (approved
   *   submission log).
   * - Later attempts are graded and returned but never mutate DB state.
   */
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

    const questions = exercise.questionsData;
    if (!questions || questions.length === 0) {
      throw new BadRequestException('Bài tập chưa được cấu hình câu hỏi.');
    }

    const answerMap = new Map(dto.answers.map((a) => [a.questionId, a.answer]));

    const normalize = (value: string): string =>
      exercise.type === ExerciseType.FILL_IN_BLANK
        ? value.trim().toLowerCase()
        : value.trim();

    const results = questions.map((q) => {
      const given = answerMap.get(q.id);
      const correct =
        given !== undefined && normalize(given) === normalize(q.correctAnswer);
      return { questionId: q.id, correct };
    });

    const correctCount = results.filter((r) => r.correct).length;
    const score = Math.round((correctCount / questions.length) * 100);
    const targetScore = exercise.targetScore ?? 100;
    const passed = score >= targetScore;

    const existing = await this.submissionRepository.findOne({
      where: { exerciseId, userId },
    });
    const alreadyCompleted = existing?.status === SubmissionStatus.APPROVED;

    let completed = alreadyCompleted;
    // First passing attempt: mark completed + persist a submission log.
    // Replays after completion never touch the DB (no junk logs, no
    // status flapping).
    if (passed && !alreadyCompleted) {
      if (existing) {
        existing.status = SubmissionStatus.APPROVED;
        existing.submittedAt = new Date();
        await this.submissionRepository.save(existing);
      } else {
        const submission = this.submissionRepository.create({
          exerciseId,
          userId,
          prUrl: 'auto-graded',
          status: SubmissionStatus.APPROVED,
          submittedAt: new Date(),
        });
        await this.submissionRepository.save(submission);
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

    Object.assign(exercise, {
      title: dto.title !== undefined ? dto.title : exercise.title,
      trackId: dto.trackId !== undefined ? dto.trackId : exercise.trackId,
      lessonId: dto.lessonId !== undefined ? dto.lessonId : exercise.lessonId,
      tag: dto.tag !== undefined ? dto.tag : exercise.tag,
      difficulty:
        dto.difficulty !== undefined ? dto.difficulty : exercise.difficulty,
      estimatedTime:
        dto.estimatedTime !== undefined
          ? dto.estimatedTime
          : exercise.estimatedTime,
      xp: dto.xp !== undefined ? dto.xp : exercise.xp,
      brief: dto.brief !== undefined ? dto.brief : exercise.brief,
      overview: dto.overview !== undefined ? dto.overview : exercise.overview,
      objectives:
        dto.objectives !== undefined ? dto.objectives : exercise.objectives,
      steps: dto.steps !== undefined ? dto.steps : exercise.steps,
      hint: dto.hint !== undefined ? dto.hint : exercise.hint,
      type: dto.type !== undefined ? dto.type : exercise.type,
      questionsData:
        dto.questionsData !== undefined
          ? dto.questionsData
          : exercise.questionsData,
      targetScore:
        dto.targetScore !== undefined ? dto.targetScore : exercise.targetScore,
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
