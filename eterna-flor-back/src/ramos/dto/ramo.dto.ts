import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsIn,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { TamanoRamo } from '@prisma/client';

const TAMANOS_VALIDOS = ['Pequeño', 'Mediano', 'Grande', 'Jumbo'];

export interface RecetaItemDto {
  materiaPrimaId: number;
  cantidad: number;
}

export class CreateRamoDto {
  @IsString()
  nombre: string;

  @IsIn(TAMANOS_VALIDOS)
  @Transform(({ value }) => value as TamanoRamo)
  tamano: TamanoRamo;

  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number(value))
  precioVenta: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number(value))
  stock?: number;

  @IsOptional()
  recetas?: RecetaItemDto[];
}

export class UpdateRamoDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsIn(TAMANOS_VALIDOS)
  @Transform(({ value }) => value as TamanoRamo)
  tamano?: TamanoRamo;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number(value))
  precioVenta?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number(value))
  stock?: number;

  @IsOptional()
  recetas?: RecetaItemDto[];
}
