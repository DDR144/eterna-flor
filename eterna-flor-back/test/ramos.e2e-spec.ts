/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AppModule } from './../src/app.module';
import { assertLocalDatabase } from './helpers/database-guard';

const TEST_ADMIN_EMAIL = 'test-admin@example.com';
const TEST_MATERIA_PRIMA_NOMBRE = 'Rosa de prueba';
// Cleanup prefixes are a de facto contract between the scripts that share this
// database: this suite deletes every row it created in a previous run by
// matching this prefix, so the prefix must never match a name a person would
// type by hand. The seed uses '[prueba] '; this suite uses '[e2e] '. A bare
// 'Ramo ' would delete any handmade bouquet whose name starts with it.
const TEST_RAMO_NOMBRE_PREFIX = '[e2e] Ramo ';
const testRamoName = (suffix: string) => `${TEST_RAMO_NOMBRE_PREFIX}${suffix}`;
const TEST_PASSWORD = 'password123';

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
        where: { email: TEST_ADMIN_EMAIL },
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

    // Create the test user directly in the database instead of using
    // POST /auth/register, because registration is only allowed while the
    // usuarios table is empty. Creating the row here lets the suite pass
    // whether the table is empty or already contains users (e.g. the local
    // duena@eternaflor.com account).
    const passwordHash = await bcrypt.hash(TEST_PASSWORD, 12);
    const user = await prisma.usuario.create({
      data: { email: TEST_ADMIN_EMAIL, passwordHash },
      select: { id: true, email: true },
    });
    userId = user.id;

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: TEST_ADMIN_EMAIL, password: TEST_PASSWORD });
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

  it('cleanup never targets a name a person would write by hand', () => {
    expect('Ramo de rosas rojas'.startsWith(TEST_RAMO_NOMBRE_PREFIX)).toBe(
      false,
    );
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
      .field('nombre', testRamoName('X'))
      .field('tamano', 'Gigante')
      .field('precioVenta', '10.50');
    expect(res.status).toBe(400);
  });

  it('POST /ramos with malformed recetas JSON -> 400', async () => {
    const res = await request(app.getHttpServer())
      .post('/ramos')
      .set('Authorization', `Bearer ${token}`)
      .field('nombre', testRamoName('X'))
      .field('tamano', 'Mediano')
      .field('precioVenta', '10.50')
      .field('recetas', 'not-json');
    expect(res.status).toBe(400);
  });

  it('POST /ramos with valid payload -> 201 and expected response shape', async () => {
    const res = await request(app.getHttpServer())
      .post('/ramos')
      .set('Authorization', `Bearer ${token}`)
      .field('nombre', testRamoName('E2E'))
      .field('tamano', 'Mediano')
      .field('precioVenta', '25.00')
      .field('stock', '10')
      .field('recetas', JSON.stringify([{ materiaPrimaId, cantidad: 2 }]));

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: expect.any(Number),
      nombre: testRamoName('E2E'),
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
      .field('nombre', testRamoName('sin stock'))
      .field('tamano', 'Pequeño')
      .field('precioVenta', '15.00')
      .field('recetas', '[]');

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      nombre: testRamoName('sin stock'),
      tamano: 'Pequeno',
      precioVenta: 15,
      stock: 0,
      recetas: [],
    });

    createdRamoIds.push(res.body.id as number);
  });

  it('PATCH /ramos/:id accepts recetas items with nombre sent by the live frontend -> 200', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/ramos')
      .set('Authorization', `Bearer ${token}`)
      .field('nombre', testRamoName('receta con nombre'))
      .field('tamano', 'Mediano')
      .field('precioVenta', '30.00')
      .field('recetas', JSON.stringify([{ materiaPrimaId, cantidad: 2 }]));
    expect(createRes.status).toBe(201);
    const ramoId = createRes.body.id as number;
    createdRamoIds.push(ramoId);

    const patchRes = await request(app.getHttpServer())
      .patch(`/ramos/${ramoId}`)
      .set('Authorization', `Bearer ${token}`)
      .field(
        'recetas',
        JSON.stringify([
          {
            materiaPrimaId,
            cantidad: 3,
            nombre: TEST_MATERIA_PRIMA_NOMBRE,
          },
        ]),
      );

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.recetas).toHaveLength(1);
    expect(patchRes.body.recetas[0]).toMatchObject({
      cantidad: 3,
      materiaPrima: expect.objectContaining({ id: materiaPrimaId }),
    });
  });

  it('PATCH /ramos/:id rejects recetas items with unknown fields -> 400', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/ramos')
      .set('Authorization', `Bearer ${token}`)
      .field('nombre', testRamoName('campo desconocido'))
      .field('tamano', 'Mediano')
      .field('precioVenta', '30.00')
      .field('recetas', JSON.stringify([{ materiaPrimaId, cantidad: 2 }]));
    expect(createRes.status).toBe(201);
    const ramoId = createRes.body.id as number;
    createdRamoIds.push(ramoId);

    const patchRes = await request(app.getHttpServer())
      .patch(`/ramos/${ramoId}`)
      .set('Authorization', `Bearer ${token}`)
      .field(
        'recetas',
        JSON.stringify([
          { materiaPrimaId, cantidad: 3, campoDesconocido: 'x' },
        ]),
      );

    expect(patchRes.status).toBe(400);
    expect(patchRes.body.message).toEqual(
      expect.arrayContaining([
        expect.stringMatching(
          /recetas\.\d+\.property campoDesconocido should not exist/,
        ),
      ]),
    );
  });
});
