import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrdenCompraDto } from './dto/create-orden-compra.dto';
import { UpdateOrdenCompraDto } from './dto/update-orden-compra.dto';
import { RecibirCompraDto } from './dto/recibir-compra.dto';
import { EstadoOrden, MovimientoTipo } from '../../generated/prisma';

@Injectable()
export class CompraService {
  constructor(private prisma: PrismaService) {}

  async create(createOrdenCompraDto: CreateOrdenCompraDto, usuarioId: number) {
    const { detalles, ...ordenData } = createOrdenCompraDto;

    const subtotal = detalles.reduce((sum, detalle) => 
      sum + (detalle.cantidad * detalle.precioUnitario), 0
    );
    
    const impuestos = subtotal * 0.16;
    const total = subtotal + impuestos;

    return this.prisma.ordenCompra.create({
      data: {
        ...ordenData,
        usuarioId,
        subtotal,
        impuestos,
        total,
        fechaEntrega: ordenData.fechaEntrega ? new Date(ordenData.fechaEntrega) : null,
        detalles: {
          create: detalles.map(detalle => ({
            productoId: detalle.productoId,
            cantidad: detalle.cantidad,
            precioUnitario: detalle.precioUnitario,
            total: detalle.cantidad * detalle.precioUnitario,
          })),
        },
      },
      include: {
        detalles: {
          include: {
            producto: true,
          },
        },
        proveedor: true,
        usuario: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });
  }

  async findAll(page: number = 1, limit: number = 10, estado?: EstadoOrden) {
    const skip = (page - 1) * limit;
    
    const where = estado ? { estado } : {};
    
    const [ordenes, total] = await Promise.all([
      this.prisma.ordenCompra.findMany({
        where,
        skip,
        take: limit,
        include: {
          detalles: {
            include: {
              producto: true,
            },
          },
          proveedor: true,
          usuario: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.ordenCompra.count({ where }),
    ]);

    return {
      data: ordenes,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const orden = await this.prisma.ordenCompra.findUnique({
      where: { id },
      include: {
        detalles: {
          include: {
            producto: true,
          },
        },
        proveedor: true,
        usuario: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    if (!orden) {
      throw new NotFoundException(`Orden de compra con ID ${id} no encontrada`);
    }

    return orden;
  }

  async update(id: number, updateOrdenCompraDto: UpdateOrdenCompraDto) {
    const orden = await this.findOne(id);
    
    if (orden.estado !== EstadoOrden.PENDIENTE) {
      throw new BadRequestException('Solo se pueden editar órdenes pendientes');
    }

    const { detalles, ...ordenData } = updateOrdenCompraDto;

    let updatedData: any = {
      ...ordenData,
    };

    if (ordenData.fechaEntrega) {
      updatedData.fechaEntrega = new Date(ordenData.fechaEntrega);
    }

    if (detalles) {
      await this.prisma.detalleOrdenCompra.deleteMany({
        where: { ordenCompraId: id },
      });

      const subtotal = detalles.reduce((sum, detalle) => 
        sum + (detalle.cantidad * detalle.precioUnitario), 0
      );
      
      const impuestos = subtotal * 0.16;
      const total = subtotal + impuestos;

      updatedData = {
        ...updatedData,
        subtotal,
        impuestos,
        total,
        detalles: {
          create: detalles.map(detalle => ({
            productoId: detalle.productoId,
            cantidad: detalle.cantidad,
            precioUnitario: detalle.precioUnitario,
            total: detalle.cantidad * detalle.precioUnitario,
          })),
        },
      };
    }

    return this.prisma.ordenCompra.update({
      where: { id },
      data: updatedData,
      include: {
        detalles: {
          include: {
            producto: true,
          },
        },
        proveedor: true,
        usuario: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    const orden = await this.findOne(id);
    
    if (orden.estado !== EstadoOrden.PENDIENTE) {
      throw new BadRequestException('Solo se pueden eliminar órdenes pendientes');
    }

    return this.prisma.ordenCompra.delete({
      where: { id },
    });
  }

  async recibir(id: number, recibirCompraDto: RecibirCompraDto, usuarioId: number) {
    const orden = await this.findOne(id);
    
    if (orden.estado !== EstadoOrden.PENDIENTE) {
      throw new BadRequestException('Solo se pueden recibir órdenes pendientes');
    }

    return this.prisma.$transaction(async (tx) => {
      for (const detalle of recibirCompraDto.detalles) {
        const detalleOrden = orden.detalles.find(d => d.id === detalle.detalleId);
        
        if (!detalleOrden) {
          throw new BadRequestException(`Detalle con ID ${detalle.detalleId} no encontrado`);
        }

        if (detalle.cantidadRecibida > detalleOrden.cantidad) {
          throw new BadRequestException(
            `Cantidad recibida (${detalle.cantidadRecibida}) no puede ser mayor a la ordenada (${detalleOrden.cantidad})`
          );
        }

        await tx.producto.update({
          where: { id: detalleOrden.productoId },
          data: {
            stock: {
              increment: detalle.cantidadRecibida,
            },
          },
        });

        await tx.stockMovement.create({
          data: {
            productoId: detalleOrden.productoId,
            tipo: MovimientoTipo.IN,
            cantidad: detalle.cantidadRecibida,
            motivo: `Recepción de orden de compra #${orden.numeroOrden}`,
            usuarioId,
          },
        });
      }

      const ordenActualizada = await tx.ordenCompra.update({
        where: { id },
        data: {
          estado: EstadoOrden.RECIBIDA,
          fechaEntrega: new Date(),
          observaciones: recibirCompraDto.observaciones 
            ? `${orden.observaciones || ''}\n[RECEPCIÓN] ${recibirCompraDto.observaciones}`.trim()
            : orden.observaciones,
        },
        include: {
          detalles: {
            include: {
              producto: true,
            },
          },
          proveedor: true,
          usuario: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      });

      return ordenActualizada;
    });
  }

  async findByProveedor(proveedorId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [ordenes, total] = await Promise.all([
      this.prisma.ordenCompra.findMany({
        where: { proveedorId },
        skip,
        take: limit,
        include: {
          detalles: {
            include: {
              producto: true,
            },
          },
          proveedor: true,
          usuario: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.ordenCompra.count({ where: { proveedorId } }),
    ]);

    return {
      data: ordenes,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}