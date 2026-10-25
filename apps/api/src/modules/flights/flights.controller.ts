import { Body, Controller, Get, NotFoundException, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';

import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

class CreateFlightDto {
  @IsString() flightNumber: string;
  @IsString() airlineId: string;
  @IsString() fromAirportId: string;
  @IsString() toAirportId: string;
  @Type(() => Date) departureTime: Date;
  @Type(() => Date) arrivalTime: Date;
  @Type(() => Number) @IsInt() durationMinutes: number;
  @IsOptional() @Type(() => Number) @IsInt() stops?: number;
  @IsOptional() @Type(() => Number) economy?: number;
  @IsOptional() @Type(() => Number) business?: number;
  @IsOptional() @Type(() => Number) baggageAllowance?: number;
  @IsOptional() @IsString() currency?: string;
}

class SearchFlightsDto {
  @IsString() fromAirportId: string;
  @IsString() toAirportId: string;
  @IsOptional() departureDate?: string;
  @IsOptional() returnDate?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) passengers?: number;
  @IsOptional() @IsString() cabin?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) maxResults?: number;
}

@ApiTags('flights')
@Controller('flights')
export class FlightsController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get('search')
  @ApiOperation({ summary: 'البحث عن رحلات طيران' })
  async search(@Query() dto: SearchFlightsDto) {
    const now = new Date();
    // عند عدم تحديد تاريخ: نبحث في نافذة 30 يومًا قادمة
    const start = dto.departureDate ? new Date(dto.departureDate) : now;
    start.setHours(0, 0, 0, 0);
    const end = dto.departureDate
      ? new Date(start.getTime() + 24 * 3600 * 1000 - 1)
      : new Date(start.getTime() + 30 * 24 * 3600 * 1000);

    const flights = await this.prisma.flight.findMany({
      where: {
        fromAirportId: dto.fromAirportId,
        toAirportId: dto.toAirportId,
        departureTime: { gte: start, lte: end },
      },
      include: {
        airline: true,
        fromAirport: { include: { city: { select: { nameAr: true, nameEn: true } } } },
        toAirport: { include: { city: { select: { nameAr: true, nameEn: true } } } },
      },
      orderBy: { departureTime: 'asc' },
      take: dto.maxResults ?? 30,
    });

    return flights.map((f) => ({
      id: f.id,
      flightNumber: f.flightNumber,
      airline: { iataCode: f.airline.iataCode, nameAr: f.airline.nameAr, logoUrl: f.airline.logoUrl },
      from: { iata: f.fromAirport.iataCode, nameAr: f.fromAirport.nameAr, cityAr: f.fromAirport.city?.nameAr },
      to: { iata: f.toAirport.iataCode, nameAr: f.toAirport.nameAr, cityAr: f.toAirport.city?.nameAr },
      departureTime: f.departureTime,
      arrivalTime: f.arrivalTime,
      durationMinutes: f.durationMinutes,
      stops: f.stops,
      prices: f.cabinPrices,
      baggageAllowance: f.baggageAllowance,
      currency: f.currency,
    }));
  }

  @Public()
  @Get('airports')
  @ApiOperation({ summary: 'قائمة المطارات' })
  airports() {
    return this.prisma.airport.findMany({
      include: { city: { select: { id: true, nameAr: true, nameEn: true, country: { select: { code: true } } } } },
      orderBy: { iataCode: 'asc' },
    });
  }

  @Public()
  @Get('airlines')
  airlines() {
    return this.prisma.airline.findMany({ orderBy: { nameAr: 'asc' } });
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل رحلة' })
  async findOne(@Param('id') id: string) {
    const f = await this.prisma.flight.findUnique({
      where: { id },
      include: {
        airline: true,
        fromAirport: { include: { city: { select: { nameAr: true, nameEn: true } } } },
        toAirport: { include: { city: { select: { nameAr: true, nameEn: true } } } },
      },
    });
    if (!f) throw new NotFoundException('الرحلة غير موجودة');
    return {
      id: f.id,
      flightNumber: f.flightNumber,
      airline: { iataCode: f.airline.iataCode, nameAr: f.airline.nameAr, logoUrl: f.airline.logoUrl },
      from: { iata: f.fromAirport.iataCode, nameAr: f.fromAirport.nameAr, cityAr: f.fromAirport.city?.nameAr },
      to: { iata: f.toAirport.iataCode, nameAr: f.toAirport.nameAr, cityAr: f.toAirport.city?.nameAr },
      departureTime: f.departureTime,
      arrivalTime: f.arrivalTime,
      durationMinutes: f.durationMinutes,
      stops: f.stops,
      prices: f.cabinPrices,
      baggageAllowance: f.baggageAllowance,
      currency: f.currency,
    };
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post()
  @ApiOperation({ summary: 'إضافة رحلة (إدارة)' })
  create(@Body() dto: CreateFlightDto) {
    return this.prisma.flight.create({
      data: {
        flightNumber: dto.flightNumber,
        airlineId: dto.airlineId,
        fromAirportId: dto.fromAirportId,
        toAirportId: dto.toAirportId,
        departureTime: dto.departureTime,
        arrivalTime: dto.arrivalTime,
        durationMinutes: dto.durationMinutes,
        stops: dto.stops ?? 0,
        baggageAllowance: dto.baggageAllowance ?? 0,
        currency: dto.currency ?? 'IQD',
        cabinPrices: {
          ECONOMY: dto.economy ?? 0,
          BUSINESS: dto.business ?? 0,
        },
      },
    });
  }
}
