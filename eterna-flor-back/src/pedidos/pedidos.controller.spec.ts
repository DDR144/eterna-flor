import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EstadoPedido } from '@prisma/client';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';

describe('PedidosController', () => {
  let controller: PedidosController;
  let ultimoFiltro: { cliente?: string; estado?: EstadoPedido } | undefined;

  const mockPedidosService = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    ultimoFiltro = undefined;

    mockPedidosService.findAll.mockReset();
    mockPedidosService.findAll.mockImplementation(
      (filtro: { cliente?: string; estado?: EstadoPedido }) => {
        ultimoFiltro = filtro;
        return Promise.resolve([]);
      },
    );

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PedidosController],
      providers: [{ provide: PedidosService, useValue: mockPedidosService }],
    }).compile();

    controller = module.get<PedidosController>(PedidosController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const filtroAplicado = (): {
    cliente?: string;
    estado?: EstadoPedido;
  } => {
    if (!ultimoFiltro) {
      throw new Error('findAll no fue llamado');
    }
    return ultimoFiltro;
  };

  it('acepta la etiqueta acentuada que guarda la base de datos', async () => {
    await controller.findAll(undefined, 'En preparación');

    expect(filtroAplicado().estado).toBe(EstadoPedido.EnPreparacion);
  });

  it.each([
    ['Pendiente', EstadoPedido.Pendiente],
    ['En preparación', EstadoPedido.EnPreparacion],
    ['Entregado', EstadoPedido.Entregado],
    ['Pagado', EstadoPedido.Pagado],
  ])(
    'traduce el estado %s al miembro %s del enum de Prisma',
    async (etiqueta: string, esperado: EstadoPedido) => {
      await controller.findAll(undefined, etiqueta);

      expect(filtroAplicado().estado).toBe(esperado);
    },
  );

  it('sigue aceptando el nombre de miembro que devuelve la API', async () => {
    await controller.findAll(undefined, 'EnPreparacion');

    expect(filtroAplicado().estado).toBe(EstadoPedido.EnPreparacion);
  });

  it('no filtra por estado cuando el parámetro no se envía', async () => {
    await controller.findAll();

    expect(filtroAplicado().estado).toBeUndefined();
  });

  it('rechaza un estado desconocido con 400, como antes', () => {
    // El guard lanza de forma síncrona, antes de llamar al servicio.
    expect(() => controller.findAll(undefined, 'Inventado')).toThrow(
      BadRequestException,
    );
    expect(() => controller.findAll(undefined, 'Inventado')).toThrow(
      /Estado de pedido inválido: Inventado/,
    );
  });

  it('pasa el filtro por cliente sin tocarlo', async () => {
    await controller.findAll('Ana');

    expect(filtroAplicado().cliente).toBe('Ana');
  });
});
