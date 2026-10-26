import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { SearchPropertiesDto, CreatePropertyDto } from './dto/search-properties.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('properties')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  // ————— المسارات الثابتة أولًا حتى لا يبتلعها :idOrSlug —————

  @Public()
  @Get()
  @ApiOperation({ summary: 'البحث في المزارع والفنادق مع كل الفلاتر' })
  search(@Query() query: SearchPropertiesDto) {
    return this.propertiesService.search(query);
  }

  @Public()
  @Get('featured')
  @ApiOperation({ summary: 'المزارع والفنادق المميزة' })
  featured(@Query('limit') limit?: number) {
    return this.propertiesService.featured(limit ? Number(limit) : 8);
  }

  @Public()
  @Get('deals')
  @ApiOperation({ summary: 'عروض اليوم' })
  deals(@Query('limit') limit?: number) {
    return this.propertiesService.dailyDeals(limit ? Number(limit) : 8);
  }

  @Public()
  @Get('cities')
  @ApiOperation({ summary: 'المدن المتاحة' })
  cities() {
    return this.propertiesService.cities();
  }

  @Public()
  @Get('map')
  @ApiOperation({ summary: 'عقارات داخل نطاق الخريطة المرئي' })
  async mapView(
    @Query('ne_lat') neLat: string,
    @Query('ne_lng') neLng: string,
    @Query('sw_lat') swLat: string,
    @Query('sw_lng') swLng: string,
    @Query('zoom') zoom = '12',
    @Query('category') category?: string,
  ) {
    const z = Number(zoom);
    // كلما زاد الـ zoom، نُعيد تفاصيل أكثر
    const limit = z >= 14 ? 150 : z >= 11 ? 80 : 40;

    const where: any = { status: 'PUBLISHED' };
    if (neLat && swLat) {
      where.latitude  = { gte: +swLat, lte: +neLat };
      where.longitude = { gte: +swLng, lte: +neLng };
    }
    if (category) where.category = category;

    const properties = await this.propertiesService.prismaClient.property.findMany({
      where,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        latitude: true,
        longitude: true,
        pricePerNight: true,
        currency: true,
        ratingAvg: true,
        isInstantBook: true,
        images: {
          take: 1,
          orderBy: { sortOrder: 'asc' },
          include: { media: { select: { url: true } } },
        },
      },
    });

    return properties.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      category: p.category,
      latitude: p.latitude,
      longitude: p.longitude,
      price: Number(p.pricePerNight),
      currency: p.currency,
      rating: Number(p.ratingAvg),
      instantBook: p.isInstantBook,
      thumbnail: p.images[0]?.media?.url ?? null,
    }));
  }

  @Public()
  @Get('city/:slug')
  @ApiOperation({ summary: 'تفاصيل مدينة' })
  city(@Param('slug') slug: string) {
    return this.propertiesService.cityBySlug(slug);
  }

  @ApiBearerAuth()
  @Get('vendor/mine')
  @ApiOperation({ summary: 'عقاراتي' })
  mine(@CurrentUser('id') userId: string) {
    return this.propertiesService.ownerProperties(userId);
  }

  @Public()
  @Get(':id/availability')
  @ApiOperation({ summary: 'التحقق من التوفر في تواريخ محددة' })
  availability(
    @Param('id') id: string,
    @Query('checkIn') checkIn: string,
    @Query('checkOut') checkOut: string,
  ) {
    return this.propertiesService.availability(id, new Date(checkIn), new Date(checkOut));
  }

  @Public()
  @Get(':idOrSlug')
  @ApiOperation({ summary: 'تفاصيل العقار' })
  findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.propertiesService.findOne(idOrSlug);
  }

  @ApiBearerAuth()
  @Post()
  @Roles(UserRole.FARM_OWNER, UserRole.HOTEL_MANAGER, UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'إضافة مزرعة / فندق جديد' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreatePropertyDto) {
    return this.propertiesService.create(userId, dto);
  }

  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'تعديل بيانات عقار' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: Partial<CreatePropertyDto>,
  ) {
    return this.propertiesService.update(id, userId, dto);
  }
}
