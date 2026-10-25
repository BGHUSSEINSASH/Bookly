import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export const PROPERTY_SORT = [
  'RELEVANCE',
  'PRICE_ASC',
  'PRICE_DESC',
  'RATING_DESC',
  'NEWEST',
  'POPULAR',
] as const;

export class SearchPropertiesDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'نص البحث الحر (اسم أو وصف)' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ enum: ['FARM', 'CHALET', 'REST', 'HOTEL', 'APARTMENT'] })
  @IsOptional()
  @IsEnum(['FARM', 'CHALET', 'REST', 'HOTEL', 'APARTMENT'])
  category?: string;

  @ApiPropertyOptional({ description: 'معرف المدينة' })
  @IsOptional()
  @IsString()
  cityId?: string;

  @ApiPropertyOptional({ description: 'استبعاد عقار محدد من النتائج' })
  @IsOptional()
  @IsString()
  exclude?: string;

  @ApiPropertyOptional({ description: 'عدد الضيوف' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  guests?: number;

  @ApiPropertyOptional({ description: 'تاريخ الدخول' })
  @IsOptional()
  @IsDateString()
  checkIn?: string;

  @ApiPropertyOptional({ description: 'تاريخ الخروج' })
  @IsOptional()
  @IsDateString()
  checkOut?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional({ isArray: true, type: String, example: ['POOL', 'FOOTBALL_PITCH'] })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.split(',').map((s: string) => s.trim()).filter(Boolean)
      : value,
  )
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @ApiPropertyOptional({ description: 'حجز فوري فقط' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  instantBook?: boolean;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  minRating?: number;

  @ApiPropertyOptional({ enum: PROPERTY_SORT, default: 'RELEVANCE' })
  @IsOptional()
  @IsEnum(PROPERTY_SORT)
  sortBy?: (typeof PROPERTY_SORT)[number];

  @ApiPropertyOptional({ description: 'عدد غرف النوم' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  bedrooms?: number;

  @ApiPropertyOptional({ description: 'عدد دورات المياه' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  bathrooms?: number;
}

export class CreatePropertyDto {
  @ApiPropertyOptional({ enum: ['FARM', 'CHALET', 'REST', 'HOTEL', 'APARTMENT'] })
  @IsEnum(['FARM', 'CHALET', 'REST', 'HOTEL', 'APARTMENT'])
  category: string;

  @ApiPropertyOptional()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  cityId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  starRating?: number;

  @ApiPropertyOptional({ default: 'IQD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber()
  pricePerNight: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pricePerHour?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pricePerDay?: number;

  @ApiPropertyOptional({ enum: ['NIGHT', 'HOUR', 'DAY'], default: 'NIGHT' })
  @IsOptional()
  @IsEnum(['NIGHT', 'HOUR', 'DAY'])
  bookingMode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  minNights?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxGuests?: number;

  @ApiPropertyOptional({ isArray: true, type: String })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  checkInTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  checkOutTime?: string;

  @ApiPropertyOptional({ isArray: true, type: String })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];
}
