import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AbrirCajaDto } from './dto/abrir-caja.dto';
import { CerrarCajaDto } from './dto/cerrar-caja.dto';
import { EstadoTurno, MovimientoTipo } from '../../generated/prisma';

@Injectable()
export class CajaService {
  constructor(private prisma: PrismaService) {}

  async abrir(abrirCajaDto: AbrirCajaDto, usuarioId: number) {
    const turnoAbierto = await this.prisma.turnoCaja.findFirst({
      where: {
        usuarioId,
        estado: EstadoTurno.ABIERTO,
      },
    });

    if (turnoAbierto) {
      throw new ConflictException('Ya tienes un turno de caja abierto');
    }

    const cajaId = abrirCajaDto.cajaId || 1;

    const turnoExistente = await this.prisma.turnoCaja.findFirst({
      where: {
        cajaId,
        estado: EstadoTurno.ABIERTO,
      },
      include: {
        usuario: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    if (turnoExistente) {
      throw new ConflictException(
        `La caja ${cajaId} ya está abierta por ${turnoExistente.usuario.fullName}`
      );
    }

    return this.prisma.turnoCaja.create({
      data: {
        usuarioId,
        cajaId,
        saldoInicial: abrirCajaDto.saldoInicial,
        observaciones: abrirCajaDto.observaciones,
      },
      include: {
        usuario: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });
  }

  async cerrar(turnoId: number, cerrarCajaDto: CerrarCajaDto, usuarioId: number) {
    const turno = await this.prisma.turnoCaja.findUnique({
      where: { id: turnoId },
      include: {
        usuario: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    if (!turno) {
      throw new NotFoundException(`Turno de caja con ID ${turnoId} no encontrado`);
    }

    if (turno.usuarioId !== usuarioId) {
      throw new BadRequestException('Solo puedes cerrar tu propio turno de caja');
    }

    if (turno.estado === EstadoTurno.CERRADO) {
      throw new BadRequestException('Este turno ya está cerrado');
    }

    const fechaInicio = turno.fechaApertura;
    const fechaFin = new Date();

    const [ingresos, egresos, ticketsDelTurno] = await Promise.all([
      this.prisma.cashMovement.aggregate({
        where: {
          usuarioId,
          tipo: MovimientoTipo.IN,
          createdAt: {
            gte: fechaInicio,
            lte: fechaFin,
          },
        },
        _sum: {
          monto: true,
        },
      }),
      this.prisma.cashMovement.aggregate({
        where: {
          usuarioId,
          tipo: MovimientoTipo.OUT,
          createdAt: {
            gte: fechaInicio,
            lte: fechaFin,
          },
        },
        _sum: {
          monto: true,
        },
      }),
      this.prisma.ticket.aggregate({
        where: {
          turnoCajaId: turnoId,
        },
        _sum: {
          total: true,
        },
      }),
    ]);

    const totalIngresos = Number(ingresos._sum.monto || 0) + Number(ticketsDelTurno._sum.total || 0);
    const totalEgresos = Number(egresos._sum.monto || 0);
    const saldoEsperado = Number(turno.saldoInicial) + totalIngresos - totalEgresos;
    const diferencia = cerrarCajaDto.saldoFinal - saldoEsperado;

    const observacionesCierre = cerrarCajaDto.observaciones
      ? `${turno.observaciones || ''}\n[CIERRE] ${cerrarCajaDto.observaciones}`.trim()
      : turno.observaciones;

    return this.prisma.turnoCaja.update({
      where: { id: turnoId },
      data: {
        estado: EstadoTurno.CERRADO,
        fechaCierre: fechaFin,
        saldoFinal: cerrarCajaDto.saldoFinal,
        totalIngresos,
        totalEgresos,
        diferencia,
        observaciones: observacionesCierre,
      },
      include: {
        usuario: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });
  }

  async getTurnoActual(usuarioId: number) {
    const turno = await this.prisma.turnoCaja.findFirst({
      where: {
        usuarioId,
        estado: EstadoTurno.ABIERTO,
      },
      include: {
        usuario: {
          select: {
            id: true,
            fullName: true,
          },
        },
        tickets: {
          select: {
            id: true,
            numeroTicket: true,
            total: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!turno) {
      throw new NotFoundException('No tienes un turno de caja abierto');
    }

    const fechaInicio = turno.fechaApertura;
    const fechaActual = new Date();

    const [ingresos, egresos, ticketsDelTurno] = await Promise.all([
      this.prisma.cashMovement.aggregate({
        where: {
          usuarioId,
          tipo: MovimientoTipo.IN,
          createdAt: {
            gte: fechaInicio,
            lte: fechaActual,
          },
        },
        _sum: {
          monto: true,
        },
      }),
      this.prisma.cashMovement.aggregate({
        where: {
          usuarioId,
          tipo: MovimientoTipo.OUT,
          createdAt: {
            gte: fechaInicio,
            lte: fechaActual,
          },
        },
        _sum: {
          monto: true,
        },
      }),
      this.prisma.ticket.aggregate({
        where: {
          turnoCajaId: turno.id,
        },
        _sum: {
          total: true,
        },
        _count: true,
      }),
    ]);

    const totalIngresos = Number(ingresos._sum.monto || 0) + Number(ticketsDelTurno._sum.total || 0);
    const totalEgresos = Number(egresos._sum.monto || 0);
    const saldoActual = Number(turno.saldoInicial) + totalIngresos - totalEgresos;

    return {
      ...turno,
      resumen: {
        saldoInicial: turno.saldoInicial,
        totalIngresos,
        totalEgresos,
        saldoActual,
        ventasRealizadas: ticketsDelTurno._count,
        ventasTotal: ticketsDelTurno._sum.total || 0,
      },
    };
  }

  async findAll(page: number = 1, limit: number = 10, usuarioId?: number, estado?: EstadoTurno) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (usuarioId) where.usuarioId = usuarioId;
    if (estado) where.estado = estado;

    const [turnos, total] = await Promise.all([
      this.prisma.turnoCaja.findMany({
        where,
        skip,
        take: limit,
        include: {
          usuario: {
            select: {
              id: true,
              fullName: true,
            },
          },
          _count: {
            select: {
              tickets: true,
            },
          },
        },
        orderBy: {
          fechaApertura: 'desc',
        },
      }),
      this.prisma.turnoCaja.count({ where }),
    ]);

    return {
      data: turnos,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const turno = await this.prisma.turnoCaja.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            fullName: true,
          },
        },
        tickets: {
          include: {
            items: {
              include: {
                producto: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!turno) {
      throw new NotFoundException(`Turno de caja con ID ${id} no encontrado`);
    }

    return turno;
  }

  async getMovimientosCaja(turnoId: number) {
    const turno = await this.prisma.turnoCaja.findUnique({
      where: { id: turnoId },
    });

    if (!turno) {
      throw new NotFoundException(`Turno de caja con ID ${turnoId} no encontrado`);
    }

    const fechaInicio = turno.fechaApertura;
    const fechaFin = turno.fechaCierre || new Date();

    const movimientos = await this.prisma.cashMovement.findMany({
      where: {
        usuarioId: turno.usuarioId,
        createdAt: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return movimientos;
  }
}