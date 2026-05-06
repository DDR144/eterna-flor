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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RamosService } from './ramos.service';
import { CreateRamoDto, UpdateRamoDto } from './dto/ramo.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

function parseFormData(body: any): CreateRamoDto | UpdateRamoDto {
  const result: any = {};

  if (body.nombre) result.nombre = body.nombre;
  if (body.tamano) result.tamano = body.tamano;
  if (body.precioVenta) result.precioVenta = parseFloat(body.precioVenta);
  if (body.stock !== undefined && body.stock !== '') result.stock = parseInt(body.stock);
  if (body.recetas) {
    try {
      result.recetas = JSON.parse(body.recetas);
    } catch {}
  }

  return result;
}

@Controller('ramos')
@UseGuards(JwtAuthGuard)
export class RamosController {
  constructor(private service: RamosService) {}

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
  @UseInterceptors(FileInterceptor('foto'))
  create(
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const createDto = parseFormData(body) as CreateRamoDto;
    return this.service.create(createDto, file?.buffer);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('foto'))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const updateDto = parseFormData(body) as UpdateRamoDto;
    return this.service.update(id, updateDto, file?.buffer);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
