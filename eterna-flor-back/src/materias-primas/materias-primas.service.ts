import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import {
  CreateMateriaPrimaDto,
  UpdateMateriaPrimaDto,
  ActualizarStockDto,
} from './dto/materia-prima.dto';

@Injectable()
export class MateriasPrimasService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const materias = await this.prisma.materiaPrima.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return materias.map((m) => ({
      ...m,
      stockActual: Number(m.stockActual),
      costoUnitario: Number(m.costoUnitario),
      alertaStock: Number(m.stockActual) <= m.stockMinimoAlerta,
    }));
  }

  async findOne(id: number) {
    const materia = await this.prisma.materiaPrima.findUnique({
      where: { id },
    });
    if (!materia) throw new NotFoundException('Materia prima no encontrada');
    return {
      ...materia,
      stockActual: Number(materia.stockActual),
      costoUnitario: Number(materia.costoUnitario),
      alertaStock: Number(materia.stockActual) <= materia.stockMinimoAlerta,
    };
  }

  async create(createDto: CreateMateriaPrimaDto) {
    return this.prisma.materiaPrima.create({
      data: {
        nombre: createDto.nombre,
        unidad: createDto.unidad,
        stockActual: createDto.stockActual,
        costoUnitario: createDto.costoUnitario,
        stockMinimoAlerta: createDto.stockMinimoAlerta || 5,
      },
    });
  }

  async update(id: number, updateDto: UpdateMateriaPrimaDto) {
    await this.findOne(id);
    return this.prisma.materiaPrima.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.materiaPrima.delete({ where: { id } });
  }

  async actualizarStock(
    id: number,
    { cantidad, operacion }: ActualizarStockDto,
  ) {
    const materia = await this.findOne(id);
    const nuevoStock =
      operacion === 'sumar'
        ? Number(materia.stockActual) + cantidad
        : Number(materia.stockActual) - cantidad;

    if (nuevoStock < 0) {
      throw new BadRequestException('Stock insuficiente');
    }

    return this.prisma.materiaPrima.update({
      where: { id },
      data: { stockActual: nuevoStock },
    });
  }

  async getAlertas() {
    const materias = await this.prisma.materiaPrima.findMany();
    return materias
      .filter((m) => Number(m.stockActual) <= m.stockMinimoAlerta)
      .map((m) => ({
        ...m,
        stockActual: Number(m.stockActual),
        costoUnitario: Number(m.costoUnitario),
      }));
  }
}
