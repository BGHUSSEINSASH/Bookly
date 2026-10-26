import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus, Prisma, PropertyStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchPropertiesDto, CreatePropertyDto } from './dto/search-properties.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { toNumber } from '../../common/utils/money';

const ACTIVE_BOOKING_STATUSES: BookingStatus[] = ['PENDING', 'CONFIRMED'];

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  // كشف عن PrismaService للكنترولر (للـ map endpoint)
  get prismaClient() { return this.prisma; }

  async search(dto: SearchPropertiesDto): Promise<PaginatedResult<any>> {
    const where: Prisma.PropertyWhereInput = {
      status: 'PUBLISHED',
    };

    if (dto.q) {
      where.OR = [
        { title: { contains: dto.q, mode: 'insensitive' } },
        { summary: { contains: dto.q, mode: 'insensitive' } },
        { description: { contains: dto.q, mode: 'insensitive' } },
        { city: { nameAr: { contains: dto.q, mode: 'insensitive' } } },
        { city: { nameEn: { contains: dto.q, mode: 'insensitive' } } },
      ];
    }

    if (dto.category) where.category = dto.category as any;
    if (dto.cityId) where.cityId = dto.cityId;
    if (dto.exclude) where.id = { not: dto.exclude };
    if (dto.guests) where.maxGuests = { gte: dto.guests };
    if (dto.bedrooms) where.bedrooms = { gte: dto.bedrooms };
    if (dto.bathrooms) where.bathrooms = { gte: dto.bathrooms };
    if (dto.instantBook !== undefined) where.isInstantBook = dto.instantBook;
    if (dto.minRating) where.ratingAvg = { gte: dto.minRating };
    if (dto.amenities?.length) {
      where.amenities = { hasEvery: dto.amenities };
    }
    if (dto.minPrice !== undefined || dto.maxPrice !== undefined) {
      where.pricePerNight = {
        ...(dto.minPrice !== undefined ? { gte: dto.minPrice } : {}),
        ...(dto.maxPrice !== undefined ? { lte: dto.maxPrice } : {}),
      };
    }

    // إتاحة التواريخ: استبعاد أي عقار عليه حجز متداخل
    if (dto.checkIn && dto.checkOut) {
      const checkIn = new Date(dto.checkIn);
      const checkOut = new Date(dto.checkOut);
      if (checkOut <= checkIn) throw new BadRequestException('تاريخ الخروج يجب أن يكون بعد تاريخ الدخول');
      where.bookings = {
        none: {
          status: { in: ['PENDING', 'CONFIRMED'] },
          checkIn: { lt: checkOut },
          checkOut: { gt: checkIn },
        },
      };
    }

    const orderBy: Prisma.PropertyOrderByWithRelationInput[] = [];
    switch (dto.sortBy) {
      case 'PRICE_ASC':
        orderBy.push({ pricePerNight: 'asc' });
        break;
      case 'PRICE_DESC':
        orderBy.push({ pricePerNight: 'desc' });
        break;
      case 'RATING_DESC':
        orderBy.push({ ratingAvg: 'desc' });
        break;
      case 'NEWEST':
        orderBy.push({ createdAt: 'desc' });
        break;
      case 'POPULAR':
        orderBy.push({ viewsCount: 'desc' });
        break;
      default:
        orderBy.push({ ratingAvg: 'desc' }, { viewsCount: 'desc' });
    }

    const [total, items] = await this.prisma.$transaction([
      this.prisma.property.count({ where }),
      this.prisma.property.findMany({
        where,
        orderBy,
        skip: (dto.page - 1) * dto.limit,
        take: dto.limit,
        include: {
          images: {
            take: 5,
            orderBy: { sortOrder: 'asc' },
            include: { media: true },
          },
          city: { select: { id: true, nameAr: true, nameEn: true, slug: true } },
          vendor: { select: { id: true, companyName: true, type: true, ratingAvg: true } },
          roomTypes: { select: { id: true, name: true, pricePerNight: true, currency: true, availableRooms: true } },
        },
      }),
    ]);

    return new PaginatedResult(
      items.map((p) => this.mapProperty(p)),
      total,
      dto.page,
      dto.limit,
    );
  }

  async findOne(idOrSlug: string) {
    const property = await this.prisma.property.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      include: {
        images: { orderBy: { sortOrder: 'asc' }, include: { media: true } },
        roomTypes: { include: { images: { include: { media: true } } } },
        city: { include: { country: true } },
        vendor: {
          select: {
            id: true,
            companyName: true,
            type: true,
            phone: true,
            ratingAvg: true,
            ratingCount: true,
          },
        },
        amenitiesRef: true,
        seasonal: { where: { isActive: true } },
        reviews: {
          where: { status: 'PUBLISHED' },
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { customer: { select: { fullName: true, avatarUrl: true } }, images: { include: { media: true } } },
        },
      },
    });

    if (!property) throw new NotFoundException('العقار غير موجود');
    await this.prisma.property.update({
      where: { id: property.id },
      data: { viewsCount: { increment: 1 } },
    });
    return this.mapProperty(property);
  }

  async availability(propertyId: string, checkIn: Date, checkOut: Date) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, minNights: true, maxGuests: true },
    });
    if (!property) throw new NotFoundException('العقار غير موجود');

    const conflicts = await this.prisma.booking.findMany({
      where: {
        propertyId,
        status: { in: ACTIVE_BOOKING_STATUSES as any },
        checkIn: { lt: checkOut },
        checkOut: { gt: checkIn },
      },
      select: { checkIn: true, checkOut: true, code: true },
      orderBy: { checkIn: 'asc' },
    });

    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / 86400000);
    return {
      available: conflicts.length === 0,
      minNights: property.minNights,
      nights,
      conflicts,
    };
  }

  async create(vendorUserId: string, dto: CreatePropertyDto) {
    const vendor = await this.getVendorForUser(vendorUserId);
    const slug = await this.uniqueSlug(dto.title);

    const property = await this.prisma.property.create({
      data: {
        vendorId: vendor.id,
        category: dto.category as any,
        title: dto.title,
        slug,
        summary: dto.summary,
        description: dto.description,
        cityId: dto.cityId,
        address: dto.address,
        latitude: dto.latitude,
        longitude: dto.longitude,
        starRating: dto.starRating,
        currency: dto.currency ?? 'IQD',
        pricePerNight: dto.pricePerNight,
        pricePerHour: dto.pricePerHour,
        pricePerDay: dto.pricePerDay,
        bookingMode: (dto.bookingMode ?? 'NIGHT') as any,
        minNights: dto.minNights ?? 1,
        maxGuests: dto.maxGuests ?? 4,
        amenities: dto.amenities ?? [],
        checkInTime: dto.checkInTime ?? '15:00',
        checkOutTime: dto.checkOutTime ?? '12:00',
        status: 'PENDING_REVIEW',
        publishedAt: null,
      },
    });

    if (dto.imageUrls?.length) {
      await this.attachImages(property.id, dto.imageUrls);
    }

    return this.findOne(property.id);
  }

  async update(propertyId: string, userId: string, data: Partial<CreatePropertyDto>) {
    const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('العقار غير موجود');
    await this.assertOwnership(property.vendorId, userId);

    // ملاحظة أمنية: المزوّد لا يستطيع تغيير حالة النشر — الاعتماد من الإدارة فقط
    const updated = await this.prisma.property.update({
      where: { id: propertyId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.summary !== undefined && { summary: data.summary }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.cityId !== undefined && { cityId: data.cityId }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.latitude !== undefined && { latitude: data.latitude }),
        ...(data.longitude !== undefined && { longitude: data.longitude }),
        ...(data.pricePerNight !== undefined && { pricePerNight: data.pricePerNight }),
        ...(data.pricePerHour !== undefined && { pricePerHour: data.pricePerHour }),
        ...(data.pricePerDay !== undefined && { pricePerDay: data.pricePerDay }),
        ...(data.maxGuests !== undefined && { maxGuests: data.maxGuests }),
        ...(data.minNights !== undefined && { minNights: data.minNights }),
        ...(data.amenities !== undefined && { amenities: data.amenities }),
      },
    });

    if (data.imageUrls?.length) {
      await this.attachImages(propertyId, data.imageUrls);
    }
    return this.findOne(updated.id);
  }

  async setStatus(propertyId: string, status: PropertyStatus) {
    await this.prisma.property.update({
      where: { id: propertyId },
      data: { status, publishedAt: status === 'PUBLISHED' ? new Date() : undefined },
    });
    return this.findOne(propertyId);
  }

  async featured(limit = 8) {
    const items = await this.prisma.property.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ ratingAvg: 'desc' }, { viewsCount: 'desc' }],
      take: limit,
      include: {
        images: { take: 3, orderBy: { sortOrder: 'asc' }, include: { media: true } },
        city: { select: { id: true, nameAr: true, nameEn: true, slug: true } },
        vendor: { select: { companyName: true, type: true } },
      },
    });
    return items.map((p) => this.mapProperty(p));
  }

  async dailyDeals(limit = 8) {
    const items = await this.prisma.property.findMany({
      where: { status: 'PUBLISHED', ratingCount: { gte: 3 } },
      orderBy: { ratingAvg: 'desc' },
      take: limit,
      include: {
        images: { take: 3, orderBy: { sortOrder: 'asc' }, include: { media: true } },
        city: { select: { id: true, nameAr: true, nameEn: true, slug: true } },
        vendor: { select: { companyName: true, type: true } },
      },
    });
    return items.map((p) => ({ ...this.mapProperty(p), dealBadge: 'خصم حتى 20%' }));
  }

  async cities() {
    return this.prisma.city.findMany({
      where: { isActive: true },
      orderBy: [{ isPopular: 'desc' }, { nameAr: 'asc' }],
      select: {
        id: true,
        slug: true,
        nameAr: true,
        nameEn: true,
        latitude: true,
        longitude: true,
        isPopular: true,
        country: { select: { code: true, nameAr: true, currency: true } },
        _count: { select: { properties: true } },
      },
    });
  }

  async cityBySlug(slug: string) {
    const city = await this.prisma.city.findUnique({
      where: { slug },
      include: { country: true, airports: true },
    });
    if (!city) throw new NotFoundException('المدينة غير موجودة');
    return city;
  }

  async ownerProperties(userId: string) {
    const vendor = await this.prisma.vendorProfile.findUnique({ where: { userId } });
    if (!vendor) throw new ForbiddenException('لا يوجد ملف مزوّد مرتبط بحسابك');
    const items = await this.prisma.property.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' },
      include: {
        images: { take: 3, orderBy: { sortOrder: 'asc' }, include: { media: true } },
        city: { select: { id: true, nameAr: true, nameEn: true } },
        _count: { select: { bookings: true, reviews: true } },
      },
    });
    return items.map((p) => this.mapProperty(p));
  }

  private async attachImages(propertyId: string, urls: string[]) {
    const medias = await Promise.all(
      urls.map((url) =>
        this.prisma.media.create({
          data: { url, type: 'IMAGE' },
          select: { id: true },
        }),
      ),
    );
    await this.prisma.propertyImage.createMany({
      data: medias.map((m, i) => ({ propertyId, mediaId: m.id, sortOrder: i })),
    });
  }

  private async uniqueSlug(title: string): Promise<string> {
    const base =
      title
        .trim()
        .toLowerCase()
        .replace(/[\s_]+/g, '-')
        .replace(/[^\p{L}\p{N}-]/gu, '')
        .slice(0, 60) || 'property';
    let slug = base;
    let counter = 1;
    while (await this.prisma.property.findUnique({ where: { slug } })) {
      counter += 1;
      slug = `${base}-${counter}`;
    }
    return slug;
  }

  private async getVendorForUser(userId: string) {
    const vendor = await this.prisma.vendorProfile.findUnique({ where: { userId } });
    if (!vendor) throw new ForbiddenException('يجب إنشاء ملف مزوّد معتمد أولًا');
    if (vendor.status === 'SUSPENDED') throw new ForbiddenException('حساب المزوّد موقوف');
    return vendor;
  }

  private async assertOwnership(vendorId: string, userId: string) {
    const vendor = await this.prisma.vendorProfile.findUnique({ where: { userId } });
    if (!vendor) throw new ForbiddenException('غير مصرح');
    if (vendor.id !== vendorId) {
      const isAdmin = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      if (!isAdmin || (isAdmin.role !== 'ADMIN' && isAdmin.role !== 'SUPER_ADMIN')) {
        throw new ForbiddenException('لا تملك صلاحية تعديل هذا العقار');
      }
    }
  }

  private mapProperty(property: any) {
    const images = (property.images ?? []).map((img: any) => img.media.url);
    return {
      id: property.id,
      slug: property.slug,
      title: property.title,
      summary: property.summary,
      description: property.description,
      category: property.category,
      status: property.status,
      city: property.city,
      address: property.address,
      latitude: property.latitude,
      longitude: property.longitude,
      starRating: property.starRating,
      currency: property.currency,
      pricePerNight: toNumber(property.pricePerNight),
      pricePerHour: property.pricePerHour ? toNumber(property.pricePerHour) : null,
      pricePerDay: property.pricePerDay ? toNumber(property.pricePerDay) : null,
      bookingMode: property.bookingMode,
      minNights: property.minNights,
      maxGuests: property.maxGuests,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      areaSqm: property.areaSqm,
      checkInTime: property.checkInTime,
      checkOutTime: property.checkOutTime,
      amenities: property.amenities,
      highlights: property.highlights ?? [],
      badgeLabel: property.badgeLabel ?? null,
      negotiable: property.negotiable ?? false,
      rules: property.rules,
      isInstantBook: property.isInstantBook,
      hasVideo: property.hasVideo,
      ratingAvg: toNumber(property.ratingAvg),
      ratingCount: property.ratingCount,
      viewsCount: property.viewsCount,
      images,
      roomTypes: property.roomTypes?.map((r: any) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        bedType: r.bedType,
        maxGuests: r.maxGuests,
        pricePerNight: toNumber(r.pricePerNight),
        currency: r.currency,
        breakfastIncluded: r.breakfastIncluded,
        availableRooms: r.availableRooms,
        amenities: r.amenities,
        images: r.images?.map((i: any) => i.media.url),
      })),
      vendor: property.vendor,
      seasonal: property.seasonal,
      amenitiesRef: property.amenitiesRef,
      reviews: property.reviews?.map((r: any) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        customer: r.customer,
        images: r.images?.map((i: any) => i.media.url),
      })),
      createdAt: property.createdAt,
    };
  }
}
