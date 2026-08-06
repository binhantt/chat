import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConductRule } from '../entities/conduct-rule.entity';

export interface ConductRuleCursor {
  createdAt: Date;
  id: string;
}

@Injectable()
export class ConductRuleRepository {
  constructor(
    @InjectRepository(ConductRule)
    private readonly repository: Repository<ConductRule>,
  ) {}

  count(): Promise<number> {
    return this.repository.count();
  }

  create(data: Partial<ConductRule>): ConductRule {
    return this.repository.create(data);
  }

  saveOne(rule: ConductRule): Promise<ConductRule> {
    return this.repository.save(rule);
  }

  saveMany(rules: ConductRule[]): Promise<ConductRule[]> {
    return this.repository.save(rules);
  }

  findById(id: string): Promise<ConductRule | null> {
    return this.repository.findOne({ where: { id } });
  }

  findByPhrase(phrase: string): Promise<ConductRule | null> {
    return this.repository.findOne({ where: { phrase } });
  }

  findActive(): Promise<ConductRule[]> {
    return this.repository.find({ where: { isActive: true } });
  }

  async findPage({
    cursor,
    limit,
  }: {
    cursor?: ConductRuleCursor | null;
    limit: number;
  }): Promise<ConductRule[]> {
    const query = this.repository
      .createQueryBuilder('rule')
      .select([
        'rule.id',
        'rule.phrase',
        'rule.isActive',
        'rule.note',
        'rule.createdAt',
        'rule.updatedAt',
      ])
      .orderBy('rule.createdAt', 'DESC')
      .addOrderBy('rule.id', 'DESC')
      .take(limit + 1);

    if (cursor) {
      query.where(
        '(rule.createdAt < :createdAt OR (rule.createdAt = :createdAt AND rule.id < :id))',
        cursor,
      );
    }

    return query.getMany();
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
