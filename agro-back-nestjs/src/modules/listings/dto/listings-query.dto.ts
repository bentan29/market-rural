import { Transform, Type } from 'class-transformer'
import { IsEnum, IsIn, IsInt, IsNumber, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator'
import { Currency, ListingOperation, MachineCondition } from '@prisma/client'
import { MACHINE_TYPES } from 'src/common/constants/machine-types'
import { PaginationDto } from 'src/common/dto/pagination.dto'
import { SELLER_COUNTRIES } from 'src/common/constants/seller.constants'

export const LISTING_SORTS = ['newest', 'price_asc', 'price_desc', 'year_asc' ,'year_desc'] as const
export type ListingsSort = (typeof LISTING_SORTS)[number]

const MAX_YEAR = new Date().getFullYear() + 1

//- ?operation=SALE&operation=RENT llega como arreglo; con un solo valor llega como string
const toArray = ({ value }: { value: unknown }) =>
    Array.isArray(value) ? value : value ? [value] : undefined

//- "" (un campo vacío del formulario) se trata como "no vino"
const emptyToUndefined = ({ value }: { value: unknown }) => (value === '' ? undefined : value)

const priceOptions = { allowNaN: false, allowInfinity: false, maxDecimalPlaces: 2 }



export class ListingsQueryDto extends PaginationDto {

    //- Slug del vendedor: lo usa el perfil público para listar solo sus publicaciones
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() || undefined : value))
    @IsString()
    @MaxLength(80)
    @Matches(/^[a-z0-9-]+$/, { message: 'Vendedor inválido' })
    seller?: string

    //- Búsqueda de texto (título y descripción)
    @IsOptional()
    @Transform(({value}) => (typeof value === 'string') ? value.trim() || undefined : value)
    @IsString()
    @MaxLength(80)
    q?: string

    @IsOptional()
    @Transform(toArray)
    @IsEnum(ListingOperation, { each: true, message: 'Operación inválida' })
    operation?: ListingOperation[]

    @IsOptional()
    @Transform(toArray)
    @IsIn(MACHINE_TYPES, { each: true, message: 'Tipo de máquina inválido' })
    type?: string[]

    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() || undefined : value))
    @IsIn(SELLER_COUNTRIES, { message: 'País inválido' })
    country?: string

    @IsOptional()
    @Transform(toArray)
    @IsEnum(MachineCondition, { each: true, message: 'Condición inválida' })
    condition?: MachineCondition[]

    //- Año desde / hasta
    @IsOptional()
    @Transform(emptyToUndefined)
    @Type(() => Number)
    @IsInt()
    @Min(1900)
    @Max(MAX_YEAR)
    yearFrom?: number

    @IsOptional()
    @Transform(emptyToUndefined)
    @Type(() => Number)
    @IsInt()
    @Min(1900)
    @Max(MAX_YEAR)
    yearTo?: number

    //- Precio: se compara dentro de una moneda (por defecto USD)
    @IsOptional()
    @IsEnum(Currency, { message: 'Moneda inválida' })
    currency?: Currency

    @IsOptional()
    @Transform(emptyToUndefined)
    @Type(() => Number)
    @IsNumber(priceOptions)
    @Min(0)
    minPrice?: number

    @IsOptional()
    @Transform(emptyToUndefined)
    @Type(() => Number)
    @IsNumber(priceOptions)
    @Min(0)
    maxPrice?: number

    //- Horas de uso (máximo)
    @IsOptional()
    @Transform(emptyToUndefined)
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(200_000)
    maxHours?: number

    //- Potencia (rango)
    @IsOptional()
    @Transform(emptyToUndefined)
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(5_000)
    minHorsepower?: number

    @IsOptional()
    @Transform(emptyToUndefined)
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(5_000)
    maxHorsepower?: number

    @IsOptional()
    @IsIn(LISTING_SORTS, { message: 'Orden inválido' })
    sort?: ListingsSort

}