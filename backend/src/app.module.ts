import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ChatModule } from './chat/chat.module';
import { MatchModule } from './match/match.module';
import { ReportModule } from './report/report.module';
import { ConductModule } from './conduct/conduct.module';
import { createPostgresConfig } from './database/postgres.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(createPostgresConfig()),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    ChatModule,
    MatchModule,
    ReportModule,
    ConductModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
