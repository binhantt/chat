import { Injectable } from '@nestjs/common';
import type { CheckMessageQuery, CheckMessageResult } from '../check-message.query';
import { ConductRuleCacheService } from '../../services/conduct-rule-cache.service';

@Injectable()
export class CheckMessageHandler {
  constructor(private readonly cache: ConductRuleCacheService) {}

  async execute(query: CheckMessageQuery): Promise<CheckMessageResult> {
    const rule = await this.cache.findViolatedRule(query.content);
    return rule ? { violated: true, rule } : { violated: false };
  }
}
