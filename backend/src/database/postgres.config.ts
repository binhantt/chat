import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { User } from '../users/entities/user.entity';
import { MatchQueue } from '../match/entities/match-queue.entity';
import { Conversation } from '../chat/entities/conversation.entity';
import { Message } from '../chat/entities/message.entity';
import { Report } from '../report/entities/report.entity';
import { ConductRule } from '../conduct/entities/conduct-rule.entity';
import { PageVisit } from '../analytics/entities/page-visit.entity';
import { OutboxEvent } from '../common/events/outbox-event.entity';
import { SubscriptionPlan } from '../subscription/entities/subscription-plan.entity';
import { UserSubscription } from '../subscription/entities/user-subscription.entity';
import { Payment } from '../payment/entities/payment.entity';
import { Ad } from '../ad/entities/ad.entity';
import { AdStats } from '../ad/entities/ad-stats.entity';

const entities = [
  User,
  MatchQueue,
  Conversation,
  Message,
  Report,
  ConductRule,
  PageVisit,
  OutboxEvent,
  SubscriptionPlan,
  UserSubscription,
  Payment,
  Ad,
  AdStats,
];

export function createPostgresConfig(): TypeOrmModuleOptions {
  const url = process.env.DATABASE_URL;

  if (url) {
    return createUrlConfig(url);
  }

  return createHostConfig();
}

function createUrlConfig(url: string): TypeOrmModuleOptions {
  const ssl = process.env.DB_SSL === 'true';
  return {
    type: 'postgres',
    url,
    entities,
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: false,
    ssl: ssl ? { rejectUnauthorized: false } : false,
    namingStrategy: new SnakeNamingStrategy(),
    extra: {
      max: 5,
      connectionTimeoutMillis: 10000,
    },
  };
}

function createHostConfig(): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: getRequiredDatabasePassword(),
    database: process.env.DB_DATABASE ?? 'chat',
    entities,
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: false,
    ssl: process.env.DB_SSL === 'true',
    namingStrategy: new SnakeNamingStrategy(),
  };
}

function getRequiredDatabasePassword(): string {
  if (process.env.DB_PASSWORD) {
    return process.env.DB_PASSWORD;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'DB_PASSWORD or DATABASE_URL must be configured in production',
    );
  }

  return 'postgres';
}
