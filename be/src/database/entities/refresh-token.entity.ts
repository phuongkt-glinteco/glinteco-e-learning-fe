import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

/**
 * A persisted, revocable refresh-token handle. The `token` column stores a
 * SHA-256 hash of the issued refresh JWT (never the raw token) so a database
 * leak cannot be replayed as a live session, while still allowing a fast
 * deterministic lookup on refresh/logout. Rows are rotated on every refresh
 * and removed on logout.
 */
@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar' })
  token: string;

  @Column({ name: 'expiresAt', type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;
}
