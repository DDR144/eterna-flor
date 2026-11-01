import { Controller, Get, Query } from '@nestjs/common';
import { Prisma, TamanoRamo } from '@prisma/client';
import { PrismaService } from '../common/services/prisma.service';

const TAMANOS = Object.values(TamanoRamo);

function normalizar(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * La página pública envía las etiquetas que la propia API devuelve
 * (`Pequeño`), mientras que el cliente de Prisma expone los nombres de
 * miembro del enum (`Pequeno`). Comparar el valor crudo contra esos
 * nombres descartaba el filtro en silencio y devolvía el catálogo
 * completo. Comparar sin acentos ni mayúsculas acepta los dos
 * vocabularios sin mantener una segunda copia de las etiquetas, que es
 * justo lo que se desincronizó.
 */
function parseTamano(value?: string): TamanoRamo | undefined {
  if (!value) return undefined;

  const buscado = normalizar(value);
  return TAMANOS.find((tamano) => normalizar(tamano) === buscado);
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

    const tamanoFiltro = parseTamano(tamano);
    if (tamanoFiltro) {
      where.tamano = tamanoFiltro;
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
