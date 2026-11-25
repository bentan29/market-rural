//- Tienen que ser los mismos valores que acepta el backend (LISTING_SORTS en listing-sort.ts de Nest)
export const LISTING_SORTS = ['newest', 'price_asc', 'price_desc', 'year_asc', 'year_desc'] as const

export type ListingSort = (typeof LISTING_SORTS)[number]

export const DEFAULT_LISTING_SORT: ListingSort = 'newest'

export const SORT_LABEL: Record<ListingSort, string> = {
    newest: 'Más recientes',
    price_asc: 'Precio: menor a mayor',
    price_desc: 'Precio: mayor a menor',
    year_asc: 'Año: más antiguas',
    year_desc: 'Año: más nuevas',
}