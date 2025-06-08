// src/categoria/categoria.service.ts

import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { Categoria } from '../../generated/prisma';

@Injectable()
export class CategoriaService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea una nueva categoría.
   * @throws ConflictException si ya existe una categoría con el mismo nombre.
   * @throws BadRequestException si ocurre otro error.
   */
  async create(dto: CreateCategoriaDto): Promise<Categoria> {
    try {
      return await this.prisma.categoria.create({
        data: { nombre: dto.nombre },
      });
    } catch (e: any) {
      if (e.code === 'P2002' && e.meta?.target?.includes('nombre')) {
        throw new ConflictException(`La categoría '${dto.nombre}' ya existe`);
      }
      throw new BadRequestException('No se pudo crear la categoría');
    }
  }

  /**
   * Obtiene todas las categorías.
   */
  async findAll(): Promise<Categoria[]> {
    return this.prisma.categoria.findMany();
  }

  /**
   * Busca una categoría por su ID.
   * @throws NotFoundException si no existe.
   */
  async findOne(id: number): Promise<Categoria> {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id },
    });
    if (!categoria) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
    return categoria;
  }

  /**
   * Actualiza una categoría existente.
   * @throws NotFoundException si no existe.
   * @throws ConflictException si el nuevo nombre ya está en uso.
   * @throws BadRequestException si ocurre otro error.
   */
  async update(id: number, dto: UpdateCategoriaDto): Promise<Categoria> {
    await this.findOne(id);
    try {
      return await this.prisma.categoria.update({
        where: { id },
        data: { nombre: dto.nombre },
      });
    } catch (e: any) {
      if (e.code === 'P2002' && e.meta?.target?.includes('nombre')) {
        throw new ConflictException(`La categoría '${dto.nombre}' ya existe`);
      }
      throw new BadRequestException('No se pudo actualizar la categoría');
    }
  }

  /**
   * Elimina una categoría.
   * @throws NotFoundException si no existe.
   */
  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.prisma.categoria.delete({ where: { id } });
  }
}
