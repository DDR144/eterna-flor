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
    @Body() createDto: CreateRamoDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.service.create(createDto, file?.buffer);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('foto'))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateRamoDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.service.update(id, updateDto, file?.buffer);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
