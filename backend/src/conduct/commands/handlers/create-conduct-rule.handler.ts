import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import type { CreateConductRuleCommand } from '../create-conduct-rule.command';
import { ConductRule } from '../../entities/conduct-rule.entity';
import { ConductRuleRepository } from '../../repositories/conduct-rule.repository';
import { ConductRuleCacheService } from '../../services/conduct-rule-cache.service';
import { ConductRuleNormalizerService } from '../../services/conduct-rule-normalizer.service';
import { EventBusService } from '../../events/event-bus.service';
import {
  CONDUCT_RULE_CREATED,
  createConductRuleCreatedEvent,
} from '../../events/conduct-rule-created.event';

@Injectable()
export class CreateConductRuleHandler {
  constructor(
    private readonly conductRuleRepository: ConductRuleRepository,
    private readonly cache: ConductRuleCacheService,
    private readonly normalizer: ConductRuleNormalizerService,
    private readonly eventBus: EventBusService,
  ) {}

  async execute(command: CreateConductRuleCommand): Promise<ConductRule> {
    const normalizedPhrase = this.cleanRequiredPhrase(command.phrase);
    await this.assertPhraseAvailable(normalizedPhrase);

    const rule = await this.conductRuleRepository.saveOne(
      this.conductRuleRepository.create({
        phrase: normalizedPhrase,
        note: command.note?.trim() || null,
        isActive: true,
      }),
    );
    await this.cache.refresh();

    this.eventBus.emit(createConductRuleCreatedEvent(rule.id, rule.phrase));

    return rule;
  }

  private cleanRequiredPhrase(phrase: string): string {
    const normalizedPhrase = this.normalizer.cleanPhrase(phrase);
    if (!normalizedPhrase) {
      throw new BadRequestException('Noi dung vi pham khong duoc de trong');
    }
    return normalizedPhrase;
  }

  private async assertPhraseAvailable(phrase: string): Promise<void> {
    const exists = await this.conductRuleRepository.findByPhrase(phrase);
    if (exists) {
      throw new ConflictException('Noi dung vi pham da ton tai');
    }
  }
}
