import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ConversationStatus {
  Active = 'active',
  Ended = 'ended',
  Blocked = 'blocked',
}

@Entity('conversations')
@Index('idx_conversations_user1_status_updated', [
  'user1Id',
  'status',
  'updatedAt',
])
@Index('idx_conversations_user2_status_updated', [
  'user2Id',
  'status',
  'updatedAt',
])
@Index('idx_conversations_user1_updated', ['user1Id', 'updatedAt'])
@Index('idx_conversations_user2_updated', ['user2Id', 'updatedAt'])
@Index('idx_conversations_status_updated_id', ['status', 'updatedAt', 'id'])
@Index('idx_conversations_updated_id', ['updatedAt', 'id'])
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user1_id' })
  user1!: User;

  @Column({ name: 'user1_id' })
  user1Id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user2_id' })
  user2!: User;

  @Column({ name: 'user2_id' })
  user2Id!: string;

  @Column({
    type: 'enum',
    enum: ConversationStatus,
    default: ConversationStatus.Active,
  })
  status!: ConversationStatus;

  @Column({ nullable: true })
  user1Blocked!: boolean;

  @Column({ nullable: true })
  user2Blocked!: boolean;

  @Column({ default: false })
  user1Accepted!: boolean;

  @Column({ default: false })
  user2Accepted!: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;
}
