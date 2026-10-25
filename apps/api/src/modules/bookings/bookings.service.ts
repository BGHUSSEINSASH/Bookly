import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookingDto } from './dto/booking.dto';
import { WalletService, resolveProvider } from '../wallet/wallet.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { CouponsService } from '../coupons/coupons.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';
import { computeCommission, round2, toNumber } from '../../common/utils/money';
import { generateBookingCode } from '../../common/utils/code-generator';
import { LOYALTY } from '@bookly/shared';

const CANCEL_WINDOW_HOURS = 48;

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly wallet: WalletService,
    private readonly loyalty: LoyaltyService,
    private readonly coupons: CouponsService,
    private readonly notifications: NotificationsService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  /** حساب السعر قبل الحجز (معاينة) — يمكن لغير المسجّل استدعاؤها */
  async quote(userId: string | null, dto: CreateBookingDto) {
    const priced = await this.price(userId, dto);
    return this.finalizeQuote(userId, dto, priced);
  }

  async create(userId: string, dto: CreateBookingDto) {
    const priced = await this.price(userId, dto);
    const quote = await this.finalizeQuote(userId, dto, priced);

    const code = generateBookingCode();
    const method = (dto.paymentMethod ?? 'WALLET') as any;
    const isCash = method === 'CASH_ON_SITE';
    const sandbox = this.config.get('PAYMENT_MODE', 'sandbox') !== 'live';

    // بيئة إنتاج بلا بوابة: نقبل المحفظة والدفع عند الوصول فقط
    if (!sandbox && method !== 'WALLET' && !isCash) {
      throw new BadRequestException(
        'الدفع الإلكتروني غير متاح حاليًا — اختر المحفظة أو الدفع عند الوصول',
      );
    }

    const booking = await this.prisma.booking.create({
      data: {
        code,
        customerId: userId,
        vendorId: priced.vendorId,
        propertyId: priced.propertyId,
        roomTypeId: priced.roomTypeId,
        flightId: priced.flightId,
        carId: priced.carId,
        tripId: priced.tripId,
        status: isCash ? 'PENDING' : priced.status,
        paymentStatus: isCash ? 'PENDING' : 'PAID',
        checkIn: priced.checkIn,
        checkOut: priced.checkOut,
        guests: dto.guests,
        units: dto.units ?? 1,
        nights: priced.nights,
        subtotal: priced.subtotal,
        discount: quote.totalDiscount,
        taxes: 0,
        serviceFee: quote.serviceFee,
        commission: priced.commission,
        total: quote.total,
        currency: priced.currency,
        couponCode: quote.couponCode,
        pointsRedeemed: quote.pointsRedeemed,
        pointsEarned: quote.pointsEarned,
        customerNote: dto.customerNote,
        guestsDetail: dto.guestsDetail
          ? {
              create: dto.guestsDetail.map((g, i) => ({
                fullName: g.fullName,
                phone: g.phone,
                email: g.email,
                nationalId: g.nationalId,
                isPrimary: g.isPrimary ?? i === 0,
              })),
            }
          : undefined,
      },
    });

    // الدفع
    if (!isCash) {
      if (method === 'WALLET') {
        await this.wallet.debit(userId, quote.total, {
          bookingId: booking.id,
          note: `دفع حجز ${code}`,
        });
      }
      await this.prisma.payment.create({
        data: {
          bookingId: booking.id,
          customerId: userId,
          provider: method === 'WALLET' ? 'WALLET' : (resolveProvider(method) as any),
          method,
          amount: quote.total,
          currency: priced.currency,
          status: 'PAID',
          transactionRef: `TXN-${code}`,
          paidAt: new Date(),
          gatewayPayload: { sandbox: method !== 'WALLET' },
        },
      });
    }

    // خصم النقاط المستبدلة
    if (quote.pointsRedeemed > 0) {
      await this.loyalty.redeem(userId, quote.pointsRedeemed, booking.id, `استبدال نقاط لحجز ${code}`);
    }

    // احتساب العمولة وتوزيعها
    if (quote.pointsRedeemed > 0) {
      await this.prisma.booking.update({
        where: { id: booking.id },
        data: { total: quote.total },
      });
    }

    // احتساب نقاط المكافأة
    if (quote.pointsEarned > 0) {
      await this.loyalty.earn(userId, quote.pointsEarned, booking.id, `نقاط حجز ${code}`);
      await this.prisma.user.update({
        where: { id: userId },
        data: { lifetimeSpent: { increment: quote.total } },
      });
    }

    // تفعيل الكوبون
    if (quote.coupon && quote.coupon.couponId) {
      await this.coupons.redeem(quote.coupon.couponId, userId, booking.id, quote.coupon.discount);
    }

    // إشعار المزوّد
    if (priced.vendorId) {
      await this.notifyVendor(priced.vendorId, booking.id, code, quote.total);
    }
    await this.notifyCustomer(userId, booking.id, code, priced.status);

    return this.findByCode(code, userId);
  }

  async list(userId: string, status?: string, page = 1, limit = 20) {
    const where: Prisma.BookingWhereInput = { customerId: userId };
    if (status && status !== 'ALL') where.status = status as any;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.booking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: this.bookingInclude(),
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      items: items.map((b) => this.mapBooking(b)),
      total,
      page,
      limit,
      pages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findByCode(code: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { code },
      include: this.bookingInclude(),
    });
    if (!booking) throw new NotFoundException('الحجز غير موجود');
    if (booking.customerId !== userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
      const isStaff = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;
      if (!isStaff) throw new ForbiddenException('لا تملك صلاحية عرض هذا الحجز');
    }
    return this.mapBooking(booking);
  }

  async cancel(code: string, userId: string, reason?: string) {
    const booking = await this.prisma.booking.findUnique({ where: { code } });
    if (!booking) throw new NotFoundException('الحجز غير موجود');
    if (booking.customerId !== userId) throw new ForbiddenException('لا تملك صلاحية إلغاء هذا الحجز');
    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
      throw new BadRequestException('لا يمكن إلغاء هذا الحجز في وضعه الحالي');
    }

    const hoursBefore = (booking.checkIn.getTime() - Date.now()) / 3600000;
    const isFreeCancel = hoursBefore >= CANCEL_WINDOW_HOURS;

    // لا استرداد لحجز لم يُدفع شيئاً (دفع عند الوصول أو لم يكتمل الدفع)
    const wasPaid =
      booking.paymentStatus === 'PAID' || booking.paymentStatus === 'PARTIALLY_REFUNDED';
    const refundAmount = wasPaid
      ? isFreeCancel
        ? toNumber(booking.total)
        : round2(toNumber(booking.total) * 0.5)
      : 0;

    await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelReason: reason,
        paymentStatus:
          refundAmount > 0
            ? isFreeCancel
              ? 'REFUNDED'
              : 'PARTIALLY_REFUNDED'
            : booking.paymentStatus,
      },
    });

    if (refundAmount > 0) {
      await this.wallet.credit(userId, refundAmount, {
        bookingId: booking.id,
        type: 'REFUND',
        note: `استرداد حجز ${code}`,
      });
      await this.prisma.payment.updateMany({
        where: { bookingId: booking.id },
        data: {
          refundedAmount: refundAmount,
          status: isFreeCancel ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
        },
      });
    }

    // إشعار العميل والمزوّد بالإلغاء
    await this.notifications.notify(userId, {
      type: 'BOOKING_CANCELLED',
      title: 'تم إلغاء حجزك',
      body:
        `حجز ${code} — ` +
        (refundAmount > 0 ? `تم استرداد ${refundAmount} إلى محفظتك` : 'بدون استرداد'),
      data: { bookingId: booking.id, code, refundAmount },
    });
    if (booking.vendorId) {
      const vendor = await this.prisma.vendorProfile.findUnique({
        where: { id: booking.vendorId },
        select: { userId: true },
      });
      if (vendor) {
        await this.notifications.notify(vendor.userId, {
          type: 'BOOKING_CANCELLED',
          title: 'أُلغي أحد حجوزاتك',
          body: `حجز ${code} أُلغي من قبل العميل${refundAmount > 0 ? ` مع استرداد ${refundAmount}` : ''}`,
          data: { bookingId: booking.id, code },
        });
      }
    }

    // إعادة النقاط المستبدلة
    if (booking.pointsRedeemed > 0) {
      await this.prisma.loyaltyEntry.create({
        data: {
          userId,
          bookingId: booking.id,
          type: 'ADJUST',
          points: booking.pointsRedeemed,
          description: `إرجاع نقاط بعد إلغاء ${code}`,
        },
      });
      await this.prisma.user.update({
        where: { id: userId },
        data: { loyaltyPoints: { increment: booking.pointsRedeemed } },
      });
    }

    return {
      message: isFreeCancel ? 'تم إلغاء الحجز واسترداد المبلغ بالكامل' : 'تم الإلغاء مع استرداد نصف المبلغ',
      refundAmount,
    };
  }

  async vendorBookings(userId: string, status?: string) {
    const vendor = await this.prisma.vendorProfile.findUnique({ where: { userId } });
    if (!vendor) throw new ForbiddenException('لا يوجد ملف مزوّد');
    const where: Prisma.BookingWhereInput = { vendorId: vendor.id };
    if (status && status !== 'ALL') where.status = status as any;
    const items = await this.prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: this.bookingInclude(),
    });
    return items.map((b) => this.mapBooking(b));
  }

  async setStatus(code: string, status: string, userId: string, note?: string) {
    const booking = await this.prisma.booking.findUnique({ where: { code } });
    if (!booking) throw new NotFoundException('الحجز غير موجود');
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    const isStaff = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;
    if (!isStaff && booking.vendorId) {
      const vendor = await this.prisma.vendorProfile.findUnique({ where: { userId } });
      if (!vendor || vendor.id !== booking.vendorId) throw new ForbiddenException();
    }
    await this.prisma.booking.update({
      where: { id: booking.id },
      data: { status: status as any, vendorNote: note, confirmedAt: status === 'CONFIRMED' ? new Date() : undefined },
    });

    // إشعار العميل بتغيّر حالة الحجز من المزوّد
    if (status !== booking.status) {
      const titles: Record<string, string> = {
        CONFIRMED: 'تم تأكيد حجزك',
        CANCELLED: 'لم يعتمد المزوّد حجزك',
        DECLINED: 'لم يعتمد المزوّد حجزك',
        COMPLETED: 'اكتملت إقامتك',
      };
      const bodies: Record<string, string> = {
        CONFIRMED: `حجز ${code} — تم تأكيده من المزوّد، رحلتك قريبة!`,
        CANCELLED: `حجز ${code} — اعتذر المزوّد عن الطلب وسيُعاد المبلغ المستحق`,
        DECLINED: `حجز ${code} — اعتذر المزوّد عن الطلب وسيُعاد المبلغ المستحق`,
        COMPLETED: `حجز ${code} — شكرًا لاستخدامك بوكلي، لا تنسَ تقييم تجربتك`,
      };
      if (titles[status]) {
        await this.notifications.notify(booking.customerId, {
          type: 'BOOKING_UPDATE',
          title: titles[status],
          body: bodies[status],
          data: { bookingId: booking.id, code, status },
        });
      }
    }

    return this.findByCode(code, userId);
  }

  /** تسعير الحجز — يجمع السعر الأساسي والعمولة */
  private async price(_userId: string | null, dto: CreateBookingDto) {
    const checkIn = new Date(dto.checkIn);
    const checkOut = new Date(dto.checkOut);

    if (checkOut <= checkIn) throw new BadRequestException('تاريخ النهاية يجب أن يكون بعد تاريخ البداية');
    if (checkIn < new Date(Date.now() - 86400000)) throw new BadRequestException('التاريخ الماضي غير مسموح');

    switch (dto.target) {
      case 'PROPERTY':
        return this.priceProperty(dto, checkIn, checkOut);
      case 'FLIGHT':
        return this.priceFlight(dto, checkIn, checkOut);
      case 'CAR':
        return this.priceCar(dto, checkIn, checkOut);
      case 'TRIP':
        return this.priceTrip(dto, checkIn, checkOut);
      default:
        throw new BadRequestException('نوع الحجز غير معروف');
    }
  }

  private async priceProperty(dto: CreateBookingDto, checkIn: Date, checkOut: Date) {
    if (!dto.propertyId) throw new BadRequestException('معرف العقار مطلوب');
    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
      include: { vendor: true, roomTypes: true },
    });
    if (!property) throw new NotFoundException('العقار غير موجود');
    if (property.status !== 'PUBLISHED') throw new BadRequestException('هذا العقار غير متاح للحجز حاليًا');

    const roomType = dto.roomTypeId
      ? property.roomTypes.find((r) => r.id === dto.roomTypeId)
      : property.roomTypes[0];

    if (dto.roomTypeId && !roomType) throw new NotFoundException('نوع الغرفة غير موجود');
    if (dto.guests > property.maxGuests) {
      throw new BadRequestException(`الحد الأقصى ${property.maxGuests} ضيوف لهذا العقار`);
    }

    const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / 86400000));
    if (nights < property.minNights) {
      throw new BadRequestException(`الحد الأدنى للإقامة ${property.minNights} ليلة`);
    }

    // التحقق من عدم وجود تعارض
    const conflict = await this.prisma.booking.findFirst({
      where: {
        propertyId: property.id,
        status: { in: ['PENDING', 'CONFIRMED'] },
        checkIn: { lt: checkOut },
        checkOut: { gt: checkIn },
      },
      select: { code: true },
    });
    if (conflict) throw new ConflictException('التواريخ غير متاحة لهذا العقار');

    const units = dto.units ?? 1;
    if (roomType && roomType.availableRooms < units) {
      throw new ConflictException('الكمية المطلوبة غير متوفرة');
    }

    const unitPrice = roomType ? toNumber(roomType.pricePerNight) : toNumber(property.pricePerNight);
    const mode = dto.bookingMode ?? property.bookingMode;
    const factor = mode === 'HOUR' ? Math.max(1, (checkOut.getTime() - checkIn.getTime()) / 3600000) : nights;
    const subtotal = round2(unitPrice * factor * units);

    const { commission } = computeCommission(subtotal, toNumber(property.vendor.commissionRate));

    return {
      vendorId: property.vendorId,
      propertyId: property.id,
      roomTypeId: roomType?.id ?? null,
      flightId: null,
      carId: null,
      tripId: null,
      checkIn,
      checkOut,
      nights,
      subtotal,
      commission,
      currency: property.currency,
      category: property.category,
      status: property.isInstantBook ? ('CONFIRMED' as const) : ('PENDING' as const),
    };
  }

  private async priceFlight(dto: CreateBookingDto, _checkIn: Date, _checkOut: Date) {
    if (!dto.flightId) throw new BadRequestException('معرف الرحلة مطلوب');
    const flight = await this.prisma.flight.findUnique({ where: { id: dto.flightId } });
    if (!flight) throw new NotFoundException('الرحلة غير موجودة');

    const prices = (flight.cabinPrices as any) ?? {};
    const price = toNumber(prices.ECONOMY ?? 0);
    if (!price) throw new BadRequestException('لا توجد أسعار متاحة لهذه الرحلة');

    const subtotal = round2(price * dto.guests);
    const { commission } = computeCommission(subtotal, 3);

    return {
      vendorId: null,
      propertyId: null,
      roomTypeId: null,
      flightId: flight.id,
      carId: null,
      tripId: null,
      checkIn: new Date(flight.departureTime),
      checkOut: new Date(flight.arrivalTime),
      nights: 1,
      subtotal,
      commission,
      currency: flight.currency,
      category: 'FLIGHT',
      status: 'CONFIRMED' as const,
    };
  }

  private async priceCar(dto: CreateBookingDto, checkIn: Date, checkOut: Date) {
    if (!dto.carId) throw new BadRequestException('معرف السيارة مطلوب');
    const car = await this.prisma.car.findUnique({ where: { id: dto.carId }, include: { vendor: true } });
    if (!car) throw new NotFoundException('السيارة غير موجودة');
    if (car.status !== 'PUBLISHED') throw new BadRequestException('هذه السيارة غير متاحة للحجز');

    const days = Math.max(car.minRentalDays, Math.ceil((checkOut.getTime() - checkIn.getTime()) / 86400000));
    const subtotal = round2(toNumber(car.dailyRate) * days);
    const { commission } = computeCommission(subtotal, toNumber(car.vendor.commissionRate));

    return {
      vendorId: car.vendorId,
      propertyId: null,
      roomTypeId: null,
      flightId: null,
      carId: car.id,
      tripId: null,
      checkIn,
      checkOut,
      nights: days,
      subtotal,
      commission,
      currency: car.currency,
      category: 'CAR',
      status: 'CONFIRMED' as const,
    };
  }

  private async priceTrip(dto: CreateBookingDto, checkIn: Date, checkOut: Date) {
    if (!dto.tripId) throw new BadRequestException('معرف الرحلة السياحية مطلوب');
    const trip = await this.prisma.trip.findUnique({ where: { id: dto.tripId }, include: { vendor: true } });
    if (!trip) throw new NotFoundException('الرحلة غير موجودة');
    if (trip.status !== 'PUBLISHED') throw new BadRequestException('هذه الرحلة غير متاحة للحجز');
    if (dto.guests < trip.minGuests) {
      throw new BadRequestException(`الحد الأدنى ${trip.minGuests} مسافر`);
    }

    const subtotal = round2(toNumber(trip.pricePerPerson) * dto.guests);
    const { commission } = computeCommission(subtotal, toNumber(trip.vendor.commissionRate));

    return {
      vendorId: trip.vendorId,
      propertyId: null,
      roomTypeId: null,
      flightId: null,
      carId: null,
      tripId: trip.id,
      checkIn,
      checkOut,
      nights: trip.durationDays,
      subtotal,
      commission,
      currency: trip.currency,
      category: 'TRIP',
      status: 'CONFIRMED' as const,
    };
  }

  /** تطبيق الكوبون والنقاط واحتساب الإجمالي النهائي */
  private async finalizeQuote(userId: string | null, dto: CreateBookingDto, priced: any) {
    const serviceFeePercent = Number(this.config.get('SERVICE_FEE_PERCENT', '0'));
    let discount = 0;
    let couponCode: string | undefined;
    let coupon: any = null;

    if (dto.couponCode) {
      coupon = await this.coupons.validate(dto.couponCode, userId ?? '', priced.subtotal, priced.category);
      discount += coupon.discount;
      couponCode = coupon.code;
    }

    const pointsRedeemed = dto.pointsRedeemed ?? 0;
    let pointsValue = 0;
    if (pointsRedeemed > 0) {
      if (!userId) throw new BadRequestException('سجّل الدخول لاستخدام نقاط الولاء');
      pointsValue = this.loyalty.redeemValue(pointsRedeemed);
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { loyaltyPoints: true },
      });
      if (!user || user.loyaltyPoints < pointsRedeemed) {
        throw new BadRequestException(
          'رصيد النقاط غير كافٍ (رصيدك ' +
            (user?.loyaltyPoints ?? 0) +
            ' نقطة والمطلوب ' +
            pointsRedeemed +
            ')',
        );
      }
      if (pointsValue > priced.subtotal - discount) {
        throw new BadRequestException('قيمة النقاط أكبر من قيمة الحجز');
      }
      discount += pointsValue;
    }

    const serviceFee = round2(((priced.subtotal - discount) * serviceFeePercent) / 100);
    const total = round2(priced.subtotal - discount + serviceFee);
    const pointsEarned = Math.floor(total * LOYALTY.POINTS_PER_MAJOR_UNIT);

    return {
      discount: round2(discount),
      totalDiscount: round2(discount),
      serviceFee,
      total,
      couponCode,
      coupon,
      pointsRedeemed,
      pointsEarned,
    };
  }

  private bookingInclude() {
    return {
      property: {
        include: {
          images: { take: 3, orderBy: { sortOrder: 'asc' }, include: { media: true } },
          city: { select: { id: true, nameAr: true, nameEn: true, slug: true } },
        },
      },
      roomType: true,
      flight: { include: { fromAirport: true, toAirport: true, airline: true } },
      car: { include: { images: { take: 1, include: { media: true } } } },
      trip: { include: { images: { take: 1, include: { media: true } } } },
      payments: true,
      guestsDetail: true,
      review: true,
    } as const;
  }

  private mapBooking(b: any) {
    return {
      id: b.id,
      code: b.code,
      status: b.status,
      paymentStatus: b.paymentStatus,
      customerId: b.customerId,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      guests: b.guests,
      units: b.units,
      nights: b.nights,
      subtotal: toNumber(b.subtotal),
      discount: toNumber(b.discount),
      serviceFee: toNumber(b.serviceFee),
      commission: toNumber(b.commission),
      total: toNumber(b.total),
      currency: b.currency,
      couponCode: b.couponCode,
      pointsRedeemed: b.pointsRedeemed,
      pointsEarned: b.pointsEarned,
      customerNote: b.customerNote,
      vendorNote: b.vendorNote,
      cancelReason: b.cancelReason,
      createdAt: b.createdAt,
      property: b.property
        ? {
            id: b.property.id,
            title: b.property.title,
            slug: b.property.slug,
            category: b.property.category,
            city: b.property.city,
            images: b.property.images?.map((i: any) => i.media.url),
            checkInTime: b.property.checkInTime,
            checkOutTime: b.property.checkOutTime,
          }
        : null,
      roomType: b.roomType ? { id: b.roomType.id, name: b.roomType.name } : null,
      flight: b.flight
        ? {
            id: b.flight.id,
            flightNumber: b.flight.flightNumber,
            airline: b.flight.airline?.nameAr,
            from: b.flight.fromAirport?.iataCode,
            to: b.flight.toAirport?.iataCode,
            departureTime: b.flight.departureTime,
            arrivalTime: b.flight.arrivalTime,
          }
        : null,
      car: b.car ? { id: b.car.id, make: b.car.make, model: b.car.model, year: b.car.year } : null,
      trip: b.trip ? { id: b.trip.id, title: b.trip.title, slug: b.trip.slug, type: b.trip.type } : null,
      payments: b.payments?.map((p: any) => ({
        id: p.id,
        method: p.method,
        provider: p.provider,
        amount: toNumber(p.amount),
        status: p.status,
        paidAt: p.paidAt,
      })),
      guestsDetail: b.guestsDetail,
      review: b.review ? { id: b.review.id, rating: b.review.rating, comment: b.review.comment } : null,
    };
  }

  private async notifyVendor(vendorId: string, bookingId: string, code: string, total: number) {
    const vendor = await this.prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      select: { userId: true },
    });
    if (!vendor) return;
    await this.notifications.notify(vendor.userId, {
      type: 'NEW_BOOKING',
      title: 'حجز جديد',
      body: `وصل حجز جديد برقم ${code} بقيمة ${total}`,
      data: { bookingId, code },
    });
  }

  private async notifyCustomer(userId: string, bookingId: string, code: string, status: string) {
    await this.notifications.notify(userId, {
      type: 'BOOKING_UPDATE',
      title: status === 'CONFIRMED' ? 'تم تأكيد حجزك' : 'تم استلام طلب الحجز',
      body: `حجز ${code} — ${status === 'CONFIRMED' ? 'تم التأكيد، جهّز نفسك لرحلتك' : 'بانتظار موافقة المزوّد'}`,
      data: { bookingId, code, status },
    });

    // إرسال إيميل تأكيد
    try {
      const booking = await this.prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          customer: { select: { email: true, fullName: true } },
          property: { select: { title: true } },
        },
      });
      if (booking?.customer) {
        const propTitle = booking.property?.title ?? 'حجزك';
        await this.mail.sendBookingConfirmation(
          booking.customer.email,
          booking.customer.fullName,
          code,
          {
            propertyTitle: propTitle,
            checkIn: booking.checkIn.toLocaleDateString('ar-IQ'),
            checkOut: booking.checkOut.toLocaleDateString('ar-IQ'),
            total: toNumber(booking.total),
            currency: booking.currency,
          },
        );
      }
    } catch (e) {
      this.logger.warn(`تعذّر إرسال إيميل تأكيد الحجز ${code}: ${e}`);
    }
  }
}
