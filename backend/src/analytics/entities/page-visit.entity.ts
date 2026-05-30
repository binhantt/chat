import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('page_visits')
@Index('idx_page_visits_created_id', ['createdAt', 'id'])
@Index('idx_page_visits_path_created', ['path', 'createdAt'])
@Index('idx_page_visits_visitor_created', ['visitorId', 'createdAt'])
export class PageVisit {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 500 })
  path!: string;

  @Column({ length: 80 })
  visitorId!: string;

  @Column({ length: 300, nullable: true })
  userAgent!: string | null;

  @Column({ length: 64, nullable: true })
  ipHash!: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;
}
