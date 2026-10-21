import { Controller, Get, Query } from '@nestjs/common';
import { Prisma, TamanoRamo } from '@prisma/client';
import { PrismaService } from '../common/services/prisma.service';

function isTamanoRamo(value: string): value is TamanoRamo {
  return Object.values(TamanoRamo).includes(value as TamanoRamo);
}

@Controller('catalogo')
export class CatalogoController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async findAll(@Query('tamano') tamano?: string) {
    const where: Prisma.RamoWhereInput = {
      activo: true,
      stock: { gt: 0 },
    };

    if (tamano && isTamanoRamo(tamano)) {
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
