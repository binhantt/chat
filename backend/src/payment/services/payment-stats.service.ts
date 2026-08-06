import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from '../entities/payment.entity';

@Injectable()
export class PaymentStatsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async getStats(): Promise<{
    totalRevenue: number;
    pendingCount: number;
    completedCount: number;
  }> {
    const all = await this.paymentRepository.find();
    const totalRevenue = all
      .filter((p) => p.status === PaymentStatus.Completed)
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const pendingCount = all.filter(
      (p) => p.status === PaymentStatus.Pending,
    ).length;
    const completedCount = all.filter(
      (p) => p.status === PaymentStatus.Completed,
    ).length;
    return { totalRevenue, pendingCount, completedCount };
  }
}
