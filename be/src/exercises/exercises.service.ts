import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Exercise } from '../database/entities/exercise.entity';
import { Track } from '../database/entities/track.entity';
import { Document } from '../database/entities/document.entity';
import { Submission } from '../database/entities/submission.entity';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExerciseQueryDto } from './dto/exercise-query.dto';

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
      };
    });

    if (query.status) {
      data = data.filter((item) => item.status === query.status);
    }

    return { data };
  }

  async findOne(id: string, userId: string) {
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
