import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Injectable()
export class ProductoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateProductoDto) {
    return this.prisma.producto.create({
      data: {
        codigoBarras: createDto.codigoBarras,
        nombre: createDto.nombre,
        precioCosto: createDto.precioCosto,
        precioVenta: createDto.precioVenta,
        precioEspecial: createDto.precioEspecial,
        stock: createDto.stock,
        categoria: { connect: { id: createDto.categoriaId } },
        proveedor: { connect: { id: createDto.proveedorId } },
      },
      include: {
        categoria: true,
        proveedor: true,
      },
    });
  }

  async findAll() {
    return this.prisma.producto.findMany({
      include: {
        categoria: true,
        proveedor: true,
      },
    });
  }

  async findOne(id: number) {
    const producto = await this.prisma.producto.findUnique({
      where: { id },
      include: {
        categoria: true,
        proveedor: true,
      },
    });
    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return producto;
  }

  async update(id: number, updateDto: UpdateProductoDto) {
    await this.findOne(id);
    return this.prisma.producto.update({
      where: { id },
      data: {
        codigoBarras: updateDto.codigoBarras,
        nombre: updateDto.nombre,
        precioCosto: updateDto.precioCosto,
        precioVenta: updateDto.precioVenta,
        precioEspecial: updateDto.precioEspecial,
        stock: updateDto.stock,
        ...(updateDto.categoriaId && {
          categoria: { connect: { id: updateDto.categoriaId } },
        }),
        ...(updateDto.proveedorId && {
          proveedor: { connect: { id: updateDto.proveedorId } },
        }),
      },
      include: {
        categoria: true,
        proveedor: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.producto.delete({
      where: { id },
    });
  }
}
