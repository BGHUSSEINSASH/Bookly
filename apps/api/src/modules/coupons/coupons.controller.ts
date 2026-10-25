import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { CouponsService } from './coupons.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

class ValidateCouponDto {
  @IsString()
  code: string;

  @IsNumber()
  subtotal: number;

  @IsOptional()
  @IsString()
  category?: string;
}

@ApiTags('coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'الكوبونات المتاحة' })
  list() {
    return this.couponsService.listActive();
  }

  @ApiBearerAuth()
  @Post('validate')
  @HttpCode(200)
  @ApiOperation({ summary: 'التحقق من كود الخصم وحساب الخصم' })
  validate(@CurrentUser('id') userId: string, @Body() dto: ValidateCouponDto) {
    return this.couponsService.validate(dto.code, userId, dto.subtotal, dto.category);
  }
}
