/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaClient } from '@prisma/client';
import { AppModule } from './../src/app.module';
import { assertLocalDatabase } from './helpers/database-guard';

const TEST_ADMIN_EMAIL = 'test-admin@example.com';
const TEST_SECOND_ADMIN_EMAIL = 'another-admin@example.com';
const TEST_MATERIA_PRIMA_NOMBRE = 'Rosa de prueba';
const TEST_RAMO_NOMBRE_PREFIX = 'Ramo ';

describe('RamosController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaClient;
  let token: string;
  let userId: number;
  let materiaPrimaId: number;
  const createdRamoIds: number[] = [];

  beforeAll(async () => {
    assertLocalDatabase();

    prisma = new PrismaClient();
    await prisma.$connect();

    // Remove stale rows from previous interrupted runs so the suite can
    // bootstrap on a predictable local database. The guard above guarantees
    // this only ever targets a local database.
    await prisma.$transaction([
      prisma.receta.deleteMany({
        where: {
          OR: [
            { ramo: { nombre: { startsWith: TEST_RAMO_NOMBRE_PREFIX } } },
            { materiaPrima: { nombre: TEST_MATERIA_PRIMA_NOMBRE } },
          ],
        },
      }),
      prisma.ramo.deleteMany({
        where: { nombre: { startsWith: TEST_RAMO_NOMBRE_PREFIX } },
      }),
      prisma.materiaPrima.deleteMany({
        where: { nombre: TEST_MATERIA_PRIMA_NOMBRE },
      }),
      prisma.usuario.deleteMany({
        where: {
          email: { in: [TEST_ADMIN_EMAIL, TEST_SECOND_ADMIN_EMAIL] },
        },
      }),
    ]);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();

    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: TEST_ADMIN_EMAIL, password: 'password123' });
    expect(registerRes.status).toBe(201);
    userId = registerRes.body.id as number;

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: TEST_ADMIN_EMAIL, password: 'password123' });
    expect(loginRes.status).toBe(200);
    token = loginRes.body.token as string;

    const mpRes = await request(app.getHttpServer())
      .post('/materias-primas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: TEST_MATERIA_PRIMA_NOMBRE,
        unidad: 'unidad',
        stockActual: 100,
        costoUnitario: 1.5,
        stockMinimoAlerta: 5,
      });
    expect(mpRes.status).toBe(201);
    materiaPrimaId = mpRes.body.id as number;
  });

  afterAll(async () => {
    if (prisma) {
      if (createdRamoIds.length > 0) {
        await prisma.receta.deleteMany({
          where: { ramoId: { in: createdRamoIds } },
        });
        await prisma.ramo.deleteMany({
          where: { id: { in: createdRamoIds } },
        });
      }
      if (materiaPrimaId) {
        await prisma.materiaPrima.delete({ where: { id: materiaPrimaId } });
      }
      if (userId) {
        await prisma.usuario.delete({ where: { id: userId } });
      }
      await prisma.$disconnect();
    }
    if (app) {
      await app.close();
    }
  });

  it('POST /auth/register twice: first 201, second 403', async () => {
    const second = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: TEST_SECOND_ADMIN_EMAIL, password: 'password123' });
    expect(second.status).toBe(403);
  });

  it('POST /ramos with missing nombre -> 400', async () => {
    const res = await request(app.getHttpServer())
      .post('/ramos')
      .set('Authorization', `Bearer ${token}`)
      .field('tamano', 'Mediano')
      .field('precioVenta', '10.50');
    expect(res.status).toBe(400);
  });

  it('POST /ramos with bad tamano -> 400', async () => {
    const res = await request(app.getHttpServer())
      .post('/ramos')
      .set('Authorization', `Bearer ${token}`)
      .field('nombre', 'Ramo X')
      .field('tamano', 'Gigante')
      .field('precioVenta', '10.50');
    expect(res.status).toBe(400);
  });

  it('POST /ramos with malformed recetas JSON -> 400', async () => {
    const res = await request(app.getHttpServer())
      .post('/ramos')
      .set('Authorization', `Bearer ${token}`)
      .field('nombre', 'Ramo X')
      .field('tamano', 'Mediano')
      .field('precioVenta', '10.50')
      .field('recetas', 'not-json');
    expect(res.status).toBe(400);
  });

  it('POST /ramos with valid payload -> 201 and expected response shape', async () => {
    const res = await request(app.getHttpServer())
      .post('/ramos')
      .set('Authorization', `Bearer ${token}`)
      .field('nombre', 'Ramo E2E')
      .field('tamano', 'Mediano')
      .field('precioVenta', '25.00')
      .field('stock', '10')
      .field('recetas', JSON.stringify([{ materiaPrimaId, cantidad: 2 }]));

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: expect.any(Number),
      nombre: 'Ramo E2E',
      tamano: 'Mediano',
      precioVenta: 25,
      stock: 10,
      activo: true,
      fotoUrl: null,
      costoCalculado: expect.any(Number),
      margen: expect.any(Number),
      createdAt: expect.any(String),
      recetas: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          cantidad: 2,
          materiaPrima: expect.objectContaining({
            id: materiaPrimaId,
            nombre: expect.any(String),
            stockActual: expect.any(Number),
          }),
        }),
      ]),
    });

    createdRamoIds.push(res.body.id as number);
  });

  it('POST /ramos without stock (frontend default) and empty recetas -> 201 with stock 0', async () => {
    const res = await request(app.getHttpServer())
      .post('/ramos')
      .set('Authorization', `Bearer ${token}`)
      .field('nombre', 'Ramo sin stock')
      .field('tamano', 'Pequeño')
      .field('precioVenta', '15.00')
      .field('recetas', '[]');

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      nombre: 'Ramo sin stock',
      tamano: 'Pequeno',
      precioVenta: 15,
      stock: 0,
      recetas: [],
    });

    createdRamoIds.push(res.body.id as number);
  });
});
