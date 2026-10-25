import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

class CreateReviewDto {
  @IsString() bookingCode: string;
  @Type(() => Number) @IsInt() @Min(1) @Max(5) rating: number;
  @IsOptional() @IsString() comment?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(5) cleanliness?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(5) service?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(5) location?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(5) value?: number;
  @IsOptional() @IsString() reply?: string;
}

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get('property/:propertyId')
  @ApiOperation({ summary: 'تقييمات عقار' })
  async forProperty(
    @Param('propertyId') propertyId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const [items, total, avg] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where: { propertyId, status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: { customer: { select: { fullName: true, avatarUrl: true } } },
      }),
      this.prisma.review.count({ where: { propertyId, status: 'PUBLISHED' } }),
      this.prisma.review.aggregate({
        where: { propertyId, status: 'PUBLISHED' },
        _avg: { rating: true },
      }),
    ]);

    return {
      items: items.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        customer: r.customer,
        vendorReply: r.vendorReply,
        createdAt: r.createdAt,
      })),
      total,
      average: avg._avg.rating ?? 0,
      page: Number(page),
      limit: Number(limit),
    };
  }

  @ApiBearerAuth()
  @Get('mine')
  myReviews(@CurrentUser('id') userId: string) {
    return this.prisma.review.findMany({
      where: { customerId: userId },
      orderBy: { createdAt: 'desc' },
      include: { booking: { select: { code: true } }, property: { select: { title: true, slug: true } } },
    });
  }

  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'تقييم حجز' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateReviewDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { code: dto.bookingCode },
      include: { review: true },
    });
    if (!booking) throw new NotFoundException('الحجز غير موجود');
    if (booking.customerId !== userId) throw new ForbiddenException();
    if (booking.review) throw new BadRequestException('تم تقييم هذا الحجز مسبقًا');
    if (!['COMPLETED', 'CONFIRMED'].includes(booking.status)) {
      throw new BadRequestException('يمكن التقييم بعد إتمام الحجز فقط');
    }

    const review = await this.prisma.review.create({
      data: {
        bookingId: booking.id,
        customerId: userId,
        propertyId: booking.propertyId,
        rating: dto.rating,
        comment: dto.comment,
        cleanliness: dto.cleanliness,
        service: dto.service,
        location: dto.location,
        value: dto.value,
      },
    });

    // تحديث متوسط التقييم
    if (booking.propertyId) {
      const agg = await this.prisma.review.aggregate({
        where: { propertyId: booking.propertyId, status: 'PUBLISHED' },
        _avg: { rating: true },
        _count: true,
      });
      await this.prisma.property.update({
        where: { id: booking.propertyId },
        data: {
          ratingAvg: agg._avg.rating ?? 0,
          ratingCount: agg._count,
        },
      });
    }

    return review;
  }
}
