import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('المستخدم غير موثّق');

    const isSuperAdmin = user.role === UserRole.SUPER_ADMIN;
    const isAdmin = user.role === UserRole.ADMIN;
    if (isSuperAdmin || isAdmin) return true;

    if (!required.includes(user.role)) {
      throw new ForbiddenException('لا تملك صلاحية للوصول إلى هذا المورد');
    }
    return true;
  }
}
