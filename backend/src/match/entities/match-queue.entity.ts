import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { UserGender } from '../../users/entities/user.entity';

export enum MatchQueueStatus {
  Waiting = 'waiting',
  Matched = 'matched',
  Expired = 'expired',
  Cancelled = 'cancelled',
}

@Entity('match_queue')
@Index('idx_match_queue_user_created', ['userId', 'createdAt'])
@Index('idx_match_queue_waiting_retry', ['status', 'createdAt'])
@Index('idx_match_queue_find_waiting', [
  'status',
  'gender',
  'city',
  'expiresAt',
  'createdAt',
])
@Index('idx_match_queue_conversation', ['conversationId'])
export class MatchQueue {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column({
    type: 'enum',
    enum: UserGender,
    nullable: true,
  })
  gender!: UserGender | null;

  @Column({ type: 'varchar', nullable: true })
  city!: string | null;

  @Column({
    type: 'enum',
    enum: MatchQueueStatus,
    default: MatchQueueStatus.Waiting,
  })
  status!: MatchQueueStatus;

  @Column({ type: 'varchar', nullable: true })
  matchedWithUserId!: string | null;

  @Column({ type: 'varchar', nullable: true })
  conversationId!: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @Column({ type: 'varchar', nullable: true })
  preferredGender!: string | null;

  @Column({ type: 'int', nullable: true })
  ageMin!: number | null;

  @Column({ type: 'int', nullable: true })
  ageMax!: number | null;

  @Column({ type: 'int', default: 0 })
  priorityScore!: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  expiresAt!: Date | null;
}
