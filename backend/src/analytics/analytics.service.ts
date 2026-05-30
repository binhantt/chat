import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'node:crypto';
import type { Request } from 'express';
import { Repository } from 'typeorm';
import { PageVisit } from './entities/page-visit.entity';

type PopularPathRow = {
  count: string;
  path: string;
};

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(PageVisit)
    private readonly pageVisitRepository: Repository<PageVisit>,
  ) {}

  async trackPageVisit(input: {
    path?: string;
    request: Request;
    visitorId: string;
  }) {
    const path = this.normalizePath(input.path);

    await this.pageVisitRepository.insert({
      ipHash: this.hashIp(this.getClientIp(input.request)),
      path,
      userAgent: this.truncate(input.request.headers['user-agent'], 300),
      visitorId: this.truncate(input.visitorId, 80) ?? 'anonymous',
    });

    return { success: true };
  }

  async getVisitStats() {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [totalViews, todayViews, last7DaysViews, uniqueVisitors, popularPaths] =
      await Promise.all([
        this.pageVisitRepository.count(),
        this.pageVisitRepository
          .createQueryBuilder('visit')
          .where('visit.createdAt >= :startOfToday', { startOfToday })
          .getCount(),
        this.pageVisitRepository
          .createQueryBuilder('visit')
          .where('visit.createdAt >= :sevenDaysAgo', { sevenDaysAgo })
          .getCount(),
        this.pageVisitRepository
          .createQueryBuilder('visit')
          .select('COUNT(DISTINCT visit.visitorId)', 'count')
          .getRawOne<{ count: string }>(),
        this.pageVisitRepository
          .createQueryBuilder('visit')
          .select('visit.path', 'path')
          .addSelect('COUNT(*)', 'count')
          .where('visit.createdAt >= :sevenDaysAgo', { sevenDaysAgo })
          .groupBy('visit.path')
          .orderBy('count', 'DESC')
          .limit(5)
          .getRawMany<PopularPathRow>(),
      ]);

    return {
      last7DaysViews,
      popularPaths: popularPaths.map((item) => ({
        count: Number(item.count),
        path: item.path,
      })),
      sampledAt: now.toISOString(),
      todayViews,
      totalViews,
      uniqueVisitors: Number(uniqueVisitors?.count ?? 0),
    };
  }

  private normalizePath(path?: string): string {
    const value = (path || '/').trim();
    if (!value.startsWith('/')) return '/';
    return value.slice(0, 500);
  }

  private getClientIp(request: Request): string | null {
    const forwardedFor = request.headers['x-forwarded-for'];
    const rawIp = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor?.split(',')[0];

    return rawIp?.trim() || request.ip || null;
  }

  private hashIp(ip: string | null): string | null {
    if (!ip) return null;

    return createHash('sha256')
      .update(`${process.env.ANALYTICS_SALT ?? 'dev-analytics-salt'}:${ip}`)
      .digest('hex');
  }

  private truncate(
    value: string | string[] | undefined,
    maxLength: number,
  ): string | null {
    const text = Array.isArray(value) ? value[0] : value;
    if (!text) return null;
    return text.slice(0, maxLength);
  }
}
