// src/ticket-item/ticket-item.service.ts

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketItemDto } from './dto/create-ticket-item.dto';
import { UpdateTicketItemDto } from './dto/update-ticket-item.dto';
import { TicketItem } from '../../generated/prisma';

@Injectable()
export class TicketItemService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea un nuevo ítem de ticket, calculando el total.
   * @throws BadRequestException si hay algún error en la creación.
   */
  async create(dto: CreateTicketItemDto): Promise<TicketItem> {
    const total = dto.cantidad * dto.precioUnitario;
    try {
      return await this.prisma.ticketItem.create({
        data: {
          ticketId: dto.ticketId,
          productoId: dto.productoId,
          cantidad: dto.cantidad,
          precioUnitario: dto.precioUnitario,
          total,
        },
      });
    } catch (e: any) {
      // Aquí podrías inspeccionar e.code si Prisma pudiera lanzar un error
      throw new BadRequestException('No se pudo crear el ítem de ticket');
    }
  }

  /**
   * Lista todos los ítems de ticket.
   */
  async findAll(): Promise<TicketItem[]> {
    return this.prisma.ticketItem.findMany();
  }

  /**
   * Obtiene un ítem por ID.
   * @throws NotFoundException si no existe.
   */
  async findOne(id: number): Promise<TicketItem> {
    const item = await this.prisma.ticketItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Ítem de ticket con ID ${id} no encontrado`);
    }
    return item;
  }

  /**
   * Actualiza un ítem existente, recalcando el total si cambia cantidad o precio.
   * @throws NotFoundException si no existe.
   * @throws BadRequestException si la actualización falla.
   */
  async update(id: number, dto: UpdateTicketItemDto): Promise<TicketItem> {
    // Verificar existencia
    const existing = await this.findOne(id);

    // Armar datos de actualización
    const data: any = { ...dto };
    if (dto.cantidad !== undefined || dto.precioUnitario !== undefined) {
      const cantidad = dto.cantidad ?? existing.cantidad;
      const precio  = dto.precioUnitario ?? existing.precioUnitario.toNumber();
      data.total = cantidad * precio;
    }

    try {
      return await this.prisma.ticketItem.update({
        where: { id },
        data,
      });
    } catch (e: any) {
      throw new BadRequestException('No se pudo actualizar el ítem de ticket');
    }
  }

  /**
   * Elimina un ítem de ticket.
   * @throws NotFoundException si no existe.
   */
  async remove(id: number): Promise<void> {
    // Verificar existencia
    await this.findOne(id);

    await this.prisma.ticketItem.delete({ where: { id } });
  }
}
