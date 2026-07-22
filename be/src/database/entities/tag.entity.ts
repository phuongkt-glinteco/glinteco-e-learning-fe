import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { Document } from './document.entity';
import { Exercise } from './exercise.entity';

export enum TagCategory {
  TRACK = 'TRACK',
  EXERCISE = 'EXERCISE',
  DOCUMENT = 'DOCUMENT',
  GENERAL = 'GENERAL',
}

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'enum', enum: TagCategory, default: TagCategory.GENERAL })
  category: TagCategory;

  @ManyToMany(() => Document, (document) => document.tags)
  documents: Document[];

  @OneToMany(() => Exercise, (exercise) => exercise.tagEntity)
  exercises: Exercise[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
