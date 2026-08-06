import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Ad } from './ad.entity';

export enum AdEventType {
  Impression = 'impression',
  Click = 'click',
}

@Entity('ad_stats')
@Index('idx_ad_stats_ad_created', ['adId', 'createdAt'])
@Index('idx_ad_stats_type_created', ['type', 'createdAt'])
export class AdStats {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Ad)
  @JoinColumn({ name: 'ad_id' })
  ad!: Ad;

  @Column({ name: 'ad_id' })
  adId!: string;

  @Column({ type: 'enum', enum: AdEventType })
  type!: AdEventType;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress!: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;
}
