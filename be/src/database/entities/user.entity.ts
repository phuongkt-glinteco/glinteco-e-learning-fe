import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Cohort } from './cohort.entity';
import { TrackProgress } from './track-progress.entity';
import { Submission } from './submission.entity';
import { RefreshToken } from './refresh-token.entity';
import { LessonProgress } from './lesson-progress.entity';
import { Document } from './document.entity';

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

  // Bcrypt hash of the user's password. Nullable so users provisioned without
  // a local password (e.g. seeds or future OAuth) remain valid; AuthService
  // enforces presence at registration time. `select: false` keeps the hash out
  // of every default query so it is never accidentally serialized.
  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  password?: string;

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

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @ManyToMany(() => Document, (document) => document.bookmarkedBy)
  @JoinTable({
    name: 'user_bookmarks',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'documentId', referencedColumnName: 'id' },
  })
  bookmarkedDocuments: Document[];

  @Column({ type: 'varchar', nullable: true, select: false, name: 'reset_password_token' })
  resetPasswordToken?: string | null;

  @Column({ type: 'timestamp', nullable: true, select: false, name: 'reset_password_expires' })
  resetPasswordExpires?: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
