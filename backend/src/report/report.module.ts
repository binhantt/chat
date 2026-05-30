import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { AdminReportController, ReportController } from './report.controller';
import { ReportService } from './report.service';
import { Conversation } from '../chat/entities/conversation.entity';
import { Message } from '../chat/entities/message.entity';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { ConductModule } from '../conduct/conduct.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report, Conversation, Message, User]),
    ConductModule,
    UsersModule,
  ],
  controllers: [ReportController, AdminReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}
