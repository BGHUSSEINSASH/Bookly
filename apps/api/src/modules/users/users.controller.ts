import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('me')
  me(@CurrentUser('id') userId: string) {
    return this.usersService.findById(userId);
  }

  @Patch('me')
  update(
    @CurrentUser('id') userId: string,
    @Body()
    body: {
      fullName?: string;
      phone?: string;
      avatarUrl?: string;
      locale?: string;
      preferredCurrency?: string;
    },
  ) {
    return this.usersService.updateProfile(userId, body);
  }

  @Get('me/dashboard')
  @ApiOperation({ summary: 'لوحة تحكم العميل' })
  dashboard(@CurrentUser('id') userId: string) {
    return this.usersService.dashboard(userId);
  }

  /** ── إدارة رموز الأجهزة (Push Notifications) ── */

  @Post('me/device-tokens')
  @HttpCode(200)
  @ApiOperation({ summary: 'تسجيل رمز جهاز للإشعارات' })
  async registerDeviceToken(
    @CurrentUser('id') userId: string,
    @Body() body: { token: string; platform: 'IOS' | 'ANDROID' | 'WEB' },
  ) {
    await this.prisma.deviceToken.upsert({
      where: { token: body.token },
      update: { userId, platform: body.platform as any, isActive: true, updatedAt: new Date() },
      create: { userId, token: body.token, platform: body.platform as any },
    });
    return { registered: true };
  }

  @Delete('me/device-tokens/:token')
  @ApiOperation({ summary: 'إلغاء تسجيل رمز جهاز' })
  async removeDeviceToken(@CurrentUser('id') userId: string, @Param('token') token: string) {
    await this.prisma.deviceToken.updateMany({
      where: { token, userId },
      data: { isActive: false },
    });
    return { removed: true };
  }
}
