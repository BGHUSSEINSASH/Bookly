import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentProvider } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { toNumber, round2 } from '../../common/utils/money';

/** يحوّل وسيلة الدفع إلى مزوّد الدفع المقابل في النظام */
export function resolveProvider(method: string): PaymentProvider {
  switch (method) {
    case 'WALLET':
      return 'WALLET';
    case 'VISA':
    case 'MASTERCARD':
    case 'APPLE_PAY':
    case 'GOOGLE_PAY':
      return 'STRIPE';
    case 'PAYPAL':
      return 'PAYPAL';
    case 'ZAIN_CASH':
      return 'ZAIN_CASH';
    case 'ASIA_HAWALA':
      return 'ASIA_HAWALA';
      case 'FASTPAY':
      return 'FASTPAY';
    case 'CASH_ON_SITE':
      return 'CASH';
    default:
      return 'STRIPE';
  }
}

export interface WalletDebitResult {
  ok: boolean;
  balanceAfter: number;
  transactionId: string;
}

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async ensureWallet(userId: string, currency = 'IQD') {
    const existing = await this.prisma.wallet.findUnique({ where: { userId } });
    if (existing) return existing;
    return this.prisma.wallet.create({ data: { userId, currency } });
  }

  async getBalance(userId: string) {
    const wallet = await this.ensureWallet(userId);
    return {
      balance: toNumber(wallet.balance),
      frozenBalance: toNumber(wallet.frozenBalance),
      currency: wallet.currency,
      totalToppedUp: toNumber(wallet.totalToppedUp),
    };
  }

  /** خصم من الرصيد (يرمي استثناءً عند عدم كفاية الرصيد) */
  async debit(
    userId: string,
    amount: number,
    opts: { bookingId?: string; note?: string; type?: 'BOOKING_DEBIT' | 'TRANSFER_OUT' } = {},
  ): Promise<WalletDebitResult> {
    if (amount <= 0) throw new BadRequestException('المبلغ يجب أن يكون أكبر من صفر');

    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new NotFoundException('المحفظة غير موجودة');

      const balance = toNumber(wallet.balance);
      if (balance < amount) {
        throw new BadRequestException(
          `الرصيد غير كافٍ. رصيدك الحالي ${balance} ${wallet.currency} والمطلوب ${amount} ${wallet.currency}`,
        );
      }

      const balanceAfter = round2(balance - amount);
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: balanceAfter },
      });

      const txn = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          userId,
          bookingId: opts.bookingId,
          type: opts.type ?? 'BOOKING_DEBIT',
          amount: round2(-amount),
          balanceAfter,
          currency: wallet.currency,
          note: opts.note,
          status: 'COMPLETED',
        },
      });

      return { ok: true, balanceAfter, transactionId: txn.id };
    });
  }

  /** إيداع في الرصيد (شحن أو استرداد) */
  async credit(
    userId: string,
    amount: number,
    opts: {
      bookingId?: string;
      note?: string;
      type?: 'TOPUP' | 'REFUND' | 'REWARD' | 'ADJUSTMENT' | 'TRANSFER_IN';
      reference?: string;
    } = {},
  ): Promise<WalletDebitResult> {
    if (amount <= 0) throw new BadRequestException('المبلغ يجب أن يكون أكبر من صفر');

    const wallet = await this.ensureWallet(userId);
    return this.prisma.$transaction(async (tx) => {
      const balanceAfter = round2(toNumber(wallet.balance) + amount);
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: balanceAfter,
          ...(opts.type === 'TOPUP' && {
            totalToppedUp: { increment: amount },
          }),
        },
      });

      const txn = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          userId,
          bookingId: opts.bookingId,
          type: opts.type ?? 'TOPUP',
          amount: round2(amount),
          balanceAfter,
          currency: wallet.currency,
          reference: opts.reference,
          note: opts.note,
          status: 'COMPLETED',
        },
      });

      return { ok: true, balanceAfter, transactionId: txn.id };
    });
  }

  async transactions(userId: string, page = 1, limit = 20) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.walletTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { booking: { select: { code: true, property: { select: { title: true } } } } },
      }),
      this.prisma.walletTransaction.count({ where: { userId } }),
    ]);

    return {
      items: items.map((t) => ({
        id: t.id,
        type: t.type,
        amount: toNumber(t.amount),
        balanceAfter: toNumber(t.balanceAfter),
        currency: t.currency,
        note: t.note,
        bookingCode: t.booking?.code,
        createdAt: t.createdAt,
      })),
      total,
      page,
      limit,
      pages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async topUp(userId: string, amount: number, method: string, reference?: string) {
    const sandbox = this.config.get('PAYMENT_MODE', 'sandbox') !== 'live';
    if (!sandbox) {
      throw new BadRequestException(
        'بوابة شحن الرصيد غير متاحة في بيئة الإنتاج قبل ربط مزوّد الدفع',
      );
    }
    if (amount > 10000000) {
      throw new BadRequestException('الحد الأقصى لعملية شحن واحدة 10,000,000');
    }

    const wallet = await this.ensureWallet(userId);
    const provider = resolveProvider(method);

    const payment = await this.prisma.payment.create({
      data: {
        customerId: userId,
        provider,
        method: method as any,
        amount,
        currency: wallet.currency,
        status: 'PAID',
        transactionRef: reference ?? `TOPUP-${Date.now()}`,
        paidAt: new Date(),
        gatewayPayload: { sandbox: true },
      },
    });

    const result = await this.credit(userId, amount, {
      type: 'TOPUP',
      note: 'شحن رصيد',
      reference: payment.transactionRef ?? undefined,
    });

    return { paymentId: payment.id, sandbox: true, ...result };
  }

  async transfer(userId: string, toUserId: string, amount: number) {
    if (userId === toUserId) throw new BadRequestException('لا يمكن التحويل إلى نفس الحساب');
    const target = await this.prisma.user.findUnique({ where: { id: toUserId } });
    if (!target) throw new NotFoundException('المستلم غير موجود');

    // معاملة واحدة: إمّا ينجح التحويل كاملاً أو لا يحدث شيء
    await this.prisma.$transaction(async (tx) => {
      const from = await tx.wallet.findUnique({ where: { userId } });
      if (!from) throw new NotFoundException('المحفظة غير موجودة');

      const fromBalance = toNumber(from.balance);
      if (fromBalance < amount) {
        throw new BadRequestException(
          `الرصيد غير كافٍ. رصيدك الحالي ${fromBalance} ${from.currency} والمطلوب ${amount} ${from.currency}`,
        );
      }
      const fromAfter = round2(fromBalance - amount);
      await tx.wallet.update({ where: { id: from.id }, data: { balance: fromAfter } });
      await tx.walletTransaction.create({
        data: {
          walletId: from.id,
          userId,
          type: 'TRANSFER_OUT',
          amount: round2(-amount),
          balanceAfter: fromAfter,
          currency: from.currency,
          note: `تحويل إلى ${target.fullName}`,
          status: 'COMPLETED',
        },
      });

      let to = await tx.wallet.findUnique({ where: { userId: toUserId } });
      if (!to) to = await tx.wallet.create({ data: { userId: toUserId, currency: from.currency } });
      const toAfter = round2(toNumber(to.balance) + amount);
      await tx.wallet.update({ where: { id: to.id }, data: { balance: toAfter } });
      await tx.walletTransaction.create({
        data: {
          walletId: to.id,
          userId: toUserId,
          type: 'TRANSFER_IN',
          amount: round2(amount),
          balanceAfter: toAfter,
          currency: to.currency,
          note: 'تحويل وارد',
          status: 'COMPLETED',
        },
      });
    });

    return { message: 'تم التحويل بنجاح' };
  }

  async requireOwnership(walletUserId: string, targetUserId: string) {
    if (walletUserId !== targetUserId) throw new ForbiddenException();
  }
}
