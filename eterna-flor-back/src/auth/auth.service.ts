import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/services/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: loginDto.email },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      usuario.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: usuario.id, email: usuario.email };
    const token = this.jwtService.sign(payload);

    return { token, user: { id: usuario.id, email: usuario.email } };
  }

  async validateUser(email: string): Promise<any> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
    });
    if (usuario) {
      return { id: usuario.id, email: usuario.email };
    }
    return null;
  }

  async getProfile(userId: number) {
    return this.prisma.usuario.findUnique({
      where: { id: userId },
      select: { id: true, email: true, createdAt: true },
    });
  }

  async registerAdmin(email: string, password: string) {
    const passwordHash = await bcrypt.hash(password, 12);

    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const existingUserCount = await tx.usuario.count();

          if (existingUserCount > 0) {
            throw new ForbiddenException(
              'El registro de administrador no está disponible',
            );
          }

          return tx.usuario.create({
            data: { email, passwordHash },
            select: { id: true, email: true, createdAt: true },
          });
        },
        { isolationLevel: 'Serializable' },
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2034'
      ) {
        throw new ForbiddenException(
          'El registro de administrador no está disponible',
        );
      }

      throw error;
    }
  }
}
