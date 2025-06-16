# 📚 POS API - Documentación Completa

## 🚀 Información General

**POS API** es un sistema RESTful completo para gestión de punto de venta desarrollado con NestJS, Prisma y PostgreSQL.

### 🔗 Enlaces Importantes
- **Documentación Swagger:** http://localhost:3000/api
- **Repositorio:** https://github.com/MRMRMR033/pos-api
- **Health Check:** http://localhost:3000

## 🔐 Autenticación

### JWT Bearer Token
La API utiliza autenticación JWT. Incluye el token en el header Authorization:
```
Authorization: Bearer <tu_jwt_token>
```

### Usuario por Defecto
```json
{
  "email": "admin@pos-system.com",
  "password": "12345"
}
```

## 📋 Endpoints Principales

### 🔑 Autenticación (`/auth`)
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/auth/login` | Iniciar sesión | ❌ Público |
| POST | `/auth/register` | Registrar usuario | ❌ Público |
| GET | `/auth/perfil` | Obtener perfil | ✅ JWT |
| GET | `/auth/permissions/all` | Listar permisos | ✅ JWT + Permisos |
| GET | `/auth/permissions/user/:id` | Permisos de usuario | ✅ JWT + Permisos |
| POST | `/auth/permissions/grant` | Otorgar permiso | ✅ JWT + Permisos |
| POST | `/auth/permissions/revoke` | Revocar permiso | ✅ JWT + Permisos |

### 📦 Productos (`/producto`)
| Método | Endpoint | Descripción | Permiso Requerido |
|--------|----------|-------------|-------------------|
| POST | `/producto` | Crear producto | `productos:crear` |
| GET | `/producto` | Listar productos | `productos:ver` |
| GET | `/producto/:id` | Obtener producto | `productos:ver` |
| PATCH | `/producto/:id` | Actualizar producto | `productos:editar` |
| DELETE | `/producto/:id` | Eliminar producto | `productos:eliminar` |

### 👥 Usuarios (`/usuario`)
| Método | Endpoint | Descripción | Permiso Requerido |
|--------|----------|-------------|-------------------|
| POST | `/usuario` | Crear usuario | `usuarios:crear` |
| GET | `/usuario` | Listar usuarios | `usuarios:ver_todos` |
| GET | `/usuario/:id` | Obtener usuario | `usuarios:ver_todos` o `usuarios:ver_propio` |
| PATCH | `/usuario/:id` | Actualizar usuario | `usuarios:editar` |
| DELETE | `/usuario/:id` | Eliminar usuario | `usuarios:eliminar` |

### 🏷️ Categorías (`/categoria`)
| Método | Endpoint | Descripción | Permiso Requerido |
|--------|----------|-------------|-------------------|
| POST | `/categoria` | Crear categoría | `categorias:crear` |
| GET | `/categoria` | Listar categorías | `categorias:ver` |
| GET | `/categoria/:id` | Obtener categoría | `categorias:ver` |
| PATCH | `/categoria/:id` | Actualizar categoría | `categorias:editar` |
| DELETE | `/categoria/:id` | Eliminar categoría | `categorias:eliminar` |

### 🏢 Proveedores (`/proveedor`)
| Método | Endpoint | Descripción | Permiso Requerido |
|--------|----------|-------------|-------------------|
| POST | `/proveedor` | Crear proveedor | `proveedores:crear` |
| GET | `/proveedor` | Listar proveedores | `proveedores:ver` |
| GET | `/proveedor/:id` | Obtener proveedor | `proveedores:ver` |
| PATCH | `/proveedor/:id` | Actualizar proveedor | `proveedores:editar` |
| DELETE | `/proveedor/:id` | Eliminar proveedor | `proveedores:eliminar` |

### 🎫 Ventas (`/venta`)
| Método | Endpoint | Descripción | Permiso Requerido |
|--------|----------|-------------|-------------------|
| POST | `/venta` | Crear venta | `ventas:crear` |
| GET | `/venta` | Listar ventas | `ventas:ver_todas` o `ventas:ver_propias` |
| GET | `/venta/:id` | Obtener venta | `ventas:ver_todas` o `ventas:ver_propias` |
| PATCH | `/venta/:id` | Actualizar venta | `ventas:editar` |
| DELETE | `/venta/:id` | Eliminar venta | `ventas:eliminar` |

### 💰 Caja (`/cash-movement`)
| Método | Endpoint | Descripción | Permiso Requerido |
|--------|----------|-------------|-------------------|
| POST | `/cash-movement` | Registrar movimiento | `caja:registrar_entrada` o `caja:registrar_salida` |
| GET | `/cash-movement` | Listar movimientos | `caja:ver_movimientos_todos` o `caja:ver_movimientos` |
| GET | `/cash-movement/:id` | Obtener movimiento | `caja:ver_movimientos_todos` o `caja:ver_movimientos` |
| PATCH | `/cash-movement/:id` | Actualizar movimiento | `caja:ver_movimientos_todos` |
| DELETE | `/cash-movement/:id` | Eliminar movimiento | `caja:ver_movimientos_todos` |

### 📋 Elementos de Ticket (`/ticket-item`)
| Método | Endpoint | Descripción | Permiso Requerido |
|--------|----------|-------------|-------------------|
| POST | `/ticket-item` | Crear ítem de ticket | `ventas:crear` |
| GET | `/ticket-item` | Listar ítems de ticket | `ventas:ver_todas` o `ventas:ver_propias` |
| GET | `/ticket-item/:id` | Obtener ítem de ticket | `ventas:ver_todas` o `ventas:ver_propias` |
| PATCH | `/ticket-item/:id` | Actualizar ítem de ticket | `ventas:editar` |
| DELETE | `/ticket-item/:id` | Eliminar ítem de ticket | `ventas:eliminar` |

### 🔄 Eventos de Sesión (`/session-event`)
| Método | Endpoint | Descripción | Permiso Requerido |
|--------|----------|-------------|-------------------|
| POST | `/session-event` | Registrar evento de sesión | `sesiones:ver_propias` |
| GET | `/session-event` | Listar eventos de sesión | `sesiones:ver_todas` o `sesiones:ver_propias` |
| GET | `/session-event/:id` | Obtener evento de sesión | `sesiones:ver_todas` o `sesiones:ver_propias` |
| PATCH | `/session-event/:id` | Actualizar evento de sesión | `sesiones:ver_todas` |
| DELETE | `/session-event/:id` | Eliminar evento de sesión | `sesiones:ver_todas` |

## 🔐 Sistema de Permisos

### Roles
- **Admin:** Acceso completo automático
- **Empleado:** Permisos granulares customizables

### Módulos de Permisos
1. **Productos:** `productos:*`
2. **Ventas:** `ventas:*`
3. **Caja:** `caja:*`
4. **Usuarios:** `usuarios:*`
5. **Categorías:** `categorias:*`
6. **Proveedores:** `proveedores:*`
7. **Sesiones:** `sesiones:*`
8. **Reportes:** `reportes:*`

### Permisos Específicos
```
productos:ver
productos:ver_precio_costo
productos:ver_precio_venta
productos:crear
productos:editar
productos:eliminar
productos:ver_stock
productos:ajustar_stock

ventas:crear
ventas:ver_propias
ventas:ver_todas
ventas:cancelar
ventas:aplicar_descuento
ventas:editar
ventas:eliminar

... y más
```

## 📝 Ejemplos de Uso

### 1. Login y Obtener Token
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@pos-system.com",
    "password": "12345"
  }'
```

**Respuesta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Crear Producto
```bash
curl -X POST http://localhost:3000/producto \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "codigoBarras": "7894900011517",
    "nombre": "Coca Cola 350ml",
    "precioCosto": 1.50,
    "precioVenta": 2.50,
    "categoriaId": 1,
    "stock": 100
  }'
```

### 3. Obtener Permisos de Usuario
```bash
curl -X GET http://localhost:3000/auth/permissions/user/2 \
  -H "Authorization: Bearer <token>"
```

### 4. Listar Productos
```bash
curl -X GET http://localhost:3000/producto \
  -H "Authorization: Bearer <token>"
```

## 🚨 Códigos de Error

| Código | Descripción | Ejemplo |
|--------|-------------|---------|
| 400 | Bad Request | Datos inválidos |
| 401 | Unauthorized | Token inválido/expirado |
| 403 | Forbidden | Sin permisos suficientes |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Recurso duplicado |
| 422 | Unprocessable Entity | Error de validación |
| 500 | Internal Server Error | Error del servidor |

## 🔧 Configuración de Desarrollo

### Variables de Entorno
```env
DATABASE_URL="postgresql://user:password@localhost:5432/pos_db"
JWT_SECRET="tu_jwt_secret_seguro"
```

### Comandos Útiles
```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run start:dev

# Ejecutar migraciones
npx prisma migrate dev

# Generar cliente Prisma
npx prisma generate

# Ver documentación
http://localhost:3000/api
```

## 📊 Estructura de Respuestas

### Respuesta Exitosa
```json
{
  "id": 1,
  "nombre": "Producto",
  "precio": 10.50,
  "createdAt": "2025-06-16T10:30:00.000Z"
}
```

### Respuesta de Error
```json
{
  "statusCode": 400,
  "timestamp": "2025-06-16T10:30:00.000Z",
  "path": "/producto",
  "message": ["El código de barras ya existe"],
  "error": "Bad Request"
}
```

### Respuesta Paginada
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15,
    "hasPreviousPage": false,
    "hasNextPage": true
  }
}
```

## 🛡️ Seguridad

- **JWT tokens** con expiración de 1 hora
- **Permisos granulares** por endpoint
- **Validación de entrada** con class-validator
- **Hash de contraseñas** con bcrypt
- **Rate limiting** (recomendado para producción)

## 📱 Integración Frontend

### Headers Requeridos
```javascript
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

### Manejo de Permisos
```javascript
// Verificar permisos en frontend
const hasPermission = (permission) => {
  return userPermissions.some(p => p.key === permission);
};

// Ejemplo de uso
if (hasPermission('productos:ver_precio_costo')) {
  // Mostrar precio de costo
}
```

## 🔄 Ciclo de Vida de una Venta

1. **Autenticación** del usuario
2. **Verificación de permisos** (`ventas:crear`)
3. **Selección de productos**
4. **Cálculo de totales**
5. **Registro del ticket**
6. **Actualización de inventario**
7. **Registro de movimiento de caja**

## 📞 Soporte

Para soporte técnico o reportar bugs:
- **Email:** admin@pos-system.com
- **GitHub Issues:** https://github.com/MRMRMR033/pos-api/issues

---

**Versión:** 1.0.0  
**Última actualización:** Junio 2025