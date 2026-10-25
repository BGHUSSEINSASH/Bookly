import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { toNumber, round2 } from '../../common/utils/money';

export interface CouponValidation {
  valid: boolean;
  couponId?: string;
  code?: string;
  discount: number;
  message?: string;
  finalTotal?: number;
}

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  async listActive() {
    const coupons = await this.prisma.coupon.findMany({
      where: {
        isActive: true,
        validFrom: { lte: new Date() },
        validTo: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    return coupons.map((c) => ({
      id: c.id,
      code: c.code,
      title: c.title,
      description: c.description,
      type: c.type,
      value: toNumber(c.value),
      maxDiscount: c.maxDiscount ? toNumber(c.maxDiscount) : null,
      minOrderAmount: c.minOrderAmount ? toNumber(c.minOrderAmount) : null,
      appliesTo: c.appliesTo,
      validFrom: c.validFrom,
      validTo: c.validTo,
      usageLimit: c.usageLimit,
      usageCount: c.usageCount,
    }));
  }

  async validate(
    code: string,
    userId: string,
    subtotal: number,
    category?: string,
  ): Promise<CouponValidation> {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon) throw new NotFoundException('كود الخصم غير موجود');
    if (!coupon.isActive) throw new BadRequestException('هذا الكود غير مفعّل');
    const now = new Date();
    if (coupon.validFrom > now) throw new BadRequestException('الكود لم يُفعّل بعد');
    if (coupon.validTo < now) throw new BadRequestException('انتهت صلاحية هذا الكود');

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new BadRequestException('تم استنفاد هذا الكود');
    }

    const usedByUser = await this.prisma.couponRedemption.count({
      where: { couponId: coupon.id, userId },
    });
    if (usedByUser >= coupon.perUserLimit) {
      throw new BadRequestException('استخدمت هذا الكود الحد المسموح لك');
    }

    const minAmount = coupon.minOrderAmount ? toNumber(coupon.minOrderAmount) : 0;
    if (subtotal < minAmount) {
      throw new BadRequestException(`الحد الأدنى لاستخدام الكود ${minAmount}`);
    }

    if (coupon.appliesTo.length && category && !coupon.appliesTo.includes(category)) {
      throw new BadRequestException('الكود غير مطبق على هذه الفئة');
    }

    let discount =
      coupon.type === 'PERCENT'
        ? round2((subtotal * toNumber(coupon.value)) / 100)
        : round2(toNumber(coupon.value));

    if (coupon.maxDiscount) discount = Math.min(discount, toNumber(coupon.maxDiscount));
    discount = Math.min(discount, subtotal);

    return {
      valid: true,
      couponId: coupon.id,
      code: coupon.code,
      discount,
      finalTotal: round2(subtotal - discount),
    };
  }

  async redeem(couponId: string, userId: string, bookingId: string, discount: number) {
    await this.prisma.$transaction([
      this.prisma.couponRedemption.create({
        data: { couponId, userId, bookingId, discount },
      }),
      this.prisma.coupon.update({
        where: { id: couponId },
        data: { usageCount: { increment: 1 } },
      }),
    ]);
  }
}
