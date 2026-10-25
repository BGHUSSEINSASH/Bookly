import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        status: true,
        locale: true,
        preferredCurrency: true,
        loyaltyPoints: true,
        tier: true,
        lifetimeSpent: true,
        createdAt: true,
        wallet: { select: { balance: true, currency: true, frozenBalance: true } },
        vendorProfile: {
          select: {
            id: true,
            type: true,
            status: true,
            companyName: true,
            commissionRate: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException('المستخدم غير موجود');
    return user;
  }

  async updateProfile(userId: string, data: Partial<{ fullName: string; phone: string; avatarUrl: string; locale: string; preferredCurrency: string }>) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, fullName: true, phone: true, avatarUrl: true, locale: true, preferredCurrency: true },
    });
  }

  async dashboard(userId: string) {
    const [bookings, upcoming, wallet, points] = await Promise.all([
      this.prisma.booking.count({ where: { customerId: userId } }),
      this.prisma.booking.findMany({
        where: { customerId: userId, status: { in: ['PENDING', 'CONFIRMED'] }, checkIn: { gte: new Date() } },
        take: 5,
        orderBy: { checkIn: 'asc' },
        include: {
          property: { select: { title: true, slug: true, images: { take: 1, include: { media: true } } } },
          trip: { select: { title: true, slug: true } },
          flight: { include: { fromAirport: true, toAirport: true, airline: true } },
          car: { select: { make: true, model: true } },
        },
      }),
      this.prisma.wallet.findUnique({ where: { userId }, select: { balance: true, currency: true } }),
      this.prisma.loyaltyEntry.findMany({
        where: { userId },
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { bookings, upcoming, wallet, points };
  }
}
