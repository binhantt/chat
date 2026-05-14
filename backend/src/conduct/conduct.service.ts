import {
  BadRequestException,
  ConflictException,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConductRule } from './entities/conduct-rule.entity';

export interface ConductCheckResult {
  violated: boolean;
  rule?: ConductRule;
}

@Injectable()
export class ConductService implements OnModuleInit {
  private readonly defaultRules = ['lừa đảo', 'đe dọa', 'quấy rối', 'spam'];
  private activeRuleCache: Array<{
    rule: ConductRule;
    normalizedPhrase: string;
  }> = [];
  private activeRuleCacheLoaded = false;

  constructor(
    @InjectRepository(ConductRule)
    private readonly conductRuleRepository: Repository<ConductRule>,
  ) {}

  async onModuleInit() {
    const count = await this.conductRuleRepository.count();
    if (count > 0) {
      await this.refreshActiveRuleCache();
      return;
    }

    await this.conductRuleRepository.save(
      this.defaultRules.map((phrase) =>
        this.conductRuleRepository.create({
          phrase,
          isActive: true,
          note: 'Luật mặc định',
        }),
      ),
    );
    await this.refreshActiveRuleCache();
  }

  findAll(): Promise<ConductRule[]> {
    return this.conductRuleRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async create(phrase: string, note?: string): Promise<ConductRule> {
    const normalizedPhrase = this.cleanPhrase(phrase);
    if (!normalizedPhrase) {
      throw new BadRequestException('Nội dung vi phạm không được để trống');
    }

    const exists = await this.conductRuleRepository.findOne({
      where: { phrase: normalizedPhrase },
    });
    if (exists) {
      throw new ConflictException('Nội dung vi phạm đã tồn tại');
    }

    const rule = await this.conductRuleRepository.save(
      this.conductRuleRepository.create({
        phrase: normalizedPhrase,
        note: note?.trim() || null,
        isActive: true,
      }),
    );
    await this.refreshActiveRuleCache();
    return rule;
  }

  async update(
    id: string,
    data: { phrase?: string; note?: string | null; isActive?: boolean },
  ): Promise<ConductRule> {
    const rule = await this.conductRuleRepository.findOne({ where: { id } });
    if (!rule) {
      throw new BadRequestException('Không tìm thấy luật ứng xử');
    }

    if (typeof data.phrase === 'string') {
      const normalizedPhrase = this.cleanPhrase(data.phrase);
      if (!normalizedPhrase) {
        throw new BadRequestException('Nội dung vi phạm không được để trống');
      }
      rule.phrase = normalizedPhrase;
    }

    if ('note' in data) {
      rule.note = data.note?.trim() || null;
    }

    if (typeof data.isActive === 'boolean') {
      rule.isActive = data.isActive;
    }

    const savedRule = await this.conductRuleRepository.save(rule);
    await this.refreshActiveRuleCache();
    return savedRule;
  }

  async remove(id: string): Promise<void> {
    await this.conductRuleRepository.delete(id);
    await this.refreshActiveRuleCache();
  }

  async checkMessage(content: string): Promise<ConductCheckResult> {
    const message = this.normalize(content);
    if (!message) {
      return { violated: false };
    }

    const rules = await this.getActiveRuleCache();

    const rule = rules.find((item) => message.includes(item.normalizedPhrase));

    return rule ? { violated: true, rule: rule.rule } : { violated: false };
  }

  private async getActiveRuleCache(): Promise<
    Array<{ rule: ConductRule; normalizedPhrase: string }>
  > {
    if (!this.activeRuleCacheLoaded) {
      await this.refreshActiveRuleCache();
    }

    return this.activeRuleCache;
  }

  private async refreshActiveRuleCache(): Promise<void> {
    const rules = await this.conductRuleRepository.find({
      where: { isActive: true },
    });

    this.activeRuleCache = rules
      .map((rule) => ({
        rule,
        normalizedPhrase: this.normalize(rule.phrase),
      }))
      .filter((item) => item.normalizedPhrase.length > 0);
    this.activeRuleCacheLoaded = true;
  }

  private cleanPhrase(phrase: string): string {
    return phrase.trim().replace(/\s+/g, ' ').slice(0, 160);
  }

  private normalize(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
