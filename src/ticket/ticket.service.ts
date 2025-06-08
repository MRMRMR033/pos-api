// src/ticket/ticket.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVentaDto } from './dto/create-ticket.dto';
import { UpdateVentaDto } from './dto/update-ticket.dto';
import { Ticket } from '../../generated/prisma';

@Injectable()
export class TicketService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registra una nueva ticket. Calcula el número de ticket secuencial diario.
   * @param dto Datos de la ticket.
   * @returns La ticket creada.
   */
  async create(dto: CreateVentaDto): Promise<Ticket> {
    // Determinar fecha de la ticket (solo día)
    const date = dto.fecha ? new Date(dto.fecha) : new Date();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Obtener último ticket del día para este usuario
    const last = await this.prisma.ticket.findFirst({
      where: {
        usuarioId: dto.usuarioId,
        fecha: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { numeroTicket: 'desc' },
    });

    const numeroTicket = last ? last.numeroTicket + 1 : 1;

    return this.prisma.ticket.create({
      data: {
        usuarioId: dto.usuarioId,
        numeroTicket,
        ...(dto.fecha && { fecha: new Date(dto.fecha) }),
      },
    });
  }

  /**
   * Obtiene todas las ventas, ordenadas por fecha descendente.
   * @returns Lista de ventas.
   */
  async findAll(): Promise<Ticket[]> {
    return this.prisma.ticket.findMany({
      orderBy: { fecha: 'desc' },
    });
  }

  /**
   * Busca una ticket por su ID.
   * @param id ID de la ticket.
   * @throws NotFoundException si no existe.
   * @returns La ticket encontrada.
   */
  async findOne(id: number): Promise<Ticket> {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      throw new NotFoundException(`Ticket con ID ${id} no encontrada`);
    }
    return ticket;
  }

  /**
   * Actualiza los datos de una ticket existente.
   * @param id ID de la ticket.
   * @param dto Datos de actualización.
   * @throws NotFoundException si no existe.
   * @returns La ticket actualizada.
   */
  async update(id: number, dto: UpdateVentaDto): Promise<Ticket> {
    await this.findOne(id);
    return this.prisma.ticket.update({
      where: { id },
      data: {
        ...(dto.usuarioId !== undefined && { usuarioId: dto.usuarioId }),
        ...(dto.numeroTicket !== undefined && { numeroTicket: dto.numeroTicket }),
        ...(dto.fecha && { fecha: new Date(dto.fecha) }),
      },
    });
  }

  /**
   * Elimina una ticket.
   * @param id ID de la ticket.
   * @throws NotFoundException si no existe.
   */
  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.prisma.ticket.delete({ where: { id } });
  }
}
