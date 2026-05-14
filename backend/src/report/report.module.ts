import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { AdminReportController, ReportController } from './report.controller';
import { ReportService } from './report.service';
import { Conversation } from '../chat/entities/conversation.entity';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report, Conversation, User]),
    UsersModule,
  ],
  controllers: [ReportController, AdminReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}
