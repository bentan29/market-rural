export type ListingStatus = 'DRAFT' | 'PUBLISHED' | 'PAUSED' | 'SOLD' | 'RENTED' | 'EXPIRED'
export type ListingOperation = 'SALE' | 'RENT'

export type ListingType = {
  id: string
  slug: string
  title: string
  operation: 'SALE' | 'RENT'
  rentPeriod: 'DAY' | 'WEEK' | 'MONTH' | null
  condition: 'NEW' | 'USED'
  currency: 'USD' | 'UYU' | 'ARS' | 'BRL' | 'PYG'
  price: number
  machineType: string
  horsepower: number | null
  featured: boolean //- True o false si la marcamos como featured "destacada"
  featuredUntil: string | null
  year: number
  hours: number | null
  location: string
  status: ListingStatus
  country: string | null
  createdAt: string
  seller?: {
    displayName: string | null
    slug: string | null
  } | null

  imageUrl?: string | null
}

export type ListingsResponse = {
  items: ListingType[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

//- Lo que trae GET /listings/myListings/:id (todos los campos editables)
export type MyListingDetail = ListingType & {
  horsepower: number | null
  description: string
}

