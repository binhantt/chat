import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  Admin = 'admin',
  User = 'user',
}

@Entity('users')
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
  @Column({ nullable: true, type: 'date' })
  dateOfBirth!: Date | null;
  @Column({ type: 'varchar', nullable: true })
  phoneNumber!: string | null;

  @Column({ type: 'text', nullable: true })
  bio!: string | null;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.User,
  })
  role!: UserRole;

  // --- QUẢN LÝ TRẠNG THÁI ---
  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;
}
