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
