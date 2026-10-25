import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'قائمة الإشعارات مع عدّاد غير المقروء' })
  async list(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const [items, total, unread] = await this.notifications.list(
      userId,
      Math.max(1, Number(page) || 1),
      Math.min(100, Math.max(1, Number(limit) || 50)),
    );
    return { items, total, unread };
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'عدد الإشعارات غير المقروءة' })
  async unreadCount(@CurrentUser('id') userId: string) {
    return { count: await this.notifications.unreadCount(userId) };
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'تعليم الكل كمقروء' })
  async readAll(@CurrentUser('id') userId: string) {
    return this.notifications.markAllRead(userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'تعليم إشعار كمقروء' })
  async readOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.notifications.markRead(userId, id);
  }
}
