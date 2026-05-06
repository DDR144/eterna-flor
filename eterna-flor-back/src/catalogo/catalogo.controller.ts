import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { TamanoRamo } from '@prisma/client';

@Controller('catalogo')
export class CatalogoController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async findAll(@Query('tamano') tamano?: string) {
    const where: any = {
      activo: true,
      stock: { gt: 0 },
    };

    if (tamano && Object.values(TamanoRamo).includes(tamano as TamanoRamo)) {
      where.tamano = tamano;
    }

    const ramos = await this.prisma.ramo.findMany({
      where,
      orderBy: { nombre: 'asc' },
    });

    return ramos.map((r) => ({
      id: r.id,
      nombre: r.nombre,
      tamano: r.tamano,
      fotoUrl: r.fotoUrl,
      precioVenta: Number(r.precioVenta),
    }));
  }
}
