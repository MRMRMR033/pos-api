// src/producto/producto.service.ts

import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { AdjustStockDto, StockAdjustmentType } from './dto/adjust-stock.dto';
import { Producto, Categoria, Proveedor, MovimientoTipo } from '../../generated/prisma';

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

  async adjustStock(id: number, dto: AdjustStockDto): Promise<ProductoConRelaciones> {
    // Verificar que el producto existe
    const producto = await this.findOne(id);
    
    let nuevoStock: number;
    let movimientoTipo: MovimientoTipo;
    let cantidadMovimiento: number;
    
    // Calcular el nuevo stock según el tipo de ajuste
    switch (dto.tipo) {
      case StockAdjustmentType.ENTRADA:
        nuevoStock = producto.stock + dto.cantidad;
        movimientoTipo = MovimientoTipo.IN;
        cantidadMovimiento = dto.cantidad;
        break;
        
      case StockAdjustmentType.SALIDA:
        if (producto.stock < dto.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente. Stock actual: ${producto.stock}, cantidad solicitada: ${dto.cantidad}`
          );
        }
        nuevoStock = producto.stock - dto.cantidad;
        movimientoTipo = MovimientoTipo.OUT;
        cantidadMovimiento = dto.cantidad;
        break;
        
      case StockAdjustmentType.AJUSTE:
        if (dto.cantidad < 0) {
          throw new BadRequestException('El stock no puede ser negativo');
        }
        cantidadMovimiento = Math.abs(dto.cantidad - producto.stock);
        movimientoTipo = dto.cantidad > producto.stock ? MovimientoTipo.IN : MovimientoTipo.OUT;
        nuevoStock = dto.cantidad;
        break;
        
      default:
        throw new BadRequestException('Tipo de ajuste inválido');
    }

    // Realizar la transacción
    return this.prisma.$transaction(async (tx) => {
      // Actualizar el stock del producto
      const productoActualizado = await tx.producto.update({
        where: { id },
        data: { stock: nuevoStock },
        include: { categoria: true, proveedor: true }
      });

      // Crear el registro del movimiento de stock
      await tx.stockMovement.create({
        data: {
          productoId: id,
          tipo: movimientoTipo,
          cantidad: cantidadMovimiento,
          motivo: dto.motivo || `Ajuste manual de inventario (${dto.tipo})`,
          usuarioId: 1, // TODO: Obtener del contexto de autenticación
        }
      });

      return productoActualizado;
    });
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.prisma.producto.delete({ where: { id } });
  }
}
