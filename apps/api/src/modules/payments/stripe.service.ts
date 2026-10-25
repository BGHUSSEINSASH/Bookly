import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Stripe — للبطاقات الدولية (Visa/Mastercard/Apple Pay/Google Pay)
 */
@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: any = null;
  private readonly isSandbox: boolean;

  constructor(private readonly config: ConfigService) {
    this.isSandbox = this.config.get('PAYMENT_MODE', 'sandbox') !== 'live';
    this.init();
  }

  private async init() {
    const secretKey = this.config.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      this.logger.warn('STRIPE_SECRET_KEY غير مهيأ');
      return;
    }
    try {
      const Stripe = await import('stripe').then(m => m.default).catch(() => null);
      if (!Stripe) { this.logger.warn('حزمة stripe غير مثبّتة'); return; }
      this.stripe = new Stripe(secretKey, { apiVersion: '2024-11-20.acacia' });
      this.logger.log('✅ Stripe جاهز');
    } catch (e) {
      this.logger.error(`Stripe init error: ${e}`);
    }
  }

  get isConfigured(): boolean {
    return this.stripe !== null;
  }

  async createCheckoutSession(opts: {
    amount: number;          // بالفلس (IQD لا تدعم Stripe — استخدم USD أو EUR)
    currency: string;        // 'usd' | 'eur'
    orderId: string;
    successUrl: string;
    cancelUrl: string;
    customerEmail?: string;
    description?: string;
  }): Promise<{ sessionId: string; url: string }> {
    if (this.isSandbox || !this.stripe) {
      return {
        sessionId: `cs_sandbox_${Date.now()}`,
        url: `${opts.successUrl}?sandbox=1&session_id=cs_sandbox`,
      };
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: opts.currency.toLowerCase(),
          product_data: { name: opts.description ?? `Bookly ${opts.orderId}` },
          unit_amount: Math.round(opts.amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${opts.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: opts.cancelUrl,
      customer_email: opts.customerEmail,
      metadata: { orderId: opts.orderId },
    });

    return { sessionId: session.id, url: session.url! };
  }

  async retrieveSession(sessionId: string): Promise<{ status: string; paymentStatus: string; metadata: any }> {
    if (!this.stripe) return { status: 'unknown', paymentStatus: 'unknown', metadata: {} };
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);
    return {
      status: session.status,
      paymentStatus: session.payment_status,
      metadata: session.metadata,
    };
  }

  constructWebhookEvent(payload: Buffer, signature: string): any {
    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET', '');
    if (!this.stripe || !webhookSecret) return null;
    try {
      return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (e) {
      this.logger.error(`Stripe webhook error: ${e}`);
      return null;
    }
  }
}
