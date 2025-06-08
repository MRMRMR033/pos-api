// src/producto/producto.service.ts

import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { Producto, Categoria, Proveedor } from '../../generated/prisma';

export type ProductoConRelaciones = Producto & {
  categoria: Categoria;
  proveedor: Proveedor;
};

@Injectable()
export class ProductoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateProductoDto): Promise<ProductoConRelaciones> {
    try {
      return await this.prisma.producto.create({
        data: {
          codigoBarras: createDto.codigoBarras,
          nombre: createDto.nombre,
          precioCosto: createDto.precioCosto,
          precioVenta: createDto.precioVenta,
          precioEspecial: createDto.precioEspecial,
          stock: createDto.stock,
          categoriaId: createDto.categoriaId,
          proveedorId: createDto.proveedorId,
        },
        include: { categoria: true, proveedor: true },
      });
    } catch (e: any) {
      if (e.code === 'P2002' && e.meta?.target?.includes('codigoBarras')) {
        throw new ConflictException(`El código de barras '${createDto.codigoBarras}' ya está registrado`);
      }
      throw new BadRequestException('No se pudo crear el producto');
    }
  }

  async findAll(): Promise<ProductoConRelaciones[]> {
    return this.prisma.producto.findMany({
      include: { categoria: true, proveedor: true },
    });
  }

  async findOne(id: number): Promise<ProductoConRelaciones> {
    const producto = await this.prisma.producto.findUnique({
      where: { id },
      include: { categoria: true, proveedor: true },
    });
    if (!producto) throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    return producto;
  }

  async update(id: number, updateDto: UpdateProductoDto): Promise<ProductoConRelaciones> {
    await this.findOne(id);
    try {
      return await this.prisma.producto.update({
        where: { id },
        data: {
          ...(updateDto.codigoBarras    !== undefined && { codigoBarras: updateDto.codigoBarras }),
          ...(updateDto.nombre          !== undefined && { nombre: updateDto.nombre }),
          ...(updateDto.precioCosto     !== undefined && { precioCosto: updateDto.precioCosto }),
          ...(updateDto.precioVenta     !== undefined && { precioVenta: updateDto.precioVenta }),
          ...(updateDto.precioEspecial  !== undefined && { precioEspecial: updateDto.precioEspecial }),
          ...(updateDto.stock           !== undefined && { stock: updateDto.stock }),
          ...(updateDto.categoriaId     !== undefined && { categoriaId: updateDto.categoriaId }),
          ...(updateDto.proveedorId     !== undefined && { proveedorId: updateDto.proveedorId }),
        },
        include: { categoria: true, proveedor: true },
      });
    } catch (e: any) {
      if (e.code === 'P2002' && e.meta?.target?.includes('codigoBarras')) {
        throw new ConflictException(`El código de barras '${updateDto.codigoBarras}' ya está en uso`);
      }
      throw new BadRequestException('No se pudo actualizar el producto');
    }
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.prisma.producto.delete({ where: { id } });
  }
}
