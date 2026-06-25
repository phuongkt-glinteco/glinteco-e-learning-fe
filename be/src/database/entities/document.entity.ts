import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Tag } from './tag.entity';
import { User } from './user.entity';

export enum DocumentKind {
  GUIDE = 'Guide',
  REFERENCE = 'Reference',
  RUNBOOK = 'Runbook',
  TUTORIAL = 'Tutorial',
  LINK = 'Link',
}

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ nullable: true })
  url: string;

  @Column({
    type: 'enum',
    enum: DocumentKind,
    default: DocumentKind.GUIDE,
  })
  kind: DocumentKind;

  @ManyToMany(() => Tag, (tag) => tag.documents)
  @JoinTable({
    name: 'document_tags',
    joinColumn: { name: 'documentId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
  })
  tags: Tag[];

  @ManyToMany(() => User, (user) => user.bookmarkedDocuments)
  bookmarkedBy: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
