import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConductController } from './conduct.controller';
import { ConductService } from './conduct.service';
import { ConductRule } from './entities/conduct-rule.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([ConductRule]), UsersModule],
  controllers: [ConductController],
  providers: [ConductService],
  exports: [ConductService],
})
export class ConductModule {}
