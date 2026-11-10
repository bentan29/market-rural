import { ListingStatus } from '@prisma/client'
import { IsIn } from 'class-validator'
import { SELLER_SELECTABLE_STATUSES } from 'src/common/constants/listing.constants'

export class ChangeListingStatusDto {
    @IsIn(SELLER_SELECTABLE_STATUSES, { message: 'Estado inválido' })
    status: ListingStatus
}