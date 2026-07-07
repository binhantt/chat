import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import type { Request } from 'express';
import { PageVisitRepository } from './repositories/page-visit.repository';

@Injectable()
export class AnalyticsService {
  constructor(private readonly pageVisitRepository: PageVisitRepository) {}

  async trackPageVisit(input: {
    path?: string;
    request: Request;
    visitorId: string;
  }) {
    const path = this.normalizePath(input.path);

    await this.pageVisitRepository.insertVisit({
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

    const homePath = '/';

    const [totalViews, todayViews, last7DaysViews, uniqueVisitors, popularPaths] =
      await Promise.all([
        this.pageVisitRepository.countPath(homePath),
        this.pageVisitRepository.countPathSince(homePath, startOfToday),
        this.pageVisitRepository.countPathSince(homePath, sevenDaysAgo),
        this.pageVisitRepository.countUniqueVisitors(homePath),
        this.pageVisitRepository.findPopularPathsSince({
          limit: 5,
          path: homePath,
          since: sevenDaysAgo,
        }),
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
      uniqueVisitors,
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
