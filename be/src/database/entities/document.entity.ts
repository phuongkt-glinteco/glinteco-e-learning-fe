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
    enum: ['Guide', 'Reference', 'Runbook', 'Tutorial', 'Link'],
    default: 'Guide',
  })
  kind: 'Guide' | 'Reference' | 'Runbook' | 'Tutorial' | 'Link';

  @ManyToMany(() => Tag, (tag) => tag.documents)
  @JoinTable({
    name: 'document_tags',
    joinColumn: { name: 'documentId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
  })
  tags: Tag[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
