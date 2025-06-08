// src/ticket/ticket.service.ts

import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket } from '../../generated/prisma';

@Injectable()
export class TicketService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registra un nuevo ticket. Calcula el número de ticket secuencial diario.
   * Captura conflicto si ya existe un ticket con el mismo número en el día.
   */
  async create(dto: CreateTicketDto): Promise<Ticket> {
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

    try {
      return await this.prisma.ticket.create({
        data: {
          usuarioId: dto.usuarioId,
          numeroTicket,
          ...(dto.fecha && { fecha: new Date(dto.fecha) }),
        },
      });
    } catch (e: any) {
      // Unique constraint P2002 on composite [usuarioId, fecha, numeroTicket]
      if (e.code === 'P2002' && e.meta?.target?.includes('ticket_por_usuario_y_dia')) {
        throw new ConflictException(
          `Ya existe un ticket #${numeroTicket} para el usuario ${dto.usuarioId} en este día`,
        );
      }
      throw new BadRequestException('No se pudo crear el ticket');
    }
  }

  /**
   * Obtiene todos los tickets, ordenados por fecha descendente.
   */
  async findAll(): Promise<Ticket[]> {
    return this.prisma.ticket.findMany({
      orderBy: { fecha: 'desc' },
    });
  }

  /**
   * Busca un ticket por su ID.
   * Lanza NotFoundException si no existe.
   */
  async findOne(id: number): Promise<Ticket> {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      throw new NotFoundException(`Ticket con ID ${id} no encontrado`);
    }
    return ticket;
  }

  /**
   * Actualiza los datos de un ticket existente.
   * Lanza NotFoundException si no existe y BadRequestException si falla la actualización.
   */
  async update(id: number, dto: UpdateTicketDto): Promise<Ticket> {
    await this.findOne(id);

    const data: any = {
      ...(dto.usuarioId !== undefined && { usuarioId: dto.usuarioId }),
      ...(dto.numeroTicket !== undefined && { numeroTicket: dto.numeroTicket }),
      ...(dto.fecha && { fecha: new Date(dto.fecha) }),
    };

    try {
      return await this.prisma.ticket.update({
        where: { id },
        data,
      });
    } catch (e: any) {
      if (e.code === 'P2002' && e.meta?.target?.includes('ticket_por_usuario_y_dia')) {
        throw new ConflictException(
          `El número de ticket ${dto.numeroTicket} ya está en uso para este usuario en la fecha indicada`,
        );
      }
      throw new BadRequestException('No se pudo actualizar el ticket');
    }
  }

  /**
   * Elimina un ticket.
   * Lanza NotFoundException si no existe.
   */
  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.prisma.ticket.delete({ where: { id } });
  }
}
