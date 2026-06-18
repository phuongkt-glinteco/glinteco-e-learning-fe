import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Submission } from './submission.entity';
import { User } from './user.entity';

@Entity('submission_histories')
export class SubmissionHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  submissionId: string;

  @Column({ nullable: true })
  adminId?: string | null;

  @ManyToOne(() => Submission, (submission) => submission.histories)
  @JoinColumn({ name: 'submissionId' })
  submission: Submission;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'adminId' })
  admin?: User | null;

  @Column({ name: 'pr_url', type: 'varchar', nullable: true })
  prUrl?: string | null;

  @Column()
  action: string;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
