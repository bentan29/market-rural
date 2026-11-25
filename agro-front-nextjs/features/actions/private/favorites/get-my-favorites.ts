import "server-only"

import { authFetch } from "@/lib/auth/server-fetch"
import { ListingsResponse } from "@/lib/types/listing.type"


export async function getMyFavoritesAction(): Promise<ListingsResponse> {
    

    const res = await authFetch('/favorites/myFavorites')
    if (!res.ok) throw new Error(`No se pudieron cargar los favoritos (${res.status})`)

    return (await res.json()) as ListingsResponse
}