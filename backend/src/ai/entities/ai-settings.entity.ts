import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('ai_settings')
export class AiSettings {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ default: false })
  enabled!: boolean;

  @Column({ type: 'text', nullable: true, select: false })
  groqApiKey!: string | null;

  @Column({ type: 'jsonb', nullable: true, select: false })
  groqApiKeys!: string[] | null;

  @Column({ default: 'llama-3.3-70b-versatile' })
  model!: string;

  @Column({ type: 'text', nullable: true })
  systemPrompt!: string | null;

  @Column({ default: 10 })
  replyFrequency!: number;

  @Column({ default: 'Minh Anh' })
  botName!: string;

  @Column({ type: 'text', nullable: true })
  personality!: string | null;

  @Column({ type: 'text', nullable: true })
  botGender!: string | null;

  @Column({ default: 5 })
  timeoutMinutes!: number;

  @Column({ default: 4 })
  aiTakeoverMessages!: number;
}
