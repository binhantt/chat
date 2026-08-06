import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventBusService } from '../common/events/event-bus.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto, ApprovePaymentDto } from './dto/create-payment.dto';
import { PaymentStatsService } from './services/payment-stats.service';
import { createPaymentCreatedEvent } from './events/payment-created.event';
import { createPaymentStatusChangedEvent } from './events/payment-status-changed.event';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly paymentStats: PaymentStatsService,
    private readonly eventBus: EventBusService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async createPayment(
    userId: string,
    dto: CreatePaymentDto,
  ): Promise<Payment> {
    const payment = this.paymentRepository.create({
      userId,
      amount: dto.amount,
      paymentMethod: dto.paymentMethod as any,
      description: dto.description,
      status: PaymentStatus.Pending,
    });
    const saved = await this.paymentRepository.save(payment);

    this.eventBus.emit(
      createPaymentCreatedEvent(saved.id, userId, dto.amount, dto.paymentMethod),
    );

    return saved;
  }

  async getUserPayments(userId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getAllPayments(): Promise<Payment[]> {
    return this.paymentRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAllPaymentsWithOrphans(): Promise<any[]> {
    const payments = await this.paymentRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
    return payments.map((p) => ({
      ...p,
      user: p.user || { id: p.userId, email: 'Ẩn danh', fullName: 'Không xác định' },
    }));
  }

  async approvePayment(id: string, dto: ApprovePaymentDto): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({ where: { id } });
    if (!payment) throw new NotFoundException('Không tìm thấy giao dịch');

    const oldStatus = payment.status;
    payment.status = dto.status as PaymentStatus;
    const saved = await this.paymentRepository.save(payment);

    this.eventBus.emit(
      createPaymentStatusChangedEvent(id, payment.userId, oldStatus, dto.status),
    );

    // Auto-activate VIP subscription when payment is approved
    if (dto.status === 'completed') {
      const planId = dto.planId || this.resolvePlanByAmount(Number(payment.amount));
      if (planId) {
        try {
          await this.subscriptionService.subscribeUser(payment.userId, planId);
          this.logger.log(
            `VIP auto-activated for user ${payment.userId} via payment approval (plan: ${planId})`,
          );
        } catch (err) {
          this.logger.error(
            `Failed to auto-activate VIP for user ${payment.userId}:`,
            err,
          );
        }
      }
    }

    return saved;
  }

  private resolvePlanByAmount(amount: number): string | null {
    // Map common amounts to plan IDs (matching seeded plans)
    if (amount === 59000) return 'vip';
    if (amount === 99000) return 'premium';
    return null;
  }

  async getPaymentStats(): Promise<{
    totalRevenue: number;
    pendingCount: number;
    completedCount: number;
  }> {
    return this.paymentStats.getStats();
  }
}
