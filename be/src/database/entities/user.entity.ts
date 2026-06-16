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

  @Column({ unique: true, nullable: true, name: 'google_id' })
  googleId?: string;

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

  @OneToMany(() => Submission, (submission) => submission.user)
  submissions: Submission[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
