import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('CompraController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let userId: number;
  let proveedorId: number;
  let productoId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    
    await app.init();

    // Setup test data
    const testUser = await prisma.usuario.create({
      data: {
        email: 'test-compra@test.com',
        password: 'hashedpassword',
        fullName: 'Test User Compra',
        rol: 'admin',
      },
    });
    userId = testUser.id;

    // Create test proveedor
    const proveedor = await prisma.proveedor.create({
      data: {
        nombre: 'Test Proveedor E2E',
        email: 'proveedor@test.com',
      },
    });
    proveedorId = proveedor.id;

    // Create test producto
    const categoria = await prisma.categoria.upsert({
      where: { nombre: 'Test Categoria E2E' },
      update: {},
      create: { nombre: 'Test Categoria E2E' },
    });

    const producto = await prisma.producto.create({
      data: {
        codigoBarras: 'TEST-COMPRA-001',
        nombre: 'Test Producto Compra',
        precioCosto: 10.00,
        precioVenta: 15.00,
        stock: 100,
        categoriaId: categoria.id,
        proveedorId: proveedorId,
      },
    });
    productoId = producto.id;

    // Mock auth token (in real app, you'd get this from login endpoint)
    authToken = 'mock-jwt-token';
  });

  afterAll(async () => {
    // Cleanup
    await prisma.detalleOrdenCompra.deleteMany({});
    await prisma.ordenCompra.deleteMany({});
    await prisma.producto.deleteMany({ where: { codigoBarras: 'TEST-COMPRA-001' } });
    await prisma.proveedor.deleteMany({ where: { nombre: 'Test Proveedor E2E' } });
    await prisma.categoria.deleteMany({ where: { nombre: 'Test Categoria E2E' } });
    await prisma.usuario.deleteMany({ where: { email: 'test-compra@test.com' } });
    
    await app.close();
  });

  describe('/compra (POST)', () => {
    it('should create a new purchase order', () => {
      const createDto = {
        numeroOrden: 'TEST-ORD-001',
        proveedorId: proveedorId,
        fechaEntrega: '2024-07-01',
        observaciones: 'Test order',
        detalles: [
          {
            productoId: productoId,
            cantidad: 10,
            precioUnitario: 12.00,
          },
        ],
      };

      return request(app.getHttpServer())
        .post('/compra')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.numeroOrden).toBe('TEST-ORD-001');
          expect(res.body.estado).toBe('PENDIENTE');
          expect(res.body.subtotal).toBe(120.00);
          expect(res.body.total).toBe(139.20); // 120 + 16% tax
          expect(res.body.detalles).toHaveLength(1);
        });
    });

    it('should fail with invalid data', () => {
      const invalidDto = {
        numeroOrden: '', // Invalid empty string
        proveedorId: 999, // Non-existent proveedor
        detalles: [], // Empty details
      };

      return request(app.getHttpServer())
        .post('/compra')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('/compra (GET)', () => {
    it('should get paginated purchase orders', () => {
      return request(app.getHttpServer())
        .get('/compra?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(res.body.meta).toHaveProperty('page');
          expect(res.body.meta).toHaveProperty('limit');
          expect(res.body.meta).toHaveProperty('total');
          expect(res.body.meta).toHaveProperty('totalPages');
        });
    });

    it('should filter by estado', () => {
      return request(app.getHttpServer())
        .get('/compra?estado=PENDIENTE')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.every(orden => orden.estado === 'PENDIENTE')).toBe(true);
        });
    });
  });

  describe('/compra/:id (GET)', () => {
    it('should get purchase order by id', async () => {
      // First create an order
      const orden = await prisma.ordenCompra.create({
        data: {
          numeroOrden: 'TEST-GET-001',
          proveedorId: proveedorId,
          usuarioId: userId,
          subtotal: 100,
          impuestos: 16,
          total: 116,
          detalles: {
            create: {
              productoId: productoId,
              cantidad: 5,
              precioUnitario: 20.00,
              total: 100.00,
            },
          },
        },
      });

      return request(app.getHttpServer())
        .get(`/compra/${orden.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(orden.id);
          expect(res.body.numeroOrden).toBe('TEST-GET-001');
          expect(res.body).toHaveProperty('detalles');
          expect(res.body).toHaveProperty('proveedor');
          expect(res.body).toHaveProperty('usuario');
        });
    });

    it('should return 404 for non-existent order', () => {
      return request(app.getHttpServer())
        .get('/compra/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/compra/:id/recibir (POST)', () => {
    it('should receive purchase order and update inventory', async () => {
      // Create an order to receive
      const orden = await prisma.ordenCompra.create({
        data: {
          numeroOrden: 'TEST-RECEIVE-001',
          proveedorId: proveedorId,
          usuarioId: userId,
          estado: 'PENDIENTE',
          subtotal: 100,
          impuestos: 16,
          total: 116,
          detalles: {
            create: {
              productoId: productoId,
              cantidad: 5,
              precioUnitario: 20.00,
              total: 100.00,
            },
          },
        },
        include: { detalles: true },
      });

      const initialStock = await prisma.producto.findUnique({
        where: { id: productoId },
        select: { stock: true },
      });

      const recibirDto = {
        detalles: [
          {
            detalleId: orden.detalles[0].id,
            cantidadRecibida: 5,
          },
        ],
        observaciones: 'Recibido completo',
      };

      await request(app.getHttpServer())
        .post(`/compra/${orden.id}/recibir`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(recibirDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.estado).toBe('RECIBIDA');
          expect(res.body.fechaEntrega).toBeTruthy();
        });

      // Verify stock was updated
      const updatedStock = await prisma.producto.findUnique({
        where: { id: productoId },
        select: { stock: true },
      });

      expect(updatedStock.stock).toBe(initialStock.stock + 5);

      // Verify stock movement was created
      const stockMovement = await prisma.stockMovement.findFirst({
        where: {
          productoId: productoId,
          tipo: 'IN',
          cantidad: 5,
        },
      });

      expect(stockMovement).toBeTruthy();
      expect(stockMovement.motivo).toContain('TEST-RECEIVE-001');
    });

    it('should fail to receive more than ordered', async () => {
      const orden = await prisma.ordenCompra.create({
        data: {
          numeroOrden: 'TEST-RECEIVE-FAIL-001',
          proveedorId: proveedorId,
          usuarioId: userId,
          estado: 'PENDIENTE',
          subtotal: 100,
          impuestos: 16,
          total: 116,
          detalles: {
            create: {
              productoId: productoId,
              cantidad: 5,
              precioUnitario: 20.00,
              total: 100.00,
            },
          },
        },
        include: { detalles: true },
      });

      const recibirDto = {
        detalles: [
          {
            detalleId: orden.detalles[0].id,
            cantidadRecibida: 10, // More than ordered (5)
          },
        ],
      };

      return request(app.getHttpServer())
        .post(`/compra/${orden.id}/recibir`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(recibirDto)
        .expect(400);
    });
  });

  describe('/compra/proveedor/:proveedorId (GET)', () => {
    it('should get purchase orders by supplier', () => {
      return request(app.getHttpServer())
        .get(`/compra/proveedor/${proveedorId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(res.body.data.every(orden => orden.proveedorId === proveedorId)).toBe(true);
        });
    });
  });
});