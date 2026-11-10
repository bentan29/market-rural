export type SuscriptionType = {
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PAST_DUE'
  isActive: boolean
  startedAt: string
  expiresAt: string | null
  isComplimentary: boolean
  plan: {
    name: string
    price: number
    currency: 'USD' | 'UYU' | 'ARS'
    maxListings: number
    maxFeatured: number
    features: string[]
  }
  usage: {
    listings: { used: number; max: number }
  }
}