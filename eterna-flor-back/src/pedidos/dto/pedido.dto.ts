import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
  IsDateString,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { EstadoPedido } from '@prisma/client';

export class PedidoItemDto {
  @IsNumber()
  @Transform(({ value }) => Number(value))
  ramoId: number;

  @IsNumber()
  @Min(1)
  @Transform(({ value }) => Number(value))
  cantidad: number;
}

export class CreatePedidoDto {
  @IsString()
  clienteNombre: string;

  @IsString()
  clienteWhatsapp: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PedidoItemDto)
  items: PedidoItemDto[];

  @IsOptional()
  @IsString()
  metodoPago?: string;

  @IsOptional()
  @IsDateString()
  fechaEntrega?: string;
}

export class UpdatePedidoDto {
  @IsOptional()
  @IsEnum(EstadoPedido)
  estado?: EstadoPedido;

  @IsOptional()
  @IsString()
  metodoPago?: string;

  @IsOptional()
  @IsDateString()
  fechaEntrega?: string;
}

export class BuscarPedidosDto {
  @IsOptional()
  @IsString()
  cliente?: string;

  @IsOptional()
  @IsEnum(EstadoPedido)
  estado?: EstadoPedido;

  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @IsOptional()
  @IsDateString()
  fechaHasta?: string;
}
