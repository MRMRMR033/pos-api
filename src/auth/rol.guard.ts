import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../auth/rol.decorator';
import { Rol } from '../../generated/prisma';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.get<Rol[]>(ROLES_KEY, ctx.getHandler())
      || this.reflector.get<Rol[]>(ROLES_KEY, ctx.getClass());
    if (!required) return true;           // no hay @Roles → permitido
    const { user } = ctx.switchToHttp().getRequest();
    return required.includes(user.rol);   // user.rol viene de JwtStrategy.validate
  }
}
