import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Conversation } from './conversation.entity';
import { User } from '../../users/entities/user.entity';

export enum MessageStatus {
  Sent = 'sent',
  Delivered = 'delivered',
  Read = 'read',
}

@Entity('messages')
@Index('idx_messages_conversation_created', ['conversationId', 'createdAt'])
@Index('idx_messages_read_status', ['conversationId', 'senderId', 'status'])
@Index('idx_messages_created', ['createdAt'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Conversation)
  @JoinColumn({ name: 'conversation_id' })
  conversation!: Conversation;

  @Column({ name: 'conversation_id' })
  conversationId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_id' })
  sender!: User;

  @Column({ name: 'sender_id' })
  senderId!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({
    type: 'enum',
    enum: MessageStatus,
    default: MessageStatus.Sent,
  })
  status!: MessageStatus;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;
}
