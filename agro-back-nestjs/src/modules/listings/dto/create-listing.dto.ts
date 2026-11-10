import { Transform, Type } from 'class-transformer'
import {
    IsEnum, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString,
    Max, MaxLength, Min, MinLength, ValidateIf,
} from 'class-validator'
import { Currency, ListingOperation, MachineCondition, RentPeriod } from '@prisma/client'
import { MACHINE_TYPES } from 'src/common/constants/machine-types'
import { SELLER_COUNTRIES } from 'src/common/constants/seller.constants'


const trim = () =>
    Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))

const MAX_YEAR = new Date().getFullYear() + 1

export class CreateListingDto {

    @trim()
    @IsString()
    @MinLength(5, { message: 'Mínimo 5 caracteres' })
    @MaxLength(120, { message: 'Máximo 120 caracteres' })
    title: string

    @IsEnum(ListingOperation, { message: 'Operación inválida' })
    operation: ListingOperation

    //- En venta se descarta lo que venga; en alquiler es obligatorio
    @Transform(({ value, obj }: { value: RentPeriod; obj: CreateListingDto }) =>
        obj.operation === ListingOperation.RENT ? value : undefined,
    )
    @ValidateIf((o: CreateListingDto) => o.operation === ListingOperation.RENT)
    @IsEnum(RentPeriod, { message: 'Elegí el período de alquiler' })
    rentPeriod?: RentPeriod

    @IsIn(MACHINE_TYPES, { message: 'Elegí un tipo de máquina válido' })
    machineType: string

    @IsEnum(MachineCondition, { message: 'Condición inválida' })
    condition: MachineCondition

    @Type(() => Number)
    @IsInt({ message: 'Año inválido' })
    @Min(1900, { message: 'Año inválido' })
    @Max(MAX_YEAR, { message: 'Año inválido' })
    year: number

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Las horas deben ser un número entero' })
    @Min(0, { message: 'Las horas no pueden ser negativas' })
    @Max(200_000, { message: 'Cantidad de horas inválida' })
    hours?: number

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'La potencia debe ser un número entero' })
    @Min(1, { message: 'La potencia debe ser mayor a 0' })
    @Max(5_000, { message: 'Potencia inválida' })
    horsepower?: number

    @IsEnum(Currency, { message: 'Moneda inválida' })
    currency: Currency

    @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
    @IsIn(SELLER_COUNTRIES, { message: 'País inválido' })
    country: string

    //- Decimal(12,2): hasta 9.999.999.999,99 y 2 decimales
    @Type(() => Number)
    @IsNumber(
        { allowNaN: false, allowInfinity: false, maxDecimalPlaces: 2 },
        { message: 'Precio inválido (máximo 2 decimales)' },
    )
    @IsPositive({ message: 'El precio debe ser mayor a 0' })
    @Max(9_999_999_999.99, { message: 'El precio es demasiado alto' })
    price: number

    @trim()
    @IsString()
    @MinLength(20, { message: 'Mínimo 20 caracteres' })
    @MaxLength(5000, { message: 'Máximo 5000 caracteres' })
    description: string

    @trim()
    @IsString()
    @MinLength(2, { message: 'Ingresá la ubicación' })
    @MaxLength(120, { message: 'Máximo 120 caracteres' })
    location: string
}