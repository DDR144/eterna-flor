import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { CloudinaryService } from '../common/services/cloudinary.service';
import { CreateRamoDto, UpdateRamoDto } from './dto/ramo.dto';

@Injectable()
export class RamosService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  private async calcularCosto(ramoId?: number): Promise<number> {
    if (!ramoId) return 0;
    const recetas = await this.prisma.receta.findMany({
      where: { ramoId },
      include: { materiaPrima: true },
    });
    return Number(
      recetas.reduce(
        (total, r) =>
          total + Number(r.cantidad) * Number(r.materiaPrima.costoUnitario),
        0,
      ),
    );
  }

  async findAll() {
    const ramos = await this.prisma.ramo.findMany({
      where: { activo: true },
      include: { recetas: { include: { materiaPrima: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return ramos.map((r) => ({
      ...r,
      precioVenta: Number(r.precioVenta),
      costoCalculado: Number(r.costoCalculado),
      margen: Number(r.precioVenta) - Number(r.costoCalculado),
      alertaStock: r.stock <= 2,
      recetas: r.recetas.map((rec) => ({
        ...rec,
        cantidad: Number(rec.cantidad),
        materiaPrima: {
          ...rec.materiaPrima,
          stockActual: Number(rec.materiaPrima.stockActual),
          costoUnitario: Number(rec.materiaPrima.costoUnitario),
        },
      })),
    }));
  }

  async findOne(id: number) {
    const ramo = await this.prisma.ramo.findUnique({
      where: { id },
      include: { recetas: { include: { materiaPrima: true } } },
    });
    if (!ramo) throw new NotFoundException('Ramo no encontrado');
    return {
      ...ramo,
      precioVenta: Number(ramo.precioVenta),
      costoCalculado: Number(ramo.costoCalculado),
      margen: Number(ramo.precioVenta) - Number(ramo.costoCalculado),
      recetas: ramo.recetas.map((rec) => ({
        ...rec,
        cantidad: Number(rec.cantidad),
        materiaPrima: {
          ...rec.materiaPrima,
          stockActual: Number(rec.materiaPrima.stockActual),
          costoUnitario: Number(rec.materiaPrima.costoUnitario),
        },
      })),
    };
  }

  async create(createDto: CreateRamoDto, foto?: Buffer) {
    let fotoUrl: string | undefined;
    if (foto) {
      fotoUrl = await this.cloudinary.uploadImage(foto, 'eternaflor/ramos');
    }

    const ramo = await this.prisma.ramo.create({
      data: {
        nombre: createDto.nombre,
        tamano: createDto.tamano,
        precioVenta: createDto.precioVenta,
        stock: createDto.stock || 0,
        fotoUrl,
        costoCalculado: 0,
      },
    });

    if (createDto.recetas?.length) {
      await this.prisma.receta.createMany({
        data: createDto.recetas.map((r) => ({
          ramoId: ramo.id,
          materiaPrimaId: r.materiaPrimaId,
          cantidad: r.cantidad,
        })),
      });
      const costoCalculado = await this.calcularCosto(ramo.id);
      await this.prisma.ramo.update({
        where: { id: ramo.id },
        data: { costoCalculado },
      });
    }

    return this.findOne(ramo.id);
  }

  async update(id: number, updateDto: UpdateRamoDto, foto?: Buffer) {
    await this.findOne(id);

    let fotoUrl: string | undefined;
    if (foto) {
      fotoUrl = await this.cloudinary.uploadImage(foto, 'eternaflor/ramos');
    }

    await this.prisma.ramo.update({
      where: { id },
      data: {
        ...(updateDto.nombre && { nombre: updateDto.nombre }),
        ...(updateDto.tamano && { tamano: updateDto.tamano }),
        ...(updateDto.precioVenta && { precioVenta: updateDto.precioVenta }),
        ...(updateDto.stock !== undefined && { stock: updateDto.stock }),
        ...(fotoUrl && { fotoUrl }),
      },
    });

    if (updateDto.recetas !== undefined) {
      await this.prisma.receta.deleteMany({ where: { ramoId: id } });
      if (updateDto.recetas.length) {
        await this.prisma.receta.createMany({
          data: updateDto.recetas.map((r) => ({
            ramoId: id,
            materiaPrimaId: r.materiaPrimaId,
            cantidad: r.cantidad,
          })),
        });
      }
      const costoCalculado = await this.calcularCosto(id);
      await this.prisma.ramo.update({
        where: { id },
        data: { costoCalculado },
      });
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.ramo.update({
      where: { id },
      data: { activo: false },
    });
  }

  async getAlertas() {
    const ramos = await this.prisma.ramo.findMany({
      where: { activo: true, stock: { lte: 2 } },
    });
    return ramos.map((r) => ({
      ...r,
      precioVenta: Number(r.precioVenta),
      costoCalculado: Number(r.costoCalculado),
    }));
  }
}
