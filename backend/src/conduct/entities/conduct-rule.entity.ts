import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('conduct_rules')
@Index('idx_conduct_rules_active', ['isActive'])
@Index('idx_conduct_rules_created', ['createdAt'])
@Index('idx_conduct_rules_created_id', ['createdAt', 'id'])
export class ConductRule {
  @PrimaryGeneratedColumn('uuid')
  declare id: string;

  @Column({ type: 'varchar', length: 160, unique: true })
  declare phrase: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  declare isActive: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  declare note: string | null;

  @CreateDateColumn({ name: 'created_at' })
  declare createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  declare updatedAt: Date;
}
