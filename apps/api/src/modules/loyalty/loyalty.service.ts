import { BadRequestException, Injectable } from '@nestjs/common';
import { LOYALTY, LoyaltyTier } from '@bookly/shared';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LoyaltyService {
  constructor(private readonly prisma: PrismaService) {}

  tierFor(points: number): LoyaltyTier {
    const tiers = [...LOYALTY.TIERS].reverse();
    return (tiers.find((t) => points >= t.minPoints)?.name ?? 'BRONZE') as LoyaltyTier;
  }

  multiplierFor(points: number): number {
    return this.tierFor(points) === 'BRONZE'
      ? 1
      : (LOYALTY.TIERS.find((t) => t.name === this.tierFor(points))?.multiplier ?? 1);
  }

  async summary(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { loyaltyPoints: true, lifetimeSpent: true, tier: true },
    });

    const points = user?.loyaltyPoints ?? 0;
    const tier = this.tierFor(points);
    const tierIndex = LOYALTY.TIERS.findIndex((t) => t.name === tier);
    const nextTier = LOYALTY.TIERS[tierIndex + 1] ?? null;

    const history = await this.prisma.loyaltyEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return {
      points,
      tier,
      tierLabelAr: LOYALTY.TIERS.find((t) => t.name === tier)?.nameAr,
      multiplier: this.multiplierFor(points),
      nextTier: nextTier
        ? {
            name: nextTier.name,
            nameAr: nextTier.nameAr,
            minPoints: nextTier.minPoints,
            remaining: Math.max(0, nextTier.minPoints - points),
          }
        : null,
      redeemValue: points * LOYALTY.POINT_VALUE_MINOR,
      redeemRatio: LOYALTY.POINTS_REDEEM_RATIO,
      minRedeemPoints: LOYALTY.MIN_REDEEM_POINTS,
      lifetimeSpent: Number(user?.lifetimeSpent ?? 0),
      history: history.map((h) => ({
        id: h.id,
        type: h.type,
        points: h.points,
        description: h.description,
        expiresAt: h.expiresAt,
        createdAt: h.createdAt,
      })),
    };
  }

  async earn(userId: string, points: number, bookingId?: string, description?: string) {
    if (points <= 0) return;
    const multiplier = this.multiplierFor(
      (await this.prisma.user.findUnique({ where: { id: userId }, select: { loyaltyPoints: true } }))?.loyaltyPoints ?? 0,
    );
    const finalPoints = Math.round(points * multiplier);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { loyaltyPoints: { increment: finalPoints } },
      }),
      this.prisma.loyaltyEntry.create({
        data: {
          userId,
          bookingId,
          type: 'EARN',
          points: finalPoints,
          description: description ?? 'نقاط من حجز',
          expiresAt: new Date(Date.now() + LOYALTY.EXPIRY_MONTHS * 30 * 24 * 3600 * 1000),
        },
      }),
    ]);

    await this.syncTier(userId);
  }

  async redeem(userId: string, points: number, bookingId?: string, description?: string) {
    if (points < LOYALTY.MIN_REDEEM_POINTS) {
      throw new BadRequestException(`الحد الأدنى للاستبدال ${LOYALTY.MIN_REDEEM_POINTS} نقطة`);
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { loyaltyPoints: true },
    });
    if (!user || user.loyaltyPoints < points) {
      throw new BadRequestException('رصيد النقاط غير كافٍ');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { loyaltyPoints: { decrement: points } },
      }),
      this.prisma.loyaltyEntry.create({
        data: {
          userId,
          bookingId,
          type: 'REDEEM',
          points: -points,
          description: description ?? 'استبدال نقاط',
        },
      }),
    ]);
  }

  /** قيمة النقاط المستبدلة بالمال (بالوحدة الكبرى) */
  redeemValue(points: number): number {
    return Math.floor((points / LOYALTY.POINTS_REDEEM_RATIO) * LOYALTY.POINT_VALUE_MINOR);
  }

  private async syncTier(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { loyaltyPoints: true, tier: true },
    });
    if (!user) return;
    const tier = this.tierFor(user.loyaltyPoints);
    if (tier !== user.tier) {
      await this.prisma.user.update({ where: { id: userId }, data: { tier } });
    }
  }
}
