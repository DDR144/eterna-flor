import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/services/prisma.service';
import { CreatePedidoDto, UpdatePedidoDto } from './dto/pedido.dto';
import { EstadoPedido } from '@prisma/client';

@Injectable()
export class PedidosService {
  constructor(private prisma: PrismaService) {}

  async findAll(filtros?: { cliente?: string; estado?: EstadoPedido }) {
    const where: Prisma.PedidoWhereInput = {};
    if (filtros?.cliente) {
      where.clienteNombre = { contains: filtros.cliente };
    }
    if (filtros?.estado) {
      where.estado = filtros.estado;
    }

    const pedidos = await this.prisma.pedido.findMany({
      where,
      include: {
        pedidoItems: {
          include: { ramo: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return pedidos.map((p) => ({
      ...p,
      montoTotal: Number(p.montoTotal),
      fechaEntrega: p.fechaEntrega?.toISOString(),
      createdAt: p.createdAt.toISOString(),
      pedidoItems: p.pedidoItems.map((pi) => ({
        ...pi,
        cantidad: Number(pi.cantidad),
        precioUnitario: Number(pi.precioUnitario),
      })),
    }));
  }

  async findOne(id: number) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id },
      include: { pedidoItems: { include: { ramo: true } } },
    });
    if (!pedido) throw new NotFoundException('Pedido no encontrado');
    return {
      ...pedido,
      montoTotal: Number(pedido.montoTotal),
      fechaEntrega: pedido.fechaEntrega?.toISOString(),
      createdAt: pedido.createdAt.toISOString(),
      pedidoItems: pedido.pedidoItems.map((pi) => ({
        ...pi,
        cantidad: Number(pi.cantidad),
        precioUnitario: Number(pi.precioUnitario),
      })),
    };
  }

  async create(createDto: CreatePedidoDto) {
    const itemsData = await Promise.all(
      createDto.items.map(async (item) => {
        const ramo = await this.prisma.ramo.findUnique({
          where: { id: item.ramoId },
        });
        if (!ramo)
          throw new NotFoundException(
            `Ramo con ID ${item.ramoId} no encontrado`,
          );
        if (ramo.stock < item.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente para ramo ${ramo.nombre}. Stock actual: ${ramo.stock}`,
          );
        }
        return {
          ramoId: item.ramoId,
          cantidad: item.cantidad,
          precioUnitario: ramo.precioVenta,
        };
      }),
    );

    const montoTotal = itemsData.reduce((total, item) => {
      return total + Number(item.precioUnitario) * item.cantidad;
    }, 0);

    const result = await this.prisma.$transaction(async (tx) => {
      const pedido = await tx.pedido.create({
        data: {
          clienteNombre: createDto.clienteNombre,
          clienteWhatsapp: createDto.clienteWhatsapp,
          metodoPago: createDto.metodoPago,
          fechaEntrega: createDto.fechaEntrega
            ? new Date(createDto.fechaEntrega)
            : null,
          montoTotal,
          pedidoItems: {
            create: itemsData.map((item) => ({
              ramoId: item.ramoId,
              cantidad: item.cantidad,
              precioUnitario: item.precioUnitario,
            })),
          },
        },
        include: { pedidoItems: { include: { ramo: true } } },
      });

      for (const item of createDto.items) {
        await tx.ramo.update({
          where: { id: item.ramoId },
          data: { stock: { decrement: item.cantidad } },
        });
      }

      return pedido;
    });

    return this.findOne(result.id);
  }

  async update(id: number, updateDto: UpdatePedidoDto) {
    await this.findOne(id);

    const pedidoActualizado = await this.prisma.pedido.update({
      where: { id },
      data: {
        ...(updateDto.estado && { estado: updateDto.estado }),
        ...(updateDto.metodoPago && { metodoPago: updateDto.metodoPago }),
        ...(updateDto.fechaEntrega && {
          fechaEntrega: new Date(updateDto.fechaEntrega),
        }),
      },
    });

    return this.findOne(pedidoActualizado.id);
  }

  async delete(id: number) {
    const pedido = await this.findOne(id);

    if (pedido.estado !== 'Pendiente' && pedido.estado !== 'EnPreparacion') {
      throw new BadRequestException(
        'Solo se pueden eliminar pedidos pendientes o en preparación',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      for (const item of pedido.pedidoItems) {
        await tx.ramo.update({
          where: { id: item.ramoId },
          data: { stock: { increment: item.cantidad } },
        });
      }
      await tx.pedido.delete({ where: { id } });
    });

    return { message: 'Pedido eliminado correctamente' };
  }

  async getPendientes() {
    const pedidos = await this.prisma.pedido.findMany({
      where: {
        estado: { in: ['Pendiente', 'EnPreparacion'] },
      },
      include: { pedidoItems: { include: { ramo: true } } },
      orderBy: { fechaEntrega: 'asc' },
    });
    return pedidos.map((p) => ({
      ...p,
      montoTotal: Number(p.montoTotal),
      pedidoItems: p.pedidoItems.map((pi) => ({
        ...pi,
        cantidad: Number(pi.cantidad),
        precioUnitario: Number(pi.precioUnitario),
      })),
    }));
  }
}
