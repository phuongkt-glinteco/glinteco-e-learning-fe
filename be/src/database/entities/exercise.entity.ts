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
