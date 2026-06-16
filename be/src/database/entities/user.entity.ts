import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Cohort } from './cohort.entity';
import { TrackProgress } from './track-progress.entity';
import { Submission } from './submission.entity';
import { LessonProgress } from './lesson-progress.entity';

export enum UserRole {
  LEARNER = 'learner',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'int', nullable: true })
  avatarHue: number;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.LEARNER })
  role: UserRole;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  xp: number;

  @Column({ default: 0 })
  streakDays: number;

  @Column({ nullable: true })
  cohortId: string;

  @ManyToOne(() => Cohort, (cohort) => cohort.users)
  @JoinColumn({ name: 'cohortId' })
  cohort: Cohort;

  @OneToMany(() => TrackProgress, (progress) => progress.user)
  trackProgresses: TrackProgress[];

  @OneToMany(() => LessonProgress, (progress) => progress.user)
  lessonProgresses: LessonProgress[];

  @OneToMany(() => Submission, (submission) => submission.user)
  submissions: Submission[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
