import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ForbiddenException } from '@nestjs/common';

class SearchCarsDto {
  @IsOptional() @IsEnum(['ECONOMY', 'COMPACT', 'SEDAN', 'SUV', 'LUXURY', 'VAN', 'FAMILY', 'PICKUP'])
  category?: string;

  @IsOptional() @IsString() cityId?: string;
  @IsOptional() @Type(() => Number) @IsNumber() minPrice?: number;
  @IsOptional() @Type(() => Number) @IsNumber() maxPrice?: number;
  @IsOptional() @Type(() => Boolean) airportPickup?: boolean;
  @IsOptional() @Type(() => Boolean) withDriver?: boolean;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) seats?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit?: number;
}

class CreateCarDto {
  @IsEnum(['ECONOMY', 'COMPACT', 'SEDAN', 'SUV', 'LUXURY', 'VAN', 'FAMILY', 'PICKUP']) category: string;
  @IsString() make: string;
  @IsString() model: string;
  @Type(() => Number) @IsInt() year: number;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsString() plateNumber?: string;
  @IsOptional() @IsString() transmission?: string;
  @IsOptional() @IsString() fuelType?: string;
  @Type(() => Number) @IsInt() seats: number;
  @Type(() => Number) @IsInt() luggage: number;
  @Type(() => Number) @IsNumber() dailyRate: number;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @Type(() => Boolean) airportPickup?: boolean;
  @IsOptional() @Type(() => Boolean) withDriver?: boolean;
  @IsOptional() @Type(() => Number) @IsInt() freeKmPerDay?: number;
  @IsOptional() @Type(() => Number) @IsInt() minRentalDays?: number;
}

@ApiTags('cars')
@Controller('cars')
export class CarsController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'البحث عن سيارات تأجير' })
  async search(@Query() dto: SearchCarsDto) {
    const where: any = { status: 'PUBLISHED' };
    if (dto.category) where.category = dto.category;
    if (dto.seats) where.seats = { gte: dto.seats };
    if (dto.airportPickup !== undefined) where.airportPickup = dto.airportPickup;
    if (dto.withDriver !== undefined) where.withDriver = dto.withDriver;
    if (dto.minPrice !== undefined || dto.maxPrice !== undefined) {
      where.dailyRate = {
        ...(dto.minPrice !== undefined ? { gte: dto.minPrice } : {}),
        ...(dto.maxPrice !== undefined ? { lte: dto.maxPrice } : {}),
      };
    }

    const cars = await this.prisma.car.findMany({
      where,
      orderBy: [{ ratingAvg: 'desc' }, { dailyRate: 'asc' }],
      take: dto.limit ?? 30,
      include: {
        images: { take: 3, orderBy: { sortOrder: 'asc' }, include: { media: true } },
        vendor: { select: { id: true, companyName: true, ratingAvg: true } },
      },
    });

    return cars.map((c) => ({
      id: c.id,
      category: c.category,
      make: c.make,
      model: c.model,
      year: c.year,
      color: c.color,
      transmission: c.transmission,
      fuelType: c.fuelType,
      seats: c.seats,
      luggage: c.luggage,
      dailyRate: Number(c.dailyRate),
      currency: c.currency,
      airportPickup: c.airportPickup,
      withDriver: c.withDriver,
      freeKmPerDay: c.freeKmPerDay,
      ratingAvg: Number(c.ratingAvg),
      ratingCount: c.ratingCount,
      images: c.images.map((i) => i.media.url),
      vendor: c.vendor,
    }));
  }

  @Public()
  @Get('classes')
  classes() {
    return [
      { key: 'ECONOMY', nameAr: 'اقتصادية', icon: 'car' },
      { key: 'COMPACT', nameAr: 'مدمجة', icon: 'car' },
      { key: 'SEDAN', nameAr: 'سيدان', icon: 'car' },
      { key: 'SUV', nameAr: 'دفع رباعي', icon: 'suv' },
      { key: 'LUXURY', nameAr: 'فاخرة', icon: 'luxury' },
      { key: 'VAN', nameAr: 'شاحنة ركاب', icon: 'van' },
      { key: 'FAMILY', nameAr: 'عائلية', icon: 'family' },
      { key: 'PICKUP', nameAr: 'بيك أب', icon: 'pickup' },
    ];
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prisma.car.findUnique({
      where: { id },
      include: {
        images: { include: { media: true } },
        vendor: { select: { id: true, companyName: true, ratingAvg: true } },
      },
    });
  }

  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'إضافة سيارة (مزوّد)' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateCarDto) {
    const vendor = await this.prisma.vendorProfile.findUnique({ where: { userId } });
    if (!vendor) throw new ForbiddenException('يجب إنشاء ملف مزوّد أولًا');
    return this.prisma.car.create({
      data: {
        vendorId: vendor.id,
        category: dto.category as any,
        make: dto.make,
        model: dto.model,
        year: dto.year,
        color: dto.color,
        plateNumber: dto.plateNumber,
        transmission: (dto.transmission ?? 'AUTOMATIC') as any,
        fuelType: (dto.fuelType ?? 'PETROL') as any,
        seats: dto.seats,
        luggage: dto.luggage,
        dailyRate: dto.dailyRate,
        currency: dto.currency ?? 'IQD',
        airportPickup: dto.airportPickup ?? true,
        withDriver: dto.withDriver ?? false,
        freeKmPerDay: dto.freeKmPerDay ?? 200,
        minRentalDays: dto.minRentalDays ?? 1,
        status: 'PENDING_REVIEW',
      },
    });
  }
}
