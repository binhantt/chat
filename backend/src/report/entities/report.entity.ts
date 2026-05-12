import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User, UserLockType } from '../../users/entities/user.entity';

export enum ReportReason {
  Spam = 'spam',
  Harassment = 'harassment',
  InappropriateContent = 'inappropriate_content',
  FakeProfile = 'fake_profile',
  Underage = 'underage',
  Other = 'other',
}

export enum ReportStatus {
  Pending = 'pending',
  Reviewed = 'reviewed',
  Resolved = 'resolved',
  Rejected = 'rejected',
}

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'reporter_id' })
  reporterId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reporter_id' })
  reporter!: User;

  @Column({ name: 'reported_user_id' })
  reportedUserId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reported_user_id' })
  reportedUser!: User;

  @Column({
    type: 'enum',
    enum: ReportReason,
  })
  reason!: ReportReason;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.Pending,
  })
  status!: ReportStatus;

  @Column({
    type: 'enum',
    enum: UserLockType,
    default: UserLockType.None,
  })
  lockType!: UserLockType;

  @Column({ name: 'reviewed_by_admin_id', type: 'uuid', nullable: true })
  reviewedByAdminId!: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;
}
