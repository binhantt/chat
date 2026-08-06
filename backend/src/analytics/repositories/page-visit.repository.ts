import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PageVisit } from '../entities/page-visit.entity';

export interface PageVisitStatsRow {
  count: string;
  path: string;
}

@Injectable()
export class PageVisitRepository {
  constructor(
    @InjectRepository(PageVisit)
    private readonly repository: Repository<PageVisit>,
  ) {}

  async insertVisit(data: {
    ipHash: string | null;
    path: string;
    userAgent: string | null;
    visitorId: string;
  }): Promise<void> {
    await this.repository.insert(data);
  }

  countPath(path: string): Promise<number> {
    return this.repository.count({ where: { path } });
  }

  countPathSince(path: string, since: Date): Promise<number> {
    return this.repository
      .createQueryBuilder('visit')
      .where('visit.path = :path', { path })
      .andWhere('visit.createdAt >= :since', { since })
      .getCount();
  }

  async countUniqueVisitors(path: string): Promise<number> {
    const row = await this.repository
      .createQueryBuilder('visit')
      .select('COUNT(DISTINCT visit.visitorId)', 'count')
      .where('visit.path = :path', { path })
      .getRawOne<{ count: string }>();

    return Number(row?.count ?? 0);
  }

  findPopularPathsSince({
    limit,
    path,
    since,
  }: {
    limit: number;
    path: string;
    since: Date;
  }): Promise<PageVisitStatsRow[]> {
    return this.repository
      .createQueryBuilder('visit')
      .select('visit.path', 'path')
      .addSelect('COUNT(*)', 'count')
      .where('visit.path = :path', { path })
      .andWhere('visit.createdAt >= :since', { since })
      .groupBy('visit.path')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany<PageVisitStatsRow>();
  }
}
