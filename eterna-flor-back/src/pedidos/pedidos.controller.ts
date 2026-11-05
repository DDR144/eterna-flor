import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { EstadoPedido } from '@prisma/client';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto, UpdatePedidoDto } from './dto/pedido.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { parseEnumLabel } from '../common/enum-label';

const ESTADOS = Object.values(EstadoPedido);

function parseEstadoPedido(value?: string): EstadoPedido | undefined {
  if (!value) {
    return undefined;
  }

  const estado = parseEnumLabel(ESTADOS, value);
  if (!estado) {
    throw new BadRequestException(`Estado de pedido inválido: ${value}`);
  }
  return estado;
}

@Controller('pedidos')
@UseGuards(JwtAuthGuard)
export class PedidosController {
  constructor(private service: PedidosService) {}

  @Get()
  findAll(
    @Query('cliente') cliente?: string,
    @Query('estado') estado?: string,
  ) {
    return this.service.findAll({ cliente, estado: parseEstadoPedido(estado) });
  }

  @Get('pendientes')
  getPendientes() {
    return this.service.getPendientes();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() createDto: CreatePedidoDto) {
    return this.service.create(createDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePedidoDto,
  ) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
