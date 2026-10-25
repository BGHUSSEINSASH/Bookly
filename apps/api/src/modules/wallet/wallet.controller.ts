import { Body, Controller, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { WalletService } from './wallet.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

class TopUpDto {
  @IsNumber()
  @Min(1000, { message: 'الحد الأدنى للشحن 1000' })
  amount: number;

  @IsOptional()
  @IsString()
  method?: string;

  @IsOptional()
  @IsString()
  reference?: string;
}

class TransferDto {
  @IsString()
  toUserId: string;

  @IsNumber()
  @Min(1)
  amount: number;
}

@ApiTags('wallet')
@ApiBearerAuth()
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @ApiOperation({ summary: 'رصيد المحفظة' })
  balance(@CurrentUser('id') userId: string) {
    return this.walletService.getBalance(userId);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'سجل العمليات' })
  transactions(
    @CurrentUser('id') userId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.walletService.transactions(userId, Number(page), Number(limit));
  }

  @Post('topup')
  @HttpCode(200)
  @ApiOperation({ summary: 'شحن الرصيد' })
  topUp(@CurrentUser('id') userId: string, @Body() dto: TopUpDto) {
    return this.walletService.topUp(userId, dto.amount, dto.method ?? 'VISA', dto.reference);
  }

  @Post('transfer')
  @HttpCode(200)
  @ApiOperation({ summary: 'تحويل رصيد' })
  transfer(@CurrentUser('id') userId: string, @Body() dto: TransferDto) {
    return this.walletService.transfer(userId, dto.toUserId, dto.amount);
  }

  @Get('user/:userId')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'رصيد مستخدم (للإدارة)' })
  adminBalance(@Param('userId') userId: string) {
    return this.walletService.getBalance(userId);
  }
}
