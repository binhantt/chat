import { Injectable, Logger } from '@nestjs/common';

export interface SePayCreateOrderResult {
  success: boolean;
  transactionId?: string;
  checkoutUrl?: string;
  qrUrl?: string;
  message?: string;
}

@Injectable()
export class SeppayApiService {
  private readonly logger = new Logger(SeppayApiService.name);

  async createOrder(params: {
    transactionCode: string;
    amount: number;
    description: string;
    returnUrl: string;
    ipnUrl: string;
  }): Promise<SePayCreateOrderResult> {
    const endpoint = process.env.SEPAY_PAYMENT_GATEWAY_CHECKOUT_URL || '';
    const apiToken = process.env.SEPAY_API_TOKEN || '';
    const merchantId = process.env.SEPAY_MERCHANT_ID || '';

    if (!endpoint || !apiToken) {
      this.logger.warn('SePay not configured (missing endpoint or API token), using local QR');
      return { success: false, message: 'Missing config' };
    }

    const payload = {
      merchant_id: merchantId,
      api_token: apiToken,
      order_code: params.transactionCode,
      amount: params.amount,
      description: params.description,
      return_url: params.returnUrl,
      ipn_url: params.ipnUrl,
      sub_account: process.env.SEPAY_SUB_ACCOUNT || '',
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        this.logger.warn(`SePay API error ${response.status}: ${text}`);
        return { success: false, message: `API error: ${response.status}` };
      }

      const data = await response.json();
      this.logger.log(`SePay order created: ${params.transactionCode}`);

      return {
        success: true,
        transactionId: data.transaction_id || data.order_id,
        checkoutUrl: data.checkout_url,
        qrUrl: data.qr_url || data.qrCode,
      };
    } catch (error: any) {
      this.logger.warn(`SePay API call failed: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  async checkOrderStatus(transactionCode: string): Promise<{
    status: 'pending' | 'completed' | 'failed';
    transactionId?: string;
  }> {
    const apiToken = process.env.SEPAY_API_TOKEN || '';
    try {
      const response = await fetch(
        `https://pgapi.sepay.vn/v1/orders/${transactionCode}?api_token=${apiToken}`,
        { signal: AbortSignal.timeout(8000) },
      );
      if (!response.ok) return { status: 'pending' };
      const data = await response.json();
      return {
        status: data.status === 'completed' ? 'completed' : data.status === 'failed' ? 'failed' : 'pending',
        transactionId: data.transaction_id,
      };
    } catch {
      return { status: 'pending' };
    }
  }
}
