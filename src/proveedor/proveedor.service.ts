import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
// Importa el tipo Proveedor desde tu cliente Prisma generado
import { Proveedor } from '../../generated/prisma';

@Injectable()
export class ProveedorService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea un nuevo proveedor.
   * @param dto CreateProveedorDto
   * @returns Promise<Proveedor>
   */
  async create(dto: CreateProveedorDto): Promise<Proveedor> {
    return this.prisma.proveedor.create({ data: dto });
  }

  /**
   * Obtiene todos los proveedores.
   * @returns Promise<Proveedor[]>
   */
  async findAll(): Promise<Proveedor[]> {
    return this.prisma.proveedor.findMany();
  }

  /**
   * Obtiene un proveedor por su ID.
   * @param id número de ID del proveedor
   * @throws NotFoundException si no existe
   * @returns Promise<Proveedor>
   */
  async findOne(id: number): Promise<Proveedor> {
    const proveedor = await this.prisma.proveedor.findUnique({ where: { id } });
    if (!proveedor) {
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
    }
    return proveedor;
  }

  /**
   * Actualiza un proveedor existente.
   * @param id número de ID del proveedor
   * @param dto UpdateProveedorDto
   * @throws NotFoundException si no existe
   * @returns Promise<Proveedor>
   */
  async update(id: number, dto: UpdateProveedorDto): Promise<Proveedor> {
    await this.findOne(id);
    return this.prisma.proveedor.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Elimina un proveedor.
   * @param id número de ID del proveedor
   * @throws NotFoundException si no existe
   * @returns Promise<Proveedor>
   */
  async remove(id: number): Promise<Proveedor> {
    await this.findOne(id);
    return this.prisma.proveedor.delete({ where: { id } });
  }
}
