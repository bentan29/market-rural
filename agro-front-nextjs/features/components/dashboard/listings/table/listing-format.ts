import type {ListingType } from '@/lib/types/listing.type'

export const RENT_PERIOD_LABEL = { DAY: '/ día', WEEK: '/ semana', MONTH: '/ mes' } as const
export const CONDITION_LABEL = { NEW: 'Nueva', USED: 'Usada' } as const

export const formatPrice = (price: number, currency: ListingType['currency']) =>
  new Intl.NumberFormat('es-UY', { style: 'currency', currency, maximumFractionDigits: 0 }).format(price)

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('es-UY', { dateStyle: 'medium' }).format(new Date(iso))

//- Las suscripciones sin vencimiento usan una fecha lejana (año 9999)
export const featuredLabel = (iso: string) =>
  new Date(iso).getFullYear() > 2100 ? 'Mientras dure tu plan' : `Hasta ${formatDate(iso)}`