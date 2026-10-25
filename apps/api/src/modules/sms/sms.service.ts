import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * خدمة SMS — تدعم Twilio أو أي مزوّد SMS عراقي
 * الرسائل تُطبع في السجلات عند غياب الإعداد
 */
@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private twilio: any = null;
  private readonly fromNumber: string;

  constructor(private readonly config: ConfigService) {
    this.fromNumber = this.config.get('TWILIO_FROM', '');
    this.init();
  }

  private async init() {
    const sid   = this.config.get<string>('TWILIO_SID');
    const token = this.config.get<string>('TWILIO_TOKEN');
    if (!sid || !token) {
      this.logger.warn('SMS (Twilio) غير مهيأ — الرموز ستُطبع في السجلات');
      return;
    }
    try {
      // Dynamic import لتجنّب الكسر عند غياب الحزمة
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const twilio = await (eval('import("twilio")') as Promise<any>).catch(() => null);
      if (!twilio) { this.logger.warn('حزمة twilio غير مثبّتة — نفّذ: npm install twilio'); return; }
      const Twilio = twilio.default ?? twilio;
      this.twilio = Twilio(sid, token);
      this.logger.log('✅ Twilio SMS جاهز');
    } catch (e) {
      this.logger.error(`Twilio init error: ${e}`);
    }
  }

  async sendOtp(phone: string, code: string, fullName?: string): Promise<boolean> {
    const body = `مرحباً ${fullName ?? ''}\nرمز التحقق في Bookly: ${code}\nصالح 10 دقائق. لا تشاركه أحداً.`;
    return this.send(phone, body);
  }

  async sendBookingConfirmation(phone: string, bookingCode: string): Promise<boolean> {
    const body = `✅ تم تأكيد حجزك ${bookingCode} في Bookly. شكراً لاختيارك منصّتنا!`;
    return this.send(phone, body);
  }

  async sendCancellation(phone: string, bookingCode: string, refundAmount?: number): Promise<boolean> {
    const refundText = refundAmount ? ` — تم استرداد ${refundAmount} إلى محفظتك` : '';
    const body = `تم إلغاء حجزك ${bookingCode}${refundText}. Bookly`;
    return this.send(phone, body);
  }

  async send(to: string, message: string): Promise<boolean> {
    if (!this.twilio) {
      this.logger.log(`[SMS-SKIP] to=${to} msg="${message}"`);
      return false;
    }
    try {
      await this.twilio.messages.create({ from: this.fromNumber, to, body: message });
      this.logger.log(`📱 SMS أُرسل إلى ${to}`);
      return true;
    } catch (e) {
      this.logger.error(`فشل إرسال SMS إلى ${to}: ${e}`);
      return false;
    }
  }
}
