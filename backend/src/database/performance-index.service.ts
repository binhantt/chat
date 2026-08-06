import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class PerformanceIndexService implements OnModuleInit {
  private readonly logger = new Logger(PerformanceIndexService.name);

  constructor(private readonly dataSource: DataSource) {}

  onModuleInit(): void {
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
    await this.dataSource.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS "page_visits" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "path" varchar(500) NOT NULL,
        "visitor_id" varchar(80) NOT NULL,
        "user_agent" varchar(300),
        "ip_hash" varchar(64),
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);

    const indexes = [
      'CREATE INDEX IF NOT EXISTS "idx_conversations_user1_status_updated" ON "conversations" ("user1_id", "status", "updated_at" DESC)',
      'CREATE INDEX IF NOT EXISTS "idx_conversations_user2_status_updated" ON "conversations" ("user2_id", "status", "updated_at" DESC)',
      'CREATE INDEX IF NOT EXISTS "idx_conversations_user1_updated" ON "conversations" ("user1_id", "updated_at" DESC)',
      'CREATE INDEX IF NOT EXISTS "idx_conversations_user2_updated" ON "conversations" ("user2_id", "updated_at" DESC)',
      'CREATE INDEX IF NOT EXISTS "idx_conversations_status_updated_id" ON "conversations" ("status", "updated_at" DESC, "id" DESC)',
      'CREATE INDEX IF NOT EXISTS "idx_conversations_updated_id" ON "conversations" ("updated_at" DESC, "id" DESC)',
      'CREATE INDEX IF NOT EXISTS "idx_conversations_active_user1_updated" ON "conversations" ("user1_id", "updated_at" DESC) WHERE "status" = \'active\'',
      'CREATE INDEX IF NOT EXISTS "idx_conversations_active_user2_updated" ON "conversations" ("user2_id", "updated_at" DESC) WHERE "status" = \'active\'',
      'CREATE INDEX IF NOT EXISTS "idx_messages_conversation_created" ON "messages" ("conversation_id", "created_at" DESC)',
      'CREATE INDEX IF NOT EXISTS "idx_messages_conversation_created_id" ON "messages" ("conversation_id", "created_at" DESC, "id" DESC)',
      'CREATE INDEX IF NOT EXISTS "idx_messages_sender_created" ON "messages" ("sender_id", "created_at" DESC)',
      'CREATE INDEX IF NOT EXISTS "idx_messages_read_status" ON "messages" ("conversation_id", "sender_id", "status")',
      'CREATE INDEX IF NOT EXISTS "idx_messages_conversation" ON "messages" ("conversation_id")',
      'CREATE INDEX IF NOT EXISTS "idx_messages_sender" ON "messages" ("sender_id")',
      'CREATE INDEX IF NOT EXISTS "idx_messages_created" ON "messages" ("created_at")',
      'CREATE INDEX IF NOT EXISTS "idx_match_queue_user_created" ON "match_queue" ("user_id", "created_at" DESC)',
      'CREATE INDEX IF NOT EXISTS "idx_match_queue_waiting_retry" ON "match_queue" ("status", "created_at")',
      'CREATE INDEX IF NOT EXISTS "idx_match_queue_find_waiting" ON "match_queue" ("status", "gender", "city", "expires_at", "created_at")',
      'CREATE INDEX IF NOT EXISTS "idx_match_queue_waiting_gender_city" ON "match_queue" ("gender", "city", "expires_at", "created_at") WHERE "status" = \'waiting\'',
      'CREATE INDEX IF NOT EXISTS "idx_match_queue_waiting_created" ON "match_queue" ("created_at") WHERE "status" = \'waiting\'',
      'CREATE INDEX IF NOT EXISTS "idx_match_queue_conversation" ON "match_queue" ("conversation_id")',
      'CREATE INDEX IF NOT EXISTS "idx_reports_reporter_created" ON "reports" ("reporter_id", "created_at" DESC)',
      'CREATE INDEX IF NOT EXISTS "idx_reports_reported_created" ON "reports" ("reported_user_id", "created_at" DESC)',
      'CREATE INDEX IF NOT EXISTS "idx_reports_status_created" ON "reports" ("status", "created_at" DESC)',
      'CREATE INDEX IF NOT EXISTS "idx_reports_status_created_id" ON "reports" ("status", "created_at" DESC, "id" DESC)',
      'CREATE INDEX IF NOT EXISTS "idx_reports_created" ON "reports" ("created_at" DESC)',
      'CREATE INDEX IF NOT EXISTS "idx_reports_created_id" ON "reports" ("created_at" DESC, "id" DESC)',
      'CREATE INDEX IF NOT EXISTS "idx_reports_pending_created" ON "reports" ("created_at" DESC) WHERE "status" = \'pending\'',
      'CREATE INDEX IF NOT EXISTS "idx_users_city_gender_active" ON "users" ("city", "gender", "is_active")',
      'CREATE INDEX IF NOT EXISTS "idx_users_role_created" ON "users" ("role", "created_at" DESC)',
      'CREATE INDEX IF NOT EXISTS "idx_users_role_created_id" ON "users" ("role", "created_at" DESC, "id" DESC)',
      'CREATE INDEX IF NOT EXISTS "idx_users_active_created_id" ON "users" ("is_active", "created_at" DESC, "id" DESC)',
      'CREATE INDEX IF NOT EXISTS "idx_users_active_lock_created_id" ON "users" ("is_active", "lock_type", "created_at" DESC, "id" DESC)',
      'CREATE INDEX IF NOT EXISTS "idx_users_created_id" ON "users" ("created_at" DESC, "id" DESC)',
      'CREATE INDEX IF NOT EXISTS "idx_users_lock_state" ON "users" ("lock_type", "locked_until")',
      'CREATE INDEX IF NOT EXISTS "idx_conduct_rules_active" ON "conduct_rules" ("is_active")',
      'CREATE INDEX IF NOT EXISTS "idx_conduct_rules_created" ON "conduct_rules" ("created_at" DESC)',
      'CREATE INDEX IF NOT EXISTS "idx_conduct_rules_created_id" ON "conduct_rules" ("created_at" DESC, "id" DESC)',
      'CREATE INDEX IF NOT EXISTS "idx_page_visits_created_id" ON "page_visits" ("created_at" DESC, "id" DESC)',
      'CREATE INDEX IF NOT EXISTS "idx_page_visits_path_created" ON "page_visits" ("path", "created_at" DESC)',
      'CREATE INDEX IF NOT EXISTS "idx_page_visits_visitor_created" ON "page_visits" ("visitor_id", "created_at" DESC)',
    ];

    for (const sql of indexes) {
      await this.dataSource.query(sql);
    }

    this.logger.log(`Ensured ${indexes.length} performance indexes`);
  }
}
