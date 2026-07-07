import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  Admin = 'admin',
  User = 'user',
}

export enum UserGender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
}

export enum UserLockType {
  None = 'none',
  FifteenDays = '15_days',
  ThirtyDays = '30_days',
  Permanent = 'permanent',
}

@Entity('users')
@Index('idx_users_city_gender_active', ['city', 'gender', 'isActive'])
@Index('idx_users_role_created', ['role', 'createdAt'])
@Index('idx_users_role_created_id', ['role', 'createdAt', 'id'])
@Index('idx_users_active_created_id', ['isActive', 'createdAt', 'id'])
@Index('idx_users_active_lock_created_id', [
  'isActive',
  'lockType',
  'createdAt',
  'id',
])
@Index('idx_users_created_id', ['createdAt', 'id'])
@Index('idx_users_lock_created_id', ['lockType', 'createdAt', 'id'])
@Index('idx_users_lock_state', ['lockType', 'lockedUntil'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // --- THÔNG TIN ĐĂNG NHẬP GOOGLE ---
  @Column({ unique: true })
  email!: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  googleId!: string | null; // ID định danh từ Google (sub)

  // --- THÔNG TIN ĐĂNG NHẬP EMAIL/PASSWORD ---
  @Column({ type: 'varchar', nullable: true, select: false })
  passwordHash!: string | null;

  // --- THÔNG TIN CHI TIẾT ---
  @Column({ type: 'varchar', nullable: true })
  fullName!: string | null;

  @Column({ nullable: true, type: 'text' })
  avatarUrl!: string | null; // Đường dẫn ảnh (từ Google hoặc tự upload)

  @Column({ nullable: true, type: 'text' })
  badge!: string | null; // Huy hiệu VIP (URL ảnh hoặc emoji)

  @Column({ nullable: true, type: 'date' })
  dateOfBirth!: Date | null;
  @Column({ type: 'varchar', nullable: true })
  phoneNumber!: string | null;

  @Column({ type: 'text', nullable: true })
  bio!: string | null;

  @Column({
    type: 'enum',
    enum: UserGender,
    nullable: true,
  })
  gender!: UserGender | null;

  @Column({ type: 'varchar', nullable: true })
  city!: string | null;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.User,
  })
  role!: UserRole;

  // --- QUẢN LÝ TRẠNG THÁI ---
  @Column({ default: true })
  isActive!: boolean;

  @Column({
    type: 'enum',
    enum: UserLockType,
    default: UserLockType.None,
  })
  lockType!: UserLockType;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lockedUntil!: Date | null;

  @Column({ type: 'text', nullable: true })
  lockReason!: string | null;

  @Column({ type: 'varchar', nullable: true })
  lockedByReportId!: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;
}
