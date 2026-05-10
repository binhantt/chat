import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ConversationStatus {
  Active = 'active',
  Ended = 'ended',
  Blocked = 'blocked',
}

@Entity('conversations')
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

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;
}