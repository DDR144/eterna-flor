import { Module } from '@nestjs/common';
import { CatalogoController } from './catalogo.controller';
import { PrismaService } from '../common/services/prisma.service';

@Module({
  controllers: [CatalogoController],
  providers: [PrismaService],
})
export class CatalogoModule {}
