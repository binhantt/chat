import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConductController } from './conduct.controller';
import { ConductService } from './conduct.service';
import { ConductRule } from './entities/conduct-rule.entity';
import { ConductRuleRepository } from './repositories/conduct-rule.repository';
import { ConductRuleCacheService } from './services/conduct-rule-cache.service';
import { ConductRuleCursorService } from './services/conduct-rule-cursor.service';
import { ConductRuleNormalizerService } from './services/conduct-rule-normalizer.service';
import { ConductRuleSeederService } from './services/conduct-rule-seeder.service';
import { UsersModule } from '../users/users.module';
import { EventBusModule } from '../common/events/event-bus.module';
import { CreateConductRuleHandler } from './commands/handlers/create-conduct-rule.handler';
import { UpdateConductRuleHandler } from './commands/handlers/update-conduct-rule.handler';
import { DeleteConductRuleHandler } from './commands/handlers/delete-conduct-rule.handler';
import { GetConductRulesHandler } from './queries/handlers/get-conduct-rules.handler';
import { CheckMessageHandler } from './queries/handlers/check-message.handler';


@Module({
  imports: [TypeOrmModule.forFeature([ConductRule]), UsersModule, EventBusModule],
  controllers: [ConductController],
  providers: [
    ConductService,
    ConductRuleRepository,
    ConductRuleCacheService,
    ConductRuleCursorService,
    ConductRuleNormalizerService,
    ConductRuleSeederService,
    CreateConductRuleHandler,
    UpdateConductRuleHandler,
    DeleteConductRuleHandler,
    GetConductRulesHandler,
    CheckMessageHandler,
  ],
  exports: [ConductService, CheckMessageHandler],
})
export class ConductModule {}
