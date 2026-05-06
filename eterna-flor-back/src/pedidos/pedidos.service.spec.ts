import { Test, TestingModule } from '@nestjs/testing';
import { PedidosService } from './pedidos.service';
import { PrismaService } from '../common/services/prisma.service';

describe('PedidosService', () => {
  let service: PedidosService;

  const mockPrisma = {
    pedido: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    ramo: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrisma)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PedidosService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PedidosService>(PedidosService);
    (service as any).prisma = mockPrisma;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all pedidos', async () => {
      const mockPedidos = [
        {
          id: 1,
          clienteNombre: 'Juan',
          clienteWhatsapp: '999999999',
          estado: 'Pendiente',
          metodoPago: 'Efectivo',
          montoTotal: 100,
          createdAt: new Date(),
          fechaEntrega: null,
          pedidoItems: [],
        },
      ];
      mockPrisma.pedido.findMany.mockResolvedValue(mockPedidos);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].clienteNombre).toBe('Juan');
    });

    it('should filter by cliente', async () => {
      const mockPedidos = [
        {
          id: 1,
          clienteNombre: 'Juan',
          clienteWhatsapp: '999999999',
          estado: 'Pendiente',
          metodoPago: null,
          montoTotal: 100,
          createdAt: new Date(),
          fechaEntrega: null,
          pedidoItems: [],
        },
      ];
      mockPrisma.pedido.findMany.mockResolvedValue(mockPedidos);

      const result = await service.findAll({ cliente: 'Juan' });

      expect(mockPrisma.pedido.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            clienteNombre: { contains: 'Juan' },
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a pedido by id', async () => {
      const mockPedido = {
        id: 1,
        clienteNombre: 'Juan',
        estado: 'Pendiente',
        montoTotal: 100,
        createdAt: new Date(),
        fechaEntrega: null,
        pedidoItems: [],
      };
      mockPrisma.pedido.findUnique.mockResolvedValue(mockPedido);

      const result = await service.findOne(1);

      expect(result.clienteNombre).toBe('Juan');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.pedido.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        'Pedido no encontrado',
      );
    });
  });

  describe('create', () => {
    it('should create a pedido and decrease stock', async () => {
      const mockRamo = {
        id: 1,
        nombre: 'Ramo Rosa',
        stock: 10,
        precioVenta: 50,
      };
      mockPrisma.ramo.findUnique.mockResolvedValue(mockRamo);

      const mockPedido = {
        id: 1,
        clienteNombre: 'Juan',
        clienteWhatsapp: '999999999',
        estado: 'Pendiente',
        montoTotal: 100,
        createdAt: new Date(),
        fechaEntrega: null,
        pedidoItems: [
          {
            id: 1,
            ramoId: 1,
            cantidad: 2,
            precioUnitario: 50,
            ramo: { nombre: 'Ramo Rosa', tamano: 'Mediano' },
          },
        ],
      };
      mockPrisma.pedido.create.mockResolvedValue(mockPedido);
      mockPrisma.pedido.findUnique.mockResolvedValue(mockPedido);
      mockPrisma.ramo.update.mockResolvedValue({ ...mockRamo, stock: 8 });

      const result = await service.create({
        clienteNombre: 'Juan',
        clienteWhatsapp: '999999999',
        items: [{ ramoId: 1, cantidad: 2 }],
      });

      expect(result.clienteNombre).toBe('Juan');
      expect(mockPrisma.ramo.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { stock: { decrement: 2 } },
      });
    });

    it('should throw error when stock is insufficient', async () => {
      const mockRamo = {
        id: 1,
        nombre: 'Ramo Rosa',
        stock: 1,
        precioVenta: 50,
      };
      mockPrisma.ramo.findUnique.mockResolvedValue(mockRamo);

      await expect(
        service.create({
          clienteNombre: 'Juan',
          clienteWhatsapp: '999999999',
          items: [{ ramoId: 1, cantidad: 5 }],
        }),
      ).rejects.toThrow('Stock insuficiente');
    });
  });

  describe('update', () => {
    it('should update pedido estado', async () => {
      const mockPedido = {
        id: 1,
        clienteNombre: 'Juan',
        estado: 'Pendiente',
        montoTotal: 100,
        createdAt: new Date(),
        fechaEntrega: null,
        pedidoItems: [],
      };
      mockPrisma.pedido.findUnique.mockResolvedValue(mockPedido);
      mockPrisma.pedido.update.mockResolvedValue({
        ...mockPedido,
        estado: 'Entregado',
      });
      mockPrisma.pedido.findUnique.mockResolvedValue({
        ...mockPedido,
        estado: 'Entregado',
        createdAt: new Date(),
      });

      const result = await service.update(1, { estado: 'Entregado' });

      expect(result.estado).toBe('Entregado');
    });
  });

  describe('getPendientes', () => {
    it('should return pending and in-progress pedidos', async () => {
      const mockPedidos = [
        {
          id: 1,
          clienteNombre: 'Juan',
          estado: 'Pendiente',
          montoTotal: 100,
          createdAt: new Date(),
          fechaEntrega: null,
          pedidoItems: [],
        },
        {
          id: 2,
          clienteNombre: 'Maria',
          estado: 'EnPreparacion',
          montoTotal: 150,
          createdAt: new Date(),
          fechaEntrega: null,
          pedidoItems: [],
        },
      ];
      mockPrisma.pedido.findMany.mockResolvedValue(mockPedidos);

      const result = await service.getPendientes();

      expect(result).toHaveLength(2);
    });
  });
});
