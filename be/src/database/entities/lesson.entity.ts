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
import { LessonProgress } from './lesson-progress.entity';
import { Document } from './document.entity';

export enum LessonType {
  VIDEO = 'video',
  READING = 'reading',
  QUIZ = 'quiz',
  CODING = 'coding',
  ASSIGNMENT = 'assignment',
}

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

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'lesson_order' })
  order: number;

  @Column()
  estimatedTime: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'enum', enum: LessonType, default: LessonType.READING })
  type: LessonType;

  @ManyToMany(() => Document)
  @JoinTable({
    name: 'lesson_documents',
    joinColumn: { name: 'lessonId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'documentId', referencedColumnName: 'id' },
  })
  relatedDocs: Document[];

  @OneToMany(() => LessonProgress, (progress) => progress.lesson)
  progresses: LessonProgress[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
