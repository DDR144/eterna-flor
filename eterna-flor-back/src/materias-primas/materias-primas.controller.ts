import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { MateriasPrimasService } from './materias-primas.service';
import {
  CreateMateriaPrimaDto,
  UpdateMateriaPrimaDto,
  ActualizarStockDto,
} from './dto/materia-prima.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('materias-primas')
@UseGuards(JwtAuthGuard)
export class MateriasPrimasController {
  constructor(private service: MateriasPrimasService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('alertas')
  getAlertas() {
    return this.service.getAlertas();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() createDto: CreateMateriaPrimaDto) {
    return this.service.create(createDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateMateriaPrimaDto,
  ) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Patch(':id/stock')
  actualizarStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarStockDto,
  ) {
    return this.service.actualizarStock(id, dto);
  }
}
