import { OmitType, PartialType } from '@nestjs/mapped-types'
import { RentPeriod } from '@prisma/client'
import { ArrayMaxSize, IsArray, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator'
import { CreateListingDto } from './create-listing.dto'
import { MAX_LISTING_IMAGES } from 'src/common/constants/listing.constants'

//- rentPeriod se valida aparte: en una edición parcial, "depende de operation" no se puede decidir en el DTO
//- (con la regla de CreateListingDto, un rentPeriod suelto se descartaría en silencio)
export class UpdateListingDto extends PartialType(OmitType(CreateListingDto, ['rentPeriod'] as const)) {

    @IsOptional()
    @IsEnum(RentPeriod, { message: 'Período de alquiler inválido' })
    rentPeriod?: RentPeriod

    //- Ids de las fotos actuales que se quitan al guardar
    @IsOptional()
    @IsArray()
    @ArrayMaxSize(MAX_LISTING_IMAGES)
    @IsString({ each: true })
    @MaxLength(40, { each: true })
    removeImageIds?: string[]
}