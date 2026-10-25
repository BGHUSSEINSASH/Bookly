import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    this.init();
  }

  private init() {
    const host = this.config.get<string>('SMTP_HOST');
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    if (!host || !user || !pass) {
      this.logger.warn('SMTP غير مهيأ — سيُطبع OTP في السجلات فقط');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port: this.config.get<number>('SMTP_PORT', 587),
      secure: this.config.get<string>('SMTP_SECURE', 'false') === 'true',
      auth: { user, pass },
    });

    this.transporter.verify((err) => {
      if (err) this.logger.error(`SMTP verify failed: ${err.message}`);
      else this.logger.log('✅ SMTP جاهز للإرسال');
    });
  }

  async send(options: MailOptions): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn(`[MAIL-SKIP] to=${options.to} subject="${options.subject}"`);
      return false;
    }
    try {
      await this.transporter.sendMail({
        from: `"${this.config.get('MAIL_FROM_NAME', 'Bookly')}" <${this.config.get('MAIL_FROM', this.config.get('SMTP_USER'))}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      this.logger.log(`📧 إيميل أُرسل إلى ${options.to}`);
      return true;
    } catch (e) {
      this.logger.error(`فشل إرسال الإيميل إلى ${options.to}: ${e}`);
      return false;
    }
  }

  /** إرسال رمز OTP */
  async sendOtp(to: string, fullName: string, code: string, purpose: 'VERIFY_EMAIL' | 'RESET_PASSWORD') {
    const isReset = purpose === 'RESET_PASSWORD';
    const subject = isReset ? 'إعادة تعيين كلمة المرور — Bookly' : 'تأكيد بريدك الإلكتروني — Bookly';
    const title = isReset ? 'إعادة تعيين كلمة المرور' : 'تأكيد البريد الإلكتروني';
    const description = isReset
      ? 'استخدم الرمز التالي لإعادة تعيين كلمة مرورك. الرمز صالح لمدة 10 دقائق.'
      : 'استخدم الرمز التالي لتأكيد بريدك الإلكتروني. الرمز صالح لمدة 10 دقائق.';

    const html = this.otpTemplate({ fullName, code, title, description });
    return this.send({ to, subject, html });
  }

  /** إرسال تأكيد الحجز */
  async sendBookingConfirmation(to: string, fullName: string, bookingCode: string, details: {
    propertyTitle: string;
    checkIn: string;
    checkOut: string;
    total: number;
    currency: string;
  }) {
    const html = this.bookingTemplate({ fullName, bookingCode, ...details });
    return this.send({
      to,
      subject: `تأكيد حجزك ${bookingCode} — Bookly`,
      html,
    });
  }

  /** إرسال إشعار إلغاء */
  async sendCancellation(to: string, fullName: string, bookingCode: string, refundAmount: number, currency: string) {
    const html = this.cancellationTemplate({ fullName, bookingCode, refundAmount, currency });
    return this.send({
      to,
      subject: `تم إلغاء حجزك ${bookingCode} — Bookly`,
      html,
    });
  }

  // ─── القوالب ───

  private baseTemplate(content: string) {
    return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Bookly</title>
  <style>
    body{font-family:'Segoe UI',Tahoma,Arial,sans-serif;background:#f4f4f4;margin:0;padding:0;direction:rtl}
    .wrapper{max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)}
    .header{background:#0ea5e9;padding:32px 24px;text-align:center}
    .header h1{color:#fff;margin:0;font-size:28px;letter-spacing:-0.5px}
    .header p{color:rgba(255,255,255,.85);margin:6px 0 0;font-size:14px}
    .body{padding:32px 24px}
    .otp-box{background:#f0f9ff;border:2px dashed #0ea5e9;border-radius:10px;text-align:center;padding:20px;margin:24px 0}
    .otp-code{font-size:42px;font-weight:700;color:#0ea5e9;letter-spacing:8px;display:block;font-family:monospace}
    .info-row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f0f0f0}
    .info-label{color:#64748b;font-size:14px}
    .info-value{color:#1e293b;font-weight:600;font-size:14px}
    .btn{display:inline-block;background:#0ea5e9;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:20px}
    .footer{background:#f8fafc;padding:20px 24px;text-align:center;color:#94a3b8;font-size:12px}
    .warning{background:#fef3c7;border-right:4px solid #f59e0b;padding:12px 16px;border-radius:6px;font-size:13px;color:#92400e;margin-top:16px}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🏨 Bookly</h1>
      <p>منصة الحجز الأولى في العراق</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>© 2026 Bookly — جميع الحقوق محفوظة</p>
      <p>بغداد، العراق | <a href="https://bookly.app" style="color:#0ea5e9">bookly.app</a></p>
    </div>
  </div>
</body>
</html>`;
  }

  private otpTemplate(p: { fullName: string; code: string; title: string; description: string }) {
    return this.baseTemplate(`
      <p style="font-size:18px;font-weight:600;color:#1e293b">مرحباً ${p.fullName} 👋</p>
      <h2 style="color:#1e293b;margin:0 0 8px">${p.title}</h2>
      <p style="color:#64748b">${p.description}</p>
      <div class="otp-box">
        <span class="otp-code">${p.code}</span>
      </div>
      <div class="warning">⚠️ لا تشارك هذا الرمز مع أي شخص. فريق Bookly لن يطلب منك هذا الرمز أبداً.</div>
    `);
  }

  private bookingTemplate(p: {
    fullName: string;
    bookingCode: string;
    propertyTitle: string;
    checkIn: string;
    checkOut: string;
    total: number;
    currency: string;
  }) {
    return this.baseTemplate(`
      <p style="font-size:18px;font-weight:600;color:#1e293b">مرحباً ${p.fullName} 👋</p>
      <h2 style="color:#16a34a">✅ تم تأكيد حجزك!</h2>
      <p style="color:#64748b">يسعدنا إعلامك بتأكيد حجزك. إليك تفاصيل الحجز:</p>
      <div style="background:#f8fafc;border-radius:10px;padding:20px;margin:20px 0">
        <div class="info-row"><span class="info-label">رمز الحجز</span><span class="info-value" style="color:#0ea5e9;font-size:16px">${p.bookingCode}</span></div>
        <div class="info-row"><span class="info-label">الوجهة</span><span class="info-value">${p.propertyTitle}</span></div>
        <div class="info-row"><span class="info-label">تاريخ الوصول</span><span class="info-value">${p.checkIn}</span></div>
        <div class="info-row"><span class="info-label">تاريخ المغادرة</span><span class="info-value">${p.checkOut}</span></div>
        <div class="info-row" style="border-bottom:none"><span class="info-label">المبلغ الإجمالي</span><span class="info-value" style="font-size:18px;color:#0ea5e9">${p.total.toLocaleString()} ${p.currency}</span></div>
      </div>
      <p style="color:#64748b;font-size:14px">يمكنك إدارة حجزك من تطبيق Bookly أو الموقع الرسمي. نتمنى لك رحلة ممتعة! ✈️</p>
    `);
  }

  private cancellationTemplate(p: {
    fullName: string;
    bookingCode: string;
    refundAmount: number;
    currency: string;
  }) {
    return this.baseTemplate(`
      <p style="font-size:18px;font-weight:600;color:#1e293b">مرحباً ${p.fullName}</p>
      <h2 style="color:#dc2626">تم إلغاء حجزك ${p.bookingCode}</h2>
      ${p.refundAmount > 0
        ? `<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:20px;margin:20px 0">
             <p style="color:#16a34a;font-weight:600;margin:0">💰 تم استرداد ${p.refundAmount.toLocaleString()} ${p.currency} إلى محفظتك على Bookly</p>
           </div>`
        : `<p style="color:#64748b">لم يتم استرداد أي مبلغ وفقاً لسياسة الإلغاء.</p>`
      }
      <p style="color:#64748b;font-size:14px">نأمل أن نراك مجدداً قريباً. تفضّل باستكشاف وجهات أخرى في تطبيق Bookly.</p>
    `);
  }
}
