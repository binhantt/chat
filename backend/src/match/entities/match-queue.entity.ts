import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { UserGender } from '../../users/entities/user.entity';

export enum MatchQueueStatus {
  Waiting = 'waiting',
  Matched = 'matched',
  Expired = 'expired',
  Cancelled = 'cancelled',
}

@Entity('match_queue')
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

  @Column({ type: 'timestamp with time zone', nullable: true })
  expiresAt!: Date | null;
}
