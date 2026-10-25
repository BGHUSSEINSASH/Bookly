import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ForbiddenException } from '@nestjs/common';

class SearchTripsDto {
  @IsOptional() @IsEnum(['MARINE', 'SAFARI', 'MOUNTAIN', 'HERITAGE', 'DESERT', 'CITY', 'ADVENTURE'])
  type?: string;

  @IsOptional() @IsString() cityId?: string;
  @IsOptional() @Type(() => Number) @IsNumber() minPrice?: number;
  @IsOptional() @Type(() => Number) @IsNumber() maxPrice?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit?: number;
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
  @IsOptional() @IsString() meetingPoint?: string;
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
    if (dto.minPrice !== undefined || dto.maxPrice !== undefined) {
      where.pricePerPerson = {
        ...(dto.minPrice !== undefined ? { gte: dto.minPrice } : {}),
        ...(dto.maxPrice !== undefined ? { lte: dto.maxPrice } : {}),
      };
    }

    const trips = await this.prisma.trip.findMany({
      where,
      orderBy: [{ ratingAvg: 'desc' }, { pricePerPerson: 'asc' }],
      take: dto.limit ?? 30,
      include: {
        images: { take: 3, orderBy: { sortOrder: 'asc' }, include: { media: true } },
        city: { select: { id: true, nameAr: true, nameEn: true, slug: true } },
        vendor: { select: { id: true, companyName: true } },
      },
    });

    return trips.map((t) => ({
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
      ratingAvg: Number(t.ratingAvg),
      ratingCount: t.ratingCount,
      city: t.city,
      images: t.images.map((i) => i.media.url),
      vendor: t.vendor,
    }));
  }

  @Public()
  @Get('types')
  types() {
    return [
      { key: 'MARINE', nameAr: 'رحلات بحرية', icon: 'ship' },
      { key: 'SAFARI', nameAr: 'سفاري', icon: 'binoculars' },
      { key: 'MOUNTAIN', nameAr: 'رحلات جبلية', icon: 'mountain' },
      { key: 'HERITAGE', nameAr: 'رحلات أثرية', icon: 'landmark' },
      { key: 'DESERT', nameAr: 'صحراء', icon: 'sun' },
      { key: 'CITY', nameAr: 'جولات مدينة', icon: 'building' },
      { key: 'ADVENTURE', nameAr: 'مغامرات', icon: 'compass' },
    ];
  }

  @Public()
  @Get(':idOrSlug')
  findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.prisma.trip.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      include: {
        images: { include: { media: true } },
        city: true,
        vendor: { select: { id: true, companyName: true, ratingAvg: true } },
      },
    });
  }

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

    const trip = await this.prisma.trip.create({
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
        meetingPoint: dto.meetingPoint,
        status: 'PENDING_REVIEW',
      },
    });
    return trip;
  }
}
