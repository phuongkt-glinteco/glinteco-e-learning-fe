import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Document } from './document.entity';

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
