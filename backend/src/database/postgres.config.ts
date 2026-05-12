import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { MatchQueue } from '../match/entities/match-queue.entity';
import { Conversation } from '../chat/entities/conversation.entity';
import { Message } from '../chat/entities/message.entity';
import { Report } from '../report/entities/report.entity';
import { ConductRule } from '../conduct/entities/conduct-rule.entity';

export function createPostgresConfig(): TypeOrmModuleOptions {
  const url = process.env.DATABASE_URL;

  if (url) {
    return createUrlConfig(url);
  }

  return createHostConfig();
}

function createUrlConfig(url: string): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    url,
    entities: [User, MatchQueue, Conversation, Message, Report, ConductRule],
    synchronize: process.env.DB_SYNC === 'true',
    ssl: process.env.DB_SSL === 'true',
  };
}

function createHostConfig(): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_DATABASE ?? 'chat',
    entities: [User, MatchQueue, Conversation, Message, Report, ConductRule],
    synchronize: process.env.DB_SYNC === 'true',
    ssl: process.env.DB_SSL === 'true',
  };
}
