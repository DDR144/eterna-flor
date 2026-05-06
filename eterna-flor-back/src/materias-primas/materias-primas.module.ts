import { Module } from '@nestjs/common';
import { MateriasPrimasController } from './materias-primas.controller';
import { MateriasPrimasService } from './materias-primas.service';
import { PrismaService } from '../common/services/prisma.service';

@Module({
  controllers: [MateriasPrimasController],
  providers: [MateriasPrimasService, PrismaService],
  exports: [MateriasPrimasService],
})
export class MateriasPrimasModule {}
