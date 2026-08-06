import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ad } from '../entities/ad.entity';
import { AdStats, AdEventType } from '../entities/ad-stats.entity';

@Injectable()
export class AdTrackerService {
  private readonly logger = new Logger(AdTrackerService.name);

  constructor(
    @InjectRepository(Ad)
    private readonly adRepository: Repository<Ad>,
    @InjectRepository(AdStats)
    private readonly adStatsRepository: Repository<AdStats>,
  ) {}

  async trackImpression(
    adId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.adRepository.increment({ id: adId }, 'totalImpressions', 1);
    await this.adStatsRepository.save(
      this.adStatsRepository.create({
        adId,
        type: AdEventType.Impression,
        ipAddress: ipAddress ?? null,
        userAgent: userAgent ?? null,
      }),
    );
  }

  async trackClick(
    adId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.adRepository.increment({ id: adId }, 'totalClicks', 1);
    await this.adStatsRepository.save(
      this.adStatsRepository.create({
        adId,
        type: AdEventType.Click,
        ipAddress: ipAddress ?? null,
        userAgent: userAgent ?? null,
      }),
    );
  }

  async getStatsSummary(): Promise<{
    totalImpressions: number;
    totalClicks: number;
  }> {
    const all = await this.adRepository.find();
    return {
      totalImpressions: all.reduce((s, a) => s + a.totalImpressions, 0),
      totalClicks: all.reduce((s, a) => s + a.totalClicks, 0),
    };
  }
}
