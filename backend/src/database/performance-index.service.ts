import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class PerformanceIndexService implements OnModuleInit {
  private readonly logger = new Logger(PerformanceIndexService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    if (this.dataSource.options.type !== 'postgres') {
      return;
    }

    if (process.env.PERFORMANCE_INDEXES === 'false') {
      this.logger.log('Skipped performance index bootstrap');
      return;
    }

    void this.ensureIndexes().catch((error) => {
      this.logger.error('Failed to ensure performance indexes', error);
    });
  }

  private async ensureIndexes(): Promise<void> {
    const indexes = [
      'CREATE INDEX IF NOT EXISTS "idx_conversations_user1_status_updated" ON "conversations" ("user1_id", "status", "updatedAt" DESC)',
      'CREATE INDEX IF NOT EXISTS "idx_conversations_user2_status_updated" ON "conversations" ("user2_id", "status", "updatedAt" DESC)',
      'CREATE INDEX IF NOT EXISTS "idx_conversations_user1_updated" ON "conversations" ("user1_id", "updatedAt" DESC)',
      'CREATE INDEX IF NOT EXISTS "idx_conversations_user2_updated" ON "conversations" ("user2_id", "updatedAt" DESC)',
      'CREATE INDEX IF NOT EXISTS "idx_conversations_active_user1_updated" ON "conversations" ("user1_id", "updatedAt" DESC) WHERE "status" = \'active\'',
      'CREATE INDEX IF NOT EXISTS "idx_conversations_active_user2_updated" ON "conversations" ("user2_id", "updatedAt" DESC) WHERE "status" = \'active\'',
      'CREATE INDEX IF NOT EXISTS "idx_messages_conversation_created" ON "messages" ("conversation_id", "createdAt" DESC)',
      'CREATE INDEX IF NOT EXISTS "idx_messages_sender_created" ON "messages" ("sender_id", "createdAt" DESC)',
      'CREATE INDEX IF NOT EXISTS "idx_messages_read_status" ON "messages" ("conversation_id", "sender_id", "status")',
      'CREATE INDEX IF NOT EXISTS "idx_messages_created" ON "messages" ("createdAt")',
      'CREATE INDEX IF NOT EXISTS "idx_match_queue_user_created" ON "match_queue" ("userId", "createdAt" DESC)',
      'CREATE INDEX IF NOT EXISTS "idx_match_queue_waiting_retry" ON "match_queue" ("status", "createdAt")',
      'CREATE INDEX IF NOT EXISTS "idx_match_queue_find_waiting" ON "match_queue" ("status", "gender", "city", "expiresAt", "createdAt")',
      'CREATE INDEX IF NOT EXISTS "idx_match_queue_waiting_gender_city" ON "match_queue" ("gender", "city", "expiresAt", "createdAt") WHERE "status" = \'waiting\'',
      'CREATE INDEX IF NOT EXISTS "idx_match_queue_waiting_created" ON "match_queue" ("createdAt") WHERE "status" = \'waiting\'',
      'CREATE INDEX IF NOT EXISTS "idx_match_queue_conversation" ON "match_queue" ("conversationId")',
      'CREATE INDEX IF NOT EXISTS "idx_reports_reporter_created" ON "reports" ("reporter_id", "createdAt" DESC)',
      'CREATE INDEX IF NOT EXISTS "idx_reports_reported_created" ON "reports" ("reported_user_id", "createdAt" DESC)',
      'CREATE INDEX IF NOT EXISTS "idx_reports_status_created" ON "reports" ("status", "createdAt" DESC)',
      'CREATE INDEX IF NOT EXISTS "idx_reports_created" ON "reports" ("createdAt" DESC)',
      'CREATE INDEX IF NOT EXISTS "idx_reports_pending_created" ON "reports" ("createdAt" DESC) WHERE "status" = \'pending\'',
      'CREATE INDEX IF NOT EXISTS "idx_users_city_gender_active" ON "users" ("city", "gender", "isActive")',
      'CREATE INDEX IF NOT EXISTS "idx_users_role_created" ON "users" ("role", "createdAt" DESC)',
      'CREATE INDEX IF NOT EXISTS "idx_users_lock_state" ON "users" ("lockType", "lockedUntil")',
      'CREATE INDEX IF NOT EXISTS "idx_conduct_rules_active" ON "conduct_rules" ("is_active")',
      'CREATE INDEX IF NOT EXISTS "idx_conduct_rules_created" ON "conduct_rules" ("created_at" DESC)',
    ];

    for (const sql of indexes) {
      await this.dataSource.query(sql);
    }

    this.logger.log(`Ensured ${indexes.length} performance indexes`);
  }
}
