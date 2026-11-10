import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server"

export const CATALOG_OPERATIONS = ["SALE", "RENT"] as const
export const CATALOG_CONDITIONS = ["NEW", "USED"] as const
export const CATALOG_CURRENCIES = ["USD", "UYU", "ARS", "BRL", "PYG"] as const
export const CATALOG_SORTS = ["newest", "price_asc", "price_desc", "year_asc", "year_desc"] as const

//- Los nombres son los mismos que los de ListingsQueryDto en Nest. El país NO está acá: va en la ruta
export const catalogParsers = {
    q: parseAsString.withDefault(""),
    operation: parseAsArrayOf(parseAsStringLiteral(CATALOG_OPERATIONS)).withDefault([]),
    type: parseAsArrayOf(parseAsString).withDefault([]),
    condition: parseAsArrayOf(parseAsStringLiteral(CATALOG_CONDITIONS)).withDefault([]),
    yearFrom: parseAsInteger,
    yearTo: parseAsInteger,
    currency: parseAsStringLiteral(CATALOG_CURRENCIES),
    minPrice: parseAsInteger,
    maxPrice: parseAsInteger,
    maxHours: parseAsInteger,
    minHorsepower: parseAsInteger,
    maxHorsepower: parseAsInteger,
    sort: parseAsStringLiteral(CATALOG_SORTS).withDefault("newest"),
    page: parseAsInteger.withDefault(1),
}