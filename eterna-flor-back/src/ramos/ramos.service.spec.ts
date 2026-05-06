import { Test, TestingModule } from '@nestjs/testing';
import { RamosService } from './ramos.service';
import { PrismaService } from '../common/services/prisma.service';
import { CloudinaryService } from '../common/services/cloudinary.service';
import { TamanoRamo } from '@prisma/client';

describe('RamosService', () => {
  let service: RamosService;

  const mockPrisma = {
    ramo: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    receta: {
      findMany: jest.fn(),
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  const mockCloudinary = {
    uploadImage: jest
      .fn()
      .mockResolvedValue('https://cloudinary.com/image.jpg'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RamosService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CloudinaryService, useValue: mockCloudinary },
      ],
    }).compile();

    service = module.get<RamosService>(RamosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all active ramos', async () => {
      const mockRamos = [
        {
          id: 1,
          nombre: 'Ramo Rosa',
          tamano: TamanoRamo.Mediano,
          precioVenta: 50,
          costoCalculado: 25,
          stock: 10,
          activo: true,
          createdAt: new Date(),
          recetas: [],
        },
      ];
      mockPrisma.ramo.findMany.mockResolvedValue(mockRamos);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].margen).toBe(25);
    });

    it('should return alertaStock when stock <= 2', async () => {
      const mockRamos = [
        {
          id: 1,
          nombre: 'Ramo Rosa',
          tamano: TamanoRamo.Mediano,
          precioVenta: 50,
          costoCalculado: 25,
          stock: 2,
          activo: true,
          createdAt: new Date(),
          recetas: [],
        },
      ];
      mockPrisma.ramo.findMany.mockResolvedValue(mockRamos);

      const result = await service.findAll();

      expect(result[0].alertaStock).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return a ramo by id', async () => {
      const mockRamo = {
        id: 1,
        nombre: 'Ramo Rosa',
        tamano: TamanoRamo.Mediano,
        precioVenta: 50,
        costoCalculado: 25,
        stock: 10,
        activo: true,
        recetas: [],
      };
      mockPrisma.ramo.findUnique.mockResolvedValue(mockRamo);

      const result = await service.findOne(1);

      expect(result.nombre).toBe('Ramo Rosa');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.ramo.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow('Ramo no encontrado');
    });
  });

  describe('create', () => {
    it('should create a ramo without foto', async () => {
      const createDto = {
        nombre: 'Ramo Nuevo',
        tamano: TamanoRamo.Grande,
        precioVenta: 80,
        stock: 5,
      };
      const mockCreated = {
        id: 1,
        ...createDto,
        costoCalculado: 0,
        fotoUrl: null,
        activo: true,
        createdAt: new Date(),
        recetas: [],
      };
      mockPrisma.ramo.create.mockResolvedValue(mockCreated);
      mockPrisma.ramo.findUnique.mockResolvedValue(mockCreated);

      const result = await service.create(createDto);

      expect(result.nombre).toBe('Ramo Nuevo');
      expect(mockCloudinary.uploadImage).not.toHaveBeenCalled();
    });

    it('should create a ramo with foto', async () => {
      const createDto = {
        nombre: 'Ramo Nuevo',
        tamano: TamanoRamo.Grande,
        precioVenta: 80,
        stock: 5,
      };
      const mockCreated = {
        id: 1,
        ...createDto,
        costoCalculado: 0,
        fotoUrl: 'https://cloudinary.com/image.jpg',
        activo: true,
        createdAt: new Date(),
        recetas: [],
      };
      mockPrisma.ramo.create.mockResolvedValue(mockCreated);
      mockPrisma.ramo.findUnique.mockResolvedValue(mockCreated);

      await service.create(createDto, Buffer.from('fake image'));

      expect(mockCloudinary.uploadImage).toHaveBeenCalled();
    });

    it('should calculate costo from recetas', async () => {
      const createDto = {
        nombre: 'Ramo Nuevo',
        tamano: TamanoRamo.Grande,
        precioVenta: 80,
        stock: 5,
        recetas: [{ materiaPrimaId: 1, cantidad: 2 }],
      };

      const mockCreated = {
        id: 1,
        nombre: 'Ramo Nuevo',
        tamano: TamanoRamo.Grande,
        precioVenta: 80,
        stock: 5,
        costoCalculado: 0,
        fotoUrl: null,
        activo: true,
        createdAt: new Date(),
      };
      mockPrisma.ramo.create.mockResolvedValue(mockCreated);

      const mockRecetas = [
        { cantidad: 2, materiaPrima: { costoUnitario: 10 } },
      ];
      mockPrisma.receta.findMany.mockResolvedValue(mockRecetas);

      const mockWithCosto = { ...mockCreated, costoCalculado: 20 };
      mockPrisma.ramo.update.mockResolvedValue(mockWithCosto);
      mockPrisma.ramo.findUnique.mockResolvedValue({
        ...mockWithCosto,
        recetas: [],
      });

      await service.create(createDto);

      expect(mockPrisma.ramo.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { costoCalculado: 20 },
      });
    });
  });

  describe('getAlertas', () => {
    it('should return ramos with low stock', async () => {
      const mockRamos = [
        {
          id: 1,
          nombre: 'Ramo Rosa',
          tamano: TamanoRamo.Mediano,
          precioVenta: 50,
          costoCalculado: 25,
          stock: 1,
          activo: true,
        },
        {
          id: 2,
          nombre: 'Ramo Azul',
          tamano: TamanoRamo.Grande,
          precioVenta: 80,
          costoCalculado: 40,
          stock: 2,
          activo: true,
        },
      ];
      mockPrisma.ramo.findMany.mockResolvedValue(mockRamos);

      const result = await service.getAlertas();

      expect(result).toHaveLength(2);
    });
  });
});
