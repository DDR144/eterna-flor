import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, TamanoRamo } from '@prisma/client';
import { CatalogoController } from './catalogo.controller';
import { PrismaService } from '../common/services/prisma.service';

describe('CatalogoController', () => {
  let controller: CatalogoController;
  let ultimoWhere: Prisma.RamoWhereInput | undefined;
  let filas: unknown[] = [];

  const mockPrisma = {
    ramo: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    ultimoWhere = undefined;
    filas = [];

    mockPrisma.ramo.findMany.mockReset();
    mockPrisma.ramo.findMany.mockImplementation(
      (args: { where: Prisma.RamoWhereInput }) => {
        ultimoWhere = args.where;
        return Promise.resolve(filas);
      },
    );

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatalogoController],
      providers: [{ provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    controller = module.get<CatalogoController>(CatalogoController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const whereUltimaConsulta = (): Prisma.RamoWhereInput => {
    if (!ultimoWhere) {
      throw new Error('findMany no fue llamado');
    }
    return ultimoWhere;
  };

  it('aplica el filtro cuando la página pública envía la etiqueta acentuada', async () => {
    await controller.findAll('Pequeño');

    expect(whereUltimaConsulta()).toEqual({
      activo: true,
      stock: { gt: 0 },
      tamano: TamanoRamo.Pequeno,
    });
  });

  it.each([
    ['Pequeño', TamanoRamo.Pequeno],
    ['Mediano', TamanoRamo.Mediano],
    ['Grande', TamanoRamo.Grande],
    ['Jumbo', TamanoRamo.Jumbo],
  ])(
    'traduce el tamaño %s al miembro %s del enum de Prisma',
    async (etiqueta: string, esperado: TamanoRamo) => {
      await controller.findAll(etiqueta);

      expect(whereUltimaConsulta().tamano).toBe(esperado);
    },
  );

  it('no filtra por tamaño cuando el parámetro no se envía', async () => {
    await controller.findAll();

    expect(whereUltimaConsulta()).toEqual({ activo: true, stock: { gt: 0 } });
    expect(whereUltimaConsulta()).not.toHaveProperty('tamano');
  });

  it('ignora un tamaño desconocido en lugar de fallar', async () => {
    await controller.findAll('Gigante');

    expect(whereUltimaConsulta()).not.toHaveProperty('tamano');
  });

  it('mantiene la forma de la respuesta y convierte precioVenta a número', async () => {
    filas = [
      {
        id: 7,
        nombre: 'Ramo X',
        tamano: 'Mediano',
        fotoUrl: null,
        precioVenta: '14.50',
        stock: 3,
        activo: true,
      },
    ];

    await expect(controller.findAll()).resolves.toEqual([
      {
        id: 7,
        nombre: 'Ramo X',
        tamano: 'Mediano',
        fotoUrl: null,
        precioVenta: 14.5,
      },
    ]);
  });
});
