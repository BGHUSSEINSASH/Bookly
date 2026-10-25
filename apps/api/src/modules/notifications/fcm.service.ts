import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FcmService implements OnModuleInit {
  private readonly logger = new Logger(FcmService.name);
  private admin: any = null;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const projectId = this.config.get<string>('FIREBASE_PROJECT_ID');
    const privateKey = this.config.get<string>('FIREBASE_PRIVATE_KEY');
    const clientEmail = this.config.get<string>('FIREBASE_CLIENT_EMAIL');

    if (!projectId || !privateKey || !clientEmail) {
      this.logger.warn('Firebase غير مهيأ — الإشعارات ستُحفظ في DB فقط بدون push');
      return;
    }

    try {
      // Dynamic import to avoid crash when firebase-admin not installed
      const firebaseAdmin = await import('firebase-admin').catch(() => null);
      if (!firebaseAdmin) {
        this.logger.warn('حزمة firebase-admin غير مثبّتة');
        return;
      }

      if (firebaseAdmin.apps.length === 0) {
        firebaseAdmin.initializeApp({
          credential: firebaseAdmin.credential.cert({
            projectId,
            privateKey: privateKey.replace(/\\n/g, '\n'),
            clientEmail,
          }),
        });
      }

      this.admin = firebaseAdmin;
      this.logger.log('✅ Firebase FCM جاهز');
    } catch (e) {
      this.logger.error(`Firebase init error: ${e}`);
    }
  }

  /** إرسال push notification لرمز جهاز واحد */
  async sendToToken(token: string, title: string, body: string, data?: Record<string, string>): Promise<boolean> {
    if (!this.admin) return false;
    try {
      await this.admin.messaging().send({
        token,
        notification: { title, body },
        data: data ?? {},
        android: { priority: 'high', notification: { channelId: 'bookly_default', sound: 'default' } },
        apns: { payload: { aps: { sound: 'default', badge: 1 } } },
      });
      return true;
    } catch (e) {
      this.logger.warn(`FCM sendToToken failed: ${e}`);
      return false;
    }
  }

  /** إرسال للأجهزة المتعددة */
  async sendMulticast(tokens: string[], title: string, body: string, data?: Record<string, string>): Promise<number> {
    if (!this.admin || tokens.length === 0) return 0;
    try {
      const res = await this.admin.messaging().sendEachForMulticast({
        tokens,
        notification: { title, body },
        data: data ?? {},
        android: { priority: 'high' },
      });
      return res.successCount;
    } catch (e) {
      this.logger.warn(`FCM multicast failed: ${e}`);
      return 0;
    }
  }

  /** إرسال لموضوع (topic) */
  async sendToTopic(topic: string, title: string, body: string, data?: Record<string, string>): Promise<boolean> {
    if (!this.admin) return false;
    try {
      await this.admin.messaging().send({
        topic,
        notification: { title, body },
        data: data ?? {},
      });
      return true;
    } catch (e) {
      this.logger.warn(`FCM sendToTopic failed: ${e}`);
      return false;
    }
  }
}
