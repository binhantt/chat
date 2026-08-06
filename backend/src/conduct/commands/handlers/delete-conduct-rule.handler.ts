import { Injectable } from '@nestjs/common';
import type { DeleteConductRuleCommand } from '../delete-conduct-rule.command';
import { ConductRuleRepository } from '../../repositories/conduct-rule.repository';
import { ConductRuleCacheService } from '../../services/conduct-rule-cache.service';
import { EventBusService } from '../../events/event-bus.service';
import {
  CONDUCT_RULE_DELETED,
  createConductRuleDeletedEvent,
} from '../../events/conduct-rule-deleted.event';

@Injectable()
export class DeleteConductRuleHandler {
  constructor(
    private readonly conductRuleRepository: ConductRuleRepository,
    private readonly cache: ConductRuleCacheService,
    private readonly eventBus: EventBusService,
  ) {}

  async execute(command: DeleteConductRuleCommand): Promise<void> {
    await this.conductRuleRepository.remove(command.id);
    await this.cache.refresh();

    this.eventBus.emit(createConductRuleDeletedEvent(command.id));
  }
}
