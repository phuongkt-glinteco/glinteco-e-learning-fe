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
import { User } from './user.entity';
import { Exercise } from './exercise.entity';
import { SubmissionHistory } from './submission-history.entity';

export enum SubmissionStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  CHANGES = 'changes',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  exerciseId: string;

  @ManyToOne(() => User, (user) => user.submissions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Exercise, (exercise) => exercise.submissions)
  @JoinColumn({ name: 'exerciseId' })
  exercise: Exercise;

  @Column()
  prUrl: string;

  @Column({
    type: 'enum',
    enum: SubmissionStatus,
    default: SubmissionStatus.PENDING,
  })
  status: SubmissionStatus;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date;

  @OneToMany(() => SubmissionHistory, (history) => history.submission)
  histories: SubmissionHistory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
