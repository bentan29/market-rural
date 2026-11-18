import "server-only"

import { cacheLife, cacheTag } from "next/cache"
import type { PublicListingDetail } from "@/lib/types/listing.type"

const API = process.env.API_URL

//- Pública: va con caché. updateTag('listings') la invalida cuando algo cambia
export async function getListingDetails(slug: string): Promise<PublicListingDetail | null> {
    "use cache"
    cacheLife("hours")
    cacheTag("listings", `listing-${slug}`)

    const res = await fetch(`${API}/listings/${encodeURIComponent(slug)}`)

    if (res.status === 404) return null
    //- Se lanza (no se devuelve): un fallo no tiene que quedar guardado en el caché
    if (!res.ok) throw new Error(`No se pudo cargar la publicación (${res.status})`)

    return (await res.json()) as PublicListingDetail
}