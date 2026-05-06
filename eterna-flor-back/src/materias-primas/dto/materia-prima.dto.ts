import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateMateriaPrimaDto {
  @IsString()
  nombre: string;

  @IsString()
  unidad: string;

  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number(value))
  stockActual: number;

  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number(value))
  costoUnitario: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number(value))
  stockMinimoAlerta?: number;
}

export class UpdateMateriaPrimaDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  unidad?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number(value))
  stockActual?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number(value))
  costoUnitario?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number(value))
  stockMinimoAlerta?: number;
}

export class ActualizarStockDto {
  @IsNumber()
  @Transform(({ value }) => Number(value))
  cantidad: number;

  @IsString()
  operacion: 'sumar' | 'restar';
}
