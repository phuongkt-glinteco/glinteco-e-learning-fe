import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Lesson } from './lesson.entity';
import { TrackProgress } from './track-progress.entity';
import { Exercise } from './exercise.entity';

@Entity('tracks')
export class Track {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Index('IDX_tracks_track_order')
  @Column({ name: 'track_order' })
  order: number;

  @Column({ default: 0 })
  lessonsCount: number;

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
