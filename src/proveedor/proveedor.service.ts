// src/proveedor/proveedor.service.ts

import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { Proveedor } from '../../generated/prisma';

@Injectable()
export class ProveedorService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea un nuevo proveedor.
   * @throws ConflictException si ya existe un proveedor con el mismo nombre.
   * @throws BadRequestException si ocurre otro error.
   */
  async create(dto: CreateProveedorDto): Promise<Proveedor> {
    try {
      return await this.prisma.proveedor.create({ data: dto });
    } catch (e: any) {
      if (e.code === 'P2002' && e.meta?.target?.includes('nombre')) {
        throw new ConflictException(
          `Ya existe un proveedor con el nombre '${dto.nombre}'`,
        );
      }
      throw new BadRequestException('No se pudo crear el proveedor');
    }
  }

  /**
   * Obtiene todos los proveedores.
   */
  async findAll(): Promise<Proveedor[]> {
    return this.prisma.proveedor.findMany();
  }

  /**
   * Obtiene un proveedor por su ID.
   * @throws NotFoundException si no existe.
   */
  async findOne(id: number): Promise<Proveedor> {
    const proveedor = await this.prisma.proveedor.findUnique({
      where: { id },
    });
    if (!proveedor) {
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
    }
    return proveedor;
  }

  /**
   * Actualiza un proveedor existente.
   * @throws NotFoundException si no existe.
   * @throws ConflictException si el nuevo nombre ya está en uso.
   * @throws BadRequestException si ocurre otro error.
   */
  async update(
    id: number,
    dto: UpdateProveedorDto,
  ): Promise<Proveedor> {
    await this.findOne(id);
    try {
      return await this.prisma.proveedor.update({
        where: { id },
        data: dto,
      });
    } catch (e: any) {
      if (e.code === 'P2002' && e.meta?.target?.includes('nombre')) {
        throw new ConflictException(
          `Ya existe un proveedor con el nombre '${dto.nombre}'`,
        );
      }
      throw new BadRequestException('No se pudo actualizar el proveedor');
    }
  }

  /**
   * Elimina un proveedor.
   * @throws NotFoundException si no existe.
   */
  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.prisma.proveedor.delete({ where: { id } });
  }
}
