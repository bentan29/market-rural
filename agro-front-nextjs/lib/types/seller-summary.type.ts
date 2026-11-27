export type SellerSummary = {
    seller: { displayName: string; slug: string }
    listings: { total: number; published: number; draft: number; paused: number; closed: number; expired: number }
    featured: { used: number; max: number }
    subscription: {
        planName: string
        maxListings: number
        isActive: boolean
        isComplimentary: boolean
        expiresAt: string | null
    } | null
    inquiries: {
        total: number
        unread: number
        recent: {
            id: string
            name: string
            email: string
            phone: string | null
            message: string
            createdAt: string
            readAt: string | null
            listing: { title: string; slug: string }
        }[]
    }
}