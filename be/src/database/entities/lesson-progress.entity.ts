import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Lesson } from './lesson.entity';

@Entity('lesson_progresses')
export class LessonProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  lessonId: string;

  @ManyToOne(() => User, (user) => user.lessonProgresses)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Lesson, (lesson) => lesson.progresses)
  @JoinColumn({ name: 'lessonId' })
  lesson: Lesson;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
