import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventBusService } from '../common/events/event-bus.service';
import { Ad, AdStatus } from './entities/ad.entity';
import { AdStats } from './entities/ad-stats.entity';
import { CreateAdDto, UpdateAdStatusDto } from './dto/create-ad.dto';
import { AdTrackerService } from './services/ad-tracker.service';
import { createAdCreatedEvent } from './events/ad-created.event';
import { createAdStatusChangedEvent } from './events/ad-status-changed.event';

@Injectable()
export class AdService {
  private readonly logger = new Logger(AdService.name);

  constructor(
    @InjectRepository(Ad)
    private readonly adRepository: Repository<Ad>,
    @InjectRepository(AdStats)
    private readonly adStatsRepository: Repository<AdStats>,
    private readonly adTracker: AdTrackerService,
    private readonly eventBus: EventBusService,
  ) {}

  async createAd(userId: string, dto: CreateAdDto): Promise<Ad> {
    const ad = this.adRepository.create({
      userId,
      title: dto.title,
      content: dto.content ?? null,
      imageUrl: dto.imageUrl ?? null,
      targetUrl: dto.targetUrl ?? null,
      budget: dto.budget ?? 0,
      status: AdStatus.Pending,
    });
    const saved = await this.adRepository.save(ad);

    this.eventBus.emit(createAdCreatedEvent(saved.id, userId, dto.title));

    return saved;
  }

  async getUserAds(userId: string): Promise<Ad[]> {
    return this.adRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getAllAds(): Promise<Ad[]> {
    return this.adRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateAdStatus(id: string, dto: UpdateAdStatusDto): Promise<Ad> {
    const ad = await this.adRepository.findOne({ where: { id } });
    if (!ad) throw new NotFoundException('Không tìm thấy quảng cáo');

    const oldStatus = ad.status;
    ad.status = dto.status as AdStatus;
    if (dto.status === 'active') {
      ad.startDate = new Date();
    }
    const saved = await this.adRepository.save(ad);

    this.eventBus.emit(
      createAdStatusChangedEvent(id, ad.userId, oldStatus, dto.status),
    );

    return saved;
  }

  async getAdStats(): Promise<{
    totalAds: number;
    activeAds: number;
    totalImpressions: number;
    totalClicks: number;
  }> {
    const all = await this.adRepository.find();
    const tracking = await this.adTracker.getStatsSummary();
    return {
      totalAds: all.length,
      activeAds: all.filter((a) => a.status === AdStatus.Active).length,
      totalImpressions: tracking.totalImpressions,
      totalClicks: tracking.totalClicks,
    };
  }

  async getAdDetail(id: string): Promise<Ad> {
    const ad = await this.adRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!ad) throw new NotFoundException('Không tìm thấy quảng cáo');
    return ad;
  }

  async getActiveAds(): Promise<Ad[]> {
    return this.adRepository.find({
      where: { status: AdStatus.Active },
      order: { createdAt: 'DESC' },
      take: 5,
    });
  }
}
