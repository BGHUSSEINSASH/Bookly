import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { randomOtp, randomToken } from '../../common/utils/code-generator';
import * as bcrypt from 'bcryptjs';
import { MailService } from '../mail/mail.service';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, ...(dto.phone ? [{ phone: dto.phone }] : [])] },
    });
    if (existing) {
      throw new ConflictException('البريد الإلكتروني أو رقم الهاتف مسجّل مسبقًا');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase().trim(),
        phone: dto.phone,
        fullName: dto.fullName.trim(),
        passwordHash,
        locale: dto.locale ?? 'ar',
        preferredCurrency: dto.preferredCurrency ?? 'IQD',
        wallet: { create: { currency: dto.preferredCurrency ?? 'IQD' } },
      },
      select: this.publicUserSelect,
    });

    await this.createOtp(user.id, 'VERIFY_EMAIL');
    const tokens = await this.issueTokens(user.id, user.email, user.role);
    return { user, ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase().trim() } });
    if (!user) throw new UnauthorizedException('بيانات الدخول غير صحيحة');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('بيانات الدخول غير صحيحة');
    if (user.status === 'SUSPENDED') throw new UnauthorizedException('تم إيقاف الحساب، تواصل مع الدعم');
    if (user.status === 'DELETED') throw new UnauthorizedException('الحساب غير موجود');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.issueTokens(user.id, user.email, user.role);
    return { user: this.toPublic(user), ...tokens };
  }

  async refresh(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('جلسة منتهية، الرجاء تسجيل الدخول مجددًا');
    }
    if (stored.user.status !== 'ACTIVE' && stored.user.status !== 'PENDING_VERIFICATION') {
      throw new UnauthorizedException('الحساب غير متاح');
    }

    // تدوير الرمز (token rotation)
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const tokens = await this.issueTokens(stored.user.id, stored.user.email, stored.user.role);
    return { user: this.toPublic(stored.user), ...tokens };
  }

  async logout(refreshToken: string, userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, tokenHash: this.hashToken(refreshToken) },
      data: { revokedAt: new Date() },
    });
    return { message: 'تم تسجيل الخروج بنجاح' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    // نُرجع نفس الرسالة سواء وُجد الحساب أم لا لمنع تسريب المعلومات
    if (user) await this.createOtp(user.id, 'RESET_PASSWORD');
    return { message: 'إذا كان البريد مسجّلًا فسيصلك رمز إعادة التعيين' };
  }

  async resetPassword(code: string, password: string) {
    const otp = await this.prisma.otpCode.findFirst({
      where: { code, purpose: 'RESET_PASSWORD', consumedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    if (!otp) throw new BadRequestException('الرمز غير صالح أو منتهي الصلاحية');

    const passwordHash = await bcrypt.hash(password, 12);
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: otp.userId }, data: { passwordHash } }),
      this.prisma.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } }),
      this.prisma.refreshToken.updateMany({
        where: { userId: otp.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
    return { message: 'تم تغيير كلمة المرور بنجاح' };
  }

  async changePassword(userId: string, currentPassword: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) throw new BadRequestException('كلمة المرور الحالية غير صحيحة');

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await bcrypt.hash(password, 12) },
    });
    return { message: 'تم تغيير كلمة المرور بنجاح' };
  }

  private async createOtp(userId: string, purpose: string) {
    const code = randomOtp();
    await this.prisma.otpCode.create({
      data: {
        userId,
        code,
        purpose,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });
    this.logger.log(`[OTP] ${purpose} → user=${userId} code=${code}`);

    // إرسال الإيميل تلقائياً
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, fullName: true },
      });
      if (user) {
        await this.mail.sendOtp(
          user.email,
          user.fullName,
          code,
          purpose as 'VERIFY_EMAIL' | 'RESET_PASSWORD',
        );
      }
    } catch (e) {
      this.logger.warn(`تعذّر إرسال OTP بالبريد: ${e}`);
    }

    return code;
  }

  private async issueTokens(userId: string, email: string, role: string): Promise<AuthTokens> {
    const accessTtl = this.config.get<string>('JWT_ACCESS_TTL', '15m');
    const refreshTtl = this.config.get<string>('JWT_REFRESH_TTL', '30d');

    const accessToken = await this.jwt.signAsync(
      { sub: userId, email, role },
      { secret: this.config.get<string>('JWT_ACCESS_SECRET'), expiresIn: accessTtl as any },
    );

    const refreshToken = randomToken(48);
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hashToken(refreshToken),
        expiresAt: new Date(Date.now() + this.parseDuration(refreshTtl)),
      },
    });

    return { accessToken, refreshToken, expiresIn: accessTtl };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private parseDuration(duration: string): number {
    const match = /^(\d+)([smhd])$/.exec(duration);
    if (!match) return 30 * 24 * 60 * 60 * 1000;
    const value = Number(match[1]);
    const unit = match[2];
    const ms = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[unit as 's' | 'm' | 'h' | 'd'];
    return value * ms;
  }

  private toPublic(user: any) {
    const { passwordHash, ...rest } = user;
    void passwordHash;
    return rest;
  }

  private readonly publicUserSelect = {
    id: true,
    email: true,
    phone: true,
    fullName: true,
    avatarUrl: true,
    role: true,
    status: true,
    locale: true,
    preferredCurrency: true,
    loyaltyPoints: true,
    tier: true,
    createdAt: true,
  } as const;
}
