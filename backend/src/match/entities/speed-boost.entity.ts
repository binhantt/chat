import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('speed_boosts')
@Index('idx_speed_boost_user', ['userId'])
@Index('idx_speed_boost_expires', ['boostExpiresAt'])
export class SpeedBoost {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column({ type: 'timestamptz', nullable: true })
  adViewedAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  boostExpiresAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  cooldownUntil!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
