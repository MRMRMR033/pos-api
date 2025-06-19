# 📋 SCHEMA DE API PARA FRONTEND

## 🗄️ **BASE DE DATOS ACTUALIZADA Y SINCRONIZADA**

La base de datos ha sido completamente actualizada y sincronizada con Prisma. Migración aplicada: `20250618201318_initial_complete_schema`

---

## 📊 **MODELOS DE DATOS**

### 👤 **Usuario**
```typescript
interface Usuario {
  id: number;
  email?: string;
  password: string; // Solo en request, nunca en response
  rol: "admin" | "empleado";
  fullName: string;
  createdAt: string; // ISO DateTime
  updatedAt: string; // ISO DateTime
}
```


### 📦 **Producto**
```typescript
interface Producto {
  id: number;
  codigoBarras: string; // Único
  nombre: string;
  precioCosto: number; // Decimal como number
  precioVenta: number; // Decimal como number
  precioEspecial?: number; // Decimal como number
  stock: number;
  stockMinimo: number;
  categoriaId: number;
  proveedorId?: number;
  impuestoId?: number;
  createdAt: string; // ISO DateTime
  updatedAt: string; // ISO DateTime
  updatedById?: number;
  
  // Relaciones (cuando se incluyen)
  categoria?: Categoria;
  proveedor?: Proveedor;
  impuesto?: ConfiguracionImpuesto;
  updatedBy?: Usuario;
}
```

### 🏷️ **Categoria**
```typescript
interface Categoria {
  id: number;
  nombre: string; // Único
}
```

### 🏢 **Proveedor**
```typescript
interface Proveedor {
  id: number;
  nombre: string; // Único
  contacto?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  condicionesPago?: string;
  descuentoPromedio: number; // Decimal como number (porcentaje)
}
```

### 🧾 **Ticket (Venta)**
```typescript
interface Ticket {
  id: number;
  usuarioId: number;
  turnoCajaId?: number;
  numeroTicket: number;
  fecha: string; // ISO DateTime
  subtotal: number; // Decimal como number
  impuestos: number; // Decimal como number
  descuentoTotal: number; // Decimal como number
  total: number; // Decimal como number
  createdAt: string; // ISO DateTime
  updatedAt: string; // ISO DateTime
  
  // Relaciones (cuando se incluyen)
  usuario?: Usuario;
  turnoCaja?: TurnoCaja;
  items?: TicketItem[];
}
```

### 📝 **TicketItem (Artículo de Venta)**
```typescript
interface TicketItem {
  id: number;
  ticketId: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number; // Decimal como number
  descuento: number; // Decimal como number
  impuesto: number; // Decimal como number
  total: number; // Decimal como number
  
  // Relaciones (cuando se incluyen)
  producto?: Producto;
  ticket?: Ticket;
}
```

### 💰 **TurnoCaja**
```typescript
interface TurnoCaja {
  id: number;
  usuarioId: number;
  cajaId: number; // Default: 1
  fechaApertura: string; // ISO DateTime
  fechaCierre?: string; // ISO DateTime
  saldoInicial: number; // Decimal como number
  saldoFinal?: number; // Decimal como number
  totalIngresos: number; // Decimal como number
  totalEgresos: number; // Decimal como number
  diferencia: number; // Decimal como number
  observaciones?: string;
  estado: "ABIERTO" | "CERRADO";
  
  // Relaciones (cuando se incluyen)
  usuario?: Usuario;
  tickets?: Ticket[];
}
```

### 🛒 **OrdenCompra**
```typescript
interface OrdenCompra {
  id: number;
  numeroOrden: string; // Único
  proveedorId: number;
  usuarioId: number;
  estado: "PENDIENTE" | "RECIBIDA" | "CANCELADA";
  fechaOrden: string; // ISO DateTime
  fechaEntrega?: string; // ISO DateTime
  subtotal: number; // Decimal como number
  impuestos: number; // Decimal como number
  total: number; // Decimal como number
  observaciones?: string;
  createdAt: string; // ISO DateTime
  updatedAt: string; // ISO DateTime
  
  // Relaciones (cuando se incluyen)
  proveedor?: Proveedor;
  usuario?: Usuario;
  detalles?: DetalleOrdenCompra[];
}
```

### 📋 **DetalleOrdenCompra**
```typescript
interface DetalleOrdenCompra {
  id: number;
  ordenCompraId: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number; // Decimal como number
  total: number; // Decimal como number
  
  // Relaciones (cuando se incluyen)
  ordenCompra?: OrdenCompra;
  producto?: Producto;
}
```

### 📈 **StockMovement (Movimientos de Inventario)**
```typescript
interface StockMovement {
  id: number;
  productoId: number;
  tipo: "IN" | "OUT";
  cantidad: number;
  motivo?: string;
  usuarioId: number;
  createdAt: string; // ISO DateTime
  
  // Relaciones (cuando se incluyen)
  producto?: Producto;
  usuario?: Usuario;
}
```

### 💵 **CashMovement (Movimientos de Efectivo)**
```typescript
interface CashMovement {
  id: number;
  usuarioId: number;
  tipo: "IN" | "OUT";
  monto: number; // Decimal como number
  descripcion?: string;
  createdAt: string; // ISO DateTime
  
  // Relaciones (cuando se incluyen)
  usuario?: Usuario;
}
```

### 🔐 **Permission (Permisos)**
```typescript
interface Permission {
  id: number;
  key: string; // Único (ej: "PRODUCTOS_CREATE")
  name: string;
  description?: string;
  module: string; // "PRODUCTOS", "CLIENTES", etc.
  createdAt: string; // ISO DateTime
}
```

### 👥 **UserPermission (Permisos de Usuario)**
```typescript
interface UserPermission {
  id: number;
  usuarioId: number;
  permissionId: number;
  granted: boolean;
  grantedAt: string; // ISO DateTime
  grantedById?: number;
  
  // Relaciones (cuando se incluyen)
  grantedBy?: Usuario;
  permission?: Permission;
  usuario?: Usuario;
}
```

### 💼 **ConfiguracionImpuesto**
```typescript
interface ConfiguracionImpuesto {
  id: number;
  nombre: string;
  porcentaje: number; // Decimal como number
  aplicadoPorDefecto: boolean;
  activo: boolean;
  createdAt: string; // ISO DateTime
  updatedAt: string; // ISO DateTime
}
```

### 📊 **SessionEvent (Eventos de Sesión)**
```typescript
interface SessionEvent {
  id: number;
  usuarioId: number;
  tipo: "LOGIN" | "LOGOUT";
  timestamp: string; // ISO DateTime
  
  // Relaciones (cuando se incluyen)
  usuario?: Usuario;
}
```

---

## 🎯 **ENDPOINTS CON DTOs ACTUALIZADOS**

### 🔐 **AUTH**

#### POST `/auth/register`
```typescript
// Request
interface RegisterDto {
  email: string;
  password: string;
  fullName: string;
  rol: "admin" | "empleado";
}

// Response
interface AuthResponse {
  message: string;
  usuario: Omit<Usuario, 'password'>;
}
```

#### POST `/auth/login`
```typescript
// Request
interface LoginDto {
  email: string;
  password: string;
}

// Response
interface LoginResponse {
  access_token: string;
  usuario: Omit<Usuario, 'password'>;
}
```


### 📦 **PRODUCTOS**

#### POST `/producto`
```typescript
// Request
interface CreateProductoDto {
  codigoBarras: string;
  nombre: string;
  precioCosto: number;
  precioVenta: number;
  precioEspecial?: number;
  stock?: number; // Default: 0
  stockMinimo?: number; // Default: 0
  categoriaId: number;
  proveedorId?: number;
  impuestoId?: number;
}
```

### 💰 **CAJA**

#### POST `/caja/abrir`
```typescript
// Request
interface AbrirCajaDto {
  saldoInicial: number;
  observaciones?: string;
}
```

#### POST `/caja/:id/cerrar`
```typescript
// Request
interface CerrarCajaDto {
  saldoFinal: number;
  observaciones?: string;
}
```

### 🛒 **COMPRAS**

#### POST `/compra`
```typescript
// Request
interface CreateOrdenCompraDto {
  proveedorId: number;
  fechaEntrega?: string; // ISO Date
  observaciones?: string;
  detalles: Array<{
    productoId: number;
    cantidad: number;
    precioUnitario: number;
  }>;
}
```

#### POST `/compra/:id/recibir`
```typescript
// Request
interface RecibirCompraDto {
  observaciones?: string;
  detallesRecibidos: Array<{
    productoId: number;
    cantidadRecibida: number;
  }>;
}
```

### 🎫 **TICKETS/VENTAS**

#### POST `/ticket`
```typescript
// Request
interface CreateTicketDto {
  items: Array<{
    productoId: number;
    cantidad: number;
    precioUnitario?: number; // Si no se envía, usa precio del producto
    descuento?: number; // Default: 0
  }>;
  descuentoTotal?: number; // Default: 0
  observaciones?: string;
}
```

---

## 📊 **REPORTES - RESPONSES**

### 📈 **GET `/reportes/ventas`**
```typescript
interface ReporteVentas {
  periodo: {
    desde: string; // YYYY-MM-DD
    hasta: string; // YYYY-MM-DD
  };
  resumen: {
    totalTickets: number;
    subtotal: number;
    impuestos: number;
    descuentos: number;
    total: number;
    ticketPromedio: number;
  };
  ventasPorDia: Array<{
    fecha: string; // YYYY-MM-DD
    tickets: number;
    total: number;
  }>;
  productosTopVentas: Array<{
    producto: {
      id: number;
      nombre: string;
      codigoBarras: string;
    };
    cantidadVendida: number;
    totalVentas: number;
  }>;
  ventasPorVendedor: Array<{
    vendedor: {
      id: number;
      fullName: string;
    };
    tickets: number;
    total: number;
  }>;
}
```

### 📦 **GET `/reportes/inventario`**
```typescript
interface ReporteInventario {
  resumen: {
    totalProductos: number;
    productosConStock: number;
    productosAgotados: number;
    productosStockBajo: number;
    valorTotalInventario: number;
  };
  stockBajo: Array<{
    id: number;
    nombre: string;
    codigoBarras: string;
    categoria: string;
    stock: number;
    stockMinimo: number;
    proveedor: string;
    estado: "AGOTADO" | "STOCK_BAJO";
  }>;
  resumenPorCategoria: Array<{
    categoria: string;
    totalProductos: number;
    stockTotal: number;
    valorInventario: number;
  }>;
  movimientosRecientes: Array<{
    id: number;
    tipo: "IN" | "OUT";
    cantidad: number;
    motivo?: string;
    producto: {
      nombre: string;
    };
    usuario: {
      fullName: string;
    };
    createdAt: string;
  }>;
}
```

---

## 🚨 **CONSIDERACIONES IMPORTANTES PARA EL FRONTEND**

### 1. **Manejo de Decimales**
- Todos los campos monetarios (precios, totales, montos) se envían como `number`
- La API convierte automáticamente entre Decimal (base de datos) y number (JSON)

### 2. **Fechas**
- Todas las fechas se manejan en formato ISO string: `"2024-01-01T10:30:00.000Z"`
- Para filtros de fecha en query params, usar formato: `"YYYY-MM-DD"`

### 3. **Autenticación**
- Incluir header: `Authorization: Bearer <token>`
- El token expira en 1 hora

### 4. **Paginación**
- Query params estándar: `?page=1&limit=10`
- Response siempre incluye `meta` con información de paginación

### 5. **Permisos**
- Cada endpoint requiere permisos específicos
- Los permisos se validan automáticamente en el backend

### 6. **Relaciones**
- Los objetos pueden incluir relaciones dependiendo del endpoint
- No todas las relaciones se incluyen por defecto (para optimización)

### 7. **Estados de Enums**
```typescript
type Rol = "admin" | "empleado";
type EstadoTurno = "ABIERTO" | "CERRADO";
type EstadoOrden = "PENDIENTE" | "RECIBIDA" | "CANCELADA";
type MovimientoTipo = "IN" | "OUT";
type EventoTipo = "LOGIN" | "LOGOUT";
```

### 8. **Códigos HTTP**
- `200`: Éxito
- `201`: Creado
- `400`: Bad Request (datos inválidos)
- `401`: No autorizado
- `403`: Sin permisos
- `404`: No encontrado
- `409`: Conflicto (ej: email duplicado)
- `500`: Error interno

---

## ✅ **VERIFICACIÓN PARA EL FRONTEND**

El frontend debe verificar que está:

1. ✅ **Enviando los DTOs correctos** según los schemas definidos
2. ✅ **Manejando las respuestas** con los tipos TypeScript correctos
3. ✅ **Implementando paginación** usando `page` y `limit`
4. ✅ **Gestionando fechas** en formato ISO
5. ✅ **Enviando headers de autenticación** en todos los requests protegidos
6. ✅ **Manejando errores HTTP** apropiadamente
7. ✅ **Usando enums correctos** para estados y tipos
8. ✅ **Tratando números decimales** como `number` en JavaScript/TypeScript

La base de datos está 100% sincronizada y todos los endpoints están funcionando correctamente.