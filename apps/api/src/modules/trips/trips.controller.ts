import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

class SearchTripsDto {
  @IsOptional() @IsEnum(['MARINE', 'SAFARI', 'MOUNTAIN', 'HERITAGE', 'DESERT', 'CITY', 'ADVENTURE'])
  type?: string;

  @IsOptional() @IsString() cityId?: string;
  @IsOptional() @IsString() q?: string;
  @IsOptional() @Type(() => Number) @IsNumber() minPrice?: number;
  @IsOptional() @Type(() => Number) @IsNumber() maxPrice?: number;
  @IsOptional() @IsString() difficultyLevel?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit?: number;
  @IsOptional() @Type(() => Number) @IsInt() page?: number;
}

class CreateTripDto {
  @IsEnum(['MARINE', 'SAFARI', 'MOUNTAIN', 'HERITAGE', 'DESERT', 'CITY', 'ADVENTURE']) type: string;
  @IsString() title: string;
  @IsOptional() @IsString() summary?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() cityId?: string;
  @Type(() => Number) @IsInt() durationDays: number;
  @Type(() => Number) @IsNumber() pricePerPerson: number;
  @IsOptional() @IsString() currency?: string;
  @Type(() => Number) @IsInt() maxGuests: number;
  @IsOptional() @Type(() => Number) @IsInt() minGuests?: number;
  @IsOptional() @IsArray() @IsString({ each: true }) includes?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) excludes?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) highlights?: string[];
  @IsOptional() @IsString() meetingPoint?: string;
  @IsOptional() @Type(() => Number) @IsNumber() meetingPointLat?: number;
  @IsOptional() @Type(() => Number) @IsNumber() meetingPointLng?: number;
  @IsOptional() @IsString() difficultyLevel?: string;
  @IsOptional() @Type(() => Number) @IsInt() minAge?: number;
  @IsOptional() itinerary?: any[];
}

class CreateScheduleDto {
  @Type(() => Date) departureDate: Date;
  @IsOptional() @Type(() => Number) @IsInt() seatsTotal?: number;
  @IsOptional() @Type(() => Number) @IsNumber() priceOverride?: number;
  @IsOptional() @IsString() guideId?: string;
  @IsOptional() @IsString() notes?: string;
}

@ApiTags('trips')
@Controller('trips')
export class TripsController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'البحث عن رحلات سياحية' })
  async search(@Query() dto: SearchTripsDto) {
    const where: any = { status: 'PUBLISHED' };
    if (dto.type) where.type = dto.type;
    if (dto.cityId) where.cityId = dto.cityId;
    if (dto.difficultyLevel) where.difficultyLevel = dto.difficultyLevel;
    if (dto.q) {
      where.OR = [
        { title: { contains: dto.q, mode: 'insensitive' } },
        { summary: { contains: dto.q, mode: 'insensitive' } },
        { description: { contains: dto.q, mode: 'insensitive' } },
      ];
    }
    if (dto.minPrice !== undefined || dto.maxPrice !== undefined) {
      where.pricePerPerson = {
        ...(dto.minPrice !== undefined ? { gte: dto.minPrice } : {}),
        ...(dto.maxPrice !== undefined ? { lte: dto.maxPrice } : {}),
      };
    }

    const limit = dto.limit ?? 30;
    const page  = dto.page ?? 1;
    const skip  = (page - 1) * limit;

    const [trips, total] = await this.prisma.$transaction([
      this.prisma.trip.findMany({
        where,
        orderBy: [{ ratingAvg: 'desc' }, { pricePerPerson: 'asc' }],
        take: limit,
        skip,
        include: {
          images: { take: 3, orderBy: { sortOrder: 'asc' }, include: { media: true } },
          city: { select: { id: true, nameAr: true, nameEn: true, slug: true } },
          vendor: { select: { id: true, companyName: true } },
          schedules: {
            where: { status: 'OPEN', departureDate: { gte: new Date() } },
            orderBy: { departureDate: 'asc' },
            take: 3,
            include: { guide: { select: { id: true, fullName: true, photoUrl: true, ratingAvg: true } } },
          },
        },
      }),
      this.prisma.trip.count({ where }),
    ]);

    return {
      items: trips.map((t) => this.mapTrip(t)),
      total,
      page,
      limit,
      pages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  @Public()
  @Get('types')
  types() {
    return [
      { key: 'MARINE',    nameAr: 'رحلات بحرية',   icon: 'ship',       emoji: '⛵' },
      { key: 'SAFARI',    nameAr: 'سفاري',           icon: 'binoculars', emoji: '🦁' },
      { key: 'MOUNTAIN',  nameAr: 'رحلات جبلية',    icon: 'mountain',   emoji: '⛰️' },
      { key: 'HERITAGE',  nameAr: 'رحلات أثرية',    icon: 'landmark',   emoji: '🏛️' },
      { key: 'DESERT',    nameAr: 'صحراء',           icon: 'sun',        emoji: '🏜️' },
      { key: 'CITY',      nameAr: 'جولات مدينة',    icon: 'building',   emoji: '🏙️' },
      { key: 'ADVENTURE', nameAr: 'مغامرات',         icon: 'compass',    emoji: '🧭' },
    ];
  }

  @Public()
  @Get('featured')
  @ApiOperation({ summary: 'الرحلات المميزة' })
  async featured(@Query('limit') limit = '6') {
    const trips = await this.prisma.trip.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ ratingAvg: 'desc' }, { ratingCount: 'desc' }],
      take: Number(limit),
      include: {
        images: { take: 1, orderBy: { sortOrder: 'asc' }, include: { media: true } },
        city: { select: { id: true, nameAr: true } },
        schedules: {
          where: { status: 'OPEN', departureDate: { gte: new Date() } },
          orderBy: { departureDate: 'asc' },
          take: 1,
        },
      },
    });
    return trips.map((t) => this.mapTrip(t));
  }

  @Public()
  @Get(':idOrSlug')
  @ApiOperation({ summary: 'تفاصيل رحلة' })
  async findOne(@Param('idOrSlug') idOrSlug: string) {
    const trip = await this.prisma.trip.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }], status: 'PUBLISHED' },
      include: {
        images: { orderBy: { sortOrder: 'asc' }, include: { media: true } },
        city: true,
        vendor: { select: { id: true, companyName: true, ratingAvg: true, logoUrl: true } },
        schedules: {
          where: { departureDate: { gte: new Date() } },
          orderBy: { departureDate: 'asc' },
          take: 20,
          include: {
            guide: { select: { id: true, fullName: true, photoUrl: true, languages: true, ratingAvg: true, bio: true } },
          },
        },
      },
    });
    if (!trip) throw new NotFoundException('الرحلة غير موجودة');

    // الرحلات المشابهة
    const similar = await this.prisma.trip.findMany({
      where: { status: 'PUBLISHED', type: trip.type, id: { not: trip.id } },
      orderBy: { ratingAvg: 'desc' },
      take: 4,
      include: {
        images: { take: 1, orderBy: { sortOrder: 'asc' }, include: { media: true } },
        city: { select: { nameAr: true } },
      },
    });

    return { ...this.mapTripFull(trip), similar: similar.map(t => this.mapTrip(t)) };
  }

  // ────── مواعيد الرحلة ──────

  @ApiBearerAuth()
  @Post(':tripId/schedules')
  @ApiOperation({ summary: 'إضافة موعد لرحلة (منظّم)' })
  async addSchedule(
    @CurrentUser('id') userId: string,
    @Param('tripId') tripId: string,
    @Body() dto: CreateScheduleDto,
  ) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId }, select: { vendorId: true } });
    if (!trip) throw new NotFoundException('الرحلة غير موجودة');
    const vendor = await this.prisma.vendorProfile.findUnique({ where: { userId } });
    if (!vendor || vendor.id !== trip.vendorId) throw new ForbiddenException();

    return this.prisma.tripSchedule.create({
      data: {
        tripId,
        departureDate: new Date(dto.departureDate),
        seatsTotal: dto.seatsTotal ?? 20,
        priceOverride: dto.priceOverride ?? undefined,
        guideId: dto.guideId ?? undefined,
        notes: dto.notes,
      },
      include: { guide: { select: { fullName: true, photoUrl: true } } },
    });
  }

  @Public()
  @Get(':tripId/schedules')
  @ApiOperation({ summary: 'مواعيد رحلة' })
  async getSchedules(@Param('tripId') tripId: string) {
    return this.prisma.tripSchedule.findMany({
      where: { tripId, departureDate: { gte: new Date() } },
      orderBy: { departureDate: 'asc' },
      include: {
        guide: { select: { id: true, fullName: true, photoUrl: true, languages: true, ratingAvg: true } },
      },
    });
  }

  // ────── إضافة رحلة ──────

  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'إضافة رحلة سياحية (منظّم)' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateTripDto) {
    const vendor = await this.prisma.vendorProfile.findUnique({ where: { userId } });
    if (!vendor) throw new ForbiddenException('يجب إنشاء ملف مزوّد أولًا');
    const slug = dto.title
      .toLowerCase()
      .replace(/[\s_]+/g, '-')
      .replace(/[^\p{L}\p{N}-]/gu, '')
      .slice(0, 60);

    return this.prisma.trip.create({
      data: {
        vendorId: vendor.id,
        type: dto.type as any,
        title: dto.title,
        slug: `${slug}-${Date.now().toString(36).slice(-4)}`,
        summary: dto.summary,
        description: dto.description,
        cityId: dto.cityId,
        durationDays: dto.durationDays,
        pricePerPerson: dto.pricePerPerson,
        currency: dto.currency ?? 'IQD',
        maxGuests: dto.maxGuests,
        minGuests: dto.minGuests ?? 1,
        includes: dto.includes ?? [],
        excludes: dto.excludes ?? [],
        highlights: dto.highlights ?? [],
        meetingPoint: dto.meetingPoint,
        meetingPointLat: dto.meetingPointLat,
        meetingPointLng: dto.meetingPointLng,
        difficultyLevel: dto.difficultyLevel,
        minAge: dto.minAge,
        itinerary: dto.itinerary ?? undefined,
        status: 'PENDING_REVIEW',
      },
    });
  }

  // ────── Private helpers ──────

  private mapTrip(t: any) {
    const nextSchedule = t.schedules?.[0];
    const seatsLeft = nextSchedule
      ? nextSchedule.seatsTotal - nextSchedule.seatsBooked
      : null;

    return {
      id: t.id,
      title: t.title,
      slug: t.slug,
      summary: t.summary,
      type: t.type,
      durationDays: t.durationDays,
      pricePerPerson: Number(t.pricePerPerson),
      currency: t.currency,
      maxGuests: t.maxGuests,
      minGuests: t.minGuests,
      includes: t.includes,
      excludes: t.excludes,
      highlights: t.highlights,
      difficultyLevel: t.difficultyLevel,
      minAge: t.minAge,
      requiresGuide: t.requiresGuide,
      ratingAvg: Number(t.ratingAvg ?? 0),
      ratingCount: t.ratingCount,
      city: t.city,
      images: t.images?.map((i: any) => i.media?.url ?? i) ?? [],
      vendor: t.vendor,
      nextDeparture: nextSchedule?.departureDate ?? null,
      seatsLeft,
    };
  }

  private mapTripFull(t: any) {
    return {
      ...this.mapTrip(t),
      description: t.description,
      meetingPoint: t.meetingPoint,
      meetingPointLat: t.meetingPointLat,
      meetingPointLng: t.meetingPointLng,
      itinerary: t.itinerary,
      schedules: t.schedules?.map((s: any) => ({
        id: s.id,
        departureDate: s.departureDate,
        seatsTotal: s.seatsTotal,
        seatsBooked: s.seatsBooked,
        seatsLeft: s.seatsTotal - s.seatsBooked,
        priceOverride: s.priceOverride ? Number(s.priceOverride) : null,
        status: s.status,
        notes: s.notes,
        guide: s.guide,
      })) ?? [],
    };
  }
}
