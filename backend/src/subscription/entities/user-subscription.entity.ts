import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { SubscriptionPlan } from './subscription-plan.entity';

export enum SubscriptionStatus {
  Active = 'active',
  Expired = 'expired',
  Cancelled = 'cancelled',
}

@Entity('user_subscriptions')
@Index('idx_user_sub_user_status', ['userId', 'status'])
export class UserSubscription {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'user_id' })
  userId!: string;

  @ManyToOne(() => SubscriptionPlan)
  @JoinColumn({ name: 'plan_id' })
  plan!: SubscriptionPlan;

  @Column({ name: 'plan_id' })
  planId!: string;

  @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.Active })
  status!: SubscriptionStatus;

  @Column({ name: 'start_date', type: 'timestamp with time zone' })
  startDate!: Date;

  @Column({ name: 'end_date', type: 'timestamp with time zone' })
  endDate!: Date;

  @Column({ name: 'auto_renew', type: 'boolean', default: false })
  autoRenew!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt!: Date;
}
