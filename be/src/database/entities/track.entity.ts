import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Lesson } from './lesson.entity';
import { TrackProgress } from './track-progress.entity';
import { Exercise } from './exercise.entity';

@Entity('tracks')
export class Track {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ name: 'track_order' })
  order: number;

  @Column({ default: 0 })
  lessonsCount: number;

  @Column({ type: 'text' })
  description: string;

  @Column()
  estimatedTime: string;

  @Column({ default: 'flag' })
  icon: string;

  @OneToMany(() => Lesson, (lesson) => lesson.track)
  lessons: Lesson[];

  @OneToMany(() => TrackProgress, (progress) => progress.track)
  progresses: TrackProgress[];

  @OneToMany(() => Exercise, (exercise) => exercise.track)
  exercises: Exercise[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
