import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { Track } from './track.entity';
import { Lesson } from './lesson.entity';
import { Submission } from './submission.entity';
import { Document } from './document.entity';

export enum ExerciseDifficulty {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
}

export enum ExerciseType {
  PR_REVIEW = 'PR_REVIEW',
  QUIZ = 'QUIZ',
  FILL_IN_BLANK = 'FILL_IN_BLANK',
}

/**
 * One auto-gradable question stored inside `questionsData`.
 * `correctAnswer` must NEVER be serialized to learners — see
 * ExercisesService.sanitizeQuestionsData.
 */
export interface ExerciseQuestion {
  id: string;
  prompt: string;
  options?: string[];
  correctAnswer: string;
}

@Entity('exercises')
export class Exercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  trackId: string;

  @ManyToOne(() => Track, (track) => track.exercises)
  @JoinColumn({ name: 'trackId' })
  track: Track;

  @Column({ type: 'uuid', nullable: true })
  lessonId: string | null;

  @ManyToOne(() => Lesson, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'lessonId' })
  lesson: Lesson | null;

  @Column()
  title: string;

  @Column({ type: 'varchar' })
  tag: string;

  @Column({ type: 'enum', enum: ExerciseDifficulty })
  difficulty: ExerciseDifficulty;

  @Column({
    type: 'enum',
    enum: ExerciseType,
    default: ExerciseType.PR_REVIEW,
  })
  type: ExerciseType;

  @Column({ type: 'jsonb', nullable: true, name: 'questions_data' })
  questionsData: ExerciseQuestion[] | null;

  // Minimum score (percent) required to pass an auto-graded exercise.
  @Column({ type: 'integer', default: 100, name: 'target_score' })
  targetScore: number;

  @Column({ type: 'boolean', default: true, name: 'is_mandatory' })
  isMandatory: boolean;

  @Column({ type: 'varchar', name: 'estimated_time' })
  estimatedTime: string;

  @Column({ type: 'integer' })
  xp: number;

  @Column({ type: 'text' })
  brief: string;

  @Column({ type: 'text' })
  overview: string;

  @Column({ type: 'jsonb', nullable: true })
  objectives: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  steps: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  hint?: string;

  @ManyToMany(() => Document)
  @JoinTable({
    name: 'exercise_documents',
    joinColumn: { name: 'exerciseId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'documentId', referencedColumnName: 'id' },
  })
  resources: Document[];

  @OneToMany(() => Submission, (submission) => submission.exercise)
  submissions: Submission[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
