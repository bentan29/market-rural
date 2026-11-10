export type PreviousSeller = {
    displayName: string
    about: string | null
    phone: string | null
    whatsapp: string | null
    website: string | null
    country: string
    location: string
    cancelledAt: string | null
    listingsCount: number
}


export type PublicSeller = {
    displayName: string
    slug: string
    avatarUrl: string | null
    about: string | null
    phone: string
    whatsapp: string | null
    website: string | null
    country: string
    location: string
    createdAt: string
    listingsCount: number
}