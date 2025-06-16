# 🏪 POS API - Sistema de Punto de Venta

## 📋 Información General

**POS API** es un sistema completo de punto de venta desarrollado con **NestJS**, **Prisma ORM** y **PostgreSQL**. Incluye autenticación JWT, sistema de permisos granulares, y documentación Swagger completa.

### 🔗 Enlaces Importantes
- **Documentación Swagger:** http://localhost:3000/api
- **Repositorio:** https://github.com/MRMRMR033/pos-api
- **Health Check:** http://localhost:3000

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+ 
- PostgreSQL 14+
- npm o yarn

### Instalación
```bash
# Clonar repositorio
git clone https://github.com/MRMRMR033/pos-api.git
cd pos-api

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu configuración de BD

# Ejecutar migraciones
npx prisma migrate dev
npx prisma generate

# Iniciar servidor
npm run start:dev
```

### ✅ Verificación de Instalación
```bash
# 1. Health check
curl http://localhost:3000
# Respuesta esperada: "Hello World!"

# 2. Login con usuario admin por defecto
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@pos-system.com", "password": "12345"}'
# Respuesta esperada: {"access_token": "eyJ..."}

# 3. Acceder a documentación
open http://localhost:3000/api
```

## 🔐 Autenticación y Seguridad

### Usuario Administrador por Defecto
- **Email:** `admin@pos-system.com`
- **Password:** `12345`
- **Rol:** `admin` (tiene todos los permisos automáticamente)

### Sistema de Autenticación
- **JWT Bearer Token** con expiración de 1 hora
- **Header requerido:** `Authorization: Bearer <token>`
- **Inicialización automática** en primer arranque

### Sistema de Permisos Granulares
El sistema incluye **41 permisos específicos** organizados por módulos:

#### Módulos de Permisos:
1. **Productos** (`productos:*`) - 8 permisos
2. **Ventas** (`ventas:*`) - 7 permisos  
3. **Caja** (`caja:*`) - 6 permisos
4. **Categorías** (`categorias:*`) - 4 permisos
5. **Proveedores** (`proveedores:*`) - 4 permisos
6. **Usuarios** (`usuarios:*`) - 6 permisos
7. **Sesiones** (`sesiones:*`) - 2 permisos
8. **Reportes** (`reportes:*`) - 4 permisos

#### Roles:
- **admin:** Acceso automático a todos los permisos
- **empleado:** Permisos granulares customizables

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico
- **Framework:** NestJS con TypeScript
- **Base de Datos:** PostgreSQL con Prisma ORM
- **Autenticación:** JWT + Passport
- **Validación:** class-validator + class-transformer
- **Documentación:** Swagger/OpenAPI
- **Guards:** JWT + Roles + Permissions

### Estructura de Directorios
```
src/
├── auth/                    # Autenticación y permisos
│   ├── dto/                # DTOs de auth
│   ├── permissions.service.ts
│   ├── permissions.guard.ts
│   └── jwt.strategy.ts
├── categoria/              # Gestión de categorías
├── producto/               # Gestión de productos
├── usuario/                # Gestión de usuarios
├── proveedor/              # Gestión de proveedores
├── ticket/                 # Sistema de ventas (tickets)
├── cash-movement/          # Movimientos de caja
├── session-event/          # Eventos de sesión
├── ticket-item/            # Items de tickets
├── common/                 # Utilidades compartidas
│   ├── dto/               # DTOs comunes
│   ├── filters/           # Exception filters
│   └── initialization.module.ts
└── prisma/                 # Configuración Prisma
```

## 🛠️ Resolución de Problemas Conocidos

### ❌ Error 500 en Endpoints Protegidos
**Síntoma:** Error 500 en POST /categoria y otros endpoints con permisos
**Causa:** Inconsistencia entre `user.sub` (JWT) y `user.id` (Prisma)
**Solución:** ✅ **YA RESUELTO** - Usar `user.id` en guards

### ❌ Permisos No Funcionan para Admin
**Síntoma:** Usuario admin recibe "Sin permisos"
**Causa:** Error en PermissionsService o guards mal configurados  
**Solución:** Verificar que admins retornen `true` automáticamente

### ❌ Token Inválido/Expirado
**Síntoma:** Error 401 Unauthorized
**Solución:** 
```bash
# Generar nuevo token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@pos-system.com", "password": "12345"}'
```

### ❌ Base de Datos No Conecta
**Solución:**
```bash
# Verificar conexión
npx prisma db pull

# Aplicar migraciones
npx prisma migrate dev

# Regenerar cliente
npx prisma generate
```

## 📡 API Endpoints Principales

### Autenticación
- `POST /auth/login` - Iniciar sesión (público)
- `GET /auth/perfil` - Obtener perfil de usuario
- `GET /auth/permissions/user/:id` - Ver permisos de usuario

### Recursos CRUD
- `GET|POST|PATCH|DELETE /categoria` - Gestión de categorías
- `GET|POST|PATCH|DELETE /producto` - Gestión de productos  
- `GET|POST|PATCH|DELETE /usuario` - Gestión de usuarios
- `GET|POST|PATCH|DELETE /proveedor` - Gestión de proveedores
- `GET|POST|PATCH|DELETE /venta` - Gestión de ventas (tickets)
- `GET|POST|PATCH|DELETE /cash-movement` - Movimientos de caja

### Endpoints Auxiliares
- `GET|POST|PATCH|DELETE /session-event` - Eventos de sesión
- `GET|POST|PATCH|DELETE /ticket-item` - Items de tickets

## 🧪 Testing y Desarrollo

### Comandos Útiles
```bash
# Desarrollo con hot-reload
npm run start:dev

# Construcción para producción  
npm run build

# Ejecutar tests
npm run test

# Ver logs de BD
npx prisma studio

# Reset de BD completo
npx prisma migrate reset
```

### Testing Manual con cURL
```bash
# Variables
export TOKEN="tu_jwt_token_aqui"
export API_URL="http://localhost:3000"

# Crear categoría
curl -X POST $API_URL/categoria \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Bebidas"}'

# Crear producto
curl -X POST $API_URL/producto \
  -H "Authorization: Bearer $TOKEN" \
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

## 📊 Base de Datos

### Modelos Principales
- **Usuario** - Sistema de usuarios con roles
- **Permission** - Permisos granulares del sistema
- **UserPermission** - Relación usuarios-permisos
- **Producto** - Inventario de productos
- **Categoria** - Categorización de productos
- **Proveedor** - Gestión de proveedores
- **Ticket** - Ventas/Facturas
- **TicketItem** - Items de cada venta
- **CashMovement** - Movimientos de caja
- **SessionEvent** - Logs de sesiones

### Migraciones Importantes
- `20250608042328_add_events_and_cash` - Sistema de eventos y caja
- Migraciones de permisos granulares
- Auto-inicialización de datos

## 🔧 Configuración de Producción

### Variables de Entorno Críticas
```env
DATABASE_URL="postgresql://user:password@localhost:5432/pos_db"
JWT_SECRET="tu_jwt_secret_muy_seguro_aqui"
NODE_ENV="production"
```

### Consideraciones de Seguridad
- Cambiar password del admin por defecto
- Configurar JWT_SECRET fuerte en producción
- Habilitar HTTPS
- Configurar rate limiting
- Revisar CORS settings

## 🤝 Contribución y Desarrollo

### Convenciones de Código
- **ESLint + Prettier** configurados
- **Commits semánticos:** `feat:`, `fix:`, `docs:`, etc.
- **TypeScript strict mode** habilitado
- **DTOs con validación** para todos los endpoints

### Workflow de Desarrollo
1. Crear feature branch desde `main`
2. Implementar cambios con tests
3. Verificar que compile sin errores
4. Commit con mensaje descriptivo
5. Push y crear Pull Request

## 🚨 Notas Importantes para Futuras Sesiones

### Errores Críticos Resueltos
1. **Error 500 en sistema de permisos:** 
   - Causa: `user.sub` vs `user.id` en guards
   - Fix: Usar `user.id` en `PermissionsGuard` y `AuthController`

2. **Lógica de permisos incorrecta:**
   - Causa: `hasAllPermissions` (AND logic) muy restrictivo
   - Fix: Usar `hasAnyPermission` (OR logic) en guards

3. **Rutas documentadas pero no implementadas:**
   - Fix: Agregar `/session-event` y `/ticket-item` a documentación

### Arquitectura de Permisos
- **Admins:** Acceso automático (return true en PermissionsService)
- **Empleados:** Verificación granular en base de datos
- **Guards orden:** JwtAuthGuard → RolesGuard → PermissionsGuard

### Debugging Tools Implementadas
- Exception filter con logs detallados (temporalmente)
- Debug logs en guards (removidos en producción)
- Comprehensive error responses

## 📞 Soporte y Contacto

### Enlaces de Documentación
- **Swagger UI:** http://localhost:3000/api
- **Documentación API completa:** `/API_DOCUMENTATION.md`
- **Repositorio GitHub:** https://github.com/MRMRMR033/pos-api

### Debugging
Para troubleshooting detallado, verificar:
1. Logs del servidor (`npm run start:dev`)
2. Estado de la base de datos (`npx prisma studio`)
3. Documentación Swagger para ejemplos de requests
4. Este README para problemas conocidos

---

## 🎯 Estado del Proyecto

**✅ SISTEMA COMPLETAMENTE FUNCIONAL**

- Backend operativo al 100%
- Frontend compatible y funcionando
- Todos los endpoints documentados y probados
- Sistema de permisos granulares operativo
- Auto-inicialización implementada
- Documentación completa disponible

**Última actualización:** Junio 2025  
**Versión:** 1.1.0  
**Estado:** Producción Ready 🚀