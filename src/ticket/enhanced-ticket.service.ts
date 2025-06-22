import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { CreateTicketItemDto } from '../ticket-item/dto/create-ticket-item.dto';
import { MovimientoTipo } from '../../generated/prisma';

export interface CreateEnhancedTicketDto {
  usuarioId: number;
  turnoCajaId?: number;
  fecha?: string;
  items: CreateTicketItemDto[];
  descuentoManual?: number;
  recargoManual?: number;
  observaciones?: string;
}

export interface TicketCalculation {
  subtotal: number;
  impuestos: number;
  descuentoTotal: number;
  total: number;
}

@Injectable()
export class EnhancedTicketService {
  constructor(private readonly prisma: PrismaService) {}

  private async calculateTicketTotals(items: CreateTicketItemDto[], descuentoManual: number = 0, recargoManual: number = 0): Promise<TicketCalculation> {
    let subtotal = 0;
    let impuestos = 0;
    let descuentoTotal = descuentoManual;

    for (const item of items) {
      const producto = await this.prisma.producto.findUnique({
        where: { id: item.productoId },
        include: {
          impuesto: true,
        },
      });

      if (!producto) {
        throw new BadRequestException(`Producto con ID ${item.productoId} no encontrado`);
      }

      const precioUnitario = item.precioUnitario || Number(producto.precioVenta);
      const cantidad = item.cantidad || 1;
      const descuentoItem = item.descuento || 0;
      
      const subtotalItem = (precioUnitario * cantidad) - descuentoItem;
      subtotal += subtotalItem;
      descuentoTotal += descuentoItem;

      if (producto.impuesto && producto.impuesto.activo) {
        const impuestoItem = subtotalItem * (Number(producto.impuesto.porcentaje) / 100);
        impuestos += impuestoItem;
      }
    }

    subtotal += recargoManual;
    const total = subtotal + impuestos - descuentoManual;

    return {
      subtotal,
      impuestos,
      descuentoTotal,
      total,
    };
  }

  async create(dto: CreateEnhancedTicketDto) {
    const date = dto.fecha ? new Date(dto.fecha) : new Date();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const last = await this.prisma.ticket.findFirst({
      where: {
        usuarioId: dto.usuarioId,
        fecha: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { numeroTicket: 'desc' },
    });
    const numeroTicket = last ? last.numeroTicket + 1 : 1;

    const calculations = await this.calculateTicketTotals(
      dto.items, 
      dto.descuentoManual, 
      dto.recargoManual
    );

    return this.prisma.$transaction(async (tx) => {
      for (const item of dto.items) {
        const producto = await tx.producto.findUnique({
          where: { id: item.productoId },
        });

        if (!producto) {
          throw new BadRequestException(`Producto con ID ${item.productoId} no encontrado`);
        }

        const cantidadVenta = item.cantidad || 1;
        if (producto.stock < cantidadVenta) {
          throw new BadRequestException(
            `Stock insuficiente para ${producto.nombre}. Stock disponible: ${producto.stock}, solicitado: ${cantidadVenta}`
          );
        }
      }

      const ticket = await tx.ticket.create({
        data: {
          usuarioId: dto.usuarioId,
          turnoCajaId: dto.turnoCajaId,
          numeroTicket,
          fecha: date,
          subtotal: calculations.subtotal,
          impuestos: calculations.impuestos,
          descuentoTotal: calculations.descuentoTotal,
          total: calculations.total,
        },
      });

      for (const item of dto.items) {
        const producto = await tx.producto.findUnique({
          where: { id: item.productoId },
          include: {
            impuesto: true,
          },
        });

        const precioUnitario = item.precioUnitario || Number(producto.precioVenta);
        const cantidad = item.cantidad || 1;
        const descuentoItem = item.descuento || 0;
        
        const subtotalItem = (precioUnitario * cantidad) - descuentoItem;
        let impuestoItem = 0;

        if (producto.impuesto && producto.impuesto.activo) {
          impuestoItem = subtotalItem * (Number(producto.impuesto.porcentaje) / 100);
        }

        const totalItem = subtotalItem + impuestoItem;

        await tx.ticketItem.create({
          data: {
            ticketId: ticket.id,
            productoId: item.productoId,
            cantidad,
            precioUnitario,
            descuento: descuentoItem,
            impuesto: impuestoItem,
            total: totalItem,
          },
        });

        await tx.producto.update({
          where: { id: item.productoId },
          data: {
            stock: {
              decrement: cantidad,
            },
          },
        });

        await tx.stockMovement.create({
          data: {
            productoId: item.productoId,
            tipo: MovimientoTipo.OUT,
            cantidad,
            motivo: `Venta - Ticket #${numeroTicket}`,
            usuarioId: dto.usuarioId,
          },
        });
      }

      // Buscar el ticket completo dentro de la misma transacción
      return await tx.ticket.findUnique({
        where: { id: ticket.id },
        include: {
          items: {
            include: {
              producto: {
                include: {
                  categoria: true,
                  impuesto: true,
                },
              },
            },
          },
          usuario: {
            select: {
              id: true,
              fullName: true,
            },
          },
          turnoCaja: {
            select: {
              id: true,
              cajaId: true,
              fechaApertura: true,
            },
          },
        },
      });
    });
  }

  async findOneWithDetails(id: number) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            producto: {
              include: {
                categoria: true,
                impuesto: true,
              },
            },
          },
        },
        usuario: {
          select: {
            id: true,
            fullName: true,
          },
        },
        turnoCaja: {
          select: {
            id: true,
            cajaId: true,
            fechaApertura: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket con ID ${id} no encontrado`);
    }

    return {
      ...ticket,
      calculatedTotals: {
        subtotal: ticket.subtotal,
        impuestos: ticket.impuestos,
        descuentoTotal: ticket.descuentoTotal,
        total: ticket.total,
      },
    };
  }

  async findAll(page: number = 1, limit: number = 10, usuarioId?: number, desde?: string, hasta?: string) {
    const skip = (page - 1) * limit;
    
    let where: any = {};
    
    if (usuarioId) where.usuarioId = usuarioId;
    
    if (desde || hasta) {
      where.fecha = {};
      if (desde) where.fecha.gte = new Date(desde);
      if (hasta) {
        const fechaHasta = new Date(hasta);
        fechaHasta.setHours(23, 59, 59, 999);
        where.fecha.lte = fechaHasta;
      }
    }

    const [tickets, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        skip,
        take: limit,
        include: {
          items: {
            include: {
              producto: {
                select: {
                  id: true,
                  nombre: true,
                  codigoBarras: true,
                },
              },
            },
          },
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
      this.prisma.ticket.count({ where }),
    ]);

    return {
      data: tickets.map(ticket => ({
        ...ticket,
        calculatedTotals: {
          subtotal: ticket.subtotal,
          impuestos: ticket.impuestos,
          descuentoTotal: ticket.descuentoTotal,
          total: ticket.total,
        },
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: number, dto: UpdateTicketDto) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket con ID ${id} no encontrado`);
    }

    const data: any = {
      ...(dto.usuarioId !== undefined && { usuarioId: dto.usuarioId }),
      ...(dto.numeroTicket !== undefined && { numeroTicket: dto.numeroTicket }),
      ...(dto.fecha && { fecha: new Date(dto.fecha) }),
    };

    try {
      const updatedTicket = await this.prisma.ticket.update({
        where: { id },
        data,
      });

      return this.findOneWithDetails(updatedTicket.id);
    } catch (e: any) {
      if (e.code === 'P2002' && e.meta?.target?.includes('ticket_por_usuario_y_dia')) {
        throw new ConflictException(
          `El número de ticket ${dto.numeroTicket} ya está en uso para este usuario en la fecha indicada`,
        );
      }
      throw new BadRequestException('No se pudo actualizar el ticket');
    }
  }

  async remove(id: number): Promise<void> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket con ID ${id} no encontrado`);
    }

    await this.prisma.$transaction(async (tx) => {
      for (const item of ticket.items) {
        await tx.producto.update({
          where: { id: item.productoId },
          data: {
            stock: {
              increment: item.cantidad,
            },
          },
        });

        await tx.stockMovement.create({
          data: {
            productoId: item.productoId,
            tipo: MovimientoTipo.IN,
            cantidad: item.cantidad,
            motivo: `Cancelación de venta - Ticket #${ticket.numeroTicket}`,
            usuarioId: ticket.usuarioId,
          },
        });
      }

      await tx.ticket.delete({ where: { id } });
    });
  }

  async recalculateTicketTotals(ticketId: number) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        items: {
          include: {
            producto: {
              include: {
                impuesto: true,
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket con ID ${ticketId} no encontrado`);
    }

    let subtotal = 0;
    let impuestos = 0;
    let descuentoTotal = 0;

    for (const item of ticket.items) {
      const subtotalItem = (Number(item.precioUnitario) * item.cantidad) - Number(item.descuento);
      subtotal += subtotalItem;
      descuentoTotal += Number(item.descuento);
      impuestos += Number(item.impuesto);
    }

    const total = subtotal + impuestos;

    await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        subtotal,
        impuestos,
        descuentoTotal,
        total,
      },
    });

    return this.findOneWithDetails(ticketId);
  }
}