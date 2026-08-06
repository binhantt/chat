import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, IsNull } from 'typeorm';
import { SpeedBoost } from '../entities/speed-boost.entity';

/**
 * Collective speed-boost mechanic:
 *
 * - Non-boosted users must wait 2-3 minutes between searches (cooldown).
 * - Clicking "speed up" (watch ad) enters the boost pool.
 * - When 10 users are in the pool, ALL of them get 30 minutes of
 *   priority matching (no cooldown, higher match priority).
 * - The 30-minute window is per-user: once activated, each boosted
 *   user gets `boostExpiresAt` set to now + 30 min.
 */
@Injectable()
export class SpeedBoostService {
  private readonly logger = new Logger(SpeedBoostService.name);

  private readonly BOOST_THRESHOLD = 10;
  private readonly BOOST_DURATION_MS = 30 * 60 * 1000; // 30 minutes
  private readonly COOLDOWN_MS = 2.5 * 60 * 1000; // 2.5 minutes (150s)

  // In-memory collective counter for the current boost cycle.
  // Resets on server restart — individual boost records survive.
  private collectiveBoostCount = 0;

  constructor(
    @InjectRepository(SpeedBoost)
    private readonly boostRepository: Repository<SpeedBoost>,
  ) {
    this.initializeCount();
  }

  // ── Initialisation ──

  /**
   * On startup, count how many users have an active (un-expired) boost
   * record with no boostExpiresAt yet (i.e. they watched the ad but
   * the 30-min window hasn't been activated).  This restores the
   * collective counter across restarts.
   */
  private async initializeCount(): Promise<void> {
    try {
      const count = await this.boostRepository.count({
        where: {
          adViewedAt: MoreThan(new Date(Date.now() - 24 * 60 * 60 * 1000)), // within 24h
          boostExpiresAt: IsNull(),
        },
      });
      this.collectiveBoostCount = count;
      this.logger.log(`Speed-boost collective counter initialised at ${count}/${this.BOOST_THRESHOLD}`);
    } catch (err) {
      this.logger.error('Failed to initialise speed-boost counter', err);
    }
  }

  // ── Public API ──

  /**
   * User watches an ad and claims a speed boost.
   * Returns { activated: true } if the 30-min window fires now.
   */
  async claimBoost(userId: string): Promise<{
    activated: boolean;
    boostExpiresAt: Date | null;
  }> {
    // Check if the user already has an active boost window
    const existing = await this.boostRepository.findOne({
      where: { userId },
    });

    if (existing?.boostExpiresAt && existing.boostExpiresAt > new Date()) {
      // User already has active boost
      return { activated: false, boostExpiresAt: existing.boostExpiresAt };
    }

    // Record that this user watched an ad
    const now = new Date();
    if (existing) {
      existing.adViewedAt = now;
      existing.boostExpiresAt = null;
      await this.boostRepository.save(existing);
    } else {
      await this.boostRepository.save(
        this.boostRepository.create({ userId, adViewedAt: now }),
      );
    }

    // Increment collective counter
    this.collectiveBoostCount += 1;
    this.logger.log(`Boost claimed by ${userId} — ${this.collectiveBoostCount}/${this.BOOST_THRESHOLD}`);

    if (this.collectiveBoostCount >= this.BOOST_THRESHOLD) {
      return this.activateBoostForAll();
    }

    return { activated: false, boostExpiresAt: null };
  }

  /**
   * Activate 30-min boost for ALL users in the current pool.
   */
  private async activateBoostForAll(): Promise<{
    activated: boolean;
    boostExpiresAt: Date;
  }> {
    const expiresAt = new Date(Date.now() + this.BOOST_DURATION_MS);

    // Find all users who watched an ad in the last 24h and don't have boost yet
    const pending = await this.boostRepository.find({
      where: {
        adViewedAt: MoreThan(new Date(Date.now() - 24 * 60 * 60 * 1000)),
        boostExpiresAt: IsNull(),
      },
    });

    for (const record of pending) {
      record.boostExpiresAt = expiresAt;
    }
    await this.boostRepository.save(pending);

    this.collectiveBoostCount = 0;
    this.logger.log(
      `Speed-boost ACTIVATED for ${pending.length} users until ${expiresAt.toISOString()}`,
    );

    return { activated: true, boostExpiresAt: expiresAt };
  }

  /**
   * Check whether a user is currently boosted (within the 30-min window).
   */
  async isUserBoosted(userId: string): Promise<boolean> {
    const record = await this.boostRepository.findOne({
      where: { userId },
    });
    if (!record?.boostExpiresAt) return false;
    return record.boostExpiresAt > new Date();
  }

  /**
   * Get a boosted user's priority score (80 for boosted, 0 otherwise).
   */
  async getPriorityScore(userId: string): Promise<number> {
    const boosted = await this.isUserBoosted(userId);
    return boosted ? 80 : 0;
  }

  // ── Cooldown ──

  /**
   * Set cooldown for user after they leave/cancel a search.
   */
  async setCooldown(userId: string): Promise<void> {
    // Boosted users don't get cooldown
    if (await this.isUserBoosted(userId)) return;

    const cooldownUntil = new Date(Date.now() + this.COOLDOWN_MS);
    const existing = await this.boostRepository.findOne({
      where: { userId },
    });

    if (existing) {
      existing.cooldownUntil = cooldownUntil;
      await this.boostRepository.save(existing);
    } else {
      await this.boostRepository.save(
        this.boostRepository.create({ userId, cooldownUntil }),
      );
    }
  }

  /**
   * Get cooldown remaining (ms) for a user. Returns 0 if no cooldown.
   */
  async getCooldownRemaining(userId: string): Promise<number> {
    // Boosted users skip cooldown
    if (await this.isUserBoosted(userId)) return 0;

    const record = await this.boostRepository.findOne({
      where: { userId },
    });
    if (!record?.cooldownUntil) return 0;

    const remaining = record.cooldownUntil.getTime() - Date.now();
    return remaining > 0 ? remaining : 0;
  }

  /**
   * Check if user is blocked by cooldown.
   */
  async isOnCooldown(userId: string): Promise<boolean> {
    return (await this.getCooldownRemaining(userId)) > 0;
  }

  // ── Status ──

  /**
   * Get full boost status for the frontend.
   */
  async getBoostStatus(userId: string): Promise<{
    isBoosted: boolean;
    boostExpiresAt: Date | null;
    cooldownRemainingMs: number;
    collectiveCount: number;
    collectiveThreshold: number;
  }> {
    const record = await this.boostRepository.findOne({
      where: { userId },
    });

    const isBoosted =
      !!record?.boostExpiresAt && record.boostExpiresAt > new Date();

    let cooldownRemainingMs = 0;
    if (!isBoosted && record?.cooldownUntil) {
      cooldownRemainingMs = Math.max(0, record.cooldownUntil.getTime() - Date.now());
    }

    return {
      isBoosted,
      boostExpiresAt: isBoosted ? record!.boostExpiresAt : null,
      cooldownRemainingMs,
      collectiveCount: this.collectiveBoostCount,
      collectiveThreshold: this.BOOST_THRESHOLD,
    };
  }
}
