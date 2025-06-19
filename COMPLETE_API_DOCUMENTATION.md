# POS API - Documentación Completa

## Resumen General

Este documento describe todos los endpoints implementados en el sistema POS, incluyendo ejemplos de peticiones y respuestas.

## Autenticación

Todos los endpoints requieren autenticación Bearer Token excepto los endpoints públicos.

```
Authorization: Bearer <jwt_token>
```

## Endpoints Implementados

### 1. Compras y Órdenes de Compra

#### POST /compra
**Descripción:** Crear nueva orden de compra
**Permisos:** `compras:crear`

**Ejemplo de petición:**
```json
{
  "numeroOrden": "ORD-2024-001",
  "proveedorId": 1,
  "fechaEntrega": "2024-07-01",
  "observaciones": "Pedido urgente",
  "detalles": [
    {
      "productoId": 1,
      "cantidad": 50,
      "precioUnitario": 25.50
    },
    {
      "productoId": 2,
      "cantidad": 30,
      "precioUnitario": 15.00
    }
  ]
}
```

**Ejemplo de respuesta:**
```json
{
  "id": 1,
  "numeroOrden": "ORD-2024-001",
  "proveedorId": 1,
  "usuarioId": 1,
  "estado": "PENDIENTE",
  "fechaOrden": "2024-06-18T10:00:00.000Z",
  "fechaEntrega": "2024-07-01T00:00:00.000Z",
  "subtotal": 1725.00,
  "impuestos": 276.00,
  "total": 2001.00,
  "observaciones": "Pedido urgente",
  "detalles": [
    {
      "id": 1,
      "productoId": 1,
      "cantidad": 50,
      "precioUnitario": 25.50,
      "total": 1275.00,
      "producto": {
        "id": 1,
        "nombre": "Producto A",
        "codigoBarras": "123456789"
      }
    }
  ],
  "proveedor": {
    "id": 1,
    "nombre": "Proveedor XYZ"
  },
  "usuario": {
    "id": 1,
    "fullName": "Juan Pérez"
  }
}
```

#### GET /compra
**Descripción:** Obtener todas las órdenes de compra
**Permisos:** `compras:ver`
**Query params:** `page`, `limit`, `estado`

#### GET /compra/:id
**Descripción:** Obtener orden de compra por ID
**Permisos:** `compras:ver`

#### PATCH /compra/:id
**Descripción:** Actualizar orden de compra (solo si está PENDIENTE)
**Permisos:** `compras:editar`

#### DELETE /compra/:id
**Descripción:** Eliminar orden de compra (solo si está PENDIENTE)
**Permisos:** `compras:eliminar`

#### POST /compra/:id/recibir
**Descripción:** Marcar orden como recibida y actualizar inventario
**Permisos:** `compras:recibir`

**Ejemplo de petición:**
```json
{
  "detalles": [
    {
      "detalleId": 1,
      "cantidadRecibida": 45
    },
    {
      "detalleId": 2,
      "cantidadRecibida": 30
    }
  ],
  "observaciones": "Recibido completo, 5 unidades faltantes del primer producto"
}
```

#### GET /compra/proveedor/:proveedorId
**Descripción:** Obtener órdenes de compra por proveedor
**Permisos:** `compras:ver`


### 2. Caja - Apertura y Cierre de Turnos

#### POST /caja/abrir
**Descripción:** Abrir turno de caja
**Permisos:** `caja:abrir`

**Ejemplo de petición:**
```json
{
  "saldoInicial": 1000.00,
  "cajaId": 1,
  "observaciones": "Inicio de turno matutino"
}
```

**Ejemplo de respuesta:**
```json
{
  "id": 1,
  "usuarioId": 1,
  "cajaId": 1,
  "fechaApertura": "2024-06-18T08:00:00.000Z",
  "saldoInicial": 1000.00,
  "estado": "ABIERTO",
  "observaciones": "Inicio de turno matutino",
  "usuario": {
    "id": 1,
    "fullName": "Juan Pérez"
  }
}
```

#### POST /caja/:id/cerrar
**Descripción:** Cerrar turno de caja con arqueo
**Permisos:** `caja:cerrar`

**Ejemplo de petición:**
```json
{
  "saldoFinal": 1575.50,
  "observaciones": "Cierre normal, sin novedades"
}
```

**Ejemplo de respuesta:**
```json
{
  "id": 1,
  "usuarioId": 1,
  "cajaId": 1,
  "fechaApertura": "2024-06-18T08:00:00.000Z",
  "fechaCierre": "2024-06-18T18:00:00.000Z",
  "saldoInicial": 1000.00,
  "saldoFinal": 1575.50,
  "totalIngresos": 600.00,
  "totalEgresos": 25.00,
  "diferencia": 0.50,
  "estado": "CERRADO",
  "observaciones": "Inicio de turno matutino\n[CIERRE] Cierre normal, sin novedades"
}
```

#### GET /caja/actual
**Descripción:** Obtener turno actual del usuario con resumen
**Permisos:** `caja:ver`

**Ejemplo de respuesta:**
```json
{
  "id": 1,
  "usuarioId": 1,
  "saldoInicial": 1000.00,
  "fechaApertura": "2024-06-18T08:00:00.000Z",
  "tickets": [
    {
      "id": 1,
      "numeroTicket": 1,
      "total": 125.50,
      "createdAt": "2024-06-18T10:00:00.000Z"
    }
  ],
  "resumen": {
    "saldoInicial": 1000.00,
    "totalIngresos": 125.50,
    "totalEgresos": 0.00,
    "saldoActual": 1125.50,
    "ventasRealizadas": 1,
    "ventasTotal": 125.50
  }
}
```

#### GET /caja/turnos
**Descripción:** Obtener historial de turnos
**Permisos:** `caja:ver`
**Query params:** `page`, `limit`, `usuarioId`, `estado`

#### GET /caja/turnos/:id
**Descripción:** Obtener turno por ID con todas sus ventas
**Permisos:** `caja:ver`

#### GET /caja/turnos/:id/movimientos
**Descripción:** Obtener movimientos de efectivo de un turno
**Permisos:** `caja:ver`

### 3. Reportes

#### GET /reportes/ventas
**Descripción:** Reporte completo de ventas
**Permisos:** `reportes:ver`
**Query params:** `desde`, `hasta`

**Ejemplo de respuesta:**
```json
{
  "periodo": {
    "desde": "2024-06-01",
    "hasta": "2024-06-18"
  },
  "resumen": {
    "totalTickets": 150,
    "subtotal": 12500.00,
    "impuestos": 2000.00,
    "descuentos": 500.00,
    "total": 14000.00,
    "ticketPromedio": 93.33
  },
  "ventasPorDia": [
    {
      "fecha": "2024-06-18",
      "tickets": 25,
      "total": 2500.00
    }
  ],
  "productosTopVentas": [
    {
      "producto": {
        "id": 1,
        "nombre": "Producto A",
        "codigoBarras": "123456789"
      },
      "cantidadVendida": 100,
      "totalVentas": 5000.00
    }
  ],
  "vendedoresRendimiento": [
    {
      "usuario": {
        "id": 1,
        "fullName": "Juan Pérez"
      },
      "ticketsVendidos": 75,
      "totalVentas": 7500.00
    }
  ]
}
```

#### GET /reportes/inventario
**Descripción:** Reporte de inventario con alertas de stock
**Permisos:** `reportes:ver`

**Ejemplo de respuesta:**
```json
{
  "resumen": {
    "totalProductos": 500,
    "productosConStock": 450,
    "productosAgotados": 25,
    "productosStockBajo": 75,
    "valorTotalInventario": 125000.00
  },
  "stockBajo": [
    {
      "id": 1,
      "nombre": "Producto A",
      "codigoBarras": "123456789",
      "categoria": "Electrónicos",
      "stock": 2,
      "stockMinimo": 10,
      "proveedor": "Proveedor XYZ",
      "estado": "STOCK_BAJO"
    }
  ],
  "resumenPorCategoria": [
    {
      "categoria": "Electrónicos",
      "totalProductos": 50,
      "stockTotal": 500,
      "valorInventario": 25000.00
    }
  ],
  "movimientosRecientes": [
    {
      "id": 1,
      "fecha": "2024-06-18T10:00:00.000Z",
      "tipo": "OUT",
      "cantidad": 2,
      "motivo": "Venta - Ticket #1",
      "producto": {
        "id": 1,
        "nombre": "Producto A"
      },
      "usuario": {
        "id": 1,
        "fullName": "Juan Pérez"
      }
    }
  ]
}
```

#### GET /reportes/financieros
**Descripción:** Reporte financiero con análisis de ingresos/egresos
**Permisos:** `reportes:ver`
**Query params:** `desde`, `hasta`

**Ejemplo de respuesta:**
```json
{
  "periodo": {
    "desde": "2024-06-01",
    "hasta": "2024-06-18"
  },
  "resumen": {
    "totalIngresos": 50000.00,
    "totalEgresos": 5000.00,
    "utilidadBruta": 45000.00,
    "margenUtilidad": 90.00,
    "ventasRealizadas": 150,
    "promedioVentaDiaria": 2777.78
  },
  "desglose": {
    "ingresosPorVentas": 48000.00,
    "ingresosPorMovimientos": 2000.00,
    "egresosPorMovimientos": 5000.00,
    "impuestosGenerados": 7680.00
  },
  "ventasPorDia": [
    {
      "fecha": "2024-06-18",
      "tickets": 25,
      "total": 2500.00
    }
  ],
  "resumenPorCaja": [
    {
      "cajaId": 1,
      "turnosCerrados": 18,
      "totalIngresos": 30000.00,
      "totalEgresos": 3000.00,
      "diferenciasAcumuladas": 25.50
    }
  ],
  "turnosCerrados": [
    {
      "id": 1,
      "cajaId": 1,
      "usuario": "Juan Pérez",
      "fechaApertura": "2024-06-18T08:00:00.000Z",
      "fechaCierre": "2024-06-18T18:00:00.000Z",
      "saldoInicial": 1000.00,
      "saldoFinal": 1575.50,
      "totalIngresos": 600.00,
      "totalEgresos": 25.00,
      "diferencia": 0.50,
      "estado": "SOBRANTE"
    }
  ]
}
```

#### GET /reportes/productos-vendidos
**Descripción:** Reporte de productos más vendidos
**Permisos:** `reportes:ver`
**Query params:** `desde`, `hasta`, `limit`

### 4. Ventas con Cálculos Mejorados

#### POST /venta/enhanced
**Descripción:** Crear venta con cálculos automáticos de impuestos y descuentos
**Permisos:** `ventas:crear`

**Ejemplo de petición:**
```json
{
  "usuarioId": 1,
  "turnoCajaId": 1,
  "items": [
    {
      "productoId": 1,
      "cantidad": 2,
      "precioUnitario": 50.00,
      "descuento": 5.00
    },
    {
      "productoId": 2,
      "cantidad": 1,
      "descuento": 0.00
    }
  ],
  "descuentoManual": 10.00,
  "recargoManual": 0.00,
  "observaciones": "Venta con descuento especial"
}
```

**Ejemplo de respuesta:**
```json
{
  "id": 1,
  "usuarioId": 1,
  "turnoCajaId": 1,
  "numeroTicket": 1,
  "fecha": "2024-06-18T10:00:00.000Z",
  "subtotal": 115.00,
  "impuestos": 18.40,
  "descuentoTotal": 15.00,
  "total": 118.40,
  "items": [
    {
      "id": 1,
      "productoId": 1,
      "cantidad": 2,
      "precioUnitario": 50.00,
      "descuento": 5.00,
      "impuesto": 15.20,
      "total": 110.20,
      "producto": {
        "id": 1,
        "nombre": "Producto A",
        "categoria": {
          "nombre": "Electrónicos"
        },
        "impuesto": {
          "nombre": "IVA",
          "porcentaje": 16.00
        }
      }
    }
  ],
  "calculatedTotals": {
    "subtotal": 115.00,
    "impuestos": 18.40,
    "descuentoTotal": 15.00,
    "total": 118.40
  }
}
```

#### GET /venta/:id/enhanced
**Descripción:** Obtener venta con todos los cálculos detallados
**Permisos:** `ventas:ver_propias` o `ventas:ver_todas`

## Validaciones y Reglas de Negocio

### Compras
- Solo se pueden editar/eliminar órdenes en estado PENDIENTE
- Al recibir, la cantidad no puede exceder la ordenada
- El inventario se actualiza automáticamente al recibir
- Se crean movimientos de stock automáticamente


### Caja
- Solo se puede tener un turno abierto por usuario
- No se puede abrir una caja que ya esté ocupada por otro usuario
- Solo se puede cerrar el propio turno
- Los cálculos de diferencia se realizan automáticamente
- Se incluyen ventas y movimientos de efectivo en los totales

### Reportes
- Todos los reportes son de solo lectura
- Los filtros de fecha validan formato YYYY-MM-DD
- Los reportes incluyen datos listos para exportar
- Los cálculos son en tiempo real

### Ventas con Cálculos
- Se verifica stock disponible antes de la venta
- Los impuestos se calculan según configuración por producto
- Los descuentos se aplican antes del cálculo de impuestos
- El inventario se actualiza automáticamente
- Se crean movimientos de stock automáticamente

## Códigos de Error Comunes

- **400 Bad Request:** Datos inválidos, validaciones fallidas
- **401 Unauthorized:** Token JWT inválido o expirado
- **403 Forbidden:** Sin permisos para realizar la acción
- **404 Not Found:** Recurso no encontrado
- **409 Conflict:** Conflicto de datos (duplicados, estados inválidos)
- **500 Internal Server Error:** Error interno del servidor

## Formatos de Fecha

Todos los endpoints que requieren fechas esperan formato ISO 8601:
- Para queries: `YYYY-MM-DD` (ej: `2024-06-18`)
- Para JSON: `YYYY-MM-DDTHH:mm:ss.sssZ` (ej: `2024-06-18T10:00:00.000Z`)

## Paginación

Los endpoints que retornan listas incluyen metadatos de paginación:

```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## Permisos Requeridos

Cada endpoint requiere permisos específicos. Los permisos se asignan por usuario y se validan en cada petición.

### Módulos de Permisos
- **compras:** crear, ver, editar, eliminar, recibir
- **caja:** abrir, cerrar, ver
- **reportes:** ver
- **ventas:** crear, ver_propias, ver_todas, editar, eliminar
