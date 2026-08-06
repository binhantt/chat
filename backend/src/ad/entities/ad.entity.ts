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

export enum AdStatus {
  Pending = 'pending',
  Active = 'active',
  Rejected = 'rejected',
  Expired = 'expired',
}

@Entity('ads')
@Index('idx_ads_status_created', ['status', 'createdAt'])
@Index('idx_ads_user_status', ['userId', 'status'])
export class Ad {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  content!: string | null;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl!: string | null;

  @Column({ name: 'target_url', type: 'text', nullable: true })
  targetUrl!: string | null;

  @Column({ type: 'enum', enum: AdStatus, default: AdStatus.Pending })
  status!: AdStatus;

  @Column({ name: 'total_impressions', type: 'int', default: 0 })
  totalImpressions!: number;

  @Column({ name: 'total_clicks', type: 'int', default: 0 })
  totalClicks!: number;

  @Column({ name: 'budget', type: 'decimal', precision: 12, scale: 2, default: 0 })
  budget!: number;

  @Column({ name: 'start_date', type: 'timestamp with time zone', nullable: true })
  startDate!: Date | null;

  @Column({ name: 'end_date', type: 'timestamp with time zone', nullable: true })
  endDate!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt!: Date;
}
