// src/usuario/usuario.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
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
   * @param dto Datos para crear el usuario.
   * @returns Usuario sin la contraseña.
   */
  async create(dto: CreateUsuarioDto): Promise<Omit<Usuario, 'password'>> {
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.usuario.create({
      data: {
        fullName: dto.fullName, // Assuming 'fullName' is the correct property in the Prisma schema
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
  }

  /**
   * Obtiene todos los usuarios (excluyendo contraseñas).
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
   * Busca un usuario por ID.
   * @throws NotFoundException si no existe.
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
   * @throws NotFoundException si no existe.
   */
  async update(
    id: number,
    dto: UpdateUsuarioDto,
  ): Promise<Omit<Usuario, 'password'>> {
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }
    await this.findOne(id);
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
  }
  async remove(id: number): Promise<void> {
    await this.findOne(id); // Verifica si el usuario existe
    await this.prisma.usuario.delete({
      where: { id },
    });
  } 
}