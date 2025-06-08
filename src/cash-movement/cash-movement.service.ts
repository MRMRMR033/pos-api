// src/cash-movement/cash-movement.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCashMovementDto } from './dto/create-cash-movement.dto';
import { UpdateCashMovementDto } from './dto/update-cash-movement.dto';
import { CashMovement } from '../../generated/prisma';

@Injectable()
export class CashMovementService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea un nuevo movimiento de efectivo (entrada o salida).
   * @throws BadRequestException si ocurre un error en la creación.
   */
  async create(dto: CreateCashMovementDto): Promise<CashMovement> {
    try {
      return await this.prisma.cashMovement.create({
        data: {
          usuarioId: dto.usuarioId,
          tipo: dto.tipo,
          monto: dto.monto,
          descripcion: dto.descripcion,
        },
      });
    } catch (e: any) {
      throw new BadRequestException('No se pudo crear el movimiento de efectivo');
    }
  }

  /**
   * Lista todos los movimientos de efectivo.
   */
  async findAll(): Promise<CashMovement[]> {
    return this.prisma.cashMovement.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

 /**
   * Lista los movimientos de efectivo de un usuario.
   * Si se pasa `date` (YYYY-MM-DD), filtra sólo los movimientos de ese día.
   */
 async findAllByUserId(
  usuarioId: number,
  date?: string,
): Promise<CashMovement[]> {
  // Base del filtro
  const where: any = { usuarioId };

  if (date) {
    // parseamos la fecha y calculamos inicio y fin de día
    const d = new Date(date);
    const startOfDay = new Date(d);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(d);
    endOfDay.setHours(23, 59, 59, 999);

    where.createdAt = {
      gte: startOfDay,
      lte: endOfDay,
    };
  }

  return this.prisma.cashMovement.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
}

  /**
   * Busca un movimiento por su ID.
   * @throws NotFoundException si no existe.
   */
  async findOne(id: number): Promise<CashMovement> {
    const movement = await this.prisma.cashMovement.findUnique({
      where: { id },
    });
    if (!movement) {
      throw new NotFoundException(`Movimiento de efectivo con ID ${id} no encontrado`);
    }
    return movement;
  }

  /**
   * Actualiza un movimiento de efectivo existente.
   * @throws NotFoundException si no existe.
   * @throws BadRequestException si falla la actualización.
   */
  async update(
    id: number,
    dto: UpdateCashMovementDto,
  ): Promise<CashMovement> {
    await this.findOne(id);

    try {
      return await this.prisma.cashMovement.update({
        where: { id },
        data: {
          ...(dto.usuarioId !== undefined && { usuarioId: dto.usuarioId }),
          ...(dto.tipo !== undefined && { tipo: dto.tipo }),
          ...(dto.monto !== undefined && { monto: dto.monto }),
          ...(dto.descripcion !== undefined && { descripcion: dto.descripcion }),
        },
      });
    } catch (e: any) {
      throw new BadRequestException('No se pudo actualizar el movimiento de efectivo');
    }
  }

  /**
   * Elimina un movimiento de efectivo.
   * @throws NotFoundException si no existe.
   */
  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.prisma.cashMovement.delete({ where: { id } });
  }
}
