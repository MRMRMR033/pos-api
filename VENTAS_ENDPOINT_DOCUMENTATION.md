# 🛒 **DOCUMENTACIÓN COMPLETA - ENDPOINT DE VENTAS**

## 🎯 **ENDPOINT PRINCIPAL**

**Base URL**: `/ventas`  
**Método principal**: `POST /ventas`  
**Descripción**: Sistema completo de ventas con cálculo automático de totales, gestión de stock y permisos

---

## 📋 **POST /ventas - CREAR NUEVA VENTA**

### 🔐 **Autenticación Requerida**
```javascript
Headers: {
  'Authorization': 'Bearer <JWT_TOKEN>',
  'Content-Type': 'application/json'
}
```

### 📥 **REQUEST BODY SCHEMA**

```typescript
interface CreateVentaRequest {
  // ❗ usuarioId se toma automáticamente del JWT (no enviar)
  turnoCajaId?: number;         // Opcional - ID del turno de caja activo
  fecha?: string;               // Opcional - ISO string, default: ahora
  items: TicketItem[];          // ✅ REQUERIDO - Array de productos
  descuentoManual?: number;     // Opcional - Descuento aplicado al total
  recargoManual?: number;       // Opcional - Recargo aplicado al total
  observaciones?: string;       // Opcional - Notas adicionales
}

interface TicketItem {
  productoId: number;           // ✅ REQUERIDO - ID del producto
  cantidad?: number;            // Opcional - Default: 1
  precioUnitario?: number;      // Opcional - Si no se envía, usa precio del producto
  descuento?: number;           // Opcional - Descuento específico del item
}
```

### 🧪 **EJEMPLO DE REQUEST**

```javascript
// ✅ EJEMPLO BÁSICO (Mínimo requerido)
const ventaBasica = {
  "items": [
    {
      "productoId": 1,
      "cantidad": 2
    },
    {
      "productoId": 5,
      "cantidad": 1,
      "descuento": 5.00
    }
  ]
};

// ✅ EJEMPLO COMPLETO
const ventaCompleta = {
  "turnoCajaId": 456,
  "items": [
    {
      "productoId": 1,
      "cantidad": 2,
      "precioUnitario": 25.50,  // Precio especial
      "descuento": 2.00         // Descuento del item
    },
    {
      "productoId": 2,
      "cantidad": 1
      // precioUnitario se toma del producto
      // cantidad default: 1
    },
    {
      "productoId": 3,
      "cantidad": 3,
      "descuento": 5.00
    }
  ],
  "descuentoManual": 10.00,     // Descuento adicional al total
  "recargoManual": 5.00,        // Recargo adicional (ej: envío)
  "observaciones": "Venta con descuento especial"
};

// 🚀 HACER EL REQUEST
const response = await fetch('/ventas', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(ventaCompleta)
});

const venta = await response.json();
```

### 📤 **RESPONSE SCHEMA (201 Created)**

```typescript
interface VentaResponse {
  id: number;                   // ID único de la venta
  numeroTicket: number;         // Número secuencial por día/usuario
  usuarioId: number;            // ID del vendedor
  clienteId?: number;           // ID del cliente (si aplica)
  turnoCajaId?: number;         // ID del turno de caja
  fecha: string;                // ISO DateTime de la venta
  subtotal: number;             // Suma de todos los items (sin impuestos)
  impuestos: number;            // Total de impuestos calculados
  descuentoTotal: number;       // Total de descuentos aplicados
  total: number;                // Total final a pagar
  createdAt: string;            // Timestamp de creación
  updatedAt: string;            // Timestamp de última actualización
  
  // Relaciones incluidas
  items: TicketItemDetail[];    // Detalles de cada producto vendido
  usuario: UsuarioInfo;         // Información del vendedor
  cliente?: ClienteInfo;        // Información del cliente (si aplica)
  turnoCaja?: TurnoInfo;        // Información del turno de caja
  calculatedTotals: TotalesCalculados; // Verificación de cálculos
}

interface TicketItemDetail {
  id: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;       // Precio al momento de la venta
  descuento: number;            // Descuento aplicado al item
  impuesto: number;             // Impuesto calculado del item
  total: number;                // Total del item (cantidad * precio - descuento + impuesto)
  producto: {
    id: number;
    nombre: string;
    codigoBarras: string;
    categoria: {
      id: number;
      nombre: string;
    };
    impuesto?: {
      id: number;
      nombre: string;
      porcentaje: number;
    };
  };
}

interface UsuarioInfo {
  id: number;
  fullName: string;
}

interface ClienteInfo {
  id: number;
  nombre: string;
  email?: string;
  telefono?: string;
}

interface TurnoInfo {
  id: number;
  cajaId: number;
  fechaApertura: string;
}

interface TotalesCalculados {
  subtotal: number;
  impuestos: number;
  descuentoTotal: number;
  total: number;
}
```

### 🧪 **EJEMPLO DE RESPONSE**

```json
{
  "id": 1,
  "numeroTicket": 1,
  "usuarioId": 1,
  "clienteId": 123,
  "turnoCajaId": 456,
  "fecha": "2024-01-01T10:30:00.000Z",
  "subtotal": 75.50,
  "impuestos": 12.08,
  "descuentoTotal": 17.00,
  "total": 70.58,
  "createdAt": "2024-01-01T10:30:00.000Z",
  "updatedAt": "2024-01-01T10:30:00.000Z",
  "items": [
    {
      "id": 1,
      "productoId": 1,
      "cantidad": 2,
      "precioUnitario": 25.50,
      "descuento": 2.00,
      "impuesto": 7.84,
      "total": 56.84,
      "producto": {
        "id": 1,
        "nombre": "Coca-Cola 600ml",
        "codigoBarras": "1234567890123",
        "categoria": {
          "id": 1,
          "nombre": "Bebidas"
        },
        "impuesto": {
          "id": 1,
          "nombre": "IVA",
          "porcentaje": 16.00
        }
      }
    },
    {
      "id": 2,
      "productoId": 2,
      "cantidad": 1,
      "precioUnitario": 15.00,
      "descuento": 0.00,
      "impuesto": 2.40,
      "total": 17.40,
      "producto": {
        "id": 2,
        "nombre": "Papas Sabritas",
        "codigoBarras": "9876543210987",
        "categoria": {
          "id": 2,
          "nombre": "Snacks"
        },
        "impuesto": {
          "id": 1,
          "nombre": "IVA",
          "porcentaje": 16.00
        }
      }
    }
  ],
  "usuario": {
    "id": 1,
    "fullName": "Juan Pérez"
  },
  "cliente": {
    "id": 123,
    "nombre": "María García",
    "email": "maria@email.com",
    "telefono": "555-1234"
  },
  "turnoCaja": {
    "id": 456,
    "cajaId": 1,
    "fechaApertura": "2024-01-01T08:00:00.000Z"
  },
  "calculatedTotals": {
    "subtotal": 75.50,
    "impuestos": 12.08,
    "descuentoTotal": 17.00,
    "total": 70.58
  }
}
```

---

## ⚠️ **ERRORES COMUNES (400 Bad Request)**

### 🚫 **Stock Insuficiente**
```json
{
  "message": "Stock insuficiente para Coca-Cola 600ml. Stock disponible: 5, solicitado: 10",
  "statusCode": 400
}
```

### 🚫 **Producto No Encontrado**
```json
{
  "message": "Producto con ID 999 no encontrado",
  "statusCode": 400
}
```

### 🚫 **Items Vacíos**
```json
{
  "message": "La venta debe tener al menos un item",
  "statusCode": 400
}
```

### 🚫 **Validación de Datos**
```json
{
  "message": [
    "items.0.productoId must be a number",
    "items.0.cantidad must not be less than 1",
    "descuentoManual must not be less than 0"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

---

## 📜 **OTROS ENDPOINTS DISPONIBLES**

### 📋 **GET /ventas - LISTAR VENTAS**

```javascript
// Query parameters opcionales
const params = {
  page: 1,                    // Página (default: 1)
  limit: 10,                  // Items por página (default: 10)
  usuarioId: 123,             // Filtrar por vendedor
  clienteId: 456,             // Filtrar por cliente
  desde: '2024-01-01',        // Fecha inicio (YYYY-MM-DD)
  hasta: '2024-01-31'         // Fecha fin (YYYY-MM-DD)
};

const response = await fetch(`/ventas?${new URLSearchParams(params)}`);
```

**Response:**
```typescript
interface VentasListResponse {
  data: VentaResumen[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### 🔍 **GET /ventas/:id - OBTENER VENTA POR ID**

```javascript
const response = await fetch('/ventas/123');
const venta = await response.json(); // Mismo schema que POST
```

### ✏️ **PATCH /ventas/:id - ACTUALIZAR VENTA**

```javascript
const updateData = {
  numeroTicket: 2,  // Cambiar número de ticket
  fecha: '2024-01-01T15:00:00.000Z'  // Cambiar fecha
};

const response = await fetch('/ventas/123', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updateData)
});
```

### 🗑️ **DELETE /ventas/:id - CANCELAR VENTA**

```javascript
const response = await fetch('/ventas/123', {
  method: 'DELETE'
});

// Response: { "message": "Venta cancelada exitosamente" }
```

### 🔄 **POST /ventas/:id/recalcular - RECALCULAR TOTALES**

```javascript
const response = await fetch('/ventas/123/recalcular', {
  method: 'POST'
});
// Recalcula totales basándose en items actuales
```

---

## 🔒 **PERMISOS REQUERIDOS**

| Endpoint | Permisos |
|----------|----------|
| `POST /ventas` | `VENTAS_CREAR` |
| `GET /ventas` | `VENTAS_VER_TODAS` o `VENTAS_VER_PROPIAS` |
| `GET /ventas/:id` | `VENTAS_VER_TODAS` o `VENTAS_VER_PROPIAS` |
| `PATCH /ventas/:id` | `VENTAS_EDITAR` |
| `DELETE /ventas/:id` | `VENTAS_ELIMINAR` |
| `POST /ventas/:id/recalcular` | `VENTAS_EDITAR` |

**Nota**: Si el usuario solo tiene `VENTAS_VER_PROPIAS`, solo puede ver sus propias ventas.

---

## 🚀 **FUNCIONALIDADES AUTOMÁTICAS**

### ✅ **Lo que hace automáticamente el backend:**

1. **📊 Cálculo de totales**: Subtotal, impuestos, descuentos y total final
2. **📦 Descuento de stock**: Reduce automáticamente el inventario
3. **📝 Registro de movimientos**: Crea movimientos de stock de tipo "OUT"
4. **🔢 Numeración secuencial**: Genera número de ticket único por día/usuario
5. **👤 Seguridad**: El usuarioId se toma del JWT (no del request)
6. **💰 Aplicación de impuestos**: Calcula impuestos según configuración del producto
7. **🔄 Transacciones**: Todo se ejecuta en una transacción de BD

### ⚡ **Validaciones automáticas:**

1. **📦 Stock suficiente**: Verifica que hay inventario disponible
2. **🔍 Productos existentes**: Valida que todos los productos existan
3. **💯 Números positivos**: Cantidades, precios y descuentos deben ser >= 0
4. **📊 Decimales válidos**: Máximo 2 decimales en precios
5. **🚫 Items vacíos**: Debe tener al menos un producto
6. **🔐 Permisos**: Valida que el usuario tenga permisos necesarios

---

## 🎯 **CASOS DE USO COMUNES**

### 🛒 **Venta Simple (Sin Cliente)**
```javascript
{
  "items": [
    { "productoId": 1, "cantidad": 2 },
    { "productoId": 3, "cantidad": 1 }
  ]
}
```

### 👥 **Venta con Cliente**
```javascript
{
  "clienteId": 123,
  "items": [
    { "productoId": 1, "cantidad": 1 }
  ]
}
```

### 💰 **Venta con Descuento**
```javascript
{
  "items": [
    { 
      "productoId": 1, 
      "cantidad": 2,
      "descuento": 5.00  // Descuento por item
    }
  ],
  "descuentoManual": 10.00  // Descuento adicional al total
}
```

### 💵 **Venta con Precio Especial**
```javascript
{
  "items": [
    { 
      "productoId": 1, 
      "cantidad": 1,
      "precioUnitario": 20.00  // Precio especial (no el del producto)
    }
  ]
}
```

### 📋 **Venta con Observaciones**
```javascript
{
  "items": [
    { "productoId": 1, "cantidad": 1 }
  ],
  "observaciones": "Cliente mayorista - precio especial"
}
```

---

## ✅ **CHECKLIST PARA EL FRONTEND**

### **Antes de Enviar Request:**
- [ ] ¿Verificaste que hay stock suficiente?
- [ ] ¿Validaste que las cantidades son > 0?
- [ ] ¿Incluiste al menos un item?
- [ ] ¿Los precios tienen máximo 2 decimales?
- [ ] ¿Incluiste el header Authorization?

### **Después de Recibir Response:**
- [ ] ¿Mostraste el número de ticket al usuario?
- [ ] ¿Guardaste el ID de la venta para futuras referencias?
- [ ] ¿Actualizaste el stock en la UI?
- [ ] ¿Mostraste el total final calculado?
- [ ] ¿Manejaste errores de stock insuficiente?

### **Manejo de Errores:**
- [ ] ¿Stock insuficiente → Mostrar productos sin stock?
- [ ] ¿Producto no encontrado → Remover del carrito?
- [ ] ¿Error de permisos → Redirigir a login?
- [ ] ¿Error de validación → Mostrar campos específicos?

---

**🎉 ¡El endpoint de ventas está completamente funcional y documentado!** 🚀

**Próximos pasos recomendados:**
1. ✅ Probar el endpoint con Postman/Thunder Client
2. ✅ Implementar en el frontend siguiendo estos schemas
3. ✅ Agregar validaciones en tiempo real de stock
4. ✅ Implementar flujo completo: carrito → venta → recibo