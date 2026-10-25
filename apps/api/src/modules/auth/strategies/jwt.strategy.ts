import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../common/decorators/current-user.decorator';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_ACCESS_SECRET', 'dev_secret'),
    });
  }

  async validate(payload: { sub: string; email: string; role: string }): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        locale: true,
        preferredCurrency: true,
        status: true,
      },
    });

    if (!user || user.status === 'SUSPENDED' || user.status === 'DELETED') {
      throw new Error('الحساب غير متاح');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      locale: user.locale,
      preferredCurrency: user.preferredCurrency,
    };
  }
}
