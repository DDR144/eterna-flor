import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  private getDateRange(periodo: string) {
    const now = new Date();
    let startDate: Date;

    switch (periodo) {
      case 'dia':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'semana':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'mes':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'todos':
      default:
        startDate = new Date(0);
    }

    return startDate;
  }

  async getResumen(periodo: string = 'semana') {
    const startDate = this.getDateRange(periodo);

    const pedidos = await this.prisma.pedido.findMany({
      where: {
        estado: { in: ['Entregado', 'Pagado'] },
        createdAt: { gte: startDate },
      },
      include: {
        pedidoItems: {
          include: { ramo: true },
        },
      },
    });

    let ingresosTotales = 0;
    let costosTotales = 0;
    const porTamano: Record<
      string,
      { ingresos: number; costos: number; cantidad: number }
    > = {};

    for (const pedido of pedidos) {
      for (const item of pedido.pedidoItems) {
        const cantidad = Number(item.cantidad);
        const precio = Number(item.precioUnitario);
        const costo = Number(item.ramo.costoCalculado);

        ingresosTotales += precio * cantidad;
        costosTotales += costo * cantidad;

        const tamano = item.ramo.tamano;
        if (!porTamano[tamano]) {
          porTamano[tamano] = { ingresos: 0, costos: 0, cantidad: 0 };
        }
        porTamano[tamano].ingresos += precio * cantidad;
        porTamano[tamano].costos += costo * cantidad;
        porTamano[tamano].cantidad += cantidad;
      }
    }

    const margenesPorTamano = Object.entries(porTamano).map(
      ([tamano, data]) => ({
        tamano,
        ingresos: data.ingresos,
        costos: data.costos,
        margen: data.ingresos - data.costos,
        porcentajeMargen:
          data.ingresos > 0
            ? ((data.ingresos - data.costos) / data.ingresos) * 100
            : 0,
        cantidad: data.cantidad,
      }),
    );

    return {
      periodo,
      ingresosTotales,
      costosTotales,
      margenTotal: ingresosTotales - costosTotales,
      porcentajeMargen:
        ingresosTotales > 0
          ? ((ingresosTotales - costosTotales) / ingresosTotales) * 100
          : 0,
      totalPedidos: pedidos.length,
      margenesPorTamano: margenesPorTamano.sort(
        (a, b) => b.ingresos - a.ingresos,
      ),
    };
  }

  async getPedidosPendientes() {
    const pedidos = await this.prisma.pedido.findMany({
      where: {
        estado: { in: ['Pendiente', 'EnPreparacion'] },
      },
      include: {
        pedidoItems: {
          include: { ramo: true },
        },
      },
      orderBy: { fechaEntrega: 'asc' },
    });

    return pedidos.map((p) => ({
      id: p.id,
      clienteNombre: p.clienteNombre,
      montoTotal: Number(p.montoTotal),
      estado: p.estado,
      fechaEntrega: p.fechaEntrega?.toISOString(),
      items: p.pedidoItems.map((pi) => ({
        nombre: pi.ramo.nombre,
        cantidad: Number(pi.cantidad),
      })),
    }));
  }

  async getRamosMasVendidos(periodo: string = 'semana') {
    const startDate = this.getDateRange(periodo);

    const pedidos = await this.prisma.pedido.findMany({
      where: {
        estado: { in: ['Entregado', 'Pagado'] },
        createdAt: { gte: startDate },
      },
      include: {
        pedidoItems: {
          include: { ramo: true },
        },
      },
    });

    const ventasPorRamo: Record<
      number,
      { nombre: string; tamano: string; cantidad: number; ingresos: number }
    > = {};

    for (const pedido of pedidos) {
      for (const item of pedido.pedidoItems) {
        if (!ventasPorRamo[item.ramoId]) {
          ventasPorRamo[item.ramoId] = {
            nombre: item.ramo.nombre,
            tamano: item.ramo.tamano,
            cantidad: 0,
            ingresos: 0,
          };
        }
        ventasPorRamo[item.ramoId].cantidad += Number(item.cantidad);
        ventasPorRamo[item.ramoId].ingresos +=
          Number(item.precioUnitario) * Number(item.cantidad);
      }
    }

    return Object.entries(ventasPorRamo)
      .map(([id, data]) => ({
        id: Number(id),
        ...data,
      }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10);
  }

  async exportarDatos() {
    const [ramos, materiasPrimas, pedidos] = await Promise.all([
      this.prisma.ramo.findMany({ orderBy: { nombre: 'asc' } }),
      this.prisma.materiaPrima.findMany({ orderBy: { nombre: 'asc' } }),
      this.prisma.pedido.findMany({
        include: { pedidoItems: { include: { ramo: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const generarCSV = (
      headers: string[],
      rows: (string | number | boolean)[][],
    ) => {
      const headerLine = headers.join(',');
      const dataLines = rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
      );
      return [headerLine, ...dataLines].join('\n');
    };

    const csvRamos = generarCSV(
      [
        'ID',
        'Nombre',
        'Tamaño',
        'Precio Venta',
        'Costo Calculado',
        'Stock',
        'Activo',
      ],
      ramos.map((r) => [
        r.id,
        r.nombre,
        r.tamano,
        Number(r.precioVenta),
        Number(r.costoCalculado),
        r.stock,
        r.activo,
      ]),
    );

    const csvMateriasPrimas = generarCSV(
      [
        'ID',
        'Nombre',
        'Unidad',
        'Stock Actual',
        'Costo Unitario',
        'Stock Mínimo',
      ],
      materiasPrimas.map((m) => [
        m.id,
        m.nombre,
        m.unidad,
        Number(m.stockActual),
        Number(m.costoUnitario),
        m.stockMinimoAlerta,
      ]),
    );

    const csvPedidos = generarCSV(
      [
        'ID',
        'Cliente',
        'WhatsApp',
        'Estado',
        'Método Pago',
        'Monto Total',
        'Fecha Entrega',
        'Items',
      ],
      pedidos.map((p) => [
        p.id,
        p.clienteNombre,
        p.clienteWhatsapp,
        p.estado,
        p.metodoPago || '',
        Number(p.montoTotal),
        p.fechaEntrega?.toISOString() || '',
        p.pedidoItems
          .map((pi) => `${pi.ramo.nombre}x${pi.cantidad}`)
          .join('; '),
      ]),
    );

    return {
      ramos: csvRamos,
      materiasPrimas: csvMateriasPrimas,
      pedidos: csvPedidos,
    };
  }
}
