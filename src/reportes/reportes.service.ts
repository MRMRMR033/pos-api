import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoTurno, MovimientoTipo } from '../../generated/prisma';

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  async reporteVentas(desde?: string, hasta?: string) {
    let fechaInicio: Date;
    let fechaFin: Date;

    if (desde && hasta) {
      fechaInicio = new Date(desde);
      fechaFin = new Date(hasta);
      fechaFin.setHours(23, 59, 59, 999);
      
      if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
        throw new BadRequestException('Formato de fecha inválido. Use YYYY-MM-DD');
      }
      
      if (fechaInicio > fechaFin) {
        throw new BadRequestException('La fecha de inicio no puede ser mayor a la fecha fin');
      }
    } else {
      const hoy = new Date();
      fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
      fechaFin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59, 999);
    }

    const where = {
      createdAt: {
        gte: fechaInicio,
        lte: fechaFin,
      },
    };

    const [resumenVentas, ventasPorDia, ventasPorProducto, ventasPorUsuario] = await Promise.all([
      this.prisma.ticket.aggregate({
        where,
        _sum: {
          subtotal: true,
          impuestos: true,
          descuentoTotal: true,
          total: true,
        },
        _count: true,
      }),
      this.prisma.ticket.groupBy({
        by: ['fecha'],
        where,
        _sum: {
          total: true,
        },
        _count: true,
        orderBy: {
          fecha: 'asc',
        },
      }),
      this.prisma.ticketItem.groupBy({
        by: ['productoId'],
        where: {
          ticket: where,
        },
        _sum: {
          cantidad: true,
          total: true,
        },
        orderBy: {
          _sum: {
            total: 'desc',
          },
        },
        take: 10,
      }),
      this.prisma.ticket.groupBy({
        by: ['usuarioId'],
        where,
        _sum: {
          total: true,
        },
        _count: true,
        orderBy: {
          _sum: {
            total: 'desc',
          },
        },
      }),
    ]);

    const productosInfo = await this.prisma.producto.findMany({
      where: {
        id: {
          in: ventasPorProducto.map(v => v.productoId),
        },
      },
      select: {
        id: true,
        nombre: true,
        codigoBarras: true,
      },
    });

    const usuariosInfo = await this.prisma.usuario.findMany({
      where: {
        id: {
          in: ventasPorUsuario.map(v => v.usuarioId),
        },
      },
      select: {
        id: true,
        fullName: true,
      },
    });

    const productosConInfo = ventasPorProducto.map(venta => {
      const producto = productosInfo.find(p => p.id === venta.productoId);
      return {
        producto: producto || { id: venta.productoId, nombre: 'Producto no encontrado', codigoBarras: '' },
        cantidadVendida: venta._sum.cantidad || 0,
        totalVentas: venta._sum.total || 0,
      };
    });

    const usuariosConInfo = ventasPorUsuario.map(venta => {
      const usuario = usuariosInfo.find(u => u.id === venta.usuarioId);
      return {
        usuario: usuario || { id: venta.usuarioId, fullName: 'Usuario no encontrado' },
        ticketsVendidos: venta._count,
        totalVentas: venta._sum.total || 0,
      };
    });

    return {
      periodo: {
        desde: fechaInicio.toISOString().split('T')[0],
        hasta: fechaFin.toISOString().split('T')[0],
      },
      resumen: {
        totalTickets: resumenVentas._count,
        subtotal: Number(resumenVentas._sum.subtotal || 0),
        impuestos: Number(resumenVentas._sum.impuestos || 0),
        descuentos: Number(resumenVentas._sum.descuentoTotal || 0),
        total: Number(resumenVentas._sum.total || 0),
        ticketPromedio: resumenVentas._count > 0 
          ? Number(resumenVentas._sum.total || 0) / resumenVentas._count 
          : 0,
      },
      ventasPorDia: ventasPorDia.map(dia => ({
        fecha: dia.fecha.toISOString().split('T')[0],
        tickets: dia._count,
        total: dia._sum.total || 0,
      })),
      productosTopVentas: productosConInfo,
      vendedoresRendimiento: usuariosConInfo,
    };
  }

  async reporteInventario() {
    const [productos, stockBajo, movimientosRecientes] = await Promise.all([
      this.prisma.producto.findMany({
        include: {
          categoria: {
            select: {
              id: true,
              nombre: true,
            },
          },
          proveedor: {
            select: {
              id: true,  
              nombre: true,
            },
          },
        },
        orderBy: {
          stock: 'asc',
        },
      }),
      this.prisma.producto.findMany({
        where: {
          OR: [
            {
              stock: {
                lte: this.prisma.producto.fields.stockMinimo,
              },
            },
            {
              stock: 0,
            },
          ],
        },
        include: {
          categoria: {
            select: {
              nombre: true,
            },
          },
          proveedor: {
            select: {
              nombre: true,
            },
          },
        },
        orderBy: {
          stock: 'asc',
        },
      }),
      this.prisma.stockMovement.findMany({
        take: 20,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          producto: {
            select: {
              id: true,
              nombre: true,
              codigoBarras: true,
            },
          },
          usuario: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      }),
    ]);

    const stockBajoDetalle = stockBajo.filter(producto => 
      producto.stock <= producto.stockMinimo
    );

    const productosAgotados = productos.filter(producto => producto.stock === 0);

    const valorInventario = productos.reduce((total, producto) => {
      return total + (Number(producto.precioCosto) * producto.stock);
    }, 0);

    const resumenPorCategoria = await this.prisma.categoria.findMany({
      include: {
        productos: {
          select: {
            stock: true,
            precioCosto: true,
          },
        },
      },
    }).then(categorias => 
      categorias.map(categoria => ({
        categoria: categoria.nombre,
        totalProductos: categoria.productos.length,
        stockTotal: categoria.productos.reduce((sum, p) => sum + p.stock, 0),
        valorInventario: categoria.productos.reduce((sum, p) => 
          sum + (Number(p.precioCosto) * p.stock), 0
        ),
      }))
    );

    return {
      resumen: {
        totalProductos: productos.length,
        productosConStock: productos.filter(p => p.stock > 0).length,
        productosAgotados: productosAgotados.length,
        productosStockBajo: stockBajoDetalle.length,
        valorTotalInventario: valorInventario,
      },
      stockBajo: stockBajoDetalle.map(producto => ({
        id: producto.id,
        nombre: producto.nombre,
        codigoBarras: producto.codigoBarras,
        categoria: producto.categoria.nombre,
        stock: producto.stock,
        stockMinimo: producto.stockMinimo,
        proveedor: producto.proveedor?.nombre || 'Sin proveedor',
        estado: producto.stock === 0 ? 'AGOTADO' : 'STOCK_BAJO',
      })),
      resumenPorCategoria,
      movimientosRecientes: movimientosRecientes.map(movimiento => ({
        id: movimiento.id,
        fecha: movimiento.createdAt,
        tipo: movimiento.tipo,
        cantidad: movimiento.cantidad,
        motivo: movimiento.motivo,
        producto: movimiento.producto,
        usuario: movimiento.usuario,
      })),
      productos: productos.map(producto => ({
        id: producto.id,
        nombre: producto.nombre,
        codigoBarras: producto.codigoBarras,
        categoria: producto.categoria.nombre,
        stock: producto.stock,
        stockMinimo: producto.stockMinimo,
        precioCosto: producto.precioCosto,
        precioVenta: producto.precioVenta,
        valorStock: Number(producto.precioCosto) * producto.stock,
        estado: producto.stock === 0 ? 'AGOTADO' : 
                producto.stock <= producto.stockMinimo ? 'STOCK_BAJO' : 'NORMAL',
        proveedor: producto.proveedor?.nombre || 'Sin proveedor',
      })),
    };
  }

  async reporteFinanciero(desde?: string, hasta?: string) {
    let fechaInicio: Date;
    let fechaFin: Date;

    if (desde && hasta) {
      fechaInicio = new Date(desde);
      fechaFin = new Date(hasta);
      fechaFin.setHours(23, 59, 59, 999);
      
      if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
        throw new BadRequestException('Formato de fecha inválido. Use YYYY-MM-DD');
      }
    } else {
      const hoy = new Date();
      fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      fechaFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    const where = {
      createdAt: {
        gte: fechaInicio,
        lte: fechaFin,
      },
    };

    const [ingresosPorVentas, movimientosEfectivo, turnosCaja] = await Promise.all([
      this.prisma.ticket.aggregate({
        where,
        _sum: {
          total: true,
          subtotal: true,
          impuestos: true,
        },
        _count: true,
      }),
      this.prisma.cashMovement.groupBy({
        by: ['tipo'],
        where,
        _sum: {
          monto: true,
        },
        _count: true,
      }),
      this.prisma.turnoCaja.findMany({
        where: {
          fechaApertura: {
            gte: fechaInicio,
            lte: fechaFin,
          },
          estado: EstadoTurno.CERRADO,
        },
        select: {
          id: true,
          cajaId: true,
          fechaApertura: true,
          fechaCierre: true,
          saldoInicial: true,
          saldoFinal: true,
          totalIngresos: true,
          totalEgresos: true,
          diferencia: true,
          usuario: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
        orderBy: {
          fechaApertura: 'desc',
        },
      }),
    ]);

    const ingresosPorMovimientos = Number(movimientosEfectivo.find(m => m.tipo === MovimientoTipo.IN)?._sum.monto || 0);
    const egresosPorMovimientos = Number(movimientosEfectivo.find(m => m.tipo === MovimientoTipo.OUT)?._sum.monto || 0);

    const totalIngresos = Number(ingresosPorVentas._sum.total || 0) + ingresosPorMovimientos;
    const totalEgresos = egresosPorMovimientos;
    const utilidadBruta = totalIngresos - totalEgresos;

    const resumenPorCaja = await this.prisma.turnoCaja.groupBy({
      by: ['cajaId'],
      where: {
        fechaApertura: {
          gte: fechaInicio,
          lte: fechaFin,
        },
        estado: EstadoTurno.CERRADO,
      },
      _sum: {
        totalIngresos: true,
        totalEgresos: true,
        diferencia: true,
      },
      _count: true,
    });

    const movimientosPorDia = await this.prisma.ticket.groupBy({
      by: ['fecha'],
      where,
      _sum: {
        total: true,
      },
      _count: true,
      orderBy: {
        fecha: 'asc',
      },
    });

    return {
      periodo: {
        desde: fechaInicio.toISOString().split('T')[0],
        hasta: fechaFin.toISOString().split('T')[0],
      },
      resumen: {
        totalIngresos,
        totalEgresos,
        utilidadBruta,
        margenUtilidad: totalIngresos > 0 ? (utilidadBruta / totalIngresos) * 100 : 0,
        ventasRealizadas: ingresosPorVentas._count,
        promedioVentaDiaria: movimientosPorDia.length > 0 
          ? totalIngresos / movimientosPorDia.length 
          : 0,
      },
      desglose: {
        ingresosPorVentas: ingresosPorVentas._sum.total || 0,
        ingresosPorMovimientos: ingresosPorMovimientos,
        egresosPorMovimientos: egresosPorMovimientos,
        impuestosGenerados: ingresosPorVentas._sum.impuestos || 0,
      },
      ventasPorDia: movimientosPorDia.map(dia => ({
        fecha: dia.fecha.toISOString().split('T')[0],
        tickets: dia._count,
        total: dia._sum.total || 0,
      })),
      resumenPorCaja: resumenPorCaja.map(caja => ({
        cajaId: caja.cajaId,
        turnosCerrados: caja._count,
        totalIngresos: caja._sum.totalIngresos || 0,
        totalEgresos: caja._sum.totalEgresos || 0,
        diferenciasAcumuladas: caja._sum.diferencia || 0,
      })),
      turnosCerrados: turnosCaja.map(turno => ({
        id: turno.id,
        cajaId: turno.cajaId,
        usuario: turno.usuario.fullName,
        fechaApertura: turno.fechaApertura,
        fechaCierre: turno.fechaCierre,
        saldoInicial: turno.saldoInicial,
        saldoFinal: turno.saldoFinal,
        totalIngresos: turno.totalIngresos,
        totalEgresos: turno.totalEgresos,
        diferencia: turno.diferencia,
        estado: Number(turno.diferencia) === 0 ? 'CUADRADO' : 
               Number(turno.diferencia) > 0 ? 'SOBRANTE' : 'FALTANTE',
      })),
    };
  }

  async reporteVentasPorHora(desde?: string, hasta?: string, usuarioId?: number) {
    let fechaInicio: Date;
    let fechaFin: Date;

    if (desde && hasta) {
      fechaInicio = new Date(desde);
      fechaFin = new Date(hasta);
      fechaFin.setHours(23, 59, 59, 999);
      
      if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
        throw new BadRequestException('Formato de fecha inválido. Use YYYY-MM-DD');
      }
    } else {
      const hoy = new Date();
      fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
      fechaFin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59, 999);
    }

    const where: any = {
      createdAt: {
        gte: fechaInicio,
        lte: fechaFin,
      },
    };

    if (usuarioId) {
      where.usuarioId = usuarioId;
    }

    // Obtener todas las ventas en el rango
    const tickets = await this.prisma.ticket.findMany({
      where,
      select: {
        id: true,
        createdAt: true,
        total: true,
        usuarioId: true,
        usuario: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Agrupar ventas por hora
    const ventasPorHora = new Map<string, any>();

    tickets.forEach(ticket => {
      const hora = ticket.createdAt.getHours();
      const fecha = ticket.createdAt.toISOString().split('T')[0];
      const key = `${fecha}-${hora.toString().padStart(2, '0')}`;

      if (!ventasPorHora.has(key)) {
        ventasPorHora.set(key, {
          fecha,
          hora,
          totalVentas: 0,
          cantidadTickets: 0,
          usuarios: new Map(),
        });
      }

      const grupo = ventasPorHora.get(key);
      grupo.totalVentas += Number(ticket.total);
      grupo.cantidadTickets += 1;

      // Agrupar por usuario dentro de cada hora
      const userId = ticket.usuarioId;
      if (!grupo.usuarios.has(userId)) {
        grupo.usuarios.set(userId, {
          usuarioId: userId,
          fullName: ticket.usuario?.fullName || 'Usuario desconocido',
          totalVentas: 0,
          cantidadTickets: 0,
        });
      }

      const usuarioGrupo = grupo.usuarios.get(userId);
      usuarioGrupo.totalVentas += Number(ticket.total);
      usuarioGrupo.cantidadTickets += 1;
    });

    // Convertir Map a array y calcular promedios
    const ventasHorarias = Array.from(ventasPorHora.values()).map(grupo => ({
      fecha: grupo.fecha,
      hora: grupo.hora,
      totalVentas: grupo.totalVentas,
      cantidadTickets: grupo.cantidadTickets,
      ticketPromedio: grupo.cantidadTickets > 0 ? grupo.totalVentas / grupo.cantidadTickets : 0,
      usuarios: Array.from(grupo.usuarios.values()),
    }));

    // Calcular resumen general
    const resumen = {
      totalVentas: tickets.reduce((sum, t) => sum + Number(t.total), 0),
      totalTickets: tickets.length,
      ticketPromedio: tickets.length > 0 ? 
        tickets.reduce((sum, t) => sum + Number(t.total), 0) / tickets.length : 0,
      horasConVentas: ventasHorarias.length,
      mejorHora: ventasHorarias.length > 0 ? 
        ventasHorarias.reduce((max, curr) => 
          curr.totalVentas > max.totalVentas ? curr : max
        ) : null,
    };

    return {
      periodo: {
        desde: fechaInicio.toISOString().split('T')[0],
        hasta: fechaFin.toISOString().split('T')[0],
      },
      resumen,
      ventasPorHora: ventasHorarias.sort((a, b) => {
        if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha);
        return a.hora - b.hora;
      }),
    };
  }

  async reporteVentasPorVendedor(desde?: string, hasta?: string, usuarioIds?: number[]) {
    let fechaInicio: Date;
    let fechaFin: Date;

    if (desde && hasta) {
      fechaInicio = new Date(desde);
      fechaFin = new Date(hasta);
      fechaFin.setHours(23, 59, 59, 999);
      
      if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
        throw new BadRequestException('Formato de fecha inválido. Use YYYY-MM-DD');
      }
    } else {
      const hoy = new Date();
      fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
      fechaFin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59, 999);
    }

    const where: any = {
      createdAt: {
        gte: fechaInicio,
        lte: fechaFin,
      },
    };

    if (usuarioIds && usuarioIds.length > 0) {
      where.usuarioId = {
        in: usuarioIds,
      };
    }

    // Obtener todos los usuarios
    const usuarios = await this.prisma.usuario.findMany({
      where: {
        ...(usuarioIds && usuarioIds.length > 0 ? { id: { in: usuarioIds } } : {}),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
      },
    });

    // Obtener ventas agrupadas por usuario
    const ventasPorUsuario = await this.prisma.ticket.groupBy({
      by: ['usuarioId'],
      where,
      _sum: {
        total: true,
      },
      _count: true,
      orderBy: {
        _sum: {
          total: 'desc',
        },
      },
    });

    // Obtener ventas detalladas para calcular rangos horarios
    const ticketsDetallados = await this.prisma.ticket.findMany({
      where,
      select: {
        id: true,
        createdAt: true,
        total: true,
        usuarioId: true,
      },
    });

    // Procesar datos por vendedor
    const vendedores = usuarios.map(usuario => {
      const ventasUsuario = ventasPorUsuario.find(v => v.usuarioId === usuario.id);
      const ticketsUsuario = ticketsDetallados.filter(t => t.usuarioId === usuario.id);
      
      // Calcular ventas por hora para este usuario
      const ventasPorHora = new Array(24).fill(0).map((_, hora) => {
        const ticketsHora = ticketsUsuario.filter(t => t.createdAt.getHours() === hora);
        return {
          hora,
          totalVentas: ticketsHora.reduce((sum, t) => sum + Number(t.total), 0),
          cantidadTickets: ticketsHora.length,
        };
      }).filter(h => h.cantidadTickets > 0);

      const totalVentas = Number(ventasUsuario?._sum.total || 0);
      const cantidadTickets = ventasUsuario?._count || 0;
      
      return {
        usuarioId: usuario.id,
        fullName: usuario.fullName,
        email: usuario.email,
        totalVentas,
        cantidadTickets,
        ticketPromedio: cantidadTickets > 0 ? totalVentas / cantidadTickets : 0,
        ventasPorHora: ventasPorHora.sort((a, b) => b.totalVentas - a.totalVentas),
        primerVenta: ticketsUsuario.length > 0 ? 
          new Date(Math.min(...ticketsUsuario.map(t => t.createdAt.getTime()))).toISOString() : null,
        ultimaVenta: ticketsUsuario.length > 0 ? 
          new Date(Math.max(...ticketsUsuario.map(t => t.createdAt.getTime()))).toISOString() : null,
        mejorHora: ventasPorHora.length > 0 ? 
          ventasPorHora.reduce((max, curr) => curr.totalVentas > max.totalVentas ? curr : max) : null,
      };
    });

    // Filtrar solo vendedores que tuvieron ventas (opcional)
    const vendedoresConVentas = vendedores.filter(v => v.cantidadTickets > 0);
    const vendedoresSinVentas = vendedores.filter(v => v.cantidadTickets === 0);

    // Calcular estadísticas generales
    const resumen = {
      totalVendedores: usuarios.length,
      vendedoresConVentas: vendedoresConVentas.length,
      vendedoresSinVentas: vendedoresSinVentas.length,
      totalVentas: vendedoresConVentas.reduce((sum, v) => sum + v.totalVentas, 0),
      totalTickets: vendedoresConVentas.reduce((sum, v) => sum + v.cantidadTickets, 0),
      ticketPromedio: vendedoresConVentas.length > 0 ? 
        vendedoresConVentas.reduce((sum, v) => sum + v.totalVentas, 0) / 
        vendedoresConVentas.reduce((sum, v) => sum + v.cantidadTickets, 0) : 0,
      mejorVendedor: vendedoresConVentas.length > 0 ? 
        vendedoresConVentas.reduce((max, curr) => 
          curr.totalVentas > max.totalVentas ? curr : max
        ) : null,
    };

    return {
      periodo: {
        desde: fechaInicio.toISOString().split('T')[0],
        hasta: fechaFin.toISOString().split('T')[0],
      },
      resumen,
      vendedoresConVentas: vendedoresConVentas.sort((a, b) => b.totalVentas - a.totalVentas),
      vendedoresSinVentas: vendedoresSinVentas.sort((a, b) => a.fullName.localeCompare(b.fullName)),
    };
  }

  async reporteProductosVendidos(desde?: string, hasta?: string, limit: number = 50) {
    let fechaInicio: Date;
    let fechaFin: Date;

    if (desde && hasta) {
      fechaInicio = new Date(desde);
      fechaFin = new Date(hasta);
      fechaFin.setHours(23, 59, 59, 999);
    } else {
      const hoy = new Date();
      fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
      fechaFin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59, 999);
    }

    const productosVendidos = await this.prisma.ticketItem.groupBy({
      by: ['productoId'],
      where: {
        ticket: {
          createdAt: {
            gte: fechaInicio,
            lte: fechaFin,
          },
        },
      },
      _sum: {
        cantidad: true,
        total: true,
      },
      orderBy: {
        _sum: {
          cantidad: 'desc',
        },
      },
      take: limit,
    });

    const productosInfo = await this.prisma.producto.findMany({
      where: {
        id: {
          in: productosVendidos.map(p => p.productoId),
        },
      },
      include: {
        categoria: {
          select: {
            nombre: true,
          },
        },
      },
    });

    const productosConDetalle = productosVendidos.map(venta => {
      const producto = productosInfo.find(p => p.id === venta.productoId);
      return {
        producto: {
          id: venta.productoId,
          nombre: producto?.nombre || 'Producto no encontrado',
          codigoBarras: producto?.codigoBarras || '',
          categoria: producto?.categoria?.nombre || '',
          precioVenta: producto?.precioVenta || 0,
          stock: producto?.stock || 0,
        },
        cantidadVendida: Number(venta._sum.cantidad || 0),
        totalVentas: Number(venta._sum.total || 0),
        promedioVenta: venta._sum.cantidad ? 
          Number(venta._sum.total || 0) / Number(venta._sum.cantidad || 1) : 0,
      };
    });

    return {
      periodo: {
        desde: fechaInicio.toISOString().split('T')[0],
        hasta: fechaFin.toISOString().split('T')[0],
      },
      productos: productosConDetalle,
      resumen: {
        totalProductosVendidos: productosVendidos.length,
        cantidadTotalVendida: productosVendidos.reduce((sum, p) => sum + Number(p._sum.cantidad || 0), 0),
        ventasTotales: productosVendidos.reduce((sum, p) => sum + Number(p._sum.total || 0), 0),
      },
    };
  }
}