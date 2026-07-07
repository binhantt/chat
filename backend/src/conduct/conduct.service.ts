import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConductRule } from './entities/conduct-rule.entity';
import { ConductRuleRepository } from './repositories/conduct-rule.repository';
import { ConductRuleCacheService } from './services/conduct-rule-cache.service';
import { ConductRuleSeederService } from './services/conduct-rule-seeder.service';
import { CheckMessageHandler } from './queries/handlers/check-message.handler';

export interface ConductCheckResult {
  violated: boolean;
  rule?: ConductRule;
}

@Injectable()
export class ConductService implements OnModuleInit {
  constructor(
    private readonly conductRuleRepository: ConductRuleRepository,
    private readonly cache: ConductRuleCacheService,
    private readonly seeder: ConductRuleSeederService,
    private readonly checkMessageHandler: CheckMessageHandler,
  ) {}

  async onModuleInit() {
    await this.seeder.ensureDefaultRules();
    await this.cache.refresh();
  }

  async checkMessage(content: string): Promise<ConductCheckResult> {
    return this.checkMessageHandler.execute({ content });
  }
}
