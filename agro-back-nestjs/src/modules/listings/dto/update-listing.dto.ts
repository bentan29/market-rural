import { OmitType, PartialType } from '@nestjs/mapped-types'
import { RentPeriod } from '@prisma/client'
import { IsEnum, IsOptional } from 'class-validator'
import { CreateListingDto } from './create-listing.dto'

//- rentPeriod se valida aparte: en una edición parcial, "depende de operation" no se puede decidir en el DTO
//- (con la regla de CreateListingDto, un rentPeriod suelto se descartaría en silencio)
export class UpdateListingDto extends PartialType(OmitType(CreateListingDto, ['rentPeriod'] as const)) {
    @IsOptional()
    @IsEnum(RentPeriod, { message: 'Período de alquiler inválido' })
    rentPeriod?: RentPeriod
}