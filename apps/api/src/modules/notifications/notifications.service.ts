import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FcmService } from './fcm.service';

export interface NotificationInput {
  type: string;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
}

/**
 * خدمة الإشعارات — تحفظ في DB وترسل Push عبر FCM
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly fcm: FcmService,
  ) {}

  /** إنشاء إشعار + إرسال push notification */
  async notify(userId: string, input: NotificationInput) {
    try {
      const notification = await this.prisma.notification.create({
        data: {
          userId,
          type: input.type,
          title: input.title,
          body: input.body,
          data: input.data as never,
        },
      });

      // إرسال push لكل أجهزة المستخدم
      void this.pushToUser(userId, input.title, input.body ?? '', {
        type: input.type,
        notificationId: notification.id,
        ...Object.fromEntries(
          Object.entries(input.data ?? {}).map(([k, v]) => [k, String(v)])
        ),
      });

      return notification;
    } catch (e) {
      this.logger.warn(`تعذّر إنشاء الإشعار للمستخدم ${userId}: ${e}`);
      return null;
    }
  }

  private async pushToUser(userId: string, title: string, body: string, data: Record<string, string>) {
    try {
      const tokens = await this.prisma.deviceToken.findMany({
        where: { userId, isActive: true },
        select: { token: true },
      });
      if (tokens.length === 0) return;
      const tokenList = tokens.map(t => t.token);
      await this.fcm.sendMulticast(tokenList, title, body, data);
    } catch (e) {
      this.logger.warn(`FCM push failed for user ${userId}: ${e}`);
    }
  }

  list(userId: string, page = 1, limit = 50) {
    return this.prisma.$transaction([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);
  }

  async markAllRead(userId: string) {
    const res = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return { updated: res.count };
  }

  async markRead(userId: string, id: string) {
    await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true, readAt: new Date() },
    });
    return { updated: 1 };
  }

  unreadCount(userId: string) {
    return this.prisma.notification.count({ where: { userId, isRead: false } });
  }
}
