import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, createHmac } from 'crypto';

export interface ZainCashInitResult {
  transactionId: string;
  redirectUrl: string;
}

export interface ZainCashVerifyResult {
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  transactionId: string;
  amount: number;
  orderId: string;
}

/**
 * بوابة زين كاش — العراق
 * الوثائق: https://zaincash.iq/docs
 */
@Injectable()
export class ZainCashService {
  private readonly logger = new Logger(ZainCashService.name);

  private readonly merchantId: string;
  private readonly msisdn: string;
  private readonly secret: string;
  private readonly baseUrl: string;
  private readonly isSandbox: boolean;

  constructor(private readonly config: ConfigService) {
    this.isSandbox = this.config.get('PAYMENT_MODE', 'sandbox') !== 'live';
    this.merchantId = this.config.get('ZAIN_CASH_MERCHANT_ID', '');
    this.msisdn      = this.config.get('ZAIN_CASH_MSISDN', '');
    this.secret      = this.config.get('ZAIN_CASH_SECRET', '');
    this.baseUrl     = this.isSandbox
      ? 'https://test.zaincash.iq/transaction'
      : 'https://api.zaincash.iq/transaction';
  }

  get isConfigured(): boolean {
    return Boolean(this.merchantId && this.msisdn && this.secret);
  }

  /**
   * بدء عملية الدفع — تُعيد رابط إعادة التوجيه للمستخدم
   */
  async initTransaction(opts: {
    amount: number;          // بالدينار العراقي
    orderId: string;         // رمز الحجز
    redirectUrl: string;     // URL بعد الدفع
    note?: string;
  }): Promise<ZainCashInitResult> {
    if (this.isSandbox || !this.isConfigured) {
      // محاكاة في وضع sandbox
      return {
        transactionId: `ZC-SANDBOX-${Date.now()}`,
        redirectUrl: `${opts.redirectUrl}?sandbox=1&orderId=${opts.orderId}&status=SUCCESS`,
      };
    }

    const payload = {
      amount: opts.amount,
      serviceType: 'Bookly Booking',
      msisdn: this.msisdn,
      orderId: opts.orderId,
      redirectUrl: opts.redirectUrl,
      note: opts.note ?? `حجز ${opts.orderId}`,
      merchantId: this.merchantId,
      timeStamp: Math.floor(Date.now() / 1000),
    };

    // توقيع JWT مبسّط (HMAC-SHA256)
    const token = this.signToken(payload);

    try {
      const res = await fetch(`${this.baseUrl}/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, merchantId: this.merchantId, lang: 'ar' }),
      });

      const data = await res.json();
      if (!data.id) throw new Error(data.msg ?? 'ZainCash init failed');

      return {
        transactionId: data.id,
        redirectUrl: `${this.baseUrl}/pay/${data.id}`,
      };
    } catch (e) {
      this.logger.error(`ZainCash init error: ${e}`);
      throw e;
    }
  }

  /**
   * التحقق من حالة معاملة (عبر webhook أو redirect callback)
   */
  async verifyTransaction(transactionId: string): Promise<ZainCashVerifyResult> {
    if (this.isSandbox || !this.isConfigured) {
      return { status: 'SUCCESS', transactionId, amount: 0, orderId: '' };
    }

    try {
      const payload = { id: transactionId, merchantId: this.merchantId, timeStamp: Math.floor(Date.now() / 1000) };
      const token   = this.signToken(payload);

      const res = await fetch(`${this.baseUrl}/get`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, merchantId: this.merchantId }),
      });

      const data = await res.json();
      return {
        status: data.status === 'completed' ? 'SUCCESS' : data.status === 'failed' ? 'FAILED' : 'PENDING',
        transactionId: data.id,
        amount: data.amount ?? 0,
        orderId: data.orderId ?? '',
      };
    } catch (e) {
      this.logger.error(`ZainCash verify error: ${e}`);
      return { status: 'FAILED', transactionId, amount: 0, orderId: '' };
    }
  }

  /** التحقق من signature الـ webhook */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const expected = createHmac('sha256', this.secret).update(payload).digest('hex');
    return expected === signature;
  }

  private signToken(data: Record<string, unknown>): string {
    const header  = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify(data)).toString('base64url');
    const sig     = createHmac('sha256', this.secret).update(`${header}.${payload}`).digest('base64url');
    return `${header}.${payload}.${sig}`;
  }
}
