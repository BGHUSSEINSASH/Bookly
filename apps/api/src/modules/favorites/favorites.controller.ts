import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

class FavoriteDto {
  @IsString() propertyId: string;
}

@ApiTags('favorites')
@ApiBearerAuth()
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'مفضلتي' })
  async list(@CurrentUser('id') userId: string) {
    const items = await this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        property: {
          include: {
            images: { take: 3, orderBy: { sortOrder: 'asc' }, include: { media: true } },
            city: { select: { id: true, nameAr: true, nameEn: true } },
          },
        },
      },
    });
    return items.map((f) => ({
      id: f.id,
      createdAt: f.createdAt,
      property: {
        id: f.property.id,
        title: f.property.title,
        slug: f.property.slug,
        category: f.property.category,
        pricePerNight: Number(f.property.pricePerNight),
        currency: f.property.currency,
        ratingAvg: Number(f.property.ratingAvg),
        city: f.property.city,
        images: f.property.images.map((i) => i.media.url),
      },
    }));
  }

  @Post()
  @ApiOperation({ summary: 'إضافة إلى المفضلة' })
  async add(@CurrentUser('id') userId: string, @Body() dto: FavoriteDto) {
    await this.prisma.favorite.upsert({
      where: { userId_propertyId: { userId, propertyId: dto.propertyId } },
      create: { userId, propertyId: dto.propertyId },
      update: {},
    });
    return { message: 'تمت الإضافة إلى المفضلة' };
  }

  @Delete(':propertyId')
  @ApiOperation({ summary: 'إزالة من المفضلة' })
  async remove(@CurrentUser('id') userId: string, @Param('propertyId') propertyId: string) {
    await this.prisma.favorite.deleteMany({ where: { userId, propertyId } });
    return { message: 'تمت الإزالة من المفضلة' };
  }
}
