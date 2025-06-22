import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
import { Usuario } from '../../generated/prisma';

export interface JwtPayload {
  sub: number;
  role: string;
  email: string;
  fullName: string;
  sessionToken: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'secretKey',
    });
  }

  async validate(payload: JwtPayload): Promise<Omit<Usuario, 'password'>> {
    const user = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, rol: true, fullName: true, createdAt: true, updatedAt: true },
    });
    
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Validate session is still active
    const activeSession = await this.prisma.session.findFirst({
      where: {
        usuarioId: user.id,
        refreshToken: {
          startsWith: payload.sessionToken // sessionToken is first 16 chars
        },
        isActive: true,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (!activeSession) {
      throw new UnauthorizedException('Sesión inválida o expirada');
    }

    // Update last used timestamp
    await this.prisma.session.update({
      where: { id: activeSession.id },
      data: { lastUsedAt: new Date() }
    });

    return user;
  }
}
