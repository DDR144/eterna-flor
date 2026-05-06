import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { RamosController } from './ramos.controller';
import { RamosService } from './ramos.service';
import { PrismaService } from '../common/services/prisma.service';
import { CloudinaryService } from '../common/services/cloudinary.service';

@Module({
  imports: [
    MulterModule.register({
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Solo se permiten imágenes JPEG, PNG o WebP'), false);
        }
      },
    }),
  ],
  controllers: [RamosController],
  providers: [RamosService, PrismaService, CloudinaryService],
  exports: [RamosService],
})
export class RamosModule {}
