import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsInt,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  MaxLength,
  IsIn,
  IsPositive,
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';
import { TamanoRamo } from '@prisma/client';

const TAMANOS_VALIDOS = Object.values(TamanoRamo);

const TAMANO_FRONT_A_ENUM: Record<string, TamanoRamo> = {
  Pequeño: TamanoRamo.Pequeno,
  Mediano: TamanoRamo.Mediano,
  Grande: TamanoRamo.Grande,
  Jumbo: TamanoRamo.Jumbo,
};

function toTamanoRamo(value: unknown): TamanoRamo | undefined {
  if (typeof value !== 'string') return undefined;
  return TAMANO_FRONT_A_ENUM[value] ?? (value as TamanoRamo);
}

export function MaxDecimalPlaces(
  max: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'maxDecimalPlaces',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'number' || Number.isNaN(value)) return false;
          const decimals = (value.toString().split('.')[1] || '').length;
          return decimals <= max;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} debe tener como máximo ${max} decimales`;
        },
      },
    });
  };
}

function toNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  return Number(value);
}

function parseRecetas(value: unknown): unknown {
  if (value === undefined || value === null || value === '') return undefined;

  const parseItem = (item: unknown) =>
    plainToInstance(RecetaItemDto, item, {
      enableImplicitConversion: true,
    });

  if (Array.isArray(value)) {
    return value.map(parseItem);
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (!Array.isArray(parsed)) return parsed;
      return parsed.map(parseItem);
    } catch {
      return value;
    }
  }

  return value;
}

export class RecetaItemDto {
  @IsInt()
  @IsPositive()
  @Transform(({ value }) => toNumber(value))
  materiaPrimaId: number;

  @IsNumber()
  @IsPositive()
  @MaxDecimalPlaces(3, {
    message: 'cantidad debe tener como máximo 3 decimales',
  })
  @Transform(({ value }) => toNumber(value))
  cantidad: number;

  // The currently deployed admin page sends `nombre` inside each receta
  // when it builds an update request. The API ignores it, but with
  // forbidNonWhitelisted enabled rejecting it breaks every ramo edit in
  // production. Accepting this known, harmless field keeps edits working
  // while truly undeclared fields still fail with 400.
  @IsOptional()
  @IsString()
  nombre?: string;
}

export class CreateRamoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombre: string;

  @IsIn(TAMANOS_VALIDOS)
  @Transform(({ value }) => toTamanoRamo(value))
  tamano: TamanoRamo;

  @IsNumber()
  @Min(0)
  @MaxDecimalPlaces(2, {
    message: 'precioVenta debe tener como máximo 2 decimales',
  })
  @Transform(({ value }) => toNumber(value))
  precioVenta: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => toNumber(value))
  stock?: number;

  @IsOptional()
  @IsArray({ message: 'recetas debe ser un arreglo válido' })
  @ValidateNested({ each: true })
  @Type(() => RecetaItemDto)
  @Transform(({ value }) => parseRecetas(value))
  recetas?: RecetaItemDto[];
}

export class UpdateRamoDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombre?: string;

  @IsOptional()
  @IsIn(TAMANOS_VALIDOS)
  @Transform(({ value }) => toTamanoRamo(value))
  tamano?: TamanoRamo;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @MaxDecimalPlaces(2, {
    message: 'precioVenta debe tener como máximo 2 decimales',
  })
  @Transform(({ value }) => toNumber(value))
  precioVenta?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => toNumber(value))
  stock?: number;

  @IsOptional()
  @IsArray({ message: 'recetas debe ser un arreglo válido' })
  @ValidateNested({ each: true })
  @Type(() => RecetaItemDto)
  @Transform(({ value }) => parseRecetas(value))
  recetas?: RecetaItemDto[];
}
