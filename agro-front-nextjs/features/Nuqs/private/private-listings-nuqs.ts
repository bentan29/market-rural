import { parseAsArrayOf, parseAsInteger, parseAsString, parseAsStringLiteral } from 'nuqs/server'

//- Tienen que ser los valores de tu enum ListingStatus de Prisma: uno que no esté acá se descarta de la URL
export const LISTING_STATUSES = ['PUBLISHED', 'DRAFT', 'PAUSED', 'SOLD', 'RENTED', 'EXPIRED'] as const
export const LISTING_OPERATIONS = ['SALE', 'RENT'] as const
export const LISTING_SORTS = ['newest', 'price_asc', 'price_desc', 'year_asc', 'year_desc'] as const
      

//- Los nombres son los mismos que los del DTO de Nest: así el pedido es un recorrido directo
export const privateListingsNuqs = {
    q:            parseAsString.withDefault(''),
    status:       parseAsArrayOf(parseAsStringLiteral(LISTING_STATUSES)).withDefault([]),
    operation:    parseAsArrayOf(parseAsStringLiteral(LISTING_OPERATIONS)).withDefault([]),
    sort:         parseAsStringLiteral(LISTING_SORTS).withDefault('newest'),
    page:         parseAsInteger.withDefault(1),
}


