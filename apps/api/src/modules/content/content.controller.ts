import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('content')
@Controller('content')
export class ContentController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get('banners')
  @ApiOperation({ summary: 'بانرات الصفحة الرئيسية' })
  async banners() {
    const now = new Date();
    return this.prisma.banner.findMany({
      where: {
        isActive: true,
        ...(now ? { OR: [{ startsAt: null }, { startsAt: { lte: now } }] } : {}),
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  @Public()
  @Get('settings')
  @ApiOperation({ summary: 'إعدادات المنصة العامة' })
  async settings() {
    const rows = await this.prisma.setting.findMany();
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  }
}
