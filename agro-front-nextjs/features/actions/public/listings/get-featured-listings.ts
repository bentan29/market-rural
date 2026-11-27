import "server-only"
import { cacheLife, cacheTag } from "next/cache"
import type { ListingType } from "@/lib/types/listing.type"

const API = process.env.API_URL

export async function getFeaturedListings(limit = 12): Promise<ListingType[]> {
    "use cache"
    cacheLife("minutes")
    cacheTag("listings")

    //- Un backend dormido o caído no puede dejar colgada la página: se corta a los 8 s.
    //- Al lanzar el error, el fallo no se guarda en el caché
    const res = await fetch(`${API}/listings/featured?limit=${limit}`, {
        signal: AbortSignal.timeout(8_000),
    })
    if (!res.ok) throw new Error(`No se pudieron cargar las destacadas (${res.status})`)

    return (await res.json()) as ListingType[]
}