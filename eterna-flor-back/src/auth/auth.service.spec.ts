import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { AuthService } from './auth.service';
import { PrismaService } from '../common/services/prisma.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

type MockedAuthPrisma = {
  usuario: {
    count: jest.Mock<Promise<number>, []>;
    findUnique: jest.Mock<
      Promise<unknown>,
      [args: Prisma.UsuarioFindUniqueArgs]
    >;
    create: jest.Mock<Promise<unknown>, [args: Prisma.UsuarioCreateArgs]>;
  };
  $transaction: jest.Mock<
    Promise<unknown>,
    [
      callback: (tx: MockedAuthPrisma) => Promise<unknown>,
      options?: { isolationLevel?: string },
    ]
  >;
};

describe('AuthService', () => {
  let service: AuthService;

  const mockPrisma: MockedAuthPrisma = {
    usuario: {
      count: jest.fn() as MockedAuthPrisma['usuario']['count'],
      findUnique: jest.fn() as MockedAuthPrisma['usuario']['findUnique'],
      create: jest.fn() as MockedAuthPrisma['usuario']['create'],
    },
    $transaction: jest.fn(
      (callback: (tx: MockedAuthPrisma) => Promise<unknown>) =>
        callback(mockPrisma),
    ) as MockedAuthPrisma['$transaction'],
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    mockPrisma.$transaction.mockImplementation(
      (callback: (tx: MockedAuthPrisma) => Promise<unknown>) =>
        callback(mockPrisma),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerAdmin', () => {
    it('should throw ForbiddenException when a user already exists', async () => {
      mockPrisma.usuario.count.mockResolvedValue(1);

      await expect(
        service.registerAdmin('admin@example.com', 'password'),
      ).rejects.toThrow(ForbiddenException);
      expect(mockPrisma.usuario.count).toHaveBeenCalled();
      expect(mockPrisma.usuario.findUnique).not.toHaveBeenCalled();
    });

    it('should return an object without passwordHash when no user exists', async () => {
      const createdAt = new Date();
      mockPrisma.usuario.count.mockResolvedValue(0);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrisma.usuario.create.mockResolvedValue({
        id: 1,
        email: 'admin@example.com',
        createdAt,
      });

      const result = await service.registerAdmin(
        'admin@example.com',
        'password',
      );

      expect(result).toEqual({
        id: 1,
        email: 'admin@example.com',
        createdAt,
      });
      expect(result).not.toHaveProperty('passwordHash');
      expect(mockPrisma.usuario.create).toHaveBeenCalledWith({
        data: { email: 'admin@example.com', passwordHash: 'hashed-password' },
        select: { id: true, email: true, createdAt: true },
      });
      expect(mockPrisma.$transaction).toHaveBeenCalledWith(
        expect.any(Function),
        { isolationLevel: 'Serializable' },
      );
    });

    it('should store a bcrypt hash, not the plaintext password', async () => {
      mockPrisma.usuario.count.mockResolvedValue(0);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrisma.usuario.create.mockResolvedValue({
        id: 1,
        email: 'admin@example.com',
        createdAt: new Date(),
      });

      await service.registerAdmin('admin@example.com', 'plaintext-password');

      expect(bcrypt.hash).toHaveBeenCalledWith('plaintext-password', 12);
      expect(mockPrisma.usuario.create).toHaveBeenCalledWith({
        data: {
          email: 'admin@example.com',
          passwordHash: 'hashed-password',
        },
        select: { id: true, email: true, createdAt: true },
      });
    });

    it('should map a Prisma serialization conflict (P2034) to ForbiddenException', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrisma.$transaction.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Serialization failure', {
          code: 'P2034',
          clientVersion: Prisma.prismaVersion.client,
        }),
      );

      await expect(
        service.registerAdmin('admin@example.com', 'password'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('login', () => {
    it('should never return passwordHash and should return a token', async () => {
      const usuario = {
        id: 1,
        email: 'admin@example.com',
        passwordHash: 'stored-hash',
      };
      mockPrisma.usuario.findUnique.mockResolvedValue(usuario);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('signed-token');

      const result = await service.login({
        email: 'admin@example.com',
        password: 'password',
      });

      expect(result).toHaveProperty('token', 'signed-token');
      expect(result).not.toHaveProperty('passwordHash');
      expect(result.user).not.toHaveProperty('passwordHash');
      expect(result.user).toEqual({ id: 1, email: 'admin@example.com' });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockPrisma.usuario.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'missing@example.com', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
