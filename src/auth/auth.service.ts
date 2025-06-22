import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Usuario } from '../../generated/prisma';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<Omit<Usuario, 'password'>> {
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.usuario.create({
      data: { email: dto.email, password: hashed, rol: dto.rol, fullName: dto.fullName },
      select: { id: true, email: true, rol: true, fullName: true, createdAt: true, updatedAt: true },
    });
    return user;
  }

  async login(dto: LoginDto, deviceInfo?: string, ipAddress?: string): Promise<{ 
    access_token: string; 
    refresh_token: string;
    expires_in: number;
  }> {
    const user = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
    console.log(user)
    if (!user) throw new UnauthorizedException('Credenciales inválidas');
    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');

    // Generate refresh token
    const refreshToken = crypto.randomBytes(64).toString('hex');
    
    // Set expiration times
    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 7); // 7 days
    
    const accessTokenExpiresIn = 15 * 60; // 15 minutes in seconds

    // Clean up old sessions for this user (keep only 5 most recent)
    await this.cleanupOldSessions(user.id);

    // Create new session
    await this.prisma.session.create({
      data: {
        usuarioId: user.id,
        refreshToken: refreshToken,
        deviceInfo: deviceInfo || 'Unknown Device',
        ipAddress: ipAddress || 'Unknown IP',
        expiresAt: refreshTokenExpiresAt,
        isActive: true,
      }
    });

    // Generate short-lived access token with session info
    const payload = { 
      sub: user.id, 
      role: user.rol, 
      email: user.email, 
      fullName: user.fullName,
      sessionToken: refreshToken.substring(0, 16), // First 16 chars for session identification
    };
    
    console.log('Payload:', payload);
    
    return { 
      access_token: this.jwt.sign(payload, { expiresIn: '15m' }),
      refresh_token: refreshToken,
      expires_in: accessTokenExpiresIn
    };
  }

  async refreshToken(refreshToken: string): Promise<{ 
    access_token: string; 
    refresh_token: string;
    expires_in: number;
  }> {
    // Find active session with this refresh token
    const session = await this.prisma.session.findFirst({
      where: {
        refreshToken,
        isActive: true,
        expiresAt: {
          gt: new Date() // Not expired
        }
      },
      include: {
        usuario: true
      }
    });

    if (!session) {
      throw new UnauthorizedException('Token de refresco inválido o expirado');
    }

    // Generate new refresh token
    const newRefreshToken = crypto.randomBytes(64).toString('hex');
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7); // 7 days

    // Update session with new refresh token
    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        refreshToken: newRefreshToken,
        expiresAt: newExpiresAt,
        lastUsedAt: new Date()
      }
    });

    // Generate new access token
    const payload = {
      sub: session.usuario.id,
      role: session.usuario.rol,
      email: session.usuario.email,
      fullName: session.usuario.fullName,
      sessionToken: newRefreshToken.substring(0, 16),
    };

    const accessTokenExpiresIn = 15 * 60; // 15 minutes

    return {
      access_token: this.jwt.sign(payload, { expiresIn: '15m' }),
      refresh_token: newRefreshToken,
      expires_in: accessTokenExpiresIn
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { refreshToken },
      data: { isActive: false }
    });
  }

  async logoutAllSessions(userId: number): Promise<void> {
    await this.prisma.session.updateMany({
      where: { usuarioId: userId },
      data: { isActive: false }
    });
  }

  async validateSession(refreshTokenPrefix: string, userId: number): Promise<boolean> {
    const session = await this.prisma.session.findFirst({
      where: {
        usuarioId: userId,
        refreshToken: {
          startsWith: refreshTokenPrefix
        },
        isActive: true,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    return !!session;
  }

  private async cleanupOldSessions(userId: number): Promise<void> {
    // Keep only the 5 most recent sessions, deactivate older ones
    const sessions = await this.prisma.session.findMany({
      where: { usuarioId: userId, isActive: true },
      orderBy: { createdAt: 'desc' },
      skip: 5
    });

    if (sessions.length > 0) {
      await this.prisma.session.updateMany({
        where: {
          id: { in: sessions.map(s => s.id) }
        },
        data: { isActive: false }
      });
    }

    // Also clean up expired sessions
    await this.prisma.session.updateMany({
      where: {
        expiresAt: { lt: new Date() }
      },
      data: { isActive: false }
    });
  }
}
