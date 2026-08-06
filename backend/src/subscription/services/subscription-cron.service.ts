import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, In, Not, IsNull } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventBusService } from '../../common/events/event-bus.service';
import { User } from '../../users/entities/user.entity';
import {
  UserSubscription,
  SubscriptionStatus,
} from '../entities/user-subscription.entity';
import { createSubscriptionExpiredEvent } from '../events/subscription-expired.event';

@Injectable()
export class SubscriptionCronService {
  private readonly logger = new Logger(SubscriptionCronService.name);

  constructor(
    @InjectRepository(UserSubscription)
    private readonly userSubscriptionRepository: Repository<UserSubscription>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly eventBus: EventBusService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async expireSubscriptions(): Promise<number> {
    const expired = await this.userSubscriptionRepository.find({
      where: {
        status: SubscriptionStatus.Active,
        endDate: LessThan(new Date()),
      },
    });

    if (expired.length === 0) return 0;

    const ids = expired.map((s) => s.id);

    await this.userSubscriptionRepository
      .createQueryBuilder()
      .update(UserSubscription)
      .set({ status: SubscriptionStatus.Expired })
      .whereInIds(ids)
      .execute();

    for (const sub of expired) {
      this.eventBus.emit(
        createSubscriptionExpiredEvent(sub.id, sub.userId, sub.planId),
      );
    }

    // Remove badges for users with no remaining active subscriptions
    const userIds = [...new Set(expired.map((s) => s.userId))];
    for (const userId of userIds) {
      const activeCount = await this.userSubscriptionRepository.count({
        where: { userId, status: SubscriptionStatus.Active },
      });
      if (activeCount === 0) {
        await this.userRepository.update(userId, { badge: null });
      }
    }

    this.logger.log(`Expired ${expired.length} subscriptions, cleaned badges for ${userIds.length} users`);
    return expired.length;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async syncVipBadges(): Promise<void> {
    // Ensure all users with active subscriptions have the VIP badge
    const activeUserIds = await this.userSubscriptionRepository
      .createQueryBuilder('sub')
      .select('sub.userId')
      .where('sub.status = :status', { status: SubscriptionStatus.Active })
      .andWhere('sub.endDate > :now', { now: new Date() })
      .distinct(true)
      .getRawMany<{ sub_userId: string }>();

    const ids = activeUserIds.map((r) => r.sub_userId);
    if (ids.length === 0) return;

    // Find users who have active subscriptions but are missing the badge
    const missingBadge = await this.userRepository.find({
      where: {
        id: In(ids),
        badge: IsNull(),
      },
      select: ['id'],
    });

    if (missingBadge.length === 0) {
      this.logger.log('Badge sync: all active subscribers already have VIP badge');
      return;
    }

    // Set badge for users missing it
    for (const user of missingBadge) {
      await this.userRepository.update(user.id, { badge: '👑' });
    }

    this.logger.log(`Badge sync: assigned VIP badge to ${missingBadge.length} users`);

    // Also clean up: remove badges from users without active subscriptions
    const allBadgedUsers = await this.userRepository.find({
      where: { badge: Not(IsNull()) },
      select: ['id'],
    });

    const badgedIds = new Set(allBadgedUsers.map((u) => u.id));
    const activeIdSet = new Set(ids);

    let cleaned = 0;
    for (const uid of badgedIds) {
      if (!activeIdSet.has(uid)) {
        await this.userRepository.update(uid, { badge: null });
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.log(`Badge sync: removed stale badges from ${cleaned} users`);
    }
  }
}
