import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
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
      data: { email: dto.email, password: hashed, rol: dto.role, fullName: dto.fullName },
      select: { id: true, email: true, rol: true, fullName: true, createdAt: true, updatedAt: true },
    });
    return user;
  }

  async login(dto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Credenciales inválidas');
    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');

    const payload = { sub: user.id, role: user.rol };
    return { access_token: this.jwt.sign(payload) };
  }
}
