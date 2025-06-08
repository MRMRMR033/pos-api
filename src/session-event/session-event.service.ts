import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionEventDto } from './dto/create-session-event.dto';
import { UpdateSessionEventDto } from './dto/update-session-event.dto';
import { SessionEvent, EventoTipo } from '../../generated/prisma';

@Injectable()
export class SessionEventService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registra un evento de sesión (login/logout).
   * @param dto Datos del evento.
   * @returns El evento creado.
   */
  async create(dto: CreateSessionEventDto): Promise<SessionEvent> {
    return this.prisma.sessionEvent.create({
      data: {
        usuarioId: dto.usuarioId,
        tipo: dto.tipo as EventoTipo,
        ...(dto.timestamp && { timestamp: new Date(dto.timestamp) }),
      },
    });
  }

  /**
   * Obtiene todos los eventos de sesión.
   * @returns Lista de eventos.
   */
  async findAll(): Promise<SessionEvent[]> {
    return this.prisma.sessionEvent.findMany({
      orderBy: { timestamp: 'desc' },
    });
  }

  /**
   * Obtiene un evento por su ID.
   * @param id ID del evento.
   * @throws NotFoundException si no existe.
   * @returns El evento encontrado.
   */
  async findOne(id: number): Promise<SessionEvent> {
    const event = await this.prisma.sessionEvent.findUnique({ where: { id } });
    if (!event) {
      throw new NotFoundException(`SessionEvent con ID ${id} no encontrado`);
    }
    return event;
  }

  /**
   * Actualiza un evento de sesión existente.
   * @param id ID del evento.
   * @param dto Datos de actualización.
   * @throws NotFoundException si no existe.
   * @returns El evento actualizado.
   */
  async update(id: number, dto: UpdateSessionEventDto): Promise<SessionEvent> {
    await this.findOne(id);
    return this.prisma.sessionEvent.update({
      where: { id },
      data: {
        ...(dto.usuarioId !== undefined && { usuarioId: dto.usuarioId }),
        ...(dto.tipo !== undefined && { tipo: dto.tipo as EventoTipo }),
        ...(dto.timestamp && { timestamp: new Date(dto.timestamp) }),
      },
    });
  }

  /**
   * Elimina un evento de sesión.
   * @param id ID del evento.
   * @throws NotFoundException si no existe.
   * @returns El evento eliminado.
   */
  async remove(id: number): Promise<SessionEvent> {
    await this.findOne(id);
    return this.prisma.sessionEvent.delete({ where: { id } });
  }
}
