export const LISTING_SORTS = ['newest', 'price_asc', 'price_desc', 'year_asc', 'year_desc'] as const
export type ListingsSort = (typeof LISTING_SORTS)[number]