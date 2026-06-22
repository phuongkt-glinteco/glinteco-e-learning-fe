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
import { LessonProgress } from './lesson-progress.entity';

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  trackId: string;

  @ManyToOne(() => Track, (track) => track.lessons)
  @JoinColumn({ name: 'trackId' })
  track: Track;

  @Column()
  title: string;

  @Column({ name: 'lesson_order' })
  order: number;

  @Column()
  estimatedTime: string;

  @Column({ type: 'text' })
  body: string;

  @OneToMany(() => LessonProgress, (progress) => progress.lesson)
  progresses: LessonProgress[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
