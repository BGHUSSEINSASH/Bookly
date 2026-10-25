import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export const BOOKING_TARGETS = ['PROPERTY', 'FLIGHT', 'CAR', 'TRIP'] as const;
export type BookingTarget = (typeof BOOKING_TARGETS)[number];

export class GuestDto {
  @ApiProperty({ example: 'محمد أحمد' })
  @IsString()
  fullName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nationalId?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  isPrimary?: boolean;
}

export class CreateBookingDto {
  @ApiProperty({ enum: BOOKING_TARGETS })
  @IsEnum(BOOKING_TARGETS)
  target: BookingTarget;

  @ApiPropertyOptional({ description: 'معرف العقار (مزرعة/فندق/شاليه)' })
  @IsOptional()
  @IsString()
  propertyId?: string;

  @ApiPropertyOptional({ description: 'معرف نوع الغرفة' })
  @IsOptional()
  @IsString()
  roomTypeId?: string;

  @ApiPropertyOptional({ description: 'معرف الرحلة' })
  @IsOptional()
  @IsString()
  flightId?: string;

  @ApiPropertyOptional({ description: 'معرف السيارة' })
  @IsOptional()
  @IsString()
  carId?: string;

  @ApiPropertyOptional({ description: 'معرف الرحلة السياحية' })
  @IsOptional()
  @IsString()
  tripId?: string;

  @ApiProperty({ description: 'تاريخ الدخول / السفر' })
  @IsDateString()
  checkIn: string;

  @ApiProperty({ description: 'تاريخ الخروج / العودة' })
  @IsDateString()
  checkOut: string;

  @ApiProperty({ default: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  guests: number;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  units?: number;

  @ApiPropertyOptional({ enum: ['NIGHT', 'HOUR', 'DAY'], default: 'NIGHT' })
  @IsOptional()
  @IsString()
  bookingMode?: string;

  @ApiPropertyOptional({ description: 'كود الخصم' })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({ description: 'عدد النقاط المستبدلة' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  pointsRedeemed?: number;

  @ApiPropertyOptional({ enum: ['WALLET', 'VISA', 'MASTERCARD', 'APPLE_PAY', 'GOOGLE_PAY', 'PAYPAL', 'ZAIN_CASH', 'ASIA_HAWALA', 'FASTPAY', 'CASH_ON_SITE'] })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerNote?: string;

  @ApiPropertyOptional({ isArray: true, type: GuestDto })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestDto)
  guestsDetail?: GuestDto[];
}

export class CancelBookingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

export class QuoteDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  pointsRedeemed?: number;
}
