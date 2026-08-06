import { Injectable } from '@nestjs/common';
import { ConductRule } from '../entities/conduct-rule.entity';
import { ConductRuleRepository } from '../repositories/conduct-rule.repository';
import { ConductRuleNormalizerService } from './conduct-rule-normalizer.service';

interface CachedConductRule {
  normalizedPhrase: string;
  rule: ConductRule;
}

@Injectable()
export class ConductRuleCacheService {
  private activeRuleCache: CachedConductRule[] = [];
  private activeRuleCacheLoaded = false;

  constructor(
    private readonly conductRuleRepository: ConductRuleRepository,
    private readonly normalizer: ConductRuleNormalizerService,
  ) {}

  async refresh(): Promise<void> {
    const rules = (await this.conductRuleRepository.findActive()) ?? [];

    this.activeRuleCache = rules
      .map((rule) => ({
        rule,
        normalizedPhrase: this.normalizer.normalize(rule.phrase),
      }))
      .filter((item) => item.normalizedPhrase.length > 0);
    this.activeRuleCacheLoaded = true;
  }

  async findViolatedRule(content: string): Promise<ConductRule | null> {
    const message = this.normalizer.normalize(content);
    if (!message) {
      return null;
    }

    const rules = await this.getActiveRules();
    return (
      rules.find((item) => message.indexOf(item.normalizedPhrase) !== -1)
        ?.rule ?? null
    );
  }

  private async getActiveRules(): Promise<CachedConductRule[]> {
    if (!this.activeRuleCacheLoaded) {
      await this.refresh();
    }

    return this.activeRuleCache;
  }
}
