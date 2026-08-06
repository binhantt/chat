import { Injectable } from '@nestjs/common';
import { ConductRuleRepository } from '../repositories/conduct-rule.repository';

@Injectable()
export class ConductRuleSeederService {
  private readonly defaultRules = ['lua dao', 'de doa', 'quay roi', 'spam'];

  constructor(private readonly conductRuleRepository: ConductRuleRepository) {}

  async ensureDefaultRules(): Promise<void> {
    const count = await this.conductRuleRepository.count();
    if (count > 0) {
      return;
    }

    await this.conductRuleRepository.saveMany(
      this.defaultRules.map((phrase) =>
        this.conductRuleRepository.create({
          phrase,
          isActive: true,
          note: 'Luat mac dinh',
        }),
      ),
    );
  }
}
