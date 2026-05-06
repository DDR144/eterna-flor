import { Test, TestingModule } from '@nestjs/testing';
import { MateriasPrimasService } from './materias-primas.service';
import { PrismaService } from '../common/services/prisma.service';

describe('MateriasPrimasService', () => {
  let service: MateriasPrimasService;
  let prisma: PrismaService;

  const mockPrisma = {
    materiaPrima: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MateriasPrimasService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<MateriasPrimasService>(MateriasPrimasService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all materias primas with transformed decimals', async () => {
      const mockData = [
        {
          id: 1,
          nombre: 'Flores',
          unidad: 'unidades',
          stockActual: 10,
          costoUnitario: 5,
          stockMinimoAlerta: 5,
          createdAt: new Date(),
        },
      ];
      mockPrisma.materiaPrima.findMany.mockResolvedValue(mockData);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].stockActual).toBe(10);
      expect(result[0].costoUnitario).toBe(5);
      expect(result[0].alertaStock).toBe(false);
    });

    it('should return alertaStock true when stock is low', async () => {
      const mockData = [
        {
          id: 1,
          nombre: 'Flores',
          unidad: 'unidades',
          stockActual: 3,
          costoUnitario: 5,
          stockMinimoAlerta: 5,
          createdAt: new Date(),
        },
      ];
      mockPrisma.materiaPrima.findMany.mockResolvedValue(mockData);

      const result = await service.findAll();

      expect(result[0].alertaStock).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return a materia prima by id', async () => {
      const mockData = {
        id: 1,
        nombre: 'Flores',
        unidad: 'unidades',
        stockActual: 10,
        costoUnitario: 5,
        stockMinimoAlerta: 5,
      };
      mockPrisma.materiaPrima.findUnique.mockResolvedValue(mockData);

      const result = await service.findOne(1);

      expect(result.nombre).toBe('Flores');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.materiaPrima.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        'Materia prima no encontrada',
      );
    });
  });

  describe('create', () => {
    it('should create a new materia prima', async () => {
      const createDto = {
        nombre: 'Cintas',
        unidad: 'metros',
        stockActual: 100,
        costoUnitario: 0.5,
      };
      const mockCreated = {
        id: 1,
        ...createDto,
        stockMinimoAlerta: 5,
        createdAt: new Date(),
      };
      mockPrisma.materiaPrima.create.mockResolvedValue(mockCreated);

      const result = await service.create(createDto);

      expect(result.nombre).toBe('Cintas');
      expect(mockPrisma.materiaPrima.create).toHaveBeenCalledWith({
        data: { ...createDto, stockMinimoAlerta: 5 },
      });
    });
  });

  describe('actualizarStock', () => {
    it('should increase stock', async () => {
      const mockMateria = {
        id: 1,
        nombre: 'Flores',
        stockActual: 10,
        costoUnitario: 5,
        stockMinimoAlerta: 5,
      };
      mockPrisma.materiaPrima.findUnique.mockResolvedValue(mockMateria);
      mockPrisma.materiaPrima.update.mockResolvedValue({
        ...mockMateria,
        stockActual: 15,
      });

      const result = await service.actualizarStock(1, {
        cantidad: 5,
        operacion: 'sumar',
      });

      expect(Number(result.stockActual)).toBe(15);
    });

    it('should decrease stock', async () => {
      const mockMateria = {
        id: 1,
        nombre: 'Flores',
        stockActual: 10,
        costoUnitario: 5,
        stockMinimoAlerta: 5,
      };
      mockPrisma.materiaPrima.findUnique.mockResolvedValue(mockMateria);
      mockPrisma.materiaPrima.update.mockResolvedValue({
        ...mockMateria,
        stockActual: 5,
      });

      const result = await service.actualizarStock(1, {
        cantidad: 5,
        operacion: 'restar',
      });

      expect(Number(result.stockActual)).toBe(5);
    });

    it('should throw error when stock is insufficient', async () => {
      const mockMateria = {
        id: 1,
        nombre: 'Flores',
        stockActual: 3,
        costoUnitario: 5,
        stockMinimoAlerta: 5,
      };
      mockPrisma.materiaPrima.findUnique.mockResolvedValue(mockMateria);

      await expect(
        service.actualizarStock(1, { cantidad: 5, operacion: 'restar' }),
      ).rejects.toThrow('Stock insuficiente');
    });
  });
});
