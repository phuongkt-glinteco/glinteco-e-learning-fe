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
import { Track } from './track.entity';
import { Submission } from './submission.entity';

@Entity('exercises')
export class Exercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  trackId: string;

  @ManyToOne(() => Track, (track) => track.exercises)
  @JoinColumn({ name: 'trackId' })
  track: Track;

  @Column()
  title: string;

  @Column({ type: 'jsonb', nullable: true })
  objectives: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  steps: Record<string, any>;

  @OneToMany(() => Submission, (submission) => submission.exercise)
  submissions: Submission[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
