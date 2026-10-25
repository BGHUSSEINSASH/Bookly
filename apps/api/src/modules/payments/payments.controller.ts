import {
  Body, Controller, Get, Headers, HttpCode, HttpException,
  HttpStatus, Param, Post, Query, RawBodyRequest, Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

import { PrismaService } from '../../prisma/prisma.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ZainCashService } from './zaincash.service';
import { FastPayService } from './fastpay.service';
import { StripeService } from './stripe.service';
import { WalletService } from '../wallet/wallet.service';

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly zainCash: ZainCashService,
    private readonly fastPay: FastPayService,
    private readonly stripe: StripeService,
    private readonly wallet: WalletService,
  ) {}

  private get sandbox() {
    return this.config.get('PAYMENT_MODE', 'sandbox') !== 'live';
  }

  @Get()
  @ApiOperation({ summary: 'سجل مدفوعاتي' })
  async list(@CurrentUser('id') userId: string, @Query('limit') limit = '50') {
    const items = await this.prisma.payment.findMany({
      where: { customerId: userId },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      include: { booking: { select: { code: true, property: { select: { title: true } } } } },
    });
    return items.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      refundedAmount: Number(p.refundedAmount),
      currency: p.currency,
      method: p.method,
      provider: p.provider,
      status: p.status,
      transactionRef: p.transactionRef,
      paidAt: p.paidAt,
      createdAt: p.createdAt,
      bookingCode: p.booking?.code,
      bookingTitle: p.booking?.property?.title,
    }));
  }

  @Post('init')
  @HttpCode(200)
  @ApiOperation({ summary: 'بدء عملية دفع (بوابة)' })
  async init(
    @CurrentUser('id') userId: string,
    @Body() body: { amount: number; method: string; bookingCode?: string; currency?: string; redirectUrl?: string },
  ) {
    const booking = body.bookingCode
      ? await this.prisma.booking.findUnique({ where: { code: body.bookingCode } })
      : null;

    const webOrigin = this.config.get('WEB_ORIGIN', 'http://localhost:3000');
    const redirectUrl = body.redirectUrl ?? `${webOrigin}/bookings/${body.bookingCode}`;

    if (body.method === 'ZAIN_CASH') {
      const result = await this.zainCash.initTransaction({
        amount: body.amount,
        orderId: body.bookingCode ?? `PAY-${Date.now()}`,
        redirectUrl,
        note: `حجز Bookly ${body.bookingCode}`,
      });
      return { provider: 'ZAIN_CASH', status: 'requires_action', checkoutUrl: result.redirectUrl, transactionId: result.transactionId, sandbox: this.sandbox };
    }

    if (body.method === 'FASTPAY') {
      const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { fullName: true, phone: true } });
      const result = await this.fastPay.initPayment({
        amount: body.amount,
        orderId: body.bookingCode ?? `PAY-${Date.now()}`,
        redirectUrl,
        customerName: user?.fullName,
        customerPhone: user?.phone ?? undefined,
      });
      return { provider: 'FASTPAY', status: 'requires_action', checkoutUrl: result.redirectUrl, transactionId: result.transactionId, sandbox: this.sandbox };
    }

    if (['VISA', 'MASTERCARD', 'APPLE_PAY', 'GOOGLE_PAY'].includes(body.method)) {
      const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
      const result = await this.stripe.createCheckoutSession({
        amount: body.amount,
        currency: body.currency?.toLowerCase() ?? 'usd',
        orderId: body.bookingCode ?? `PAY-${Date.now()}`,
        successUrl: `${redirectUrl}?payment=success`,
        cancelUrl: `${redirectUrl}?payment=cancel`,
        customerEmail: user?.email,
        description: `Bookly ${body.bookingCode}`,
      });
      return { provider: 'STRIPE', status: 'requires_action', checkoutUrl: result.url, sessionId: result.sessionId, sandbox: this.sandbox };
    }

    // sandbox fallback
    if (!this.sandbox) {
      throw new HttpException('طريقة الدفع غير مدعومة — استخدم المحفظة أو الدفع عند الوصول', HttpStatus.NOT_IMPLEMENTED);
    }

    return {
      provider: body.method,
      status: 'requires_action',
      checkoutUrl: `https://gateway.sandbox.local/pay/${Date.now()}`,
      amount: body.amount,
      currency: body.currency ?? 'IQD',
      bookingCode: booking?.code,
      sandbox: true,
    };
  }

  /** Webhook: زين كاش */
  @Public()
  @Post('webhooks/zaincash')
  @HttpCode(200)
  async zaincashWebhook(@Body() body: any, @Headers('x-zaincash-signature') sig: string) {
    const valid = this.zainCash.verifyWebhookSignature(JSON.stringify(body), sig ?? '');
    if (!valid) return { received: false };
    await this.handlePaymentCallback(body.orderId, body.id, 'ZAIN_CASH', body.status === 'completed' ? 'PAID' : 'FAILED');
    return { received: true };
  }

  /** Webhook: FastPay */
  @Public()
  @Post('webhooks/fastpay')
  @HttpCode(200)
  async fastpayWebhook(@Body() body: any, @Headers('x-fastpay-signature') sig: string) {
    const valid = this.fastPay.verifyWebhook(JSON.stringify(body), sig ?? '');
    if (!valid) return { received: false };
    await this.handlePaymentCallback(body.orderId, body.transactionId, 'FASTPAY', body.status === 'success' ? 'PAID' : 'FAILED');
    return { received: true };
  }

  /** Webhook: Stripe */
  @Public()
  @Post('webhooks/stripe')
  @HttpCode(200)
  async stripeWebhook(@Req() req: RawBodyRequest<Request>, @Headers('stripe-signature') sig: string) {
    const event = this.stripe.constructWebhookEvent(req.rawBody ?? Buffer.alloc(0), sig ?? '');
    if (!event) return { received: false };

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        await this.handlePaymentCallback(orderId, session.id, 'STRIPE', session.payment_status === 'paid' ? 'PAID' : 'FAILED');
      }
    }
    return { received: true };
  }

  /** شحن المحفظة */
  @Post('wallet/topup')
  @HttpCode(200)
  @ApiOperation({ summary: 'شحن المحفظة' })
  async topupWallet(@CurrentUser('id') userId: string, @Body() body: { amount: number; method: string }) {
    if (!this.sandbox && !['ZAIN_CASH', 'FASTPAY', 'VISA', 'MASTERCARD'].includes(body.method)) {
      throw new HttpException('طريقة الشحن غير متاحة', HttpStatus.BAD_REQUEST);
    }
    await this.wallet.credit(userId, body.amount, { type: 'TOPUP', note: `شحن المحفظة عبر ${body.method}` });
    return this.wallet.getBalance(userId);
  }

  private async handlePaymentCallback(orderId: string, transactionId: string, provider: string, status: 'PAID' | 'FAILED') {
    const booking = await this.prisma.booking.findUnique({ where: { code: orderId } });
    if (!booking) return;

    if (status === 'PAID') {
      await this.prisma.booking.update({ where: { id: booking.id }, data: { paymentStatus: 'PAID', status: 'CONFIRMED' } });
      await this.prisma.payment.updateMany({
        where: { bookingId: booking.id },
        data: { status: 'PAID', transactionRef: transactionId, paidAt: new Date() },
      });
    } else {
      await this.prisma.booking.update({ where: { id: booking.id }, data: { paymentStatus: 'FAILED', status: 'CANCELLED' } });
    }
  }

  @Get('methods')
  @Public()
  @ApiOperation({ summary: 'وسائل الدفع المتاحة' })
  methods() {
    const zcAvail  = this.sandbox || this.zainCash.isConfigured;
    const fpAvail  = this.sandbox || this.fastPay.isConfigured;
    const strAvail = this.sandbox || this.stripe.isConfigured;
    return [
      { key: 'WALLET',       nameAr: 'محفظة Bookly',   icon: 'wallet',     available: true },
      { key: 'ZAIN_CASH',    nameAr: 'زين كاش',         icon: 'zaincash',   available: zcAvail },
      { key: 'FASTPAY',      nameAr: 'فاست باي',         icon: 'fastpay',    available: fpAvail },
      { key: 'VISA',         nameAr: 'فيزا',             icon: 'visa',       available: strAvail },
      { key: 'MASTERCARD',   nameAr: 'ماستركارد',        icon: 'mastercard', available: strAvail },
      { key: 'APPLE_PAY',    nameAr: 'Apple Pay',        icon: 'apple',      available: strAvail },
      { key: 'GOOGLE_PAY',   nameAr: 'Google Pay',       icon: 'google',     available: strAvail },
      { key: 'ASIA_HAWALA',  nameAr: 'آسيا حوالة',       icon: 'hawala',     available: false },
      { key: 'CASH_ON_SITE', nameAr: 'الدفع عند الوصول', icon: 'cash',       available: true },
    ];
  }
}
