import "server-only"

import { cacheLife, cacheTag } from "next/cache"
import type { ListingType } from "@/lib/types/listing.type"

const API = process.env.API_URL

export async function getFeaturedListings(limit = 8): Promise<ListingType[]> {
    "use cache"
    cacheLife("minutes")
    cacheTag("listings")

    const res = await fetch(`${API}/listings/featured?limit=${limit}`)
    if (!res.ok) throw new Error(`No se pudieron cargar las destacadas (${res.status})`)

    return (await res.json()) as ListingType[]
}