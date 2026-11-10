import { ListingOperation, ListingStatus } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsEnum, IsIn, IsOptional, IsString, MaxLength } from "class-validator";
import { LISTING_SORTS,  type ListingsSort, PaginationDto } from "src/common/dto";


//- ?operation=SALE&operation=RENT llega como arreglo; con un solo valor llega como string
const toArray = ({ value }: { value: unknown }) =>
    Array.isArray(value) ? value : value ? [value] : undefined

export class PrivateListingsDto extends PaginationDto {

    //- Búsqueda de texto (título y descripción)
    @IsOptional()
    @Transform(({value}) => (typeof value === 'string') ? value.trim() || undefined : value)
    @IsString()
    @MaxLength(80)
    q?: string

    @IsOptional()
    @Transform(toArray)
    @IsEnum(ListingStatus, { each: true, message: 'Estado inválido' })
    status?: ListingStatus[]

    @IsOptional()
    @Transform(toArray)
    @IsEnum(ListingOperation, { each: true, message: 'Operación inválida' })
    operation?: ListingOperation[]

    @IsOptional()
    @IsIn(LISTING_SORTS, { message: 'Orden inválido' })
    sort?: ListingsSort
    

}