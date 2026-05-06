import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('reportes')
@UseGuards(JwtAuthGuard)
export class ReportesController {
  constructor(private service: ReportesService) {}

  @Get('resumen')
  getResumen(@Query('periodo') periodo: string = 'semana') {
    return this.service.getResumen(periodo);
  }

  @Get('pendientes')
  getPedidosPendientes() {
    return this.service.getPedidosPendientes();
  }

  @Get('mas-vendidos')
  getRamosMasVendidos(@Query('periodo') periodo: string = 'semana') {
    return this.service.getRamosMasVendidos(periodo);
  }

  @Get('exportar')
  async exportar(@Res() res: Response) {
    const datos = await this.service.exportarDatos();

    const csvContent = `
Ramos
${datos.ramos}

Materias Primas
${datos.materiasPrimas}

Pedidos
${datos.pedidos}
    `.trim();

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=eternaflor_export_${new Date().toISOString().split('T')[0]}.csv`,
    );
    res.send(csvContent);
  }
}
