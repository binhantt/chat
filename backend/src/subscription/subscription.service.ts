import { Injectable, Logger, NotFoundException, ConflictException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventBusService } from '../common/events/event-bus.service';
import { User } from '../users/entities/user.entity';
import {
  SubscriptionPlan,
  PlanType,
} from './entities/subscription-plan.entity';
import {
  UserSubscription,
  SubscriptionStatus,
} from './entities/user-subscription.entity';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { SubscriptionCronService } from './services/subscription-cron.service';
import { createSubscriptionActivatedEvent } from './events/subscription-activated.event';
import { createSubscriptionCancelledEvent } from './events/subscription-cancelled.event';
import { createSubscriptionExpiredEvent } from './events/subscription-expired.event';

@Injectable()
export class SubscriptionService implements OnModuleInit {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    @InjectRepository(SubscriptionPlan)
    private readonly planRepository: Repository<SubscriptionPlan>,
    @InjectRepository(UserSubscription)
    private readonly userSubscriptionRepository: Repository<UserSubscription>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly subscriptionCron: SubscriptionCronService,
    private readonly eventBus: EventBusService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedDefaultPlans();
  }

  private async seedDefaultPlans(): Promise<void> {
    const count = await this.planRepository.count();
    if (count > 0) return;

    this.logger.log('Seeding default subscription plans...');

    await this.planRepository.save([
      {
        type: PlanType.Vip,
        name: 'VIP',
        description: 'Trải nghiệm cao cấp với nhiều tính năng độc quyền.',
        price: 59000,
        durationDays: 30,
        features: [
          'Không có quảng cáo',
          'Chọn giới tính để ghép',
          'Chọn quốc gia',
          'Bộ lọc độ tuổi',
          'Tăng tốc ghép đôi',
          'Hiệu ứng đặc biệt',
          'Huy hiệu VIP',
        ],
        matchPrioritySeconds: 30,
        isActive: true,
      },
      {
        type: PlanType.Premium,
        name: 'Premium',
        description: 'Gói cao nhất với ưu tiên ghép đôi cực nhanh.',
        price: 99000,
        durationDays: 30,
        features: [
          'Không có quảng cáo',
          'Chọn giới tính để ghép',
          'Chọn quốc gia',
          'Bộ lọc độ tuổi',
          'Tăng tốc ghép đôi',
          'Hiệu ứng đặc biệt',
          'Huy hiệu VIP',
          'Ưu tiên ghép đôi – tìm trong 20 giây',
        ],
        matchPrioritySeconds: 20,
        isActive: true,
      },
    ]);

    this.logger.log('Seeded default subscription plans');
  }

  // ─── Plan Management ─────────────────────────────────────

  async findAllPlans(): Promise<SubscriptionPlan[]> {
    return this.planRepository.find({ order: { price: 'ASC' } });
  }

  async findActivePlans(): Promise<SubscriptionPlan[]> {
    return this.planRepository.find({
      where: { isActive: true },
      order: { price: 'ASC' },
    });
  }

  async findPlanById(id: string): Promise<SubscriptionPlan> {
    // id có thể là UUID (PlanID) hoặc tên type ("vip"/"premium")
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (isUuid) {
      const plan = await this.planRepository.findOne({ where: { id } });
      if (plan) return plan;
    }

    // Fallback: lookup by type (e.g. "vip" or "premium")
    const byType = await this.planRepository.findOne({ where: { type: id as any } });
    if (!byType) throw new NotFoundException('Không tìm thấy gói');
    return byType;
  }

  async createPlan(dto: CreatePlanDto): Promise<SubscriptionPlan> {
    const plan = this.planRepository.create(dto);
    return this.planRepository.save(plan);
  }

  async updatePlan(id: string, dto: UpdatePlanDto): Promise<SubscriptionPlan> {
    await this.planRepository.update(id, dto);
    return this.findPlanById(id);
  }

  async deletePlan(id: string): Promise<void> {
    // Check if any user subscriptions reference this plan
    const subCount = await this.userSubscriptionRepository.count({
      where: { planId: id },
    });
    if (subCount > 0) {
      // Soft disable instead of delete
      await this.planRepository.update(id, { isActive: false });
      this.logger.log(`Plan ${id} disabled (${subCount} active subscriptions)`);
      return;
    }
    const result = await this.planRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Không tìm thấy gói');
  }

  // ─── User Subscription ──────────────────────────────────

  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    return this.userSubscriptionRepository.findOne({
      where: { userId, status: SubscriptionStatus.Active },
      relations: ['plan'],
      order: { createdAt: 'DESC' },
    });
  }

  async subscribeUser(
    userId: string,
    planId: string,
  ): Promise<UserSubscription> {
    const plan = await this.findPlanById(planId);
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + plan.durationDays);

    const sub = this.userSubscriptionRepository.create({
      userId,
      planId: plan.id,
      status: SubscriptionStatus.Active,
      startDate: now,
      endDate,
      autoRenew: false,
    });
    const saved = await this.userSubscriptionRepository.save(sub);

    // Auto-assign VIP badge
    await this.assignVipBadge(userId);

    this.eventBus.emit(
      createSubscriptionActivatedEvent(saved.id, userId, plan.id, plan.name, endDate),
    );

    return saved;
  }

  async cancelSubscription(id: string, userId: string): Promise<void> {
    const sub = await this.userSubscriptionRepository.findOne({
      where: { id, userId },
      relations: ['plan'],
    });
    if (!sub) throw new NotFoundException('Không tìm thấy gói đăng ký');
    sub.status = SubscriptionStatus.Cancelled;
    await this.userSubscriptionRepository.save(sub);

    this.eventBus.emit(
      createSubscriptionCancelledEvent(id, userId, sub.planId),
    );

    // Remove VIP badge if no active subscriptions remain
    await this.removeVipBadgeIfNoActive(userId);
  }

  async getUserSubscriptionHistory(
    userId: string,
  ): Promise<UserSubscription[]> {
    return this.userSubscriptionRepository.find({
      where: { userId },
      relations: ['plan'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAllUserSubscriptions(): Promise<UserSubscription[]> {
    return this.userSubscriptionRepository.find({
      relations: ['user', 'plan'],
      order: { createdAt: 'DESC' },
    });
  }

  async adminCancelSubscription(subscriptionId: string): Promise<void> {
    const sub = await this.userSubscriptionRepository.findOne({
      where: { id: subscriptionId },
    });
    if (!sub) throw new NotFoundException('Không tìm thấy gói đăng ký');
    sub.status = SubscriptionStatus.Cancelled;
    await this.userSubscriptionRepository.save(sub);

    this.eventBus.emit(
      createSubscriptionCancelledEvent(subscriptionId, sub.userId, sub.planId),
    );

    // Remove VIP badge if no active subscriptions remain
    await this.removeVipBadgeIfNoActive(sub.userId);
  }

  // ─── VIP Badge auto-assign ──────────────────────────────

  private async assignVipBadge(userId: string): Promise<void> {
    await this.userRepository.update(userId, { badge: '👑' });
  }

  private async removeVipBadgeIfNoActive(userId: string): Promise<void> {
    const activeCount = await this.userSubscriptionRepository.count({
      where: { userId, status: SubscriptionStatus.Active },
    });
    if (activeCount === 0) {
      await this.userRepository.update(userId, { badge: null });
    }
  }

  // ─── Cron (delegated to sub-service) ─────────────────────

  async expireSubscriptions(): Promise<number> {
    const count = await this.subscriptionCron.expireSubscriptions();
    if (count > 0) {
      this.logger.log(`Expired ${count} subscriptions via cron`);
    }
    return count;
  }
}
