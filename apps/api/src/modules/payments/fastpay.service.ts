import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';

export interface FastPayInitResult {
  transactionId: string;
  redirectUrl: string;
}

/**
 * FastPay — بوابة الدفع العراقية
 * الوثائق: https://fastpay.com.iq/docs
 */
@Injectable()
export class FastPayService {
  private readonly logger = new Logger(FastPayService.name);

  private readonly merchantId: string;
  private readonly apiKey: string;
  private readonly secret: string;
  private readonly isSandbox: boolean;
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.isSandbox  = this.config.get('PAYMENT_MODE', 'sandbox') !== 'live';
    this.merchantId = this.config.get('FASTPAY_MERCHANT_ID', '');
    this.apiKey     = this.config.get('FASTPAY_API_KEY', '');
    this.secret     = this.config.get('FASTPAY_SECRET', '');
    this.baseUrl    = this.isSandbox
      ? 'https://sandbox.fastpay.com.iq/api/v1'
      : 'https://api.fastpay.com.iq/api/v1';
  }

  get isConfigured(): boolean {
    return Boolean(this.merchantId && this.apiKey);
  }

  async initPayment(opts: {
    amount: number;
    orderId: string;
    redirectUrl: string;
    customerName?: string;
    customerPhone?: string;
  }): Promise<FastPayInitResult> {
    if (this.isSandbox || !this.isConfigured) {
      return {
        transactionId: `FP-SANDBOX-${Date.now()}`,
        redirectUrl: `${opts.redirectUrl}?sandbox=1&orderId=${opts.orderId}&status=SUCCESS`,
      };
    }

    const timestamp = Date.now().toString();
    const signature = createHmac('sha256', this.secret)
      .update(`${this.merchantId}${opts.amount}${opts.orderId}${timestamp}`)
      .digest('hex');

    try {
      const res = await fetch(`${this.baseUrl}/payments/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': this.apiKey,
          'X-Signature': signature,
          'X-Timestamp': timestamp,
        },
        body: JSON.stringify({
          merchantId: this.merchantId,
          amount: opts.amount,
          currency: 'IQD',
          orderId: opts.orderId,
          redirectUrl: opts.redirectUrl,
          customerName: opts.customerName,
          customerPhone: opts.customerPhone,
          description: `حجز Bookly ${opts.orderId}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'FastPay init failed');

      return {
        transactionId: data.transactionId,
        redirectUrl: data.paymentUrl,
      };
    } catch (e) {
      this.logger.error(`FastPay init error: ${e}`);
      throw e;
    }
  }

  async verifyPayment(transactionId: string): Promise<'SUCCESS' | 'FAILED' | 'PENDING'> {
    if (this.isSandbox) return 'SUCCESS';

    try {
      const res = await fetch(`${this.baseUrl}/payments/${transactionId}`, {
        headers: { 'X-Api-Key': this.apiKey },
      });
      const data = await res.json();
      return data.status === 'success' ? 'SUCCESS' : data.status === 'failed' ? 'FAILED' : 'PENDING';
    } catch {
      return 'FAILED';
    }
  }

  verifyWebhook(payload: string, signature: string): boolean {
    const expected = createHmac('sha256', this.secret).update(payload).digest('hex');
    return expected === signature;
  }
}
