import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import type { UpdateConductRuleCommand } from '../update-conduct-rule.command';
import { ConductRule } from '../../entities/conduct-rule.entity';
import { ConductRuleRepository } from '../../repositories/conduct-rule.repository';
import { ConductRuleCacheService } from '../../services/conduct-rule-cache.service';
import { ConductRuleNormalizerService } from '../../services/conduct-rule-normalizer.service';
import { EventBusService } from '../../events/event-bus.service';
import {
  CONDUCT_RULE_UPDATED,
  createConductRuleUpdatedEvent,
} from '../../events/conduct-rule-updated.event';

@Injectable()
export class UpdateConductRuleHandler {
  constructor(
    private readonly conductRuleRepository: ConductRuleRepository,
    private readonly cache: ConductRuleCacheService,
    private readonly normalizer: ConductRuleNormalizerService,
    private readonly eventBus: EventBusService,
  ) {}

  async execute(command: UpdateConductRuleCommand): Promise<ConductRule> {
    const rule = await this.conductRuleRepository.findById(command.id);
    if (!rule) {
      throw new BadRequestException('Khong tim thay luat ung xu');
    }

    const changes: Record<string, unknown> = {};

    if (typeof command.phrase === 'string') {
      const normalizedPhrase = this.cleanRequiredPhrase(command.phrase);
      if (normalizedPhrase !== rule.phrase) {
        await this.assertPhraseAvailable(normalizedPhrase);
      }
      rule.phrase = normalizedPhrase;
      changes.phrase = normalizedPhrase;
    }

    if ('note' in command) {
      rule.note = command.note?.trim() || null;
      changes.note = rule.note;
    }

    if (typeof command.isActive === 'boolean') {
      rule.isActive = command.isActive;
      changes.isActive = command.isActive;
    }

    const savedRule = await this.conductRuleRepository.saveOne(rule);
    await this.cache.refresh();

    if (Object.keys(changes).length > 0) {
      this.eventBus.emit(createConductRuleUpdatedEvent(rule.id, changes));
    }

    return savedRule;
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
