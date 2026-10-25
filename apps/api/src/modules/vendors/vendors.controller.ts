import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ForbiddenException } from '@nestjs/common';

class CreateVendorDto {
  @IsEnum(['FARM', 'HOTEL', 'CAR_RENTAL', 'TRAVEL_AGENCY', 'AIRLINE', 'MIXED']) type: string;
  @IsString() companyName: string;
  @IsOptional() @IsString() legalName?: string;
  @IsOptional() @IsString() taxNumber?: string;
  @IsOptional() @IsString() commercialReg?: string;
  @IsString() phone: string;
  @IsOptional() @IsString() description?: string;
}

@ApiTags('vendors')
@ApiBearerAuth()
@Controller('vendors')
export class VendorsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('me')
  @ApiOperation({ summary: 'ملف المزوّد الخاص بي' })
  async me(@CurrentUser('id') userId: string) {
    const vendor = await this.prisma.vendorProfile.findUnique({
      where: { userId },
      include: {
        properties: { select: { id: true, title: true, status: true } },
        _count: { select: { properties: true, cars: true, trips: true, bookings: true } },
      },
    });
    if (!vendor) throw new ForbiddenException('لا يوجد ملف مزوّد مرتبط بحسابك');
    return vendor;
  }

  @Post()
  @ApiOperation({ summary: 'التقديم كـ مزوّد خدمات' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateVendorDto) {
    const existing = await this.prisma.vendorProfile.findUnique({ where: { userId } });
    if (existing) throw new ForbiddenException('لديك ملف مزوّد بالفعل');

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        role: dto.type === 'FARM' ? 'FARM_OWNER' : dto.type === 'HOTEL' ? 'HOTEL_MANAGER' : 'VENDOR',
      },
    });

    const vendor = await this.prisma.vendorProfile.create({
      data: {
        userId,
        type: dto.type as any,
        companyName: dto.companyName,
        legalName: dto.legalName,
        taxNumber: dto.taxNumber,
        commercialReg: dto.commercialReg,
        phone: dto.phone,
        description: dto.description,
        // العمولة تُحدَّد من الإدارة فقط — لا تُقبل من العميل
        commissionRate: 12,
        status: 'PENDING',
      },
    });

    await this.prisma.notification.create({
      data: {
        userId,
        type: 'VENDOR_APPLICATION',
        title: 'تم استلام طلب المزوّد',
        body: 'سنراجع طلبك ونعلمك فور الموافقة',
      },
    });

    return { vendor, user };
  }

  @Patch('me')
  @ApiOperation({ summary: 'تحديث بيانات المزوّد' })
  async update(
    @CurrentUser('id') userId: string,
    @Body() dto: Partial<CreateVendorDto>,
  ) {
    return this.prisma.vendorProfile.update({
      where: { userId },
      data: {
        ...(dto.companyName !== undefined && { companyName: dto.companyName }),
        ...(dto.legalName !== undefined && { legalName: dto.legalName }),
        ...(dto.taxNumber !== undefined && { taxNumber: dto.taxNumber }),
        ...(dto.commercialReg !== undefined && { commercialReg: dto.commercialReg }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
    });
  }
}
