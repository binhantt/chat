import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PaymentService } from '../payment/payment.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { SeppayApiService } from './seppay-api.service';
import { randomUUID } from 'crypto';

export interface SeppayPaymentInfo {
  paymentId: string;
  transactionCode: string;
  amount: number;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  content: string;
  qrUrl: string;
  status: 'pending' | 'completed' | 'failed';
  planId: string;
  userId: string;
  userName?: string;
}

// In-memory store for Seppay payments (no DB table needed)
const paymentStore = new Map<string, SeppayPaymentInfo>();
const txCodeIndex = new Map<string, string>(); // transactionCode -> userId

@Injectable()
export class SeppayService {
  private readonly logger = new Logger(SeppayService.name);

  constructor(
    private readonly paymentService: PaymentService,
    private readonly subscriptionService: SubscriptionService,
    private readonly seppayApi: SeppayApiService,
  ) {}

  async createPayment(
    userId: string,
    planId: string,
  ): Promise<SeppayPaymentInfo> {
    const plan = await this.subscriptionService.findPlanById(planId);
    const txPrefix = process.env.SEPAY_TX_PREFIX || process.env.SEPPAY_TX_PREFIX || 'SEP';
    const transactionCode = `${txPrefix}${randomUUID().slice(0, 6).toUpperCase()}`;
    const paymentId = randomUUID();
    const amount = Math.round(Number(plan.price));
    const contentPrefix = process.env.SEPAY_CONTENT_PREFIX ?? process.env.SEPPAY_CONTENT_PREFIX;
    const content = contentPrefix ? `${contentPrefix} ${transactionCode}` : transactionCode;
    const bankCode = process.env.PAY_BANK_ID || process.env.SEPPAY_BANK_NAME || 'OCB';
    const bankAccount = process.env.SEPAY_ACCOUNT_NUMBER || process.env.SEPPAY_BANK_ACCOUNT || process.env.PAY_ACCOUNT_NO || '0329104253';
    const bankHolder = process.env.PAY_ACCOUNT_NAME || process.env.SEPPAY_BANK_HOLDER || 'Do Binh An';
    const bankName = process.env.PAY_BANK_ID || process.env.SEPPAY_BANK_NAME || 'OCB';

    // Try calling SePay API first
    const ipnUrl = process.env.SEPAY_IPN_URL || process.env.SEPPAY_IPN_URL || `http://localhost:3001/api/v1/payment/sepay/ipn`;
    const apiResult = await this.seppayApi.createOrder({
      transactionCode,
      amount,
      description: content,
      returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/vip`,
      ipnUrl,
    });

    let qrUrl: string;
    if (apiResult.success && apiResult.qrUrl) {
      qrUrl = apiResult.qrUrl;
      this.logger.log(`SePay order created: ${apiResult.transactionId}`);
    } else {
      // Fallback: local VietQR generation
      const qrEndpoint = process.env.SEPAY_QR_ENDPOINT || process.env.SEPPAY_QR_ENDPOINT || 'https://img.vietqr.io/image';
      const qrTemplate = process.env.SEPAY_QR_TEMPLATE || process.env.SEPPAY_QR_TEMPLATE || 'qr_only';
      qrUrl = `${qrEndpoint}/${bankCode}-${encodeURIComponent(bankAccount)}-${qrTemplate}.png?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(bankHolder)}`;
      this.logger.warn(`SePay API unavailable, using local QR (${apiResult.message || 'no response'})`);
    }

    const payment: SeppayPaymentInfo = {
      paymentId,
      transactionCode,
      amount: plan.price,
      bankName,
      bankAccount,
      bankHolder,
      content,
      qrUrl,
      status: 'pending',
      planId,
      userId,
    };

    // Store in memory (keyed by userId for easy lookup)
    paymentStore.set(userId, payment);
    txCodeIndex.set(transactionCode, userId);

    this.logger.log(`Seppay payment created for user ${userId}: ${transactionCode}`);

    return payment;
  }

  async getPaymentStatus(userId: string): Promise<SeppayPaymentInfo | null> {
    return paymentStore.get(userId) || null;
  }

  async confirmPayment(userId: string): Promise<boolean> {
    const payment = paymentStore.get(userId);
    if (!payment || payment.status !== 'pending') {
      throw new NotFoundException('Không tìm thấy giao dịch hoặc đã xử lý');
    }

    payment.status = 'completed';
    paymentStore.set(userId, payment);

    // Create payment record in DB
    try {
      await this.paymentService.createPayment(userId, {
        amount: payment.amount,
        paymentMethod: 'banking' as any,
        description: `Seppay: ${payment.transactionCode}`,
      });
    } catch (err) {
      this.logger.error('Failed to create payment record', err);
    }

    // Auto-activate VIP subscription
    if (payment.planId) {
      try {
        await this.subscriptionService.subscribeUser(userId, payment.planId);
        this.logger.log(`VIP auto-activated for user ${userId}: ${payment.planId}`);
      } catch (err) {
        this.logger.error(`Failed to auto-activate VIP for ${userId}:`, err);
      }
    }

    this.logger.log(`Payment confirmed for user ${userId}: ${payment.transactionCode}`);
    return true;
  }

  async confirmByTransactionCode(transactionCode: string, transactionContent?: string): Promise<boolean> {
    // Try exact match first
    let userId = txCodeIndex.get(transactionCode);
    if (userId) {
      return this.confirmPayment(userId);
    }

    // Try matching by content (VA number or transaction code in transfer content)
    const searchTexts = [transactionContent, transactionCode].filter(Boolean);
    for (const [uid, payment] of paymentStore.entries()) {
      if (payment.status !== 'pending') continue;
      for (const text of searchTexts) {
        if (!text) continue;
        if (text.includes(payment.transactionCode) || payment.transactionCode.includes(text) ||
            text.includes(payment.content) || (payment.content && payment.content.includes(text))) {
          userId = uid;
          break;
        }
      }
      if (userId) break;
    }

    if (!userId) {
      this.logger.warn(`No payment found for transaction code: ${transactionCode}`);
      return false;
    }
    return this.confirmPayment(userId);
  }

  async getAllPendingPayments(): Promise<SeppayPaymentInfo[]> {
    const pendings: SeppayPaymentInfo[] = [];
    for (const payment of paymentStore.values()) {
      if (payment.status === 'pending') {
        pendings.push(payment);
      }
    }
    return pendings;
  }

  async confirmAndSubscribe(userId: string, planId: string): Promise<any> {
    // Find the pending payment
    await this.confirmPayment(userId);

    // Activate subscription
    const subscription = await this.subscriptionService.subscribeUser(userId, planId);

    this.logger.log(`Subscription activated for user ${userId} after Seppay payment`);

    return {
      success: true,
      subscription,
    };
  }

  async recordDeposit(data: {
    transactionCode: string;
    amount: number;
    description: string;
    userId: string | null;
  }): Promise<void> {
    let effectiveUserId = data.userId;

    // Try to find user by matching content/VA number against pending payments
    if (!effectiveUserId) {
      for (const [uid, payment] of paymentStore.entries()) {
        if (payment.status !== 'pending') continue;
        // Match if description contains payment content or vice versa
        const desc = data.description.toLowerCase();
        const payContent = (payment.content || payment.transactionCode).toLowerCase();
        if (desc.includes(payContent) || payContent.includes(desc)) {
          effectiveUserId = uid;
          break;
        }
        // Also try matching by bank account / VA number
        if (payment.bankAccount && desc.includes(payment.bankAccount.toLowerCase())) {
          effectiveUserId = uid;
          break;
        }
      }
    }

    if (!effectiveUserId) {
      this.logger.log(`Deposit skipped (no matching user): ${data.transactionCode} - ${data.amount}đ`);
      return;
    }

    try {
      await this.paymentService.createPayment(effectiveUserId, {
        amount: data.amount,
        paymentMethod: 'banking' as any,
        description: data.description,
      });
      this.logger.log(`Deposit recorded: ${data.transactionCode} - ${data.amount}đ - user ${effectiveUserId}`);
    } catch (err) {
      this.logger.error(`Failed to record deposit ${data.transactionCode}:`, err);
    }

    // Auto-activate if pending payment exists with planId
    const pending = paymentStore.get(effectiveUserId);
    if (pending?.planId && pending.status === 'pending') {
      try {
        pending.status = 'completed';
        paymentStore.set(effectiveUserId, pending);
        await this.subscriptionService.subscribeUser(effectiveUserId, pending.planId);
        this.logger.log(`VIP auto-activated for user ${effectiveUserId}: ${pending.planId}`);
      } catch (err) {
        this.logger.error(`Failed to auto-activate VIP for ${effectiveUserId}:`, err);
      }
    }
  }

  async syncTransactions(): Promise<number> {
    const token = process.env.SEPAY_API_TOKEN || '';
    if (!token) {
      this.logger.warn('syncTransactions: missing SEPAY_API_TOKEN');
      return 0;
    }

    const now = new Date();
    const dateFrom = this.toPgDate(new Date(now.getTime() - 24 * 3600 * 1000));
    const dateTo = this.toPgDate(now);

    try {
      const params = new URLSearchParams({
        api_token: token,
        transaction_date_from: dateFrom,
        transaction_date_to: dateTo,
        per_page: '100',
      });
      const res = await fetch(`https://my.sepay.vn/userapi/transactions/list?${params}`);

      if (!res.ok) {
        this.logger.warn(`syncTransactions API error: ${res.status}`);
        return 0;
      }

      const json = await res.json();
      const transactions = json.transactions || json.data || [];
      let count = 0;

      for (const tx of transactions) {
        const refNumber = tx.reference_number || tx.id?.toString();
        if (!refNumber) continue;

        // Record as deposit in payment history
        await this.recordDeposit({
          transactionCode: refNumber,
          amount: Number(tx.amount_in || tx.amount || 0),
          description: `SePay: ${tx.transaction_content || refNumber}`,
          userId: null,
        }).catch(() => {});
        count++;
      }

      this.logger.log(`syncTransactions: ${count} giao dich da dong bo`);
      return count;
    } catch (err) {
      this.logger.error('syncTransactions error:', err);
      return 0;
    }
  }

  private toPgDate(d: Date): string {
    return d.toISOString().slice(0, 19).replace('T', ' ');
  }
}
