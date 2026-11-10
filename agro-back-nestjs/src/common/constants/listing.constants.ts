import { ListingStatus } from "@prisma/client"

//- Para suscripciones que no vencen (cortesía, por ejemplo): una fecha lejana que equivale a "mientras dure el plan"
export const FEATURED_NO_EXPIRY = new Date('9999-12-31T00:00:00.000Z')

//- Cambios de estado que puede hacer el vendedor (el menú del front ofrece los mismos)
export const SELLER_SELECTABLE_STATUSES = [
    ListingStatus.DRAFT,
    ListingStatus.PUBLISHED,
    ListingStatus.PAUSED,
    ListingStatus.SOLD,
    ListingStatus.RENTED,
] as const