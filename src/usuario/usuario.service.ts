// src/usuario/usuario.service.ts

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from '../../generated/prisma';

@Injectable()
export class UsuarioService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea un nuevo usuario con contraseña encriptada.
   * Captura conflicto si el email ya existe.
   */
  async create(dto: CreateUsuarioDto): Promise<Omit<Usuario, 'password'>> {
    const hashed = await bcrypt.hash(dto.password, 10);
    try {
      const user = await this.prisma.usuario.create({
        data: {
          fullName: dto.fullName,
          email: dto.email,
          password: hashed,
          rol: dto.rol,
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          rol: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return user;
    } catch (e: any) {
      // Prisma unique constraint violation code
      if (e.code === 'P2002' && e.meta?.target?.includes('email')) {
        throw new ConflictException('El email proporcionado ya está registrado');
      }
      throw e;
    }
  }

  /**
   * Obtiene todos los usuarios (sin exponer contraseñas).
   */
  async findAll(): Promise<Omit<Usuario, 'password'>[]> {
    return this.prisma.usuario.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        rol: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Busca un usuario por su ID.
   * Lanza NotFoundException si no existe.
   */
  async findOne(id: number): Promise<Omit<Usuario, 'password'>> {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        rol: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return user;
  }

  /**
   * Actualiza un usuario; encripta la contraseña si se provee.
   * Lanza NotFoundException si no existe y ConflictException si email ya está en uso.
   */
  async update(
    id: number,
    dto: UpdateUsuarioDto,
  ): Promise<Omit<Usuario, 'password'>> {
    // Verificar existencia
    await this.findOne(id);

    // Encriptar nueva contraseña si se proporcionó
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    try {
      const updated = await this.prisma.usuario.update({
        where: { id },
        data: { ...dto },
        select: {
          id: true,
          fullName: true,
          email: true,
          rol: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return updated;
    } catch (e: any) {
      if (e.code === 'P2002' && e.meta?.target?.includes('email')) {
        throw new ConflictException('El email proporcionado ya está registrado');
      }
      throw e;
    }
  }

  /**
   * Elimina un usuario.
   * Lanza NotFoundException si no existe.
   */
  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.prisma.usuario.delete({ where: { id } });
  }
}
