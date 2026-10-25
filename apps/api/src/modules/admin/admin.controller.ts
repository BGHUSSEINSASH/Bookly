import { Body, Controller, Get, NotFoundException, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { WalletService } from '../wallet/wallet.service';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wallet: WalletService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'إحصاءات المنصة' })
  async dashboard() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      newUsers,
      totalVendors,
      pendingVendors,
      totalProperties,
      pendingProperties,
      totalBookings,
      pendingBookings,
      revenue,
      monthRevenue,
      commission,
      activeToday,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.vendorProfile.count({ where: { status: 'APPROVED' } }),
      this.prisma.vendorProfile.count({ where: { status: 'PENDING' } }),
      this.prisma.property.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.property.count({ where: { status: 'PENDING_REVIEW' } }),
      this.prisma.booking.count(),
      this.prisma.booking.count({ where: { status: 'PENDING' } }),
      this.prisma.booking.aggregate({ where: { paymentStatus: 'PAID' }, _sum: { total: true } }),
      this.prisma.booking.aggregate({
        where: { paymentStatus: 'PAID', createdAt: { gte: startOfMonth } },
        _sum: { total: true },
      }),
      this.prisma.booking.aggregate({ where: { paymentStatus: 'PAID' }, _sum: { commission: true } }),
      this.prisma.user.count({
        where: { lastLoginAt: { gte: new Date(Date.now() - 86400000) } },
      }),
    ]);

    const byCategory = await this.prisma.booking.groupBy({
      by: ['status'],
      _count: true,
      _sum: { total: true },
    });

    const topProperties = await this.prisma.property.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { ratingAvg: 'desc' },
      take: 8,
      select: {
        id: true,
        title: true,
        slug: true,
        ratingAvg: true,
        ratingCount: true,
        viewsCount: true,
        category: true,
        _count: { select: { bookings: true } },
      },
    });

    const recentBookings = await this.prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        customer: { select: { fullName: true, email: true } },
        property: { select: { title: true } },
      },
    });

    return {
      users: { total: totalUsers, newThisMonth: newUsers, activeToday },
      vendors: { approved: totalVendors, pending: pendingVendors },
      properties: { published: totalProperties, pending: pendingProperties },
      bookings: { total: totalBookings, pending: pendingBookings, byStatus: byCategory },
      revenue: {
        total: Number(revenue._sum.total ?? 0),
        month: Number(monthRevenue._sum.total ?? 0),
        commission: Number(commission._sum.commission ?? 0),
      },
      topProperties,
      recentBookings,
    };
  }

  @Get('users')
  @ApiOperation({ summary: 'إدارة المستخدمين' })
  async users(@Query('page') page = '1', @Query('limit') limit = '25', @Query('q') q?: string) {
    const where: any = {};
    if (q) {
      where.OR = [
        { fullName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q } },
      ];
    }
    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        select: {
          id: true,
          email: true,
          phone: true,
          fullName: true,
          role: true,
          status: true,
          loyaltyPoints: true,
          createdAt: true,
          lastLoginAt: true,
          _count: { select: { bookings: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { items, total, page: Number(page), limit: Number(limit) };
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'تفعيل/إيقاف مستخدم' })
  async setUserStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.prisma.user.update({
      where: { id },
      data: { status: body.status as any },
      select: { id: true, status: true },
    });
  }

  @Get('vendors')
  async vendors() {
    return this.prisma.vendorProfile.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { fullName: true, email: true, phone: true } },
        _count: { select: { properties: true, bookings: true } },
      },
    });
  }

  @Patch('vendors/:id/status')
  @ApiOperation({ summary: 'اعتماد/رفض مزوّد' })
  async setVendorStatus(@Param('id') id: string, @Body() body: { status: string }) {
    const vendor = await this.prisma.vendorProfile.update({
      where: { id },
      data: { status: body.status as any },
    });
    await this.prisma.notification.create({
      data: {
        userId: vendor.userId,
        type: 'VENDOR_STATUS',
        title: 'تحديث حالة حساب المزوّد',
        body: `حالة طلبك الآن: ${body.status}`,
      },
    });
    return vendor;
  }

  @Get('properties')
  async properties(@Query('status') status?: string) {
    return this.prisma.property.findMany({
      where: status ? { status: status as any } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        images: { take: 1, include: { media: true } },
        city: { select: { nameAr: true } },
        vendor: { select: { companyName: true } },
      },
    });
  }

  @Patch('properties/:id/status')
  @ApiOperation({ summary: 'نشر/رفض عقار' })
  async setPropertyStatus(@Param('id') id: string, @Body() body: { status: string }) {
    const property = await this.prisma.property.update({
      where: { id },
      data: {
        status: body.status as any,
        publishedAt: body.status === 'PUBLISHED' ? new Date() : undefined,
      },
    });
    await this.prisma.adminAction.create({
      data: {
        action: 'PROPERTY_STATUS_CHANGE',
        entity: 'Property',
        entityId: id,
        payload: { status: body.status },
      },
    });
    return property;
  }

  @Get('bookings')
  async bookings(@Query('status') status?: string, @Query('page') page = '1') {
    const where: any = status && status !== 'ALL' ? { status: status as any } : {};
    return this.prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * 20,
      take: 20,
      include: {
        customer: { select: { fullName: true, email: true, phone: true } },
        property: { select: { title: true } },
        vendor: { select: { companyName: true } },
      },
    });
  }

  @Patch('bookings/:code/refund')
  @ApiOperation({ summary: 'استرداد مبلغ حجز' })
  async refund(@Param('code') code: string, @Body() body: { amount?: number; reason?: string }) {
    const booking = await this.prisma.booking.findUnique({ where: { code } });
    if (!booking) throw new NotFoundException('الحجز غير موجود');

    const amount = body.amount ?? Number(booking.total);
    const isFull = amount >= Number(booking.total);

    await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'REFUNDED',
        paymentStatus: isFull ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
      },
    });

    // استرداد عبر المحفظة (ينشئ المحفظة إن لم تكن موجودة ويحدّث الرصيد والحركة معاً)
    await this.wallet.credit(booking.customerId, amount, {
      bookingId: booking.id,
      type: 'REFUND',
      note: body.reason ?? `استرداد إداري لحجز ${code}`,
    });
    await this.prisma.payment.updateMany({
      where: { bookingId: booking.id },
      data: {
        refundedAmount: amount,
        status: isFull ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
      },
    });

    return { message: 'تم تنفيذ الاسترداد', amount };
  }

  @Get('cities')
  async cities() {
    return this.prisma.city.findMany({
      include: { country: true },
      orderBy: { nameAr: 'asc' },
    });
  }

  @Post('cities')
  async createCity(
    @Body() body: {
      nameAr: string;
      nameEn: string;
      countryId: string;
      slug: string;
      latitude?: number;
      longitude?: number;
      isPopular?: boolean;
    },
  ) {
    return this.prisma.city.create({ data: body });
  }

  @Get('countries')
  async countries() {
    return this.prisma.country.findMany({ orderBy: { nameAr: 'asc' } });
  }

  @Get('banners')
  async banners() {
    return this.prisma.banner.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  @Post('banners')
  async createBanner(
    @Body() body: { title: string; subtitle?: string; imageUrl: string; linkUrl?: string; sortOrder?: number },
  ) {
    return this.prisma.banner.create({ data: body });
  }
}
