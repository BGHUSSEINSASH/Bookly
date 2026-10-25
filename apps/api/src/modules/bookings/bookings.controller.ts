import { Body, Controller, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CancelBookingDto, CreateBookingDto } from './dto/booking.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  @ApiOperation({ summary: 'حجوزاتي' })
  list(
    @CurrentUser('id') userId: string,
    @Query('status') status?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.bookingsService.list(userId, status, Number(page), Number(limit));
  }

  @Get('vendor')
  @ApiOperation({ summary: 'حجوزات المزوّد' })
  vendorList(@CurrentUser('id') userId: string, @Query('status') status?: string) {
    return this.bookingsService.vendorBookings(userId, status);
  }

  @Public()
  @Post('quote')
  @HttpCode(200)
  @ApiOperation({ summary: 'معاينة السعر قبل الحجز (بدون تسجيل دخول)' })
  quote(@CurrentUser('id') userId: string | null, @Body() dto: CreateBookingDto) {
    return this.bookingsService.quote(userId ?? null, dto);
  }

  @Post()
  @ApiOperation({ summary: 'إنشاء حجز جديد' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(userId, dto);
  }

  @Get(':code')
  @ApiOperation({ summary: 'تفاصيل حجز' })
  findOne(@Param('code') code: string, @CurrentUser('id') userId: string) {
    return this.bookingsService.findByCode(code, userId);
  }

  @Post(':code/cancel')
  @HttpCode(200)
  @ApiOperation({ summary: 'إلغاء حجز' })
  cancel(
    @Param('code') code: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CancelBookingDto,
  ) {
    return this.bookingsService.cancel(code, userId, dto.reason);
  }

  @Post(':code/status')
  @HttpCode(200)
  @ApiOperation({ summary: 'تغيير حالة الحجز (مزوّد/إدارة)' })
  setStatus(
    @Param('code') code: string,
    @CurrentUser('id') userId: string,
    @Body() body: { status: string; note?: string },
  ) {
    return this.bookingsService.setStatus(code, body.status, userId, body.note);
  }
}
