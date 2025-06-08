/*
📦 Proyecto: Sistema POS híbrido local

🛠️ Framework principal: NestJS con Prisma ORM
🗃️ Base de datos: PostgreSQL local
🎯 Objetivo: API modular, segura y automatizada para punto de venta que funcione sin internet, sincronizable con un servidor remoto. Corre en una PC de tienda, inicia sola, sin intervención del usuario.

🧱 ENTIDADES PRINCIPALES:

1. Producto:
   - id: int (PK)
   - codigoBarras: string (único)
   - nombre: string
   - categoriaId: int (FK)
   - proveedorId: int (FK)
   - precioCosto: float
   - precioVenta: float
   - precioEspecial: float | null
   - stock: int
   - createdAt, updatedAt

2. Categoria:
   - id: int (PK)
   - nombre: string

3. Proveedor:
   - id: int (PK)
   - nombre: string

4. Usuario:
   - id: int (PK)
   - email: string
   - password: string (encriptada)
   - rol: enum ('admin' | 'empleado')

🔐 AUTENTICACIÓN Y AUTORIZACIÓN:
- JWT para login y protección de rutas
- Decorador @Roles('admin') para proteger acciones críticas
- Guard para verificar token y rol

📋 REQUISITOS DE PRUEBAS UNITARIAS (MUY IMPORTANTE):
- Cada servicio debe tener su prueba unitaria en `/__tests__` o `*.spec.ts`
- Usar Jest
- Probar métodos: create, findAll, findOne, update, delete
- Probar excepciones (NotFound, Conflict, etc.)
- Simular PrismaClient con mocks

🧪 ESTRUCTURA ESPERADA EN PRUEBAS:
- describe('[nombreServicio]')
- beforeEach con módulo de prueba Nest
- it('debería crear correctamente el recurso ...')
- expect(result).toEqual(mockResult)
- Probar también errores con expect(...).toThrow()

📂 ESTRUCTURA DEL PROYECTO (esperada por convención):
- src/
  - producto/
    - producto.module.ts
    - producto.controller.ts
    - producto.service.ts
    - dto/
      - create-producto.dto.ts
      - update-producto.dto.ts
    - producto.spec.ts (pruebas unitarias del servicio)
  - categoria/
  - proveedor/
  - usuario/
  - auth/

💡 Copilot, genera código limpio y modular con principios SOLID.  
Usa DTOs, validaciones con `class-validator`, y funciones reutilizables.  
Implementa pruebas unitarias completas. 
Evita lógica en controladores, delega todo al servicio.  
Asume que el backend debe poder instalarse en cualquier PC como sistema offline que corre solo.

*/
